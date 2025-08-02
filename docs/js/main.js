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

const path = window.location.pathname;
const body = document.body;
if (path.includes('/zh-tw/')) {
  body.classList.add('lang-zh-tw');
} else if (path.includes('/zh-cn/')) {
  body.classList.add('lang-zh-cn');
} else {
  body.classList.add('lang-en');
}