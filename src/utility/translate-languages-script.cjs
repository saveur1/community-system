const fs = require('fs');
const path = require('path');
const { translate } = require('@vitalets/google-translate-api');
const { HttpsProxyAgent } = require('https-proxy-agent');

const proxyList = [
  'http://67.43.236.20:6231',
  'http://72.10.160.91:18749',
  'http://72.10.160.173:19329',
  'http://103.226.251.170:10001',
  'http://173.209.63.70:8192',
  'http://41.59.90.168:80',
  'http://152.53.168.53:44887',
  'http://47.56.110.204:8989',
  'http://97.74.87.226:80',
  'http://103.94.52.70:3128',
  "http://192.177.139.23:8000",
  "http://146.59.202.70:80",
  "http://72.10.160.94:29225",
  "http://38.54.71.67:80",
  "http://67.43.236.18:3927",
  "http://123.30.154.171:7777",
  "http://198.176.56.39:80",
  "http://72.10.160.171:9915",
  "http://41.59.90.175:80",
  "http://197.255.125.12:16000",
  "http://23.247.136.248:80",
  "http://200.174.198.86:8888"
];

const inputFile = path.resolve(__dirname, '../locales/en.json');
const outputDir = path.resolve(__dirname, '../locales');

function flatten(obj, prefix = '', res = {}) {
  for (const key in obj) {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      flatten(value, fullKey, res);
    } else {
      res[fullKey] = value;
    }
  }
  return res;
}

function unflatten(obj) {
  const result = {};
  for (const key in obj) {
    const keys = key.split('.');
    keys.reduce((acc, k, i) => {
      if (i === keys.length - 1) {
        acc[k] = obj[key];
      } else {
        acc[k] = acc[k] || {};
      }
      return acc[k];
    }, result);
  }
  return result;
}

// Try translating text with multiple proxies until success or fail
async function translateWithProxies(text, targetLang) {
  for (let i = 0; i < proxyList.length; i++) {
    const proxyUrl = proxyList[i];
    const proxyAgent = new HttpsProxyAgent(proxyUrl);
    console.log(`🌐 Trying proxy ${i + 1}/${proxyList.length}: ${proxyUrl}`);

    try {
      const res = await translate(text, {
        to: targetLang,
        agent: { https: proxyAgent }
      });
      return res.text;
    } catch (err) {
      console.error(`❌ Proxy failed (${proxyUrl}): ${err.message}`);
    }
  }
  throw new Error(`All proxies failed for text: "${text}"`);
}

async function translateObject(flatObj, targetLang, partialFilePath) {
  const translated = {};
  for (const key in flatObj) {
    const text = flatObj[key];
    try {
      translated[key] = await translateWithProxies(text, targetLang);
    } catch (error) {
      console.error(`🚨 Failed to translate: ${error.message}`);
      // Save what’s done so far before exiting
      const partialJson = unflatten(translated);
      fs.writeFileSync(partialFilePath, JSON.stringify(partialJson, null, 2), 'utf8');
      console.log(`💾 Partial translation saved to ${partialFilePath}`);
      process.exit(1); // Stop the program
    }
  }
  return unflatten(translated);
}

async function main() {
  const enJson = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  const flatEn = flatten(enJson);

  const targetLanguages = ['fr', 'sw'];

  for (const lang of targetLanguages) {
    console.log(`🔄 Translating to ${lang}...`);
    const outputPath = path.join(outputDir, `${lang}.json`);
    const translated = await translateObject(flatEn, lang, outputPath);
    fs.writeFileSync(outputPath, JSON.stringify(translated, null, 2), 'utf8');
    console.log(`✅ Saved ${lang}.json`);
  }
}

main();
