import shutil
import os
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from tasks import process_document_task

app = FastAPI(title="IntelliArchive API")

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to IntelliArchive API"}

@app.post("/upload/")
async def upload_document(file: UploadFile = File(...)):
    file_location = f"uploads/{file.filename}"
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
    
    # Trigger Celery task
    task = process_document_task.delay(file_location)
    
    return {
        "filename": file.filename, 
        "status": "uploaded", 
        "task_id": task.id
    }

from pydantic import BaseModel
from rag import get_answer

class ChatRequest(BaseModel):
    query: str
    filename: str

@app.post("/chat/")
async def chat_with_doc(request: ChatRequest):
    # Depending on how we store, we might need full path or just filename
    # Main stored it as uploads/filename
    file_path = f"uploads/{request.filename}"
    answer = get_answer(request.query, file_path)
    return {"answer": answer}

from celery.result import AsyncResult
from tasks import celery_app

@app.get("/tasks/{task_id}")
def get_task_status(task_id: str):
    task_result = AsyncResult(task_id, app=celery_app)
    result = {
        "task_id": task_id,
        "status": task_result.status,
        "result": task_result.result if task_result.ready() else None
    }
    return result

