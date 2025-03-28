export interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  password: string;
  role?: string;
  profileImage?: string;

}

export interface RegisterResponse {
  message: string;
  user: Omit<User, 'password'>;
}
