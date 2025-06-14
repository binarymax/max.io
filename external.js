const fs = require('fs');
const path = require('path');
const axios = require('axios');
const mkdirp = require('mkdirp');
const Browser = require('./lib/browser');

const browser = new Browser();

// Load external URLs
const urls = JSON.parse(fs.readFileSync('external.json', 'utf-8'));

// Base output directory
const baseDir = path.join(__dirname, 'contents', 'articles');

// Utility to sanitize filename/folder name
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// Escape YAML safely
function escapeYaml(str) {
  return String(str || '').replace(/"/g, '\\"');
}

async function processUrl(url) {
  try {
    const article = await browser.download(url,true);

    if (!article || !article.title) {
      console.warn(`Readability failed to parse ${url}`);
      return;
    }

    console.log(article);

    const {
      title,
      author,
      text,
      description,
      image,
      published
    } = article;

    const slug = slugify(title);
    const articleDir = path.join(baseDir, slug);
    const outputFile = path.join(articleDir, 'index.md');

    // Skip if already exists
    //if (fs.existsSync(outputFile)) {
    //  console.log(`↪ Skipped (already exists): ${outputFile}`);
    //  return;
    //}

    // Ensure directory exists
    mkdirp.sync(articleDir);

    const metadata = [
      `type: external`,
      `title: "${escapeYaml(title)}"`,
      `template: "external.pug"`,
      `external_url: "${escapeYaml(url)}"`,
      author ? `author: "${escapeYaml(author)}"` : '',
      description ? `description: "${escapeYaml(description)}"` : '',
      image ? `image: "${escapeYaml(image)}"` : '',
      published ? `published: "${escapeYaml(published)}"` : ''
    ].filter(Boolean).join('\n');

    const pageContent = `---
${metadata}
---

${text}
`;

    fs.writeFileSync(outputFile, pageContent);
    console.log(`✓ Created: ${outputFile}`);
  } catch (err) {
    console.error(`Error processing ${url}`, err);
  }
}

(async function () {
  for (const url of urls) {
    await processUrl(url);
  }
})();
