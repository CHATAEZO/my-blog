/**
 * Simple Markdown Parser
 */

export function parseMarkdown(text) {
  const { frontmatter, content } = parseFrontmatter(text);
  const html = convertToHtml(content);
  const readingTime = calculateReadingTime(content);
  const toc = extractHeadings(content);

  return { frontmatter, html, readingTime, toc };
}

function parseFrontmatter(text) {
  const regex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = text.match(regex);

  if (!match) return { frontmatter: {}, content: text };

  const frontmatter = {};
  const lines = match[1].split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();

    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map(item => item.trim().replace(/['"]/g, ''));
    } else if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    frontmatter[key] = value;
  }

  return { frontmatter, content: match[2] };
}

function calculateReadingTime(text) {
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / 200);
}

function extractHeadings(markdown) {
  const headings = [];
  const lines = markdown.split('\n');

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^a-z0-9가-힣\s-]/g, '').replace(/\s+/g, '-');
      headings.push({ level, text, id });
    }
  }

  return headings;
}

function convertToHtml(markdown) {
  let html = markdown.replace(/\r\n/g, '\n');

  // Code blocks
  const codeBlocks = [];
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    codeBlocks.push({ lang, code: code.trim() });
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  // Inline code
  const inlineCodes = [];
  html = html.replace(/`([^`]+)`/g, (match, code) => {
    inlineCodes.push(code);
    return `__INLINE_CODE_${inlineCodes.length - 1}__`;
  });

  // Escape HTML
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Restore code blocks
  html = html.replace(/__CODE_BLOCK_(\d+)__/g, (match, i) => {
    const block = codeBlocks[parseInt(i)];
    const langClass = block.lang ? ` class="language-${block.lang}"` : '';
    return `<pre><code${langClass}>${block.code}</code></pre>`;
  });

  // Restore inline codes
  html = html.replace(/__INLINE_CODE_(\d+)__/g, (match, i) => {
    return `<code>${inlineCodes[parseInt(i)]}</code>`;
  });

  // Images and links
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Headings with IDs
  html = html.replace(/^######\s+(.+)$/gm, (m, t) => `<h6 id="${generateId(t)}">${t}</h6>`);
  html = html.replace(/^#####\s+(.+)$/gm, (m, t) => `<h5 id="${generateId(t)}">${t}</h5>`);
  html = html.replace(/^####\s+(.+)$/gm, (m, t) => `<h4 id="${generateId(t)}">${t}</h4>`);
  html = html.replace(/^###\s+(.+)$/gm, (m, t) => `<h3 id="${generateId(t)}">${t}</h3>`);
  html = html.replace(/^##\s+(.+)$/gm, (m, t) => `<h2 id="${generateId(t)}">${t}</h2>`);
  html = html.replace(/^#\s+(.+)$/gm, (m, t) => `<h1 id="${generateId(t)}">${t}</h1>`);

  // Horizontal rule
  html = html.replace(/^(-{3,}|\*{3,}|_{3,})$/gm, '<hr>');

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Tables
  html = html.replace(/\n(\|.+\|)\n(\|[-:| ]+\|)\n((?:\|.+\|\n?)+)/g, (match, header, sep, body) => {
    const headers = header.split('|').filter(c => c.trim());
    const rows = body.trim().split('\n').map(r => r.split('|').filter(c => c.trim()));

    let table = '<table><thead><tr>';
    headers.forEach(h => table += `<th>${h.trim()}</th>`);
    table += '</tr></thead><tbody>';
    rows.forEach(row => {
      table += '<tr>';
      row.forEach(cell => table += `<td>${cell.trim()}</td>`);
      table += '</tr>';
    });
    table += '</tbody></table>';
    return '\n' + table + '\n';
  });

  // Blockquotes
  const lines = html.split('\n');
  let result = [];
  let inBlockquote = false;
  let bqContent = [];

  for (const line of lines) {
    if (line.startsWith('&gt; ')) {
      inBlockquote = true;
      bqContent.push(line.substring(5));
    } else {
      if (inBlockquote) {
        result.push(`<blockquote><p>${bqContent.join('<br>')}</p></blockquote>`);
        bqContent = [];
        inBlockquote = false;
      }
      result.push(line);
    }
  }
  if (inBlockquote) {
    result.push(`<blockquote><p>${bqContent.join('<br>')}</p></blockquote>`);
  }
  html = result.join('\n');

  // Lists
  html = html.replace(/^(\s*)[-*+]\s+(.+)$/gm, '<li>$2</li>');
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>\n$1</ul>');

  // Paragraphs
  const blockElements = ['<h1', '<h2', '<h3', '<h4', '<h5', '<h6', '<ul', '<ol', '<li', '<blockquote', '<pre', '<hr', '<table'];
  const pLines = html.split('\n');
  let pResult = [];
  let currentP = [];

  for (const line of pLines) {
    const trimmed = line.trim();
    const isBlock = blockElements.some(el => trimmed.startsWith(el));

    if (trimmed === '') {
      if (currentP.length > 0) {
        pResult.push(`<p>${currentP.join(' ')}</p>`);
        currentP = [];
      }
    } else if (isBlock) {
      if (currentP.length > 0) {
        pResult.push(`<p>${currentP.join(' ')}</p>`);
        currentP = [];
      }
      pResult.push(line);
    } else {
      currentP.push(trimmed);
    }
  }
  if (currentP.length > 0) {
    pResult.push(`<p>${currentP.join(' ')}</p>`);
  }

  return pResult.join('\n');
}

function generateId(text) {
  return text.toLowerCase().replace(/[^a-z0-9가-힣\s-]/g, '').replace(/\s+/g, '-');
}

export default parseMarkdown;
