# Video Metadata Downloader

This script downloads YouTube channel metadata using `yt-dlp` with parallel batch processing for optimal speed.

## Prerequisites

Install `yt-dlp`:

```bash
# macOS
brew install yt-dlp

# or with pip
pip install yt-dlp
```

## Usage

Run the script with Bun by providing the channel name:

```bash
bun generate.ts <channel-name>
```

## How It Works

The script uses a two-phase approach for maximum speed:

1. **Fast ID Collection**: Uses `--flat-playlist` to quickly fetch all video IDs from the channel
2. **Parallel Metadata Fetching**: Processes videos in batches of 10 concurrently to fetch detailed metadata
3. **Auto-sorting**: Sorts videos from newest to oldest by upload timestamp
4. **Auto-indexing**: Updates `index.ts` with the new channel data

The script will:
- Construct the channel URL: `https://www.youtube.com/@<channel-name>/videos`
- Fetch all video IDs quickly
- Download metadata in parallel batches (10 videos at a time)
- Save the output as: `<channel-name>.json`
- Automatically update `index.ts` with the new import and entry

## Examples

```bash
# Download a new channel
bun generate.ts CocomelonIndonesia
# Creates: CocomelonIndonesia.json
# Updates: index.ts (adds import and spreads entries)

# Update existing channels
bun generate.ts LeoSiPenjagaAlam;
bun generate.ts Yes_Neo_ID;
bun generate.ts cocobitoys_id;
bun generate.ts BingIndonesia;
bun generate.ts SheriffLabradorID;
bun generate.ts BabyBusID;
```

## Output Format

The script generates a JSON file as a direct array:

```json
[
  {
    "id": "DwpojSYXsGQ",
    "title": "Video Title",
    "duration": 2179,
    "views": 33937,
    "thumbnail": "https://i.ytimg.com/vi/...",
    "timestamp": 1699123456,
    "channelId": "UCivjLRvBb_oZqU5x3ovI7kw",
    "channelName": "BabyBus Indonesia"
  }
]
```

Each video entry contains:
- `id`: YouTube video ID
- `title`: Video title
- `duration`: Video duration in seconds
- `views`: View count
- `thumbnail`: URL of the video thumbnail
- `timestamp`: Unix timestamp of when the video was uploaded
- `channelId`: YouTube channel ID
- `channelName`: Channel display name

Videos are automatically sorted from **newest to oldest** based on upload timestamp.

## Performance

The parallel batch processing approach significantly improves speed:
- **Sequential** (old): ~1 video per second
- **Parallel (10 batches)**: ~10 videos per second

For a channel with 100 videos:
- Old approach: ~100 seconds
- New approach: ~10-15 seconds ⚡

You can adjust `BATCH_SIZE` in `generate.ts` (line 31) to tune performance based on your network capacity.

## Auto-generated index.ts

The script automatically maintains `index.ts` which exports all videos:

```typescript
import BabyBusIDEntries from './BabyBusID.json';
import BingIndonesiaEntries from './BingIndonesia.json';
// ... more imports

export const entries = [
  ...BabyBusIDEntries,
  ...BingIndonesiaEntries,
  // ... more entries
];
```

**Total videos: 3,846** (across 6 channels)
