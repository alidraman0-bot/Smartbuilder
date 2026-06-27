import httpx
import uuid
import sys

def test_discovery():
    try:
        # Increase timeout to 60 seconds
        timeout = httpx.Timeout(60.0)
        proj_id = str(uuid.uuid4())
        print(f"Testing with project_id: {proj_id}")
        with httpx.Client(timeout=timeout) as client:
            response = client.post("http://127.0.0.1:8000/api/v1/ideas/discovery", json={"project_id": proj_id})
            with open("out3.txt", "w", encoding="utf-8") as f:
                f.write(f"Status: {response.status_code}\n")
                f.write(f"Response: {response.text}\n")
    except Exception as e:
        with open("out3.txt", "w", encoding="utf-8") as f:
            f.write(f"Error: {e}\n")

if __name__ == "__main__":
    test_discovery()
