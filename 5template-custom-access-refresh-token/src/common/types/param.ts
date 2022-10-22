export interface SignUpParams {
  name: string;
  email: string;
  phone?: string;
  password: string;
}
export interface SignInParams {
  email: string;
  password: string;
}
