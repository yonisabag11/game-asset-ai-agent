# Game Asset AI Agent v1.0

A complete AI-powered game asset generation system with a React frontend and Flask backend.

> **Version 1.0** - First release of the Game Asset AI Agent. More specialized AI agents coming in future versions!

## Features

- 🎨 AI-powered game asset generation using ClipDrop API
- 🤖 Intelligent prompt enhancement using Google Gemini
- 💬 Discord-like chat interface
- 🖼️ Image preview and download functionality
- 📱 Responsive design with fullscreen image viewing

## Architecture

- **Frontend**: React + Vite (TypeScript-ready)
- **Backend**: Flask (Python)
- **AI Services**: Google Gemini + ClipDrop API

## Setup Instructions

### Prerequisites

- Node.js and npm
- Python 3.7+
- API keys for:
  - Google Gemini API
  - ClipDrop API

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install flask flask-cors requests google-generativeai
   ```

3. Create a `.env` file in the backend directory and add your API keys:
   ```
   CLIPDROP_API_KEY=your_clipdrop_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Run the Flask server:
   ```bash
   python app.py
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173`

## API Keys Required

### Google Gemini API
- Get your API key from: https://makersuite.google.com/app/apikey
- Used for intelligent prompt enhancement

### ClipDrop API
- Get your API key from: https://clipdrop.co/apis
- Used for AI image generation

## Usage

1. Start both the backend and frontend servers
2. Open your browser to `http://localhost:5173`
3. Chat with the AI agent to generate game assets
4. The AI will enhance your prompts and generate high-quality images
5. Download generated images directly from the chat interface

## Project Structure

```
game-asset-ai-agent/
├── backend/
│   ├── app.py          # Flask server with API endpoints
│   └── requirements.txt # Python dependencies
├── frontend/
│   ├── public/         # Static assets
│   ├── src/           # React source code
│   │   ├── App.jsx    # Main app component
│   │   ├── ChatsPage.jsx # Chat interface
│   │   └── ...
│   ├── package.json   # Node dependencies
│   └── vite.config.js # Vite configuration
└── README.md          # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

This is version 1.0 - more specialized AI agents are planned for future releases!

## License

MIT License - see LICENSE file for details
