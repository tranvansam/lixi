import { httpClient, apiConfig } from '@/api';

export type Post = {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  views: number;
};

export const fetchPosts = async () => {
  const { data } = await httpClient.get<Post[]>(apiConfig.endpoints.posts);
  return data;
};

export const fetchPostById = async (id: number) => {
  const { data } = await httpClient.get<Post>(`${apiConfig.endpoints.posts}/${id}`);
  return data;
};

