# Quickstart: AI Todo Chatbot

Follow these steps to set up the Phase-3 AI features.

## Prerequisites
- **Groq API Key**: Required for the AI Agent.
- **Python 3.11+**: Existing environment.
- **Node.js**: Existing environment.

## Step 1: Environment Configuration
Add your Groq key to `backend/.env`:
```bash
GROQ_API_KEY=your_groq_key_here
```

## Step 2: Install New Dependencies
```bash
# Backend
cd backend
pip install mcp groq

# Frontend
cd frontend
npm install # Ensure latest dependencies
```

## Step 3: Database Migration
The application will automatically attempt to create the new `ChatConversation` and `ChatMessage` tables on startup if they don't exist. Alternatively, run:
```bash
cd backend
python -c "from src.database import create_db_and_tables; import asyncio; asyncio.run(create_db_and_tables())"
```

## Step 4: Launching the App
1. Start the backend: `npm run dev:backend` (from root)
2. Start the frontend: `npm run dev:frontend` (from root)
3. Log in and look for the **Chat** icon in the sidebar or dashboard.

## Testing the AI
Try these commands in the chat interface:
- "Add a task to buy coffee"
- "What's on my to-do list?"
- "Mark the coffee task as completed"
