<script>
(async function() {
  // Determine current page base name (index.html -> index)
  const file = (location.pathname.split('/').pop() || 'index.html');
  const base = file.replace(/\.html?$/i, '') || 'index';

  // Load global content
  const [site, nav] = await Promise.all([
    fetch('content/site.json', { cache: 'no-store' }).then(r => r.json()),
    fetch('content/nav.json',  { cache: 'no-store' }).then(r => r.json())
  ]);

  // Load page content if exists
  let page = {};
  try {
    const res = await fetch(`content/pages/${base}.json`, { cache: 'no-store' });
    if (res.ok) page = await res.json();
  } catch(_) {}

  // Set <title>
  const titleText = page.htmlTitle || page.pageTitle || site.siteTitle || document.title;
  const suffix = site.htmlTitleSuffix || '';
  document.title = titleText + suffix;

  // Inject simple keys (prefer page, then site)
  document.querySelectorAll('[data-content]').forEach(el => {
    const key = el.getAttribute('data-content');
    if (key in page) el.innerHTML = page[key];
    else if (key in site) el.innerHTML = site[key];
  });

  // Build nav
  const navList = document.querySelector('[data-nav-list]');
  if (navList && Array.isArray(nav.items)) {
    navList.innerHTML = nav.items.map(i =>
      `<li><a href="${i.href}" class="inline-block rounded-full bg-white/10 hover:bg-white text-white hover:text-om-navy border border-white/20 hover:border-white px-3 py-1.5 text-sm font-semibold transition">${i.label}</a></li>`
    ).join('');
  }

  // Footer note
  const footerNote = document.querySelector('[data-footer-note]');
  if (footerNote && site.footerNote) footerNote.textContent = site.footerNote;

  // Render any Markdown blocks (requires window.marked)
  const mdTargets = document.querySelectorAll('[data-md]');
  if (mdTargets.length && window.marked) {
    await Promise.all(Array.from(mdTargets).map(async el => {
      const key = el.getAttribute('data-md'); // e.g., implementation_roadmap_intro
      try {
        const r = await fetch(`content/markdown/${key}.md`, { cache: 'no-store' });
        if (r.ok) el.innerHTML = marked.parse(await r.text());
      } catch(_) {}
    }));
  }
})();
</script>
