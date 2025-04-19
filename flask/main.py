from flask import Flask, request, jsonify
from cleanliness import generate_cleanliness_report  # Import the generate report function
from whatsapp_notifier import WhatsAppNotifier  # Import the WhatsApp notifier class
import os
import requests
import json
import speech_recognition as sr
import re 
        # Import the function properly (make sure it's not shadowing this function name)
from nltk_review import analyze_reviews as analyze_reviews_nltk  # Import the review analysis function
from groq import Groq
app = Flask(__name__)
NODE_API_URL = os.getenv("NODE_API_URL")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

client = Groq(api_key=GROQ_API_KEY)

@app.route('/generate_report', methods=['POST'])
def generate_report():
    try:
        # Get image paths and vendor number from the request
        data = request.get_json()
        image_paths = data['image_paths']
        vendor_number = data['vendor_number']

        # Ensure that we have 5 images
        if len(image_paths) != 5:
            return jsonify({'status': 'error', 'message': 'Exactly 5 images are required'}), 400

        # Generate the cleanliness report
        report_data = generate_cleanliness_report(image_paths)

        if report_data['status'] != 'success':
            return jsonify(report_data), 400

        # Pass the report to WhatsAppNotifier
        notifier = WhatsAppNotifier()
        success = notifier.notify_vendor(vendor_number, report_data)

        if not success:
            return jsonify({'status': 'error', 'message': 'Failed to send WhatsApp notification'}), 500

        # Return the final report in JSON format
        return jsonify(report_data['report']), 200

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
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
            print(f"Invalid JSON received from Node.js backend for stall ID: {stall_id}")
            return jsonify({"error": "Invalid JSON received from the Node.js backend"}), 400

        if not data:
            print(f"No reviews found for stall ID: {stall_id}")
            return jsonify({"error": "No reviews found."}), 404

        # Extract ratings and review text
        ratings = [r["rating"] for r in data if "rating" in r]
        reviews = [r["review_text"] for r in data if "review_text" in r]

        print(f"Extracted {len(ratings)} ratings and {len(reviews)} reviews for stall ID: {stall_id}")

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

        return jsonify({
            "average_rating": avg_rating,
            "review_summary": summary_result
        })

    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from Node.js backend for stall ID {stall_id}: {str(e)}")
        return jsonify({"error": f"Error fetching data: {str(e)}"}), 500
    except Exception as e:
        print(f"Unexpected error during analysis for stall ID {stall_id}: {str(e)}")
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500
  # Add this import at the top of your file

CUISINE_KEYWORDS = [
    "chinese", "italian", "indian", "mexican", "thai", 
    "japanese", "french", "mediterranean", "american", 
    "vietnamese", "korean", "spanish", "greek", "lebanese"
]

@app.route('/analyze_speech', methods=['POST'])
def analyze_speech():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files['audio']
    recognizer = sr.Recognizer()

    try:
        with sr.AudioFile(audio_file) as source:
            audio_data = recognizer.record(source)
            transcript = recognizer.recognize_google(audio_data).lower()

            found_keywords = list(set(
                word for word in re.findall(r'\w+', transcript)
                if word in CUISINE_KEYWORDS
            ))

            # Send the keywords to your Node.js route
            node_url = "http://10.10.112.73:3000/customer/getKeywordStalls"
            response = requests.post(
                node_url,
                json={"keywords": found_keywords},
                headers={'Content-Type': 'application/json'}
            )

            # Return the response from your Node.js server
            return jsonify({
                "status": "success",
                "node_response": response.json(),
                "keywords_sent": found_keywords
            })

    except sr.UnknownValueError:
        return jsonify({"error": "Speech not understood"}), 400
    except sr.RequestError as e:
        return jsonify({"error": f"Google API error: {e}"}), 500
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to connect to Node server: {e}"}), 502
    except Exception as e:
        return jsonify({"error": str(e)}), 500
if __name__ == "__main__":
    app.run(debug=True)