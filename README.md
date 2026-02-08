# IntelliArchive

AI-Powered Intelligent Document Management System.
Upload documents, auto-classify them, and chat with your files using RAG.

## Prerequisites
- Docker & Docker Compose
- Node.js (v18+)
- Python (v3.11+)
- **Google API Key** (Gemini)

## Setup

1. **Environment Variables**
   Create a `.env` file in `backend/` or root with:
   ```
   GOOGLE_API_KEY=AIz...
   CELERY_BROKER_URL=redis://localhost:6379/0
   CELERY_RESULT_BACKEND=redis://localhost:6379/0
   ```
   *Get your key from [Google AI Studio](https://aistudio.google.com/app/apikey)*

## Running with Docker (Recommended)

```bash
docker-compose up --build
```
This starts:
- Redis (6379)
- Backend API (8000)
- Celery Worker (Processing with Gemini 1.5 Flash)

## Running Frontend

```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

## Verification
Run the verification script to test the backend API:
```bash
python verify_system.py
```
*Note: Ensure backend is running first.*

## Features
- **Upload**: Drag & drop PDF/Text files.
- **Auto-Tagging (Gemini)**: AI automatically tags (Invoice, Contract, etc.) and summarizes.
- **RAG Chat (Gemini)**: Ask questions about the uploaded document using `embedding-001` and `gemini-1.5-flash`.
