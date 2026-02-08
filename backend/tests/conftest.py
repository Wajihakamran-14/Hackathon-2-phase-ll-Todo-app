import pytest
from app import app
from fastapi.testclient import TestClient


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client