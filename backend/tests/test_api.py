from fastapi.testclient import TestClient
from main import app


def test_read_root():
    with TestClient(app) as client:
        response = client.get("/")
        assert response.status_code == 200
        assert response.json() == {"message": "Todo API is running with Neon Serverless PostgreSQL!"}


def test_health_check():
    with TestClient(app) as client:
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy", "database": "Neon Serverless PostgreSQL connected"}