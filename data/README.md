# Video Metadata Downloader

This script downloads YouTube channel metadata using `yt-dlp` and saves it as JSON.

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

The script will:
- Construct the channel URL: `https://www.youtube.com/@<channel-name>/videos`
- Save the output as: `<channel-name>.json`
- Automatically update `index.ts` with the new import and entry

## Examples

```bash
# Download a new channel
bun generate.ts CocomelonIndonesia
# Creates: CocomelonIndonesia.json
# Updates: index.ts (adds import and spreads entries)

# Update existing channels
bun generate.ts BabyBusID
bun generate.ts BingIndonesia
bun generate.ts LeoSiPenjagaAlam
bun generate.ts SheriffLabradorID
bun generate.ts Yes_Neo_ID
bun generate.ts cocobitoys_id
```

## Output Format

The script generates a JSON file as a direct array:

```json
[
  {
    "id": "video_id",
    "title": "Video Title",
    "duration": 123,
    "views": 1000,
    "thumbnail": "https://i.ytimg.com/vi/..."
  }
]
```

Each video entry contains:
- `id`: YouTube video ID
- `title`: Video title
- `duration`: Video duration in seconds
- `views`: Number of views
- `thumbnail`: URL of the highest quality thumbnail

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
