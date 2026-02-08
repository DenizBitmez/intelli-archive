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

class SafeGoogleGenerativeAIEmbeddings(GoogleGenerativeAIEmbeddings):
    def embed_query(self, text: str):
        res = super().embed_query(text)
        # Force conversion to standard python list of floats to satisfy Chroma
        return [float(x) for x in res]
    
    def embed_documents(self, texts, **kwargs):
        res = super().embed_documents(texts, **kwargs)
        # Force conversion for list of lists
        return [[float(x) for x in doc] for doc in res]

def ingest_document(file_path: str, documents=None):
    """
    Load, split, and ingest document into ChromaDB using Gemini Embeddings.
    If 'documents' list is provided, skip loading from file.
    """
    if documents:
        docs = documents
    else:
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
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

    model_name = "models/gemini-embedding-001"
    print(f"DEBUG: Initializing Chroma with model={model_name}")
    vectorstore = Chroma(
        persist_directory=CHROMA_PATH, 
        embedding_function=SafeGoogleGenerativeAIEmbeddings(model=model_name, task_type="retrieval_document")
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
        embedding_function=SafeGoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001", task_type="retrieval_query")
    )
    
    # Filter by source file
    print(f"DEBUG: Querying with filter source={file_path}")
    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 5, "filter": {"source": file_path}}
    )
    
    docs = retriever.invoke(query)
    print(f"DEBUG: Retrieved {len(docs)} documents")
    
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")
    
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
