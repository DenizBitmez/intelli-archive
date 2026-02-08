import requests
import time
import os

BASE_URL = "http://localhost:8000"

def create_dummy_file():
    content = "IntelliArchive Test Document.\nThis is a sample invoice #12345.\nTotal Amount: $500.00\nDate: 2023-10-27."
    with open("test_invoice.txt", "w") as f:
        f.write(content)
    return "test_invoice.txt"

def verify_system():
    print("--- Starting Verification ---")
    
    # 1. Create File
    filename = create_dummy_file()
    print(f"[+] Created test file: {filename}")

    # 2. Upload
    print("[ ] Uploading file...")
    try:
        with open(filename, "rb") as f:
            files = {"file": f}
            response = requests.post(f"{BASE_URL}/upload/", files=files)
        
        if response.status_code != 200:
            print(f"[-] Upload failed: {response.text}")
            return
        
        data = response.json()
        task_id = data["task_id"]
        remote_filename = data["filename"]
        print(f"[+] Upload successful. Task ID: {task_id}")
    except Exception as e:
        print(f"[-] Error connecting to backend: {e}")
        return

    # 3. Poll Task Status
    print("[ ] Waiting for processing...")
    for _ in range(10):
        response = requests.get(f"{BASE_URL}/tasks/{task_id}")
        task_data = response.json()
        status = task_data["status"]
        print(f"    Status: {status}")
        
        if status == "SUCCESS":
            print(f"[+] Processing complete: {task_data['result']}")
            break
        elif status == "FAILURE":
            print(f"[-] Processing failed.")
            return
        
        time.sleep(2)
    else:
        print("[-] Timeout waiting for task.")
        return

    # 4. Chat Verification
    print("[ ] Testing Chat/RAG...")
    chat_payload = {
        "query": "What is the total amount?",
        "filename": remote_filename
    }
    response = requests.post(f"{BASE_URL}/chat/", json=chat_payload)
    if response.status_code == 200:
        print(f"[+] Chat Response: {response.json()['answer']}")
    else:
        print(f"[-] Chat failed: {response.text}")

    print("--- Verification Finished ---")

if __name__ == "__main__":
    verify_system()
