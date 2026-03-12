/**
 * 3DOM Classify — Documentation Main Script
 * Handles: navigation, search, pagination, outline tracking, resizer
 */

// ─────────────────────────────────────────────
//  DATA: Pages & Sections
// ─────────────────────────────────────────────

const PAGES = [
    { id: 'home',           label: 'Overview',          icon: '⌂',  section: null },
    { id: 'getting-started',label: 'Getting Started',   icon: '▶',  section: 'GETTING STARTED' },
    { id: 'installation',   label: 'Installation',      icon: '⬇',  section: null },
    { id: 'quickstart',     label: 'Quick Start',       icon: '⚡', section: null },
    { id: 'interface',      label: 'Interface',         icon: '◫',  section: 'USER GUIDE' },
    { id: 'load-data',      label: 'Load Data',         icon: '📂', section: null },
    { id: 'training',       label: 'Training Mode',     icon: '🎯', section: null },
    { id: 'classify',       label: 'Classify Mode',     icon: '🔬', section: null },
    { id: 'tools',          label: 'Tools & Selection', icon: '🛠',  section: null },
    { id: 'export',         label: 'Export Data',       icon: '⬆',  section: 'REFERENCE' },
    { id: 'shortcuts',      label: 'Keyboard Shortcuts',icon: '⌨',  section: null },
    { id: 'faq',            label: 'FAQ',               icon: '❓', section: null },
];

// ─────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────

let currentPageId = 'home';

// ─────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    buildTOC();
    buildPagination();
    setupResizer();
    setupSearch();
    setupOutlineTracking();

    // Navigate to hash or default
    const hash = location.hash.replace('#', '');
    const target = PAGES.find(p => p.id === hash) ? hash : 'home';
    navigateTo(target, false);
});

// ─────────────────────────────────────────────
//  TOC BUILDER
// ─────────────────────────────────────────────

function buildTOC() {
    const container = document.getElementById('toc-nav');
    if (!container) return;

    let html = '';
    PAGES.forEach(page => {
        if (page.section) {
            html += `<div class="toc-section-label">${page.section}</div>`;
        }
        const isSub = !page.section && PAGES.indexOf(page) > 0;
        html += `
            <div class="toc-item ${isSub ? 'sub' : ''}" data-page="${page.id}">
                <span class="toc-icon">${page.icon}</span>
                ${page.label}
            </div>`;
    });
    container.innerHTML = html;

    container.querySelectorAll('.toc-item').forEach(el => {
        el.addEventListener('click', () => navigateTo(el.dataset.page));
    });
}

// ─────────────────────────────────────────────
//  NAVIGATION
// ─────────────────────────────────────────────

function navigateTo(pageId, animate = true) {
    const page = PAGES.find(p => p.id === pageId);
    if (!page) return;

    // Deactivate current
    document.querySelectorAll('.doc-page.active').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.toc-item.active').forEach(el => el.classList.remove('active'));

    // Activate new
    const pageEl = document.getElementById('page-' + pageId);
    if (pageEl) pageEl.classList.add('active');

    const tocEl = document.querySelector(`.toc-item[data-page="${pageId}"]`);
    if (tocEl) {
        tocEl.classList.add('active');
        tocEl.scrollIntoView({ block: 'nearest' });
    }

    currentPageId = pageId;
    location.hash = pageId;

    updatePagination();
    updateOutline(pageId);

    // Scroll content to top
    if (pageEl) pageEl.scrollTop = 0;
}

// ─────────────────────────────────────────────
//  PAGINATION
// ─────────────────────────────────────────────

function buildPagination() {
    const dotsEl = document.getElementById('pag-dots');
    if (!dotsEl) return;
    dotsEl.innerHTML = PAGES.map((p, i) =>
        `<div class="pag-dot" data-index="${i}" title="${p.label}"></div>`
    ).join('');
    dotsEl.querySelectorAll('.pag-dot').forEach(dot => {
        dot.addEventListener('click', () => navigateTo(PAGES[+dot.dataset.index].id));
    });
    updatePagination();
}

function updatePagination() {
    const idx = PAGES.findIndex(p => p.id === currentPageId);
    const prev = document.getElementById('pag-prev');
    const next = document.getElementById('pag-next');
    const info = document.getElementById('pag-info');
    const dots = document.querySelectorAll('.pag-dot');

    if (prev) prev.disabled = idx === 0;
    if (next) next.disabled = idx === PAGES.length - 1;
    if (info) info.textContent = `${PAGES[idx].label}  ·  ${idx + 1} / ${PAGES.length}`;
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
}

function pagePrev() {
    const idx = PAGES.findIndex(p => p.id === currentPageId);
    if (idx > 0) navigateTo(PAGES[idx - 1].id);
}

function pageNext() {
    const idx = PAGES.findIndex(p => p.id === currentPageId);
    if (idx < PAGES.length - 1) navigateTo(PAGES[idx + 1].id);
}

// Expose for inline onclick
window.pagePrev = pagePrev;
window.pageNext = pageNext;

// Keyboard nav
document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') pageNext();
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   pagePrev();
});

// ─────────────────────────────────────────────
//  SEARCH
// ─────────────────────────────────────────────

