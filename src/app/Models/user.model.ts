export interface User {
  id?: number;
  name: {
    fName: string;
    lName: string;
  };
  email: string;
  phone: string;
  address: {
    city: string;
    street: string;
    state: string;
    zipCode: string;
  };
  password: string;
}
