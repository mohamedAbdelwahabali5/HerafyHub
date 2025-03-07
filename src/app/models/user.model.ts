export interface User {
  id?: number | string; // MongoDB will use _id
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone: string;
  password: string;
  role?: 'user' | 'admin';
  profileImage?: string;
}