// Index: build a simple searchable list from page headings text content
const SEARCH_INDEX = [];

function buildSearchIndex() {
    PAGES.forEach(page => {
        const pageEl = document.getElementById('page-' + page.id);
        if (!pageEl) return;

        // Index the page title itself
        SEARCH_INDEX.push({ text: page.label, pageId: page.id, section: 'Page' });

        // Index all headings
        pageEl.querySelectorAll('h2, h3').forEach(h => {
            SEARCH_INDEX.push({ text: h.textContent.trim(), pageId: page.id, section: page.label });
        });

        // Index paragraph snippets
        pageEl.querySelectorAll('p').forEach(p => {
            const snippet = p.textContent.trim().substring(0, 80);
            if (snippet.length > 20) {
                SEARCH_INDEX.push({ text: snippet, pageId: page.id, section: page.label });
            }
        });
    });
}

function setupSearch() {
    const input = document.getElementById('search-input');
    const dropdown = document.getElementById('search-dropdown');
    if (!input || !dropdown) return;

    // Build index after DOM is ready
    setTimeout(buildSearchIndex, 200);

    input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        if (q.length < 2) { dropdown.classList.remove('show'); return; }

        const results = SEARCH_INDEX.filter(item =>
            item.text.toLowerCase().includes(q)
        ).slice(0, 8);

        if (!results.length) { dropdown.classList.remove('show'); return; }

        dropdown.innerHTML = results.map(r => `
            <div class="search-result-item" data-page="${r.pageId}">
                ${highlight(r.text, q)}
                <div class="result-section">${r.section}</div>
            </div>
        `).join('');

        dropdown.querySelectorAll('.search-result-item').forEach(el => {
            el.addEventListener('click', () => {
                navigateTo(el.dataset.page);
                input.value = '';
                dropdown.classList.remove('show');
            });
        });

        dropdown.classList.add('show');
    });

    document.addEventListener('click', e => {
        if (!e.target.closest('.nav-search-wrap')) dropdown.classList.remove('show');
    });
}

function highlight(text, query) {
    const idx = text.toLowerCase().indexOf(query);
    if (idx === -1) return text;
    return text.substring(0, idx) +
        `<strong style="color:var(--accent-blue)">${text.substring(idx, idx + query.length)}</strong>` +
        text.substring(idx + query.length);
}

// ─────────────────────────────────────────────
//  OUTLINE (right panel — "On This Page")
// ─────────────────────────────────────────────

function updateOutline(pageId) {
    const panel = document.getElementById('outline-list');
    if (!panel) return;

    const pageEl = document.getElementById('page-' + pageId);
    if (!pageEl) { panel.innerHTML = ''; return; }

    const headings = pageEl.querySelectorAll('h2, h3');
    if (!headings.length) { panel.innerHTML = '<div style="font-size:0.75rem;color:var(--text-muted);padding:8px">No sections</div>'; return; }

    panel.innerHTML = Array.from(headings).map(h => {
        const level = h.tagName === 'H3' ? 'h3' : '';
        const id = h.id || h.textContent.trim().toLowerCase().replace(/\s+/g, '-');
        h.id = id;
        return `<div class="outline-item ${level}" data-target="${id}">${h.textContent.trim()}</div>`;
    }).join('');

    panel.querySelectorAll('.outline-item').forEach(item => {
        item.addEventListener('click', () => {
            const el = document.getElementById(item.dataset.target);
            if (el) {
                const page = document.getElementById('page-' + pageId);
                page.scrollTo({ top: el.offsetTop - 20, behavior: 'smooth' });
            }
        });
    });
}

function setupOutlineTracking() {
    // Track scroll on active page to highlight current section
    document.getElementById('doc-pages')?.addEventListener('scroll', onPageScroll, true);
}

function onPageScroll(e) {
    const page = e.target;
    if (!page.classList.contains('doc-page')) return;

    const headings = page.querySelectorAll('h2, h3');
    let current = null;
    headings.forEach(h => {
        if (h.offsetTop - 40 <= page.scrollTop) current = h;
    });

    document.querySelectorAll('.outline-item').forEach(item => {
        item.classList.toggle('active', current && item.dataset.target === current.id);
    });
}

// ─────────────────────────────────────────────
//  RESIZER
// ─────────────────────────────────────────────

function setupResizer() {
    const resizer = document.getElementById('resizer-toc');
    const sidebar = document.getElementById('sidebar-toc');
    if (!resizer || !sidebar) return;

    let dragging = false;
    let startX = 0;
    let startW = 0;

    resizer.addEventListener('mousedown', e => {
        dragging = true;
        startX = e.clientX;
        startW = sidebar.offsetWidth;
        resizer.classList.add('active');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', e => {
        if (!dragging) return;
        const w = Math.min(420, Math.max(160, startW + (e.clientX - startX)));
        sidebar.style.width = w + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (!dragging) return;
        dragging = false;
        resizer.classList.remove('active');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    });
}

// ─────────────────────────────────────────────
//  UTILITY: navigate from card clicks
// ─────────────────────────────────────────────

window.navigateTo = navigateTo;
