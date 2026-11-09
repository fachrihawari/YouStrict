// Prints a Markdown table of an APK's size breakdown, for $GITHUB_STEP_SUMMARY.
//
//   bun scripts/apk-report.ts youstrict-arm64-v8a.apk
import { readFileSync } from 'node:fs';

const path = process.argv[2];
if (!path) {
  console.error('Usage: bun scripts/apk-report.ts <file.apk>');
  process.exit(1);
}

// Bun has ZipArchive but no public size metadata, so read the central directory.
const buffer = readFileSync(path);
const byTop: Record<string, number> = {};
const abis: Record<string, number> = {};
let count = 0;

// End of central directory record: signature 0x06054b50, scanned from the end.
let eocd = -1;
for (let i = buffer.length - 22; i >= 0 && i > buffer.length - 65558; i--) {
  if (buffer.readUInt32LE(i) === 0x06054b50) {
    eocd = i;
    break;
  }
}
if (eocd === -1) {
  console.error('Not a zip file.');
  process.exit(1);
}

let offset = buffer.readUInt32LE(eocd + 16);
const total = buffer.readUInt16LE(eocd + 10);

for (let i = 0; i < total; i++) {
  if (buffer.readUInt32LE(offset) !== 0x02014b50) break;
  const compressed = buffer.readUInt32LE(offset + 20);
  const nameLength = buffer.readUInt16LE(offset + 28);
  const extraLength = buffer.readUInt16LE(offset + 30);
  const commentLength = buffer.readUInt16LE(offset + 32);
  const name = buffer.toString('utf8', offset + 46, offset + 46 + nameLength);

  count++;
  if (name.startsWith('lib/')) {
    const abi = name.split('/')[1]!;
    abis[abi] = (abis[abi] ?? 0) + compressed;
    byTop['lib/ (native)'] = (byTop['lib/ (native)'] ?? 0) + compressed;
  } else {
    const top = name.includes('/') ? name.split('/')[0]! : name;
    byTop[top] = (byTop[top] ?? 0) + compressed;
  }

  offset += 46 + nameLength + extraLength + commentLength;
}

const mb = (bytes: number) => `${(bytes / 1e6).toFixed(1)} MB`;

console.log('| Part | Size |');
console.log('|---|---|');
for (const [part, size] of Object.entries(byTop).sort((a, b) => b[1] - a[1]).slice(0, 6)) {
  console.log(`| ${part} | ${mb(size)} |`);
}
const totalSize = Object.values(byTop).reduce((sum, size) => sum + size, 0);
console.log(`| **total** (${count} files) | **${mb(totalSize)}** |`);
console.log('');
console.log(
  `ABIs: ${Object.entries(abis)
    .sort((a, b) => b[1] - a[1])
    .map(([abi, size]) => `${abi} (${mb(size)})`)
    .join(', ') || 'none'}`,
);
