#!/usr/bin/env bun

import { $ } from "bun";
import type { Video } from "../types/video";

interface YtDlpVideo {
  id: string;
  title: string;
  duration: number;
  view_count: number;
  thumbnails: Array<{
    url: string;
    height: number;
    width: number;
  }>;
}

async function downloadChannelMetadata(channelUrl: string, outputFileName: string) {
  console.log(`Fetching metadata for: ${channelUrl}`);
  
  try {
    // Run yt-dlp to get channel metadata as JSON
    const result = await $`yt-dlp --dump-json --flat-playlist --skip-download ${channelUrl}`.text();
    
    // Parse each line as a separate JSON object (yt-dlp outputs one JSON per video)
    const lines = result.trim().split('\n').filter(line => line.trim());
    const videos: Video[] = lines.map(line => {
      const video: YtDlpVideo = JSON.parse(line);
      // Get the highest quality thumbnail URL
      const thumbnail = video.thumbnails && video.thumbnails.length > 0
        ? video.thumbnails[video.thumbnails.length - 1].url
        : '';
      
      return {
        id: video.id,
        title: video.title,
        duration: video.duration || 0,
        view_count: video.view_count || 0,
        thumbnail
      };
    });

    console.log(`Found ${videos.length} videos`);

    // Save to file
    const outputPath = `${import.meta.dir}/${outputFileName}`;
    await Bun.write(
      outputPath,
      JSON.stringify(videos, null, 2)
    );

    console.log(`Saved metadata to: ${outputPath}`);
    return { outputFileName, channelName: outputFileName.replace('.json', '') };
  } catch (error) {
    console.error("Error fetching channel metadata:", error);
    throw error;
  }
}

async function updateIndexFile(channelFileName: string, channelName: string) {
  const indexPath = `${import.meta.dir}/index.ts`;
  const indexContent = await Bun.file(indexPath).text();

  // Create import statement
  const importName = `${channelName.replace(/[^a-zA-Z0-9]/g, '_')}Entries`;
  const newImport = `import ${importName} from './${channelFileName}';`;

  // Check if import already exists
  if (indexContent.includes(newImport)) {
    console.log(`Import for ${channelFileName} already exists in index.ts`);
    return;
  }

  // Find the last import line
  const lines = indexContent.split('\n');
  let lastImportIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import')) {
      lastImportIndex = i;
    }
  }

  // Insert new import after last import
  lines.splice(lastImportIndex + 1, 0, newImport);

  // Find the export line and update it
  const exportLineIndex = lines.findIndex(line => line.includes('export const entries'));
  if (exportLineIndex !== -1) {
    // Find the closing bracket
    let closingBracketIndex = exportLineIndex;
    for (let i = exportLineIndex; i < lines.length; i++) {
      if (lines[i].includes('];')) {
        closingBracketIndex = i;
        break;
      }
    }

    // Insert new entry before closing bracket
    lines.splice(closingBracketIndex, 0, `  ...${importName},`);
  }

  // Write updated content
  await Bun.write(indexPath, lines.join('\n'));
  console.log(`Updated index.ts with ${channelFileName}`);
}

// Example usage
const channelName = process.argv[2];

if (!channelName) {
  console.error("Please provide a channel name");
  console.log("Usage: bun run data/generate.ts <channel-name>");
  console.log("Example: bun run data/generate.ts CocomelonIndonesia");
  process.exit(1);
}

const channelUrl = `https://www.youtube.com/@${channelName}/videos`;
const outputFile = `${channelName}.json`;

const result = await downloadChannelMetadata(channelUrl, outputFile);
await updateIndexFile(result.outputFileName, result.channelName);
