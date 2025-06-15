const fs = require('fs');
const path = require('path');
const axios = require('axios');
const mkdirp = require('mkdirp');
const {transform} = require('./lib/transform');
const Browser = require('./lib/browser');

const browser = new Browser();

// Load external URLs
const urls = JSON.parse(fs.readFileSync('external.json', 'utf-8'));
const manual = fs.readdirSync(path.join(__dirname,'manual'))
  .filter(f=>f.indexOf('.html')>0?1:0)
  .map(f=>path.join(__dirname,'manual',f));

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

///
/// Makes an article from an HTML source
///
async function makeArticle(item,article) {

  try {

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

    mkdirp.sync(articleDir);

    const metadata = [
      `source: "external"`,
      `title: "${escapeYaml(title)}"`,
      `template: "external.pug"`,
      `type: "${escapeYaml(item.type)}"`,
      `external_url: "${escapeYaml(item.url)}"`,
      author ? `author: "${escapeYaml(author)}"` : '',
      description ? `description: "${escapeYaml(description)}"` : '',
      image ? `image: "${escapeYaml(image)}"` : '',
      published ? `date: "${escapeYaml(published)}"` : ''
    ].filter(Boolean).join('\n');

    const pageContent = `---
${metadata}
---

${description}

---

${text}
`;

    fs.writeFileSync(outputFile, pageContent);
    console.log(`✓ Created: ${outputFile}`);
  } catch (err) {
    console.error(`Error processing article`, err);
    return false;
  }

  return true;

}

async function processFile(item) {
  const html = fs.readFileSync(path.join(__dirname,'manual',item.filename));
  const {error,data} = transform(item.url,html);
  return data;
}

async function processItem(item) {
  try {
    let article = null;
    if(item.filename) {
      article = await processFile(item);
    } else {
      article = await browser.download(item.url);
    }
    if (!article || !article.title) {
      console.warn(`Readability failed to parse ${item.url}`);
      return;
    }

    return await makeArticle(item,article,'external');
  } catch (ex) {
    console.error(`Error processing ${item.url}`, err);
  }

}

(async function () {
  for (const item of urls) {
    const res = await processItem(item);
  }

  process.exit(0);
})();
