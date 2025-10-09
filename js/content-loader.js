<script>
(async function () {
  // figure out current page name, e.g. "change_management"
  const file = (location.pathname.split('/').pop() || 'index.html');
  const base = file.replace(/\.html?$/i, '') || 'index';

  // load global content (site + nav)
  const [site, nav] = await Promise.all([
    fetch('content/site.json', { cache: 'no-store' }).then(r => r.json()),
    fetch('content/nav.json',  { cache: 'no-store' }).then(r => r.json())
  ]).catch(() => [{}, {}]);

  // try to load page JSON (content/pages/<name>.json)
  let page = {};
  try {
    const res = await fetch(`content/pages/${base}.json`, { cache: 'no-store' });
    if (res.ok) page = await res.json();
  } catch (_) {}

  // set <title> if provided
  const titleText =
    page.htmlTitle ||
    page.pageTitle ||
    site.siteTitle ||
    document.title;
  const suffix = site.htmlTitleSuffix || '';
  document.title = titleText + suffix;

  // simple keys: prefer page over site
  document.querySelectorAll('[data-content]').forEach(el => {
    const key = el.getAttribute('data-content');
    if (key in page) el.innerHTML = page[key];
    else if (key in site) el.innerHTML = site[key];
  });

  // build nav
  const navList = document.querySelector('[data-nav-list]');
  if (navList && Array.isArray(nav.items)) {
    navList.innerHTML = nav.items.map(i =>
      `<li><a href="${i.href}" class="inline-block rounded-full bg-white/10 hover:bg-white text-white hover:text-om-navy border border-white/20 hover:border-white px-3 py-1.5 text-sm font-semibold transition">${i.label}</a></li>`
    ).join('');
  }

  // footer note
  const footerNote = document.querySelector('[data-footer-note]');
  if (footerNote && site.footerNote) footerNote.textContent = site.footerNote;

  // render the page body from JSON (Markdown → HTML)
  const target = document.querySelector('[data-md-page]');
  if (target) {
    const md = page.body || '';                 // Markdown (or HTML) from JSON
    target.innerHTML = md ? marked.parse(md) : '';
  }
})();
</script>
