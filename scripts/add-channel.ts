// Adds a channel to catalog/channels.json after checking it exists on YouTube.
//
//   bun scripts/add-channel.ts <handle>
//
// Run by .github/workflows/add-channel.yml when the owner opens an "add-channel" issue.
import type { ChannelConfig } from '../catalog/schema';
import { HANDLE_PATTERN } from '../catalog/schema';
import { fetchChannel } from './yt';

const handle = (Bun.argv[2] ?? '').trim().replace(/^@/, '');
if (!HANDLE_PATTERN.test(handle)) {
  console.error(`Invalid handle: "${handle}". Use the part after @ in youtube.com/@handle.`);
  process.exit(1);
}

const path = `${import.meta.dir}/../catalog/channels.json`;
const configs: ChannelConfig[] = await Bun.file(path).json();

if (configs.some((c) => c.handle.toLowerCase() === handle.toLowerCase())) {
  console.log(`@${handle} is already in the catalog.`);
  process.exit(0);
}

let name: string;
try {
  ({ name } = await fetchChannel(handle, 1));
} catch (e) {
  console.error(`Could not find channel @${handle} on YouTube: ${(e as Error).message}`);
  process.exit(1);
}

configs.push({ handle, limit: 200 });
await Bun.write(path, JSON.stringify(configs, null, 2) + '\n');
console.log(`Added @${handle} (${name}).`);
