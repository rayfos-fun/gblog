import json
import logging
import os
from datetime import timedelta

from authlib.integrations.flask_client import OAuth
from flask import (
    Flask,
    jsonify,
    make_response,
    redirect,
    render_template_string,
    request,
    send_from_directory,
    session,
    url_for,
)
from google.cloud import firestore, secretmanager

STATIC_FOLDER = "jekyll-site/_site"
app = Flask(__name__, static_folder=STATIC_FOLDER)
logging.basicConfig(level=logging.INFO)

IS_PRODUCTION = os.environ.get("GAE_ENV", "").startswith("standard")
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=3650)
if IS_PRODUCTION:
    app.config["SESSION_COOKIE_SECURE"] = True  # https
    app.config["SESSION_COOKIE_HTTPONLY"] = True  # avoid js
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"  # allow redirect
else:
    app.config["SESSION_COOKIE_SECURE"] = False


def get_google_secrets():
    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT")
    secret_id = "RAYFOS_SECRET"
    version_id = "latest"
    client = secretmanager.SecretManagerServiceClient()
    response = client.access_secret_version(
        request={
            "name": f"projects/{project_id}/secrets/{secret_id}/versions/{version_id}"
        }
    )
    return json.loads(response.payload.data.decode("UTF-8"))


GOOGLE_CLIENT_ID = None
GOOGLE_CLIENT_SECRET = None

if IS_PRODUCTION:
    print("☁️ Loading config from Google Secret Manager...")
    try:
        config = get_google_secrets()
        app.secret_key = config.get("SECRET_KEY")
        GOOGLE_CLIENT_ID = config.get("GOOGLE_CLIENT_ID")
        GOOGLE_CLIENT_SECRET = config.get("GOOGLE_CLIENT_SECRET")
    except Exception as e:
        print(f"❌ Failed to load secrets from GSM: {e}")
        raise e
else:
    print("💻 Loading config from Local .env file...")
    from dotenv import load_dotenv

    load_dotenv()
    app.secret_key = os.environ.get("SECRET_KEY")
    GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET")

oauth = OAuth(app)
google = oauth.register(
    name="google",
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

# Initialize Firestore. It could connect to cloud or emulator (requiring GOOGLE_CLOUD_PROJECT and FIRESTORE_EMULATOR_HOST) accordingly
db = firestore.Client()


@app.route("/api/comments", methods=["POST"])
def add_comment():
    user = session.get("user")
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    if not data or "content" not in data or "slug" not in data:
        return jsonify({"error": "Missing content or slug"}), 400

    if len(data["content"].encode("utf-8")) > 1000:
        return jsonify({"error": "Comment too long (max 1000 bytes)"}), 400

    try:
        comment_data = {
            "slug": data["slug"],
            "content": data["content"],
            "author_name": user.get("name"),
            "author_picture": user.get("picture"),
            "author_id": user.get("sub"),
            "created_at": firestore.SERVER_TIMESTAMP,
        }

        db.collection("comments").add(comment_data)

        return jsonify({"status": "success", "message": "Comment added"}), 201
    except Exception as e:
        print(f"Error adding comment: {e}")
        return jsonify({"error": "Failed to add comment"}), 500


@app.route("/api/me")
def api_me():
    user = session.get("user")
    if user:
        return jsonify(
            {
                "authed": True,
                "name": user.get("name"),
                "picture": user.get("picture"),
                "sub": user.get("sub"),  # Google User Unique ID
            }
        )
    else:
        return jsonify({"authed": False})


@app.route("/auth/callback")
def auth():
    token = google.authorize_access_token()
    user_info = token.get("userinfo")

    session.permanent = True
    session["user"] = user_info

    mode = session.pop("auth_mode", "redirect")

    if mode == "popup":
        return render_template_string(
            """
      <!DOCTYPE html>
      <html><body>
      <p>Login successful. Closing...</p>
      <script>
        if (window.opener) {
          window.opener.postMessage({
            type: 'LOGIN_SUCCESS',
            user: {{ user | tojson }}
          }, '*');
        }
        window.close();
      </script>
      </body></html>
    """,
            user=user_info,
        )
    else:
        next_url = session.pop("next_url", "/")
        return redirect(next_url)


@app.route("/api/comments", methods=["GET"])
def get_comments():
    page_slug = request.args.get("slug")
    if not page_slug:
        return jsonify({"error": "Missing slug parameter"}), 400

    try:
        comments_ref = db.collection("comments")
        query = comments_ref.where("slug", "==", page_slug).order_by(
            "created_at", direction=firestore.Query.DESCENDING
        )
        docs = query.stream()

        comments = []
        for doc in docs:
            comment_data = doc.to_dict()
            # Convert timestamp to string for JSON serialization
            if "created_at" in comment_data and comment_data["created_at"]:
                comment_data["created_at"] = comment_data["created_at"].isoformat()
            comments.append(comment_data)

        return jsonify(comments)
    except Exception as e:
        print(f"Error fetching comments: {e}")
        return jsonify({"error": "Failed to fetch comments"}), 500


@app.route("/login")
def login():
    if request.args.get("mode") == "popup":
        session["auth_mode"] = "popup"
    else:
        session["auth_mode"] = "redirect"
        session["next_url"] = request.args.get("next") or request.referrer or "/"
    redirect_uri = url_for(
        "auth", _external=True
    )  # i.e. https://rayfos.fun/auth/callback based on the method "auth"
    return google.authorize_redirect(redirect_uri)


@app.route("/logout")
def logout():
    session.pop("user", None)
    return redirect("/")


@app.route("/gblog/")
@app.route("/gblog/<path:subpath>")
def redirect_old_gblog(subpath=""):
    return redirect(f"/{subpath}", code=301)


@app.route("/", defaults={"url": ""})
@app.route("/<path:url>")
def serve_index(url):
    target_langs = ["en", "zh-cn", "zh-tw"]
    if any(url.startswith(lang + "/") or url == lang for lang in target_langs):
        pass
    elif os.path.isfile(os.path.join(app.static_folder, url)):
        pass
    else:
        # Redirect Logic
        best = request.accept_languages.best_match(["zh-CN", "zh-TW", "en"])
        if best:
            prefix = best.lower()
        else:
            prefix = "en"
        return redirect(f"/{prefix}/{url}", code=302)

    target_file = "404.html"
    status_code = 404

    full_path = os.path.join(app.static_folder, url)
    if os.path.isfile(full_path):
        target_file = url
        status_code = 200
    elif os.path.isdir(full_path):
        index_path = os.path.join(full_path, "index.html")
        if os.path.isfile(index_path):
            target_file = os.path.join(url, "index.html")
            status_code = 200

    response = make_response(send_from_directory(app.static_folder, target_file))
    response.status_code = status_code
    return response


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8080, debug=True)
