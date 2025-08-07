const fs = require('fs')
const path = require('path')
const { translate } = require('@vitalets/google-translate-api');

const inputFile = path.resolve(__dirname, '../locales/en.json')
const outputDir = path.resolve(__dirname, '../locales')

// Helper: Flatten nested JSON (e.g. { navbar: { home: "Home" } } → { "navbar.home": "Home" })
function flatten(obj, prefix = '', res = {}) {
  for (const key in obj) {
    const value = obj[key]
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object') {
      flatten(value, fullKey, res)
    } else {
      res[fullKey] = value
    }
  }
  return res
}

// Helper: Unflatten back to nested structure
function unflatten(obj) {
  const result = {}
  for (const key in obj) {
    const keys = key.split('.')
    keys.reduce((acc, k, i) => {
      if (i === keys.length - 1) {
        acc[k] = obj[key]
      } else {
        acc[k] = acc[k] || {}
      }
      return acc[k]
    }, result)
  }
  return result
}

async function translateObject(flatObj, targetLang) {
  const translated = {}
  for (const key in flatObj) {
    const text = flatObj[key]
    try {
      const res = await translate(text, { to: targetLang })
      translated[key] = res.text
    } catch (error) {
      console.error(`❌ Failed to translate "${text}" to ${targetLang}:`, error.message)
      translated[key] = text // fallback to original
    }
  }
  return unflatten(translated)
}

async function main() {
  const enJson = JSON.parse(fs.readFileSync(inputFile, 'utf8'))
  const flatEn = flatten(enJson)

  const targetLanguages = ['fr', 'sw'] // French and Swahili

  for (const lang of targetLanguages) {
    console.log(`🔄 Translating to ${lang}...`)
    const translated = await translateObject(flatEn, lang)
    const outputPath = path.join(outputDir, `${lang}.json`)
    fs.writeFileSync(outputPath, JSON.stringify(translated, null, 2), 'utf8')
    console.log(`✅ Saved ${lang}.json`)
  }
}

main()
