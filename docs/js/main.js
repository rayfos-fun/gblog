loadHtml = function(selector, url) {
  const element = document.querySelector(selector);
  if (element) {
    fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('HTTP error ' + response.status);
      }
      return response.text();
    })
    .then(html => {
      element.innerHTML = html;
    })
    .catch(error => {
      console.error('Load HTML failure:', error);
    });
  }
}
loadHtml('#top-sitemap-placeholder', 'sitemap.html');
