import { httpClient, apiConfig } from '@/api';

export type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  inStock: boolean;
};

export const fetchProducts = async () => {
  const { data } = await httpClient.get<Product[]>(apiConfig.endpoints.products);
  return data;
};

export const fetchProductById = async (id: number) => {
  const { data } = await httpClient.get<Product>(`${apiConfig.endpoints.products}/${id}`);
  return data;
};

