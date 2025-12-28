from authlib.integrations.flask_client import OAuth
from flask import Flask, redirect, make_response, request, send_from_directory, session, url_for
from google.cloud import secretmanager

import logging
import os

STATIC_FOLDER = 'jekyll-site/_site'

app = Flask(__name__, static_folder=STATIC_FOLDER)
logging.basicConfig(level=logging.INFO)

def get_google_secrets():
  project_id = os.environ.get('GOOGLE_CLOUD_PROJECT')
  secret_id = 'RAYFOS_SECRET'
  version_id = "latest"
  client = secretmanager.SecretManagerServiceClient()
  response = client.access_secret_version(request={"name": f"projects/{project_id}/secrets/{secret_id}/versions/{version_id}"})
  return json.loads(response.payload.data.decode("UTF-8"))

if os.environ.get('GAE_ENV', '').startswith('standard'):
  print("Loading config from Google Secret Manager...")
  try:
    config = get_google_secrets()
    app.secret_key = config.get('SECRET_KEY')
    GOOGLE_CLIENT_ID = config.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = config.get('GOOGLE_CLIENT_SECRET')
  except Exception as e:
    print(f"Failed to load secrets from GSM: {e}")
    raise e
else:
  print("💻 Loading config from Local .env file...")
  from dotenv import load_dotenv
  load_dotenv()
  app.secret_key = os.environ.get('SECRET_KEY')
  GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
  GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')

oauth = OAuth(app)
google = oauth.register(
  name='google',
  client_id=os.environ.get('GOOGLE_CLIENT_ID'),
  client_secret=os.environ.get('GOOGLE_CLIENT_SECRET'),
  server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
  client_kwargs={'scope': 'openid email profile'}
)

@app.route('/auth/callback')
def auth():
  token = google.authorize_access_token()
  user_info = token.get('userinfo')
  session['user'] = user_info
  return redirect('https://rayfos.fun/?login=success')

@app.route('/login')
def login():
  return google.authorize_redirect(url_for('auth', _external=True))

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect('https://rayfos.fun')

@app.route('/gblog/')
@app.route('/gblog/<path:subpath>')
def redirect_old_gblog(subpath=''):
  # /gblog/* => /*
  return redirect(f'/{subpath}', code=301)

@app.route('/', defaults={'url': ''})
@app.route('/<path:url>')
def serve_index(url):
  target_langs = ['en', 'zh-cn', 'zh-tw']
  if any(url.startswith(lang + '/') or url == lang for lang in target_langs):
    # /$LANG/*
    pass
  elif os.path.isfile(os.path.join(app.static_folder, url)):
    # isfile($URL) e.g. robots.txt, sitemap.xml, ...etc.
    pass
  else:  # not /$LANG/* and not isfile($URL)
    # => redirect $URL to /$LANG/$URL
    best = request.accept_languages.best_match(['zh-CN', 'zh-TW', 'en'])
    if best:
      prefix = best.lower()
    else:
      prefix = 'en'
    return redirect(f'/{prefix}/{url}', code=302)

  target_file = '404.html'
  status_code = 404

  full_path = os.path.join(app.static_folder, url)
  if os.path.isfile(full_path):
    target_file = url
    status_code = 200
  elif os.path.isdir(full_path):
    index_path = os.path.join(full_path, 'index.html')
    if os.path.isfile(index_path):
      target_file = os.path.join(url, 'index.html')
      status_code = 200

  response = make_response(send_from_directory(app.static_folder, target_file))
  response.status_code = status_code

  if target_file.endswith('.xml'):
    response.headers['Content-Type'] = 'application/xml; charset=utf-8'
    response.headers['X-Content-Type-Options'] = 'nosniff'

  return response

if __name__ == '__main__':
  app.run(host='127.0.0.1', port=8080, debug=True)