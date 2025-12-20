from flask import Flask, redirect, make_response, send_from_directory

import logging
import os

STATIC_FOLDER = 'jekyll-site/_site'

app = Flask(__name__, static_folder=STATIC_FOLDER)
logging.basicConfig(level=logging.INFO)

@app.route('/gblog/')
@app.route('/gblog/<path:subpath>')
def redirect_old_gblog(subpath=''):
  return redirect(f'/{subpath}', code=301)

@app.route('/', defaults={'url': ''})
@app.route('/<path:url>')
def serve_index(url):
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