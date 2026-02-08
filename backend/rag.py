import os
import shutil
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_chroma import Chroma
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
# import dotenv already loaded in tasks or main

CHROMA_PATH = "chroma_db"

def get_loader(file_path):
    if file_path.endswith(".pdf"):
        loader = PyPDFLoader(file_path)
    return TextLoader(file_path)

def ingest_document(file_path: str):
    """
    Load, split, and ingest document into ChromaDB using Gemini Embeddings.
    """
    if not os.path.exists(file_path):
        return
    
    loader = get_loader(file_path)
    docs = loader.load()
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(docs)
    
    # Add metadata to allow filtering by file
    for doc in splits:
        doc.metadata["source"] = file_path

    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("Skipping ingestion: No API Key")
        return

    vectorstore = Chroma(
        persist_directory=CHROMA_PATH, 
        embedding_function=GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=api_key)
    )
    vectorstore.add_documents(splits)

def get_answer(query: str, file_path: str):
    """
    Answer a question based on a specific document file path using Gemini.
    """
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return "Error: No API Key set."

    vectorstore = Chroma(
        persist_directory=CHROMA_PATH, 
        embedding_function=GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=api_key)
    )
    
    # Filter by source file
    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 5, "filter": {"source": file_path}}
    )
    
    llm = ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=api_key)
    
    system_prompt = (
        "You are an assistant for question-answering tasks. "
        "Use the following pieces of retrieved context to answer "
        "the question. If you don't know the answer, say that you "
        "don't know. Use three sentences maximum and keep the "
        "answer concise."
        "\n\n"
        "{context}"
    )
    
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            ("human", "{input}"),
        ]
    )
    
    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)
    
    response = rag_chain.invoke({"input": query})
    return response["answer"]
