(() => {
  const host = window.location.hostname;
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const owner = host.endsWith('.github.io') ? host.slice(0, -'.github.io'.length) : '';
  const repository = owner && pathParts.length ? `${owner}/${pathParts[0]}` : '';
  const releaseUrl = repository ? `https://github.com/${repository}/releases/latest` : '';

  document.querySelectorAll('[data-release-link]').forEach((link) => {
    if (releaseUrl) {
      link.href = releaseUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    } else {
      link.setAttribute('aria-disabled', 'true');
      link.addEventListener('click', (event) => event.preventDefault());
    }
  });
})();
