(() => {
  const host = window.location.hostname;
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const owner = host.endsWith('.github.io') ? host.slice(0, -'.github.io'.length) : '';
  const repository = owner && pathParts.length ? `${owner}/${pathParts[0]}` : '';

  document.querySelectorAll('[data-release-asset]').forEach((link) => {
    const asset = link.dataset.releaseAsset;
    const version = asset && asset.match(/-v(\d+\.\d+\.\d+)(?=\.)/);
    if (repository && asset && version) {
      // A versioned asset must stay attached to its own release. Using latest
      // breaks cached pages whenever the next release has different filenames.
      link.href = `https://github.com/${repository}/releases/download/v${version[1]}/${encodeURIComponent(asset)}`;
    } else {
      link.setAttribute('aria-disabled', 'true');
      link.addEventListener('click', (event) => event.preventDefault());
    }
  });

  const downloadCount = document.querySelector('[data-download-count]');
  if (downloadCount && repository) {
    const cacheKey = `github-downloads:${repository}`;
    const renderCount = (count) => {
      downloadCount.textContent = new Intl.NumberFormat('en-US').format(count);
    };

    try {
      const cached = JSON.parse(sessionStorage.getItem(cacheKey) || 'null');
      if (cached && Date.now() - cached.savedAt < 15 * 60 * 1000) {
        renderCount(cached.count);
        return;
      }
    } catch (_) {
      sessionStorage.removeItem(cacheKey);
    }

    fetch(`https://api.github.com/repos/${repository}/releases?per_page=100`, {
      headers: { Accept: 'application/vnd.github+json' }
    })
      .then((response) => {
        if (!response.ok) throw new Error('GitHub API request failed');
        return response.json();
      })
      .then((releases) => {
        const count = releases.reduce((total, release) => {
          const downloadablePackages = release.assets.filter((asset) =>
            /Dawnwalker-Arabic-v[\d.]+\.7z(?:\.001)?$/i.test(asset.name) ||
            /Dawnwalker-Arabic-Smart-Installer-v[\d.]+\.exe$/i.test(asset.name)
          );
          return total + downloadablePackages.reduce(
            (releaseTotal, asset) => releaseTotal + asset.download_count,
            0
          );
        }, 0);
        renderCount(count);
        sessionStorage.setItem(cacheKey, JSON.stringify({ count, savedAt: Date.now() }));
      })
      .catch(() => {
        downloadCount.textContent = '—';
        downloadCount.title = 'تعذر تحميل العداد مؤقتًا';
      });
  }
})();
