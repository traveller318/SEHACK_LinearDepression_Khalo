import os
import requests
import whisper
import torch
from gtts import gTTS
from io import BytesIO
from flask import Flask, request, jsonify
from groq import Client

# Initialize Flask app
app = Flask(__name__)

# Initialize Groq client
groq_client = Client(api_key="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")

# Initialize Whisper model (tiny for speed; change to base/medium/large if needed)
whisper_model = whisper.load_model("base")

# Route to handle food assistant tasks
@app.route('/foodAssistant', methods=['POST'])
def food_assistant():
    try:
        # Get stall_id from the request body
        stall_id = request.json.get('stall_id')

        # Call Node.js route to get stall details
        stall_resp = requests.get("https://khalo-r5v5.onrender.com/customer/getSingleStall", json={"stall_id": stall_id})
        if stall_resp.status_code != 200:
            return jsonify({"error": "Failed to fetch stall data"}), 400
        stall_data = stall_resp.json()

        # Call Node.js route to get menu items
        menu_resp = requests.get("https://khalo-r5v5.onrender.com/vendor/getMenuItems", json={"stall_id": stall_id})
        if menu_resp.status_code != 200:
            return jsonify({"error": "Failed to fetch menu data"}), 400
        menu_data = menu_resp.json()

        # Combine info for prompt
        prompt = f"""
You are a food assistant for a food court.

Here are the details of the stall:
{stall_data}

And here is the menu:
{menu_data}

Now, based on this info, help the user choose something tasty or answer their questions.
"""

        # Send to Groq
        response = groq_client.chat.completions.create(
            model="Llama-3.1-8b-Instant",  # or "llama3-70b-8192"
            messages=[
                {"role": "system", "content": "You are a helpful food assistant."},
                {"role": "user", "content": prompt}
            ]
        )

        assistant_response = response.choices[0].message.content

        # Synthesize speech using gTTS
        audio_data = synthesize_speech(assistant_response)

        return jsonify({"assistant_response": assistant_response, "audio": audio_data})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def transcribe_audio(file_path):
    """Converts speech audio file to text using Whisper."""
    result = whisper_model.transcribe(file_path)
    return result['text']


def synthesize_speech(text):
    """Convert assistant text to speech using gTTS."""
    tts = gTTS(text=text, lang='en')
    audio_io = BytesIO()
    tts.save(audio_io)
    audio_io.seek(0)
    return audio_io.getvalue()  # Returning audio data as a byte stream


# Route to handle audio input and transcription
@app.route('/talk', methods=['POST'])
def talk():
    try:
        # Get stall_id from the request body
        stall_id = request.json.get('stall_id')

        # Record audio from user
        audio_file = request.files['audio']  # Audio file sent in the request

        # Save audio file temporarily to disk
        audio_path = f"temp_audio.wav"
        audio_file.save(audio_path)

        # Transcribe audio to text using Whisper
        user_text = transcribe_audio(audio_path)

        # Call the food assistant with the transcribed text
        stall_resp = requests.get("https://khalo-r5v5.onrender.com/customer/getSingleStall", json={"stall_id": stall_id})
        if stall_resp.status_code != 200:
            return jsonify({"error": "Failed to fetch stall data"}), 400
        stall_data = stall_resp.json()

        menu_resp = requests.get("https://khalo-r5v5.onrender.com/vendor/getMenuItems", json={"stall_id": stall_id})
        if menu_resp.status_code != 200:
            return jsonify({"error": "Failed to fetch menu data"}), 400
        menu_data = menu_resp.json()

        # Combine info for prompt
        prompt = f"""
You are a food assistant for a food court.

Here are the details of the stall:
{stall_data}

And here is the menu:
{menu_data}

User query: {user_text}

Respond helpfully and concisely.
"""

        response = groq_client.chat.completions.create(
            model="Llama-3.1-8b-Instant",  # or "llama3-70b-8192"
            messages=[
                {"role": "system", "content": "You are a helpful food assistant."},
                {"role": "user", "content": prompt}
            ]
        )

        assistant_response = response.choices[0].message.content

        # Synthesize speech for the assistant's response
        audio_data = synthesize_speech(assistant_response)

        return jsonify({"assistant_response": assistant_response, "audio": audio_data})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
