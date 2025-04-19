import base64
from groq import Groq
from dotenv import load_dotenv
import os
import json
from typing import List, Dict
from PIL import Image
from io import BytesIO

# Load environment variables
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def compress_image(image_path: str, quality=85, max_size=1024) -> str:
    """Compress and resize image before encoding"""
    with Image.open(image_path) as img:
        if max(img.size) > max_size:
            img.thumbnail((max_size, max_size))
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        buffer = BytesIO()
        img.save(buffer, format="JPEG", quality=quality)
        return base64.b64encode(buffer.getvalue()).decode('utf-8')

def generate_cleanliness_report(image_paths: List[str]) -> Dict:
    """Generate cleanliness report from 5 images"""
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not set")

    if len(image_paths) != 5:
        raise ValueError("Exactly 5 images are required")

    try:
        print("Compressing and encoding images...")
        encoded_images = [compress_image(path) for path in image_paths]

        query = """
        You are a professional hygiene inspector evaluating food vendors. 
        Analyze these 5 images (4 sides of the cooking area and 1 overview of the setup) and:

        1. Rate the cleanliness on a scale of 1-5 (5 being extremely clean)
        2. Identify specific cleanliness issues
        3. Provide actionable recommendations for improvement
        4. Highlight any good practices observed

        Provide your response in this JSON format:
        {
            "cleanliness_rating": number,
            "issues_found": list of strings,
            "recommendations": list of strings,
            "good_practices": list of strings,
            "overall_summary": string
        }
        """

        print("Sending request to Groq API...")
        client = Groq(api_key=GROQ_API_KEY)
        messages = [{
            "role": "user",
            "content": query
        }]

        response = client.chat.completions.create(
            messages=messages,
            model="llama3-70b-8192",
            response_format={"type": "json_object"},
            temperature=0.2
        )

        report = json.loads(response.choices[0].message.content)
        return {
            "status": "success",
            "report": report
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
