// workbox-config.cjs
module.exports = {
    globDirectory: 'dist/',
    globPatterns: [
        '**/*.{js,css,ico,svg,jpg,png,html,json,txt}',
    ],
    swSrc: 'scripts/src-sw.js',
    swDest: 'dist/sw.js',
    // Optional: Customize manifest entries if needed
    manifestTransforms: [
        (manifestEntries) => {
            const manifest = manifestEntries.map(entry => ({
                url: entry.url,
                revision: entry.revision,
            }));
            return { manifest, warnings: [] };
        },
    ],
};