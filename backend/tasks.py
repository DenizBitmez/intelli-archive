import os
from celery import Celery
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
import dotenv
from rag import ingest_document

dotenv.load_dotenv()

CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

celery_app = Celery(
    "intelli_archive_tasks",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND
)

def step_process_document(file_path: str):
    """
    Process document to get summary and tags using Google Gemini
    """
    if not os.path.exists(file_path):
        return {"error": "File not found"}

    # 1. Load Document
    if file_path.endswith(".pdf"):
        loader = PyPDFLoader(file_path)
    else:
        loader = TextLoader(file_path)
    
    docs = loader.load()
    if not docs:
        return {"error": "Empty document"}
    
    full_text = " ".join([d.page_content for d in docs])
    
    # 2. AI Processing (Summary & Tags)
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return {
            "summary": "AI processing skipped (No API Key).",
            "tags": ["Pending"],
            "text_preview": full_text[:200]
        }

    llm = ChatGoogleGenerativeAI(temperature=0, model="gemini-2.5-flash", google_api_key=api_key)

    # Summary Prompt
    summary_prompt = PromptTemplate(
        input_variables=["text"],
        template="Summarize the following document in exactly 3 sentences:\n\n{text}"
    )
    summary_chain = (summary_prompt | llm)
    summary = summary_chain.invoke({"text": full_text[:10000]}).content # Gemini handles larger context

    # Tagging Prompt
    tag_prompt = PromptTemplate(
        input_variables=["text"],
        template="Identify the type of this document (e.g., Invoice, Contract, Resume, Article) and return just the label. Document:\n\n{text}"
    )
    tag_chain = (tag_prompt | llm)
    tag = tag_chain.invoke({"text": full_text[:2000]}).content

    # 3. RAG Ingestion (Async ideally, but doing here for simplicity)
    try:
        print(f"Calling ingest_document for {file_path}")
        ingest_document(file_path, documents=docs)
        print("ingest_document completed")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Ingestion failed: {e}")

    return {
        "summary": summary,
        "tags": [tag.strip()],
        "text_preview": full_text[:200]
    }

@celery_app.task(bind=True)
def process_document_task(self, file_path: str):
    try:
        result = step_process_document(file_path)
        return result
    except Exception as e:
        return {"error": str(e)}
