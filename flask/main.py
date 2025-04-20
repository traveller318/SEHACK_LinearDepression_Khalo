from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from cleanliness import (
    generate_cleanliness_report,
)  # Import the generate report function
from whatsapp_notifier import WhatsAppNotifier  # Import the WhatsApp notifier class
import os
import requests
import json
import speech_recognition as sr
import re
import whisper
import groq
from supabase import create_client, Client
from nltk_review import (
    analyze_reviews as analyze_reviews_nltk,
)  # Import the review analysis function
from groq import Groq
import torch

app = Flask(__name__)
import wave

CORS(app)
NODE_API_URL = os.getenv("NODE_API_URL")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


@app.route("/generate_report", methods=["GET"])
def generate_report():
    try:
        # Define the image paths
        image_paths = [f"./side{i}.jpg" for i in range(1, 6)]
        
        # Verify all images exist
        for path in image_paths:
            if not os.path.exists(path):
                return jsonify({
                    "status": "error", 
                    "message": f"Image {path} not found"
                }), 404

        # Generate the cleanliness report
        report_data = generate_cleanliness_report(image_paths)

        if report_data["status"] != "success":
            return jsonify(report_data), 400

        # Get vendor number from query parameters
        vendor_number = request.args.get('vendor_number')
        if not vendor_number:
            return jsonify({
                "status": "error",
                "message": "Vendor number is required as a query parameter"
            }), 400

        # Pass the report to WhatsAppNotifier
        notifier = WhatsAppNotifier()
        success = notifier.notify_vendor("+919326445840", report_data)

        if not success:
            return jsonify({
                "status": "error",
                "message": "Failed to send WhatsApp notification"
            }), 500

        # Return the final report in JSON format
        return jsonify(report_data["report"]), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
@app.route("/analyze/<stall_id>")
def analyze_reviews(stall_id):
    try:
        print(f"Starting analysis for stall ID: {stall_id}")

        # Fetch reviews from Node.js backend
        print(f"Fetching reviews from Node.js backend for stall ID: {stall_id}")
        res = requests.get(f"{NODE_API_URL}/{stall_id}")
        res.raise_for_status()

        # Parse JSON response
        try:
            print(f"Parsing JSON response from Node.js backend")
            data = res.json()
        except ValueError:
            print(
                f"Invalid JSON received from Node.js backend for stall ID: {stall_id}"
            )
            return (
                jsonify({"error": "Invalid JSON received from the Node.js backend"}),
                400,
            )

        if not data:
            print(f"No reviews found for stall ID: {stall_id}")
            return jsonify({"error": "No reviews found."}), 404

        # Extract ratings and review text
        ratings = [r["rating"] for r in data if "rating" in r]
        reviews = [r["review_text"] for r in data if "review_text" in r]

        print(
            f"Extracted {len(ratings)} ratings and {len(reviews)} reviews for stall ID: {stall_id}"
        )

        avg_rating = round(sum(ratings) / len(ratings), 2) if ratings else 0
        print(f"Average rating for stall ID {stall_id}: {avg_rating}")

        # Handle keyword extraction and analysis
        print(f"Starting review analysis for stall ID {stall_id}")

        # Call the analysis function
        summary_result = analyze_reviews_nltk(reviews)

        # Ensure we have a proper dictionary response
        if isinstance(summary_result, str):
            try:
                summary_result = json.loads(summary_result)
            except json.JSONDecodeError:
                summary_result = {"error": "Invalid analysis result format"}
        elif not isinstance(summary_result, dict):
            summary_result = {"error": "Unexpected analysis result type"}

        return jsonify({"average_rating": avg_rating, "review_summary": summary_result})

    except requests.exceptions.RequestException as e:
        print(
            f"Error fetching data from Node.js backend for stall ID {stall_id}: {str(e)}"
        )
        return jsonify({"error": f"Error fetching data: {str(e)}"}), 500
    except Exception as e:
        print(f"Unexpected error during analysis for stall ID {stall_id}: {str(e)}")
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500


# Add this import at the top of your file

CUISINE_KEYWORDS = [
    "chinese",
    "italian",
    "indian",
    "mexican",
    "thai",
    "japanese",
    "french",
    "mediterranean",
    "american",
    "vietnamese",
    "korean",
    "spanish",
    "greek",
    "lebanese",
]
groq_client = groq.Client(api_key=os.getenv("GROQ_API_KEY"))


@app.route("/foodAssistant", methods=["POST"])
def food_assistant():
    try:
        # Get JSON data from request
        data = request.get_json()
        if not data or "stall_id" not in data:
            return jsonify({"error": "Missing stall_id in JSON payload"}), 400

        stall_id = data["stall_id"]

        # Fetch stall data
        stall_resp = requests.post(
            "https://khalo-r5v5.onrender.com/customer/getSingleStall",
            json={"stall_id": stall_id},
            headers={"Content-Type": "application/json"},
        )
        if stall_resp.status_code != 200:
            return jsonify({"error": f"Stall API failed: {stall_resp.text}"}), 400

        try:
            stall_data = stall_resp.json()
            # Handle case where response is a list
            if isinstance(stall_data, list):
                if len(stall_data) == 0:
                    return jsonify({"error": "No stall data found"}), 400
                stall_data = stall_data[0]
            elif not isinstance(stall_data, dict):
                return jsonify({"error": "Invalid stall data format"}), 400
        except ValueError:
            return jsonify({"error": "Invalid JSON from Stall API"}), 400

        # Fetch menu data
        menu_resp = requests.post(
            "https://khalo-r5v5.onrender.com/vendor/getMenuItems",
            json={"stall_id": stall_id},
            headers={"Content-Type": "application/json"},
        )
        if menu_resp.status_code != 200:
            return jsonify({"error": f"Menu API failed: {menu_resp.text}"}), 400

        try:
            menu_items = menu_resp.json()
            if not isinstance(menu_items, list):
                menu_items = []  # Default to empty list if unexpected format
        except ValueError:
            return jsonify({"error": "Invalid JSON from Menu API"}), 400

        # Generate prompt
        prompt = f"""
You are an expert food assistant at a food court. Use this information:

=== STALL DETAILS ===
Name: {stall_data.get('name', 'Unknown Stall')}
Cuisine: {stall_data.get('cuisine_type', 'Various')}
Rating: {stall_data.get('rating', 'Not rated')}
Description: {stall_data.get('description', 'No description available')}

=== MENU ITEMS ===
{format_menu_items(menu_items)}

Please provide helpful recommendations or answer questions.
"""

        # Get LLM response
        response = groq_client.chat.completions.create(
            model="Llama-3.1-8b-Instant",
            messages=[
                {"role": "system", "content": "You are a friendly food assistant."},
                {"role": "user", "content": prompt},
            ],
        )

        return jsonify(
            {
                "assistant_response": response.choices[0].message.content,
                "stall_name": stall_data.get("name"),
                "cuisine": stall_data.get("cuisine_type"),
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def format_menu_items(menu_data):
    """Safely format menu items that could be a list or dict"""
    if not menu_data:
        return "No menu items available"

    if isinstance(menu_data, dict):
        menu_data = [menu_data]

    if not isinstance(menu_data, list):
        return "Invalid menu format"

    items = []
    for item in menu_data:
        if not isinstance(item, dict):
            continue
        items.append(
            f"- {item.get('name', 'Unnamed Item')}: "
            f"${item.get('price', '?')} "
            f"({'veg' if item.get('is_vegetarian', False) else 'non-veg'})"
        )

    return "\n".join(items) if items else "No valid menu items found"


if __name__ == "__main__":
    app.run(debug=True)
