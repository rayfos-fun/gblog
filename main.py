from flask import Flask, send_from_directory

import logging
import os

STATIC_FOLDER = 'jekyll-site/_site'

app = Flask(__name__, static_folder=STATIC_FOLDER)
logging.basicConfig(level=logging.INFO)

@app.route('/gblog', defaults={'url': ''})
@app.route('/gblog/<path:url>')
def serve_index(url):
  logging.info(f'!serve_index(url={url})')
  filepath = os.path.join(app.static_folder, url)
  if not os.path.isfile(filepath):
    url = os.path.join(url, 'index.html')
  logging.info(f'url={url}')
  return send_from_directory(app.static_folder, url)


if __name__ == '__main__':
  app.run(host='127.0.0.1', port=8080, debug=True)