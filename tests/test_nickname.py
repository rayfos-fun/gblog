from unittest.mock import MagicMock, patch

import pytest

# Patch firestore before importing main
with patch("google.cloud.firestore.Client"):
    from main import app, db


@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.config["SECRET_KEY"] = "test_key"
    with app.test_client() as client:
        yield client


@pytest.fixture
def mock_db():
    db.reset_mock()
    return db


def test_update_nickname_success(client, mock_db):
    """Test successfully updating a nickname."""
    # 1. Login
    with client.session_transaction() as sess:
        sess["user"] = {"sub": "user_123", "name": "Test User"}

    # 2. Call API
    payload = {"nickname": "NewNick"}
    response = client.post("/api/user/nickname", json=payload)

    # 3. Verify
    assert response.status_code == 200
    assert response.json["status"] == "success"
    assert response.json["nickname"] == "NewNick"

    # Check Firestore update
    # db.collection('users').document('user_123').set(...)
    mock_db.collection.assert_called_with("users")
    mock_db.collection("users").document.assert_called_with("user_123")
    mock_db.collection("users").document().set.assert_called_with(
        {"nickname": "NewNick"}, merge=True
    )

    # Check Session update (need to check within a request context or via subsequent request)
    with client.session_transaction() as sess:
        assert sess["nickname"] == "NewNick"


def test_update_nickname_unauthorized(client, mock_db):
    """Test updating nickname without login."""
    response = client.post("/api/user/nickname", json={"nickname": "NewNick"})
    assert response.status_code == 401
    mock_db.collection.assert_not_called()


def test_update_nickname_invalid_length(client):
    """Test nickname with invalid length."""
    with client.session_transaction() as sess:
        sess["user"] = {"sub": "user_123"}

    # Too short
    response = client.post("/api/user/nickname", json={"nickname": ""})
    assert response.status_code == 400

    # Too long (21 chars)
    response = client.post("/api/user/nickname", json={"nickname": "a" * 21})
    assert response.status_code == 400


def test_api_me_includes_nickname(client):
    """Test /api/me returns the nickname."""
    with client.session_transaction() as sess:
        sess["user"] = {"sub": "user_123", "name": "Test User"}
        sess["nickname"] = "MyNick"

    response = client.get("/api/me")
    assert response.status_code == 200
    data = response.json
    assert data["authed"] is True
    assert data["nickname"] == "MyNick"


@patch("main.google")
def test_auth_callback_with_nickname(mock_google, client, mock_db):
    """Test auth callback correctly loads existing nickname."""
    # 1. Mock Google OAuth response
    mock_token = {
        "userinfo": {"sub": "user_123", "name": "Test User", "picture": "pic.jpg"}
    }
    mock_google.authorize_access_token.return_value = mock_token

    # 2. Mock Firestore returning a nickname
    mock_doc = MagicMock()
    mock_doc.exists = True
    mock_doc.to_dict.return_value = {"nickname": "ExistingNick"}
    mock_db.collection("users").document().get.return_value = mock_doc

    # 3. Access callback (simulating popup mode)
    with client.session_transaction() as sess:
        sess["auth_mode"] = "popup"

    response = client.get("/auth/callback")

    # 4. Verify response contains nickname in the JS postMessage
    assert response.status_code == 200
    html = response.data.decode("utf-8")
    assert "type: 'LOGIN_SUCCESS'" in html
    assert 'nickname: "ExistingNick"' in html

    # Verify session
    with client.session_transaction() as sess:
        assert sess["nickname"] == "ExistingNick"


@patch("main.google")
def test_auth_callback_no_nickname(mock_google, client, mock_db):
    """Test auth callback uses default nickname if none exists."""
    # 1. Mock Google OAuth response
    mock_token = {
        "userinfo": {"sub": "user_456", "name": "New User", "picture": "pic.jpg"}
    }
    mock_google.authorize_access_token.return_value = mock_token

    # 2. Mock Firestore returning NO document (or no nickname)
    mock_doc = MagicMock()
    mock_doc.exists = False  # Document doesn't exist
    mock_db.collection("users").document().get.return_value = mock_doc

    # 3. Access callback (simulating popup mode)
    with client.session_transaction() as sess:
        sess["auth_mode"] = "popup"

    response = client.get("/auth/callback")

    # 4. Verify response contains default 'Anonymous'
    assert response.status_code == 200
    html = response.data.decode("utf-8")
    assert "type: 'LOGIN_SUCCESS'" in html
    assert 'nickname: "Anonymous"' in html

    # Verify session
    with client.session_transaction() as sess:
        assert sess["nickname"] == "Anonymous"
