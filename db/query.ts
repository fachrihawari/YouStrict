import { db } from "@/db";


export function getVideos(page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;
  const videos = db
    .query
    .videos
    .findMany({
      offset,
      limit,
      orderBy: (video, { desc }) => [desc(video.timestamp)],
    })

  return videos
}