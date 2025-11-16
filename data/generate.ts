#!/usr/bin/env bun

import { $ } from "bun";
import type { Video } from "../types/video";

interface YtDlpVideo {
  id: string;
  title: string;
  duration: number;
  view_count: number;
  thumbnail: string;
  timestamp: number;
  channel: string;
  uploader_id: string; 
}

async function downloadChannelMetadata(channelUrl: string, outputFileName: string) {
  console.log(`\n📡 Stage 1: Fetching video IDs from channel`);
  console.log(`   Channel URL: ${channelUrl}`);
  
  try {
    // First, get list of video IDs quickly with flat-playlist
    console.log(`   Getting video list...`);
    const videoIds = await $`yt-dlp --flat-playlist --print "%(id)s" ${channelUrl}`.text();
    const ids = videoIds.trim().split('\n').filter(id => id.trim());
    console.log(`   ✓ Found ${ids.length} videos`);
    
    console.log(`\n📥 Stage 2: Fetching metadata in parallel batches`);
    // Process videos in parallel batches for speed
    const BATCH_SIZE = 10; // Adjust based on your network/system
    const videos: Video[] = [];
    
    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      const batch = ids.slice(i, Math.min(i + BATCH_SIZE, ids.length));
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(ids.length / BATCH_SIZE);
      
      console.log(`   Batch ${batchNum}/${totalBatches}: Processing ${batch.length} videos...`);
      
      // Fetch all videos in batch concurrently
      const batchPromises = batch.map(async (videoId) => {
        try {
          const result = await $`yt-dlp --skip-download --print '{"id":"%(id)s","title":"%(title)s","duration":%(duration)s,"view_count":%(view_count)s,"thumbnail":"%(thumbnail)s","timestamp":%(timestamp)s,"channel":"%(channel)s","uploader_id":"%(uploader_id)s"}' https://www.youtube.com/watch?v=${videoId}`.text();
          const video: YtDlpVideo = JSON.parse(result.trim());
          return {
            id: video.id,
            title: video.title,
            duration: video.duration,
            views: video.view_count,
            thumbnail: video.thumbnail,
            timestamp: video.timestamp,
            channelId: video.uploader_id,
            channelName: video.channel
          };
        } catch (error) {
          console.error(`   ⚠️  Failed to fetch ${videoId}:`, error);
          return null;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      videos.push(...batchResults.filter((v): v is Video => v !== null));
    }
    
    console.log(`   ✓ Successfully fetched ${videos.length}/${ids.length} videos`);
    
    console.log(`\n🔄 Stage 4: Sorting videos by date`);
    // sort videos from latest to oldest
    videos.sort((a, b) => b.timestamp - a.timestamp);
    console.log(`   ✓ Sorted from newest to oldest`);

    console.log(`\n💾 Stage 5: Saving to file`);
    // Save to file
    const outputPath = `${import.meta.dir}/${outputFileName}`;
    await Bun.write(
      outputPath,
      JSON.stringify(videos, null, 2)
    );

    console.log(`   ✓ Saved to: ${outputPath}`);
    console.log(`   File size: ${(JSON.stringify(videos).length / 1024).toFixed(2)} KB`);
    
    return { outputFileName, channelName: outputFileName.replace('.json', '') };
  } catch (error) {
    console.error("\n❌ Error fetching channel metadata:", error);
    throw error;
  }
}

async function updateIndexFile(channelFileName: string, channelName: string) {
  console.log(`\n📝 Stage 6: Updating index.ts`);
  
  const indexPath = `${import.meta.dir}/index.ts`;
  const indexContent = await Bun.file(indexPath).text();

  // Create import statement
  const importName = `${channelName.replace(/[^a-zA-Z0-9]/g, '_')}Entries`;
  const newImport = `import ${importName} from './${channelFileName}';`;

  // Check if import already exists
  if (indexContent.includes(newImport)) {
    console.log(`   ⚠️  Import for ${channelFileName} already exists in index.ts`);
    console.log(`   Skipping update (file already registered)`);
    return;
  }

  console.log(`   Adding import: ${importName}`);
  
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
  console.log(`   ✓ Added import statement`);

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
    console.log(`   ✓ Added to exports array`);
  }

  // Write updated content
  await Bun.write(indexPath, lines.join('\n'));
  console.log(`   ✓ Saved index.ts`);
}

// Example usage
const channelName = process.argv[2];

if (!channelName) {
  console.error("❌ Please provide a channel name");
  console.log("Usage: bun run data/generate.ts <channel-name>");
  console.log("Example: bun run data/generate.ts CocomelonIndonesia");
  process.exit(1);
}

console.time(`✅ All done!`);
console.log(`\n🚀 Starting metadata download for: ${channelName}`);
console.log(`${'='.repeat(60)}`);

const channelUrl = `https://www.youtube.com/@${channelName}/videos`;
const outputFile = `${channelName}.json`;

const result = await downloadChannelMetadata(channelUrl, outputFile);
await updateIndexFile(result.outputFileName, result.channelName);

console.log(`\n${'='.repeat(60)}`);
console.log(`Successfully generated ${channelName}.json`)
console.log(``);
console.timeEnd(`✅ All done!`);

