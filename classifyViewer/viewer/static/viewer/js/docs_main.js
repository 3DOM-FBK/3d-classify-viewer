/**
 * 3DOM Classify — Documentation Main Script
 * Handles: navigation, search, pagination, outline tracking, resizer
 */

// ─────────────────────────────────────────────
//  DATA: Pages & Sections
// ─────────────────────────────────────────────

const PAGES = [
    { id: 'home',       label: 'Overview',          icon: '⌂',  isSub: false, section: null },
    { id: 'load-data',  label: 'Loading Data',       icon: '📂', isSub: false, section: 'SECTIONS' },
    { id: 'training',   label: 'Training Mode',      icon: '🎯', isSub: false, section: null },
    { id: 'classify',   label: 'Classify Mode',      icon: '🔬', isSub: false, section: null },
    { id: 'export',     label: 'Export / Download',  icon: '⬆',  isSub: false, section: null },
    { id: 'tools',      label: 'Tools & Selection',  icon: '🛠',  isSub: false, section: null },
    { id: 'features',   label: 'Features',           icon: '✦',  isSub: false, section: null },
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
    setupSchemaFullscreen();

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
        // Sub-items
        const isSub = page.isSub;
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
window.navigateTo = navigateTo;

// Keyboard nav (arrow keys)
document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') pageNext();
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   pagePrev();
});

// ─────────────────────────────────────────────
//  SEARCH
// ─────────────────────────────────────────────

const SEARCH_INDEX = [];

function buildSearchIndex() {
    PAGES.forEach(page => {
        const pageEl = document.getElementById('page-' + page.id);
        if (!pageEl) return;

        SEARCH_INDEX.push({ text: page.label, pageId: page.id, section: 'Page' });

        pageEl.querySelectorAll('h2, h3').forEach(h => {
            SEARCH_INDEX.push({ text: h.textContent.trim(), pageId: page.id, section: page.label });
        });

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
//  OUTLINE (right panel)
// ─────────────────────────────────────────────

function updateOutline(pageId) {
    const panel = document.getElementById('outline-list');
    if (!panel) return;

    const pageEl = document.getElementById('page-' + pageId);
    if (!pageEl) { panel.innerHTML = ''; return; }

    const headings = pageEl.querySelectorAll('h2, h3');
    if (!headings.length) {
        panel.innerHTML = '<div style="font-size:0.75rem;color:var(--text-muted);padding:8px">No sections</div>';
        return;
    }

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
//  RESIZER (left sidebar)
// ─────────────────────────────────────────────

function setupResizer() {
    const resizer = document.getElementById('resizer-toc');
    const sidebar = document.getElementById('sidebar-toc');
    if (!resizer || !sidebar) return;

    let dragging = false, startX = 0, startW = 0;

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
//  Schema Fullscreen
// ─────────────────────────────────────────────

function setupSchemaFullscreen() {
    // Build overlay once
    const overlay = document.createElement('div');
    overlay.id = 'schemaOverlay';
    overlay.innerHTML = `
        <div id="schemaOverlayInner">
            <button id="schemaOverlayClose" title="Close"><i class="bi bi-x-lg"></i></button>
            <p id="schemaOverlayCaption"></p>
            <img id="schemaOverlayImg" src="" alt="">
        </div>
    `;
    document.body.appendChild(overlay);

    const overlayImg     = document.getElementById('schemaOverlayImg');
    const overlayCaption = document.getElementById('schemaOverlayCaption');

    function openOverlay(src, alt, caption) {
        overlayImg.src           = src;
        overlayImg.alt           = alt;
        overlayCaption.textContent = caption;
        overlay.classList.add('visible');
    }

    function closeOverlay() {
        overlay.classList.remove('visible');
    }

    document.getElementById('schemaOverlayClose').addEventListener('click', closeOverlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeOverlay(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeOverlay(); });

    // Attach expand button + click to every .schema-figure that has an <img>
    document.querySelectorAll('.schema-figure').forEach(fig => {
        const img = fig.querySelector('img');
        if (!img) return;

        const caption = fig.querySelector('figcaption')?.textContent.trim() ?? '';

        // Expand icon overlay button
        const btn = document.createElement('button');
        btn.className = 'schema-expand-btn';
        btn.title     = 'View fullscreen';
        btn.innerHTML = '<i class="bi bi-arrows-angle-expand"></i>';
        fig.querySelector('.schema-img-wrap').appendChild(btn);

        const open = () => openOverlay(img.src, img.alt, caption);
        btn.addEventListener('click', e => { e.stopPropagation(); open(); });
        fig.style.cursor = 'zoom-in';
        fig.addEventListener('click', open);
    });
}
