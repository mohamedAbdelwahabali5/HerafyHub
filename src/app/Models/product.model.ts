
export interface Product {
  _id: string;
  title: string;
  image: string;
  rating: { rate: number };
  currentprice: number;
  description: string;
  categoryId: {
    _id: string;
    title: string;
  };
}

export interface Category {
  _id: string;
  title: string;
  image?: string;
  description?: string;
}

export interface ProductsResponse {
  success: boolean;
  products: Product[];
  categoryName?: string;
  totalProducts?: number;
}
