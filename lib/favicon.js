const fs = require('fs');
const path = require('path');
const axios = require('axios');
const mime = require('mime-types');
const glob = require('glob');

const getFavicon = async function(uri) {
    const url = new URL(uri);
    const hostname = url.hostname;
    const iconDir = path.resolve(__dirname, '../contents/images/icons');
    const pattern = path.join(iconDir, `${hostname}.*`);

    // Check for existing file
    const existing = glob.sync(pattern);
    if (existing.length > 0) {
        return path.basename(existing[0]);
    }

    const faviconUrl = `https://icon.horse/icon/${hostname}`;
    try {
        const response = await axios.get(faviconUrl, {
            responseType: 'arraybuffer'
        });

        const contentType = response.headers['content-type'];
        const ext = mime.extension(contentType) || 'ico';
        const filename = `${hostname}.${ext}`;
        const outputPath = path.join(iconDir, filename);

        fs.mkdirSync(iconDir, { recursive: true });
        fs.writeFileSync(outputPath, response.data);

        return filename;
    } catch (err) {
        console.error(`Failed to fetch favicon for ${hostname}:`, err.message);
        return null;
    }
};

// Example:
getFavicon('https://www.wxxinews.org/').then(console.log);
