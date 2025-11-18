import { useEffect, useState } from 'react';
import { Video } from '@/db/schema';
import { db } from '@/db';

export function useVideos() {
  const [page, setPage] = useState(1);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getVideos(page)
      .then((data) => {
        if (page === 1) setVideos(data);
        else setVideos((prevVideos) => [...prevVideos, ...data]);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const loadNextPage = () => {
    if (loading) return;

    setPage((prevPage) => prevPage + 1);
  };

  return {
    videos,
    loading,
    loadNextPage,
  };
}

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