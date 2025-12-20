from flask import Flask, redirect, send_from_directory

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
  logging.info(f'!serve_index(url={url})')
  filepath = os.path.join(app.static_folder, url)
  if os.path.isfile(filepath):
    return send_from_directory(app.static_folder, url)
  elif os.path.isdir(filepath):
    index_filepath = os.path.join(filepath, 'index.html')
    if os.path.isfile(index_filepath):
      return send_from_directory(filepath, 'index.html')
  return send_from_directory(app.static_folder, '404.html'), 404


if __name__ == '__main__':
  app.run(host='127.0.0.1', port=8080, debug=True)