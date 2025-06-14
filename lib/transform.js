//Transforms an HTML string into a JSON document

const crypto = require('crypto');
const {JSDOM,VirtualConsole} = require('jsdom');
const {Readability} = require('@mozilla/readability');

function string_to_uuid(str) {
    let key = crypto.createHash('md5').update(str).digest('hex');
    let hash = `${key.substring(0, 8)}-${key.substring(8, 12)}-${key.substring(12, 16)}-${key.substring(16, 20)}-${key.substring(20)}`;
    return hash;
}

function guess_field(doc, possibles) {
    let val = "";
    for (let i = 0; i < possibles.length; i++) {
        const p = possibles[i];
        if (p && p[0] && p[1]) {
            const found = doc.window.document.querySelector(p[0]);
            if (found && found[p[1]]) val = found[p[1]];
        }
    }
    return val;
}

function transform(url, html_string) {
    let error = null;
    let data = null;

    try {
        let virtualConsole = new VirtualConsole();

        virtualConsole.on("error", (message, ...optionalParams) => {  
            if (message.includes('Could not parse CSS stylesheet')) {
                console.error('Could not parse CSS stylesheet');
                return;
            }
            console.error(message, ...optionalParams);

        });
        virtualConsole.on("warn", (message, ...optionalParams) => { console.warn(message, ...optionalParams); });
        virtualConsole.on("info", (message, ...optionalParams) => { console.info(message, ...optionalParams); });
        virtualConsole.on("dir", (message, ...optionalParams) => {console.dir(message, ...optionalParams); });

        let doc = new JSDOM(html_string, { url: url, virtualConsole });
        let reader = new Readability(doc.window.document);
        let article = reader.parse();

        let canonical = guess_field(doc, [
            ["link[rel=canonical]", "href"],
            ["meta[property=\"og:url\"]", "content"]
        ]) || url;

        let title = article.title;
        let author = article.byline;
        let description = article.excerpt;

        let published = guess_field(doc, [
            ["meta[property=\"article:published_time\"]", "content"],
            ["meta[name=\"DC.date\"]", "content"],
            ["meta[name=\"DC.created\"]", "content"]
        ]);
        let modified = guess_field(doc, [
            ["meta[property=\"article:modified_time\"]", "content"],
            ["meta[name=\"DC.modified\"]", "content"]
        ]);

        let image = guess_field(doc, [
            ["meta[property=\"og:image\"]", "content"],
            ["meta[name=\"twitter.image\"]", "content"]
        ]);

        let lines = article.textContent.trim().split(/[\n]+/).map((str) => str.trim());
        let body = lines.join('\n').trim().replace(/[\n]+/g, '\n');

        let bodylc = body.toLowerCase();
        if (description && bodylc.indexOf(description.toLowerCase()) < 0) {
            body = description + '\n' + body;
        }
        if (title && bodylc.indexOf(title.toLowerCase()) < 0) {
            body = title + '\n' + body;
        }

        let brightspot = guess_field(doc,[
            ["meta[name=\"brightspot-dataLayer\"]", "content"]
        ]);

        if(brightspot) {
            brightspot = JSON.parse(brightspot.replace(/\&quot\;/g,'"'));
            published = brightspot.publishedDate;

        }
        /*
        <meta name="brightspot-dataLayer" content="{
          &quot;author&quot; : &quot;Evan Dawson, Megan Mack&quot;,
          &quot;bspStoryId&quot; : &quot;00000187-e2af-d948-a1c7-eebf5fb10000&quot;,
          &quot;category&quot; : &quot;Connections,Local News&quot;,
          &quot;inlineAudio&quot; : 1,
          &quot;keywords&quot; : &quot;&quot;,
          &quot;nprCmsSite&quot; : true,
          &quot;nprStoryId&quot; : &quot;1173746202&quot;,
          &quot;pageType&quot; : &quot;radio-episode&quot;,
          &quot;program&quot; : &quot;Connections&quot;,
          &quot;publishedDate&quot; : &quot;2023-05-03T14:52:05Z&quot;,
          &quot;siteName&quot; : &quot;WXXI News&quot;,
          &quot;station&quot; : &quot;WXXI News&quot;,
          &quot;stationOrgId&quot; : &quot;1177&quot;,
          &quot;storyOrgId&quot; : &quot;0&quot;,
          &quot;storyTheme&quot; : &quot;radio-episode&quot;,
          &quot;storyTitle&quot; : &quot;What is the difference between generative AI and general AI?&quot;,
          &quot;timezone&quot; : &quot;America/New_York&quot;,
          &quot;wordCount&quot; : 0,
          &quot;series&quot; : &quot;&quot;
        }">
        */

        body = body.replace(/[ \t]{2,}/g, ' ').replace(/ /g,' ').replace(/\\n/g,'\n\n');

        let id = string_to_uuid(canonical);

        data = article;
        data.docid = id;
        data.url = canonical;
        data.title = title;
        data.author = author;
        data.description = description;
        data.published = published;
        data.modified = modified;
        data.image = image;
        data.text = body;

    } catch (ex) {
        error = ex;
    }

    return { error, data };
}

module.exports = {transform};