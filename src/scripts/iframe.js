// Report document height to a parent window so this map can live in an iframe.

export function reportHeightToParent() {
  const h = document.documentElement.scrollHeight;
  window.parent.postMessage({ type: 'iframeHeight', height: h }, '*');
}

export function watchHeight() {
  window.addEventListener('load', reportHeightToParent);
  new ResizeObserver(reportHeightToParent).observe(document.body);
}
