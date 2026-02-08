from fastapi.testclient import TestClient
from app import app


def test_migrate_endpoint():
    """Test the migration endpoint"""
    with TestClient(app) as client:
        response = client.post("/migrate")
        assert response.status_code == 200
        assert response.json() == {"message": "Database migrations completed successfully"}