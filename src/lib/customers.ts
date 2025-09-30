import axios from "axios";
import { getSession } from "next-auth/react";

const api = axios.create({
  // A URL base da sua API de backend
  baseURL: process.env.NEXT_PUBLIC_API_URL, // Ex: http://localhost:8000/api
});

// O interceptor adiciona o token de acesso a cada requisição
api.interceptors.request.use(async (config) => {
  console.log("Interceptor - Getting session...");
  const session = await getSession();
  console.log("Interceptor - Session:", session);
  if (session?.accessToken) {
    console.log("Interceptor - Adding token to headers...");
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  } else {
    console.log("Interceptor - No session or token found.");
  }
  return config;
});

export default api;
