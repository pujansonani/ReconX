import pytest

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_demo_preload(client):
    response = client.post("/api/demo/preload?scenario=ADVERSARIAL&records=500")
    assert response.status_code == 200
    data = response.json()
    assert "run_id" in data
    assert data["metrics"]["total_records"] > 0
    assert data["metrics"]["match_rate"] > 70.0

def test_list_reconciliations(client):
    # Preload first
    client.post("/api/demo/preload?scenario=CLEAN&records=500")
    response = client.get("/api/reconciliations")
    assert response.status_code == 200
    runs = response.json()
    assert len(runs) > 0

def test_evaluation_run(client):
    response = client.post("/api/evaluations/run?records=500&seed=123")
    assert response.status_code == 200
    data = response.json()
    assert data["forced_matches"] == 0
    assert data["precision"] > 90.0
