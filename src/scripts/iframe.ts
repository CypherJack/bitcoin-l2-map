// Report document height to a parent window so this map can live in an iframe.

function reportHeight(): void {
  const h = document.documentElement.scrollHeight;
  window.parent.postMessage({ type: 'iframeHeight', height: h }, '*');
}

export function watchHeight(): void {
  window.addEventListener('load', reportHeight);
  new ResizeObserver(reportHeight).observe(document.body);
}
