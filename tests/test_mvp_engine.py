import pytest
from fastapi.testclient import TestClient
from fastapi_mvp_engine import app

client = TestClient(app)

def test_generate_endpoint():
    response = client.post("/api/v1/generate", json={
        "prompt": "Test app prompt",
        "name": "Test App"
    })
    assert response.status_code == 200
    assert "projectId" in response.json()
    assert response.json()["status"] == "pending"

def test_list_projects():
    response = client.get("/api/v1/projects")
    assert response.status_code == 200
    assert "projects" in response.json()

def test_get_project_404():
    response = client.get("/api/v1/projects/non-existent-id")
    assert response.status_code == 404
