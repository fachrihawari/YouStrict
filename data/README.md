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
bun run data/generate.ts <channel-name>
```

The script will:
- Construct the channel URL: `https://www.youtube.com/@<channel-name>/videos`
- Save the output as: `data/<channel-name>.json`

## Examples

```bash
# Download CocomelonIndonesia channel
bun run data/generate.ts CocomelonIndonesia
# Output: data/CocomelonIndonesia.json

# Download another channel
bun run data/generate.ts PeppaPigOfficial
# Output: data/PeppaPigOfficial.json
```

## Output Format

The script generates a JSON file with this structure:

```json
{
  "entries": [
    {
      "id": "video_id",
      "title": "Video Title",
      "duration": 123,
      "view_count": 1000,
      "thumbnail": "https://i.ytimg.com/vi/..."
    }
  ]
}
```

Each video entry contains:
- `id`: YouTube video ID
- `title`: Video title
- `duration`: Video duration in seconds
- `view_count`: Number of views
- `thumbnail`: URL of the highest quality thumbnail
