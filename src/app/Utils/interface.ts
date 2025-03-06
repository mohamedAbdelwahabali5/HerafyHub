// Define TypeScript interfaces for better type safety
interface Product {
    _id: string;
    title: string;
    oldprice: number;
    currentprice: number;
    description: string;
    quantity: number;
    image: string;
    categoryId: string;
    rating: {
      rate: number;
      count: number;
    };
    createdAt: string;
    updatedAt: string;
  }
  
  interface ProductApiResponse {
    products: Product[];
    totalProducts: number;
    totalPages: number;
    currentPage: number;
  }
  

export type { Product, ProductApiResponse }
