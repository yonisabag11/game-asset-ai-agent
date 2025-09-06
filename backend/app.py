from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
import google.generativeai as genai
import io
import base64
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Get API keys from environment variables
CLIPDROP_API_KEY = os.getenv('CLIPDROP_API_KEY', 'your_clipdrop_api_key_here')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'your_gemini_api_key_here')

def enhance_prompt(user_input):
    """
    Enhance user input using Google Gemini to create better prompts for image generation
    """
    if GEMINI_API_KEY == 'your_gemini_api_key_here':
        return user_input  # Return original input if no API key is set
    
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.5-flash-lite')
        instruction = (
            "Rewrite the following prompt to be a high-quality, detailed, and visually appealing description for a 2D game asset. "
            "Do not explain, just output the improved prompt for an AI image generator."
        )
        full_prompt = f"{instruction}\nPrompt: {user_input}"
        response = model.generate_content(full_prompt)
        return response.text.strip() if hasattr(response, 'text') else user_input
    except Exception as e:
        print(f"Error enhancing prompt: {e}")
        return user_input

@app.route('/enhance-prompt', methods=['POST'])
def api_enhance_prompt():
    """
    API endpoint to enhance user prompts using Gemini
    """
    data = request.get_json()
    user_input = data.get('prompt', '')
    
    if not user_input:
        return jsonify({'error': 'No prompt provided'}), 400
    
    enhanced = enhance_prompt(user_input)
    return jsonify({'enhanced_prompt': enhanced})

@app.route('/generate-image', methods=['POST'])
def api_generate_image():
    """
    API endpoint to generate images using ClipDrop API
    """
    data = request.get_json()
    prompt = data.get('prompt', '')
    
    if not prompt:
        return jsonify({'error': 'No prompt provided'}), 400
    
    if CLIPDROP_API_KEY == 'your_clipdrop_api_key_here':
        return jsonify({'error': 'ClipDrop API key not configured'}), 400
    
    try:
        url = "https://clipdrop-api.co/text-to-image/v1"
        headers = {"x-api-key": CLIPDROP_API_KEY}
        files = {"prompt": (None, prompt)}
        
        response = requests.post(url, headers=headers, files=files)
        
        if response.status_code == 200 and response.headers.get("Content-Type") == "image/png":
            img_bytes = response.content
            img_b64 = base64.b64encode(img_bytes).decode('utf-8')
            return jsonify({'image': img_b64})
        else:
            return jsonify({'error': f'Image generation failed: {response.text}'}), 400
            
    except Exception as e:
        return jsonify({'error': f'Error generating image: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    return jsonify({
        'status': 'healthy',
        'clipdrop_configured': CLIPDROP_API_KEY != 'your_clipdrop_api_key_here',
        'gemini_configured': GEMINI_API_KEY != 'your_gemini_api_key_here'
    })

if __name__ == '__main__':
    print("Starting Game Asset AI Agent Backend...")
    print("Make sure to set your API keys in the .env file!")
    app.run(host='0.0.0.0', port=5000, debug=True)
