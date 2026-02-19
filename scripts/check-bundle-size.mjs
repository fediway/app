import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { gzipSync } from 'node:zlib';

const WARN_THRESHOLD = 150 * 1024; // 150KB gzipped
const NUXT_OUTPUT = '.output/public/_nuxt/';

function getJsFiles(dir) {
  try {
    return readdirSync(dir)
      .filter(f => f.endsWith('.js'))
      .map(f => join(dir, f));
  }
  catch {
    return [];
  }
}

function formatSize(bytes) {
  if (bytes < 1024)
    return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

const files = getJsFiles(NUXT_OUTPUT);

if (files.length === 0) {
  console.error(`No JS files found in ${NUXT_OUTPUT}`);
  console.error('Run a production build first: npx nuxi build');
  process.exit(1);
}

let totalRaw = 0;
let totalGzip = 0;
const chunks = [];

for (const file of files) {
  const raw = readFileSync(file);
  const gzipped = gzipSync(raw);
  const rawSize = statSync(file).size;
  const gzipSize = gzipped.length;

  totalRaw += rawSize;
  totalGzip += gzipSize;

  chunks.push({
    name: file.replace(NUXT_OUTPUT, ''),
    raw: rawSize,
    gzip: gzipSize,
  });
}

// Sort by gzipped size descending
chunks.sort((a, b) => b.gzip - a.gzip);

console.log('Bundle Size Report');
console.log('==================\n');

for (const chunk of chunks) {
  const warn = chunk.gzip > WARN_THRESHOLD ? ' ⚠️' : '';
  console.log(`  ${chunk.name.padEnd(50)} ${formatSize(chunk.raw).padStart(10)} → ${formatSize(chunk.gzip).padStart(10)}${warn}`);
}

console.log('');
console.log(`  ${'Total'.padEnd(50)} ${formatSize(totalRaw).padStart(10)} → ${formatSize(totalGzip).padStart(10)}`);
console.log('');

if (chunks.some(c => c.gzip > WARN_THRESHOLD)) {
  console.warn(`⚠️  Some chunks exceed ${formatSize(WARN_THRESHOLD)} gzipped threshold`);
  process.exit(1);
}
else {
  console.log(`✓ All chunks under ${formatSize(WARN_THRESHOLD)} gzipped`);
}
