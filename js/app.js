import { parseMarkdown } from './markdown.js';

// ===== State =====
let posts = [];
let currentFilter = 'all';
let searchQuery = '';

// ===== DOM Elements =====
const elements = {
  postsGrid: null,
  searchInput: null,
  tagsFilter: null,
  postContent: null,
  postHeader: null,
  loading: null,
  postsCount: null,
  tocList: null,
};

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', async () => {
  initElements();
  initTheme();
  initRouter();
  initEventListeners();
  initScrollToTop();
});

function initElements() {
  elements.postsGrid = document.getElementById('posts-grid');
  elements.searchInput = document.getElementById('search-input');
  elements.tagsFilter = document.getElementById('tags-filter');
  elements.postContent = document.getElementById('post-content');
  elements.postHeader = document.getElementById('post-header');
  elements.loading = document.getElementById('loading');
  elements.postsCount = document.getElementById('posts-count');
  elements.tocList = document.getElementById('toc-list');
}

// ===== Theme =====
function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  } else if (prefersDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  updateThemeToggle();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      updateThemeToggle();
    }
  });
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeToggle();
}

function updateThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  btn.innerHTML = isDark
    ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>`;

  btn.setAttribute('aria-label', isDark ? '라이트 모드로 전환' : '다크 모드로 전환');
}

// ===== Scroll to Top =====
function initScrollToTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 300);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== Router =====
function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

function handleRoute() {
  const hash = window.location.hash;

  document.querySelectorAll('.page').forEach(page => {
    page.style.display = 'none';
  });

  if (hash.startsWith('#/post/')) {
    showPostPage();
  } else {
    showHomePage();
  }
}

function navigateTo(path) {
  if (path === '/' || path === '') {
    window.location.hash = '';
  } else if (path.startsWith('/post/')) {
    window.location.hash = path;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== Pages =====
async function showHomePage() {
  document.getElementById('home-page').style.display = 'block';
  document.getElementById('post-page').style.display = 'none';

  showLoading(true);

  try {
    posts = await loadPosts();
    renderTags();
    renderPosts();
  } catch (error) {
    console.error('Failed to load posts:', error);
    showError('포스트를 불러오는데 실패했습니다.');
  } finally {
    showLoading(false);
  }
}

async function showPostPage() {
  document.getElementById('home-page').style.display = 'none';
  document.getElementById('post-page').style.display = 'block';

  showLoading(true);

  try {
    const slug = getSlugFromUrl();
    if (!slug) {
      showError('포스트를 찾을 수 없습니다.');
      return;
    }

    const post = await loadPost(slug);
    if (!post) {
      showError('포스트를 찾을 수 없습니다.');
      return;
    }

    renderPost(post);
  } catch (error) {
    console.error('Failed to load post:', error);
    showError('포스트를 불러오는데 실패했습니다.');
  } finally {
    showLoading(false);
  }
}

function getSlugFromUrl() {
  const hash = window.location.hash;
  if (hash.startsWith('#/post/')) {
    return hash.replace('#/post/', '').replace(/\/$/, '');
  }
  return '';
}

// ===== Data Loading =====
async function loadPosts() {
  const response = await fetch('posts/index.json');
  if (!response.ok) throw new Error('Failed to fetch posts index');
  return response.json();
}

async function loadPost(slug) {
  const response = await fetch(`posts/${slug}.md`);
  if (!response.ok) throw new Error(`Failed to fetch post: ${slug}`);

  const markdown = await response.text();
  const { frontmatter, html, readingTime, toc } = parseMarkdown(markdown);

  return { slug, ...frontmatter, content: html, readingTime, toc };
}

// ===== Rendering =====
function renderPosts() {
  if (!elements.postsGrid) return;

  let filtered = posts;

  if (currentFilter !== 'all') {
    filtered = filtered.filter(p => p.tags && p.tags.includes(currentFilter));
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
    );
  }

  if (elements.postsCount) {
    elements.postsCount.textContent = `${filtered.length}개의 포스트`;
  }

  if (filtered.length === 0) {
    elements.postsGrid.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>포스트가 없습니다.</p>
      </div>
    `;
    return;
  }

  const emojis = ['📝', '💡', '🚀', '🎨', '📚', '✨', '🔧', '💻'];

  elements.postsGrid.innerHTML = filtered.map((post, i) => {
    const emoji = emojis[i % emojis.length];
    const readTime = estimateReadingTime(post.description || '');

    return `
      <article class="post-card" onclick="navigateTo('/post/${post.slug}')">
        <div class="post-card-image">${emoji}</div>
        <div class="post-card-body">
          <div class="post-card-meta">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="14" height="14">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              ${formatDate(post.date)}
            </span>
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="14" height="14">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ${readTime}분 읽기
            </span>
          </div>
          <h2 class="post-card-title">
            <a href="#/post/${post.slug}" onclick="event.preventDefault(); navigateTo('/post/${post.slug}')">${post.title}</a>
          </h2>
          ${post.description ? `<p class="post-card-description">${post.description}</p>` : ''}
          <div class="post-card-footer">
            ${post.tags && post.tags.length > 0 ? `
              <div class="post-card-tags">
                ${post.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
              </div>
            ` : '<div></div>'}
            <span class="read-more">
              읽기
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function renderTags() {
  if (!elements.tagsFilter) return;

  const allTags = new Set();
  posts.forEach(p => {
    if (p.tags) p.tags.forEach(t => allTags.add(t));
  });

  const tags = ['all', ...Array.from(allTags).sort()];

  elements.tagsFilter.innerHTML = tags.map(tag => `
    <button class="tag-btn ${tag === currentFilter ? 'active' : ''}" data-tag="${tag}">
      ${tag === 'all' ? '전체' : tag}
    </button>
  `).join('');

  elements.tagsFilter.querySelectorAll('.tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.tag;
      renderTags();
      renderPosts();
    });
  });
}

function renderPost(post) {
  if (!elements.postHeader || !elements.postContent) return;

  document.title = `${post.title} | My Blog`;

  elements.postHeader.innerHTML = `
    <a href="#" class="back-link" onclick="event.preventDefault(); navigateTo('/')">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      목록으로 돌아가기
    </a>
    <div class="post-meta">
      <span>${formatDate(post.date)}</span>
      ${post.author ? `<span class="separator"></span><span>${post.author}</span>` : ''}
      <span class="separator"></span>
      <span>${post.readingTime || 1}분 읽기</span>
    </div>
    <h1 class="post-title">${post.title}</h1>
    ${post.tags && post.tags.length > 0 ? `
      <div class="post-tags">
        ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
    ` : ''}
  `;

  elements.postContent.innerHTML = post.content;
  renderTOC(post.toc);
}

function renderTOC(toc) {
  const sidebar = document.querySelector('.post-sidebar');

  if (!elements.tocList || !toc || toc.length === 0) {
    if (sidebar) sidebar.style.display = 'none';
    return;
  }

  if (sidebar) sidebar.style.display = 'block';

  elements.tocList.innerHTML = toc.map(h => `
    <li>
      <a href="#${h.id}" class="toc-${h.level === 3 ? 'h3' : 'h2'}">${h.text}</a>
    </li>
  `).join('');

  elements.tocList.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(link.getAttribute('href').substring(1));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Highlight current section
  const headingElements = toc.map(h => document.getElementById(h.id)).filter(Boolean);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        elements.tocList.querySelectorAll('a').forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-80px 0px -80% 0px' });

  headingElements.forEach(el => observer.observe(el));
}

// ===== Event Listeners =====
function initEventListeners() {
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => navLinks.classList.toggle('active'));
  }

  if (elements.searchInput) {
    elements.searchInput.addEventListener('input', debounce((e) => {
      searchQuery = e.target.value;
      renderPosts();
    }, 300));
  }
}

// ===== Utilities =====
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function estimateReadingTime(text) {
  if (!text) return 1;
  return Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 200));
}

function showLoading(show) {
  if (elements.loading) elements.loading.style.display = show ? 'block' : 'none';
}

function showError(message) {
  const html = `
    <div class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <p>${message}</p>
    </div>
  `;
  if (elements.postsGrid) elements.postsGrid.innerHTML = html;
  if (elements.postContent) elements.postContent.innerHTML = html;
}

function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Global
window.navigateTo = navigateTo;
