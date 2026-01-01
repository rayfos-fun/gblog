import pytest
import sys
from unittest.mock import MagicMock, patch

# Need to patch firestore.Client BEFORE importing main because it initializes 'db' at module level
with patch("google.cloud.firestore.Client"):
    from main import app, db


@pytest.fixture
def client():
    """Configures the Flask application for testing."""
    app.config["TESTING"] = True
    app.config["SECRET_KEY"] = "test_secet_key"  # Needed for session
    with app.test_client() as client:
        yield client


@pytest.fixture
def mock_db():
    """
    Returns the mocked Firestore client object (db) from main.
    Since we patched Client() before import, main.db is a Mock object.
    We can reset it for each test.
    """
    db.reset_mock()
    return db


# --- POST /api/comments Tests ---


def test_add_comment_success_logged_in(client, mock_db):
    """
    Test adding a comment successfully when user is logged in.
    Should return 201 and call db.collection(...).add(...)
    """
    # 1. Simulate logged-in user
    with client.session_transaction() as sess:
        sess["user"] = {
            "name": "Test User",
            "picture": "http://example.com/pic.jpg",
            "sub": "user_123",
        }

    # 2. Mock payload
    payload = {"slug": "/test-post", "content": "This is a test comment."}

    # 3. Make POST request
    response = client.post("/api/comments", json=payload)

    # 4. Assertions
    assert response.status_code == 201
    assert response.json["status"] == "success"

    # Verify Firestore interaction
    # db.collection("comments").add(...)
    mock_db.collection.assert_called_with("comments")
    mock_db.collection("comments").add.assert_called_once()

    # Check arguments passed to add()
    args, _ = mock_db.collection("comments").add.call_args
    data = args[0]
    assert data["slug"] == "/test-post"
    assert data["content"] == "This is a test comment."
    assert data["author_name"] == "Test User"
    assert data["author_id"] == "user_123"


def test_add_comment_unauthorized(client, mock_db):
    """
    Test adding a comment when user is NOT logged in.
    Should return 401 Unauthorized.
    """
    # No session setup

    payload = {"slug": "/test", "content": "hello"}
    response = client.post("/api/comments", json=payload)

    assert response.status_code == 401
    assert "Unauthorized" in response.json["error"]

    # Verify DB was NOT called
    mock_db.collection("comments").add.assert_not_called()


def test_add_comment_missing_fields(client, mock_db):
    """
    Test adding a comment with missing fields (slug or content).
    Should return 400 Bad Request.
    """
    with client.session_transaction() as sess:
        sess["user"] = {"name": "Test User"}

    # Case 1: Missing content
    response = client.post("/api/comments", json={"slug": "/test"})
    assert response.status_code == 400
    assert "Missing" in response.json["error"]

    # Case 2: Missing slug
    response = client.post("/api/comments", json={"content": "hello"})
    assert response.status_code == 400
    assert "Missing" in response.json["error"]

    mock_db.collection("comments").add.assert_not_called()


# --- GET /api/comments Tests ---


def test_get_comments_success(client, mock_db):
    """
    Test fetching comments for a specific slug.
    Should return 200 and a list of comments.
    """
    # 1. Setup mock query results
    # Query chain: db.collection("comments").where(...).order_by(...).stream()

    mock_collection = mock_db.collection.return_value
    mock_query_where = mock_collection.where.return_value
    mock_query_order = mock_query_where.order_by.return_value

    # Simulate documents returned by stream()
    mock_doc1 = MagicMock()
    mock_doc1.to_dict.return_value = {
        "slug": "/test",
        "content": "First!",
        "author_name": "Alice",
        # Timestamp is usually an object with isoformat() in real Flask/Firestore logic
        # In main.py: if 'created_at' in data: data['created_at'].isoformat()
        # We can mock a datetime object or a mock with isoformat
        "created_at": MagicMock(isoformat=lambda: "2024-01-01T12:00:00"),
    }

    mock_doc2 = MagicMock()
    mock_doc2.to_dict.return_value = {
        "slug": "/test",
        "content": "Second!",
        "author_name": "Bob",
        "created_at": None,  # Handle missing timestamp case
    }

    mock_query_order.stream.return_value = [mock_doc1, mock_doc2]

    # 2. Make GET request
    response = client.get("/api/comments?slug=/test")

    # 3. Assertions
    assert response.status_code == 200
    data = response.json
    assert len(data) == 2
    assert data[0]["content"] == "First!"
    assert data[0]["created_at"] == "2024-01-01T12:00:00"
    assert data[1]["content"] == "Second!"

    # Verify Query Construction
    mock_db.collection.assert_called_with("comments")
    mock_collection.where.assert_called_with("slug", "==", "/test")


def test_get_comments_missing_slug(client):
    """
    Test fetching comments without providing 'slug' param.
    Should return 400.
    """
    response = client.get("/api/comments")
    assert response.status_code == 400
    assert "Missing slug" in response.json["error"]


def test_get_comments_db_error(client, mock_db):
    """
    Test handling of a database exception.
    Should return 500.
    """
    # Simulate Exception during query
    mock_db.collection.side_effect = Exception("Firestore is down")

    response = client.get("/api/comments?slug=/test")

    assert response.status_code == 500
    assert "Failed to fetch" in response.json["error"]
