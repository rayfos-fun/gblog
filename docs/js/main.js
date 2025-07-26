loadHtml = function(selector, url) {
  fetch(url)
  .then(response => {
    if (!response.ok) {
      throw new Error('HTTP error ' + response.status);
    }
    return response.text();
  })
  .then(html => {
    document.querySelector(selector).innerHTML = html;
  })
  .catch(error => {
    console.error('Load HTML failure:', error);
  });
}
loadHtml('#top-sitemap-placeholder', 'sitemap.html');
