import { fetcher } from "./client";
import { User } from "@/types";

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface SignupRequest {
  email: string;
  password?: string;
  full_name: string;
  phone?: string;
  role?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const authApi = {
  login: (credentials: LoginRequest) =>
    fetcher<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password || "password123",
      }),
    }),

  signup: (data: SignupRequest) =>
    fetcher<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        password: data.password || "password123",
      }),
    }),

  getMe: () => fetcher<User>("/auth/me"),

  logout: () =>
    fetcher<{ detail: string; user_id: string }>("/auth/logout", {
      method: "POST",
    }),
};
