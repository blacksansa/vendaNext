import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(async (config) => {
  console.log('Request Interceptor: Getting session');
  const session = await getSession();
  if (session?.accessToken) {
    console.log('Request Interceptor: Attaching token to headers');
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void; }[] = [];

const processQueue = (error: any, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      console.log('Response Interceptor: 401 error');
      if (isRefreshing) {
        console.log('Response Interceptor: Token refresh is already in progress');
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axios(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      console.log('Response Interceptor: Starting token refresh');

      return new Promise(async (resolve, reject) => {
        try {
          const session = await getSession({ force: true });
          if (session) {
            console.log('Response Interceptor: Token refresh successful');
            originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
            processQueue(null, session.accessToken);
            resolve(axios(originalRequest));
          } else {
            throw new Error("No session after refresh");
          }
        } catch (e) {
          console.error('Response Interceptor: Token refresh failed', e);
          processQueue(e, null);
          signOut();
          reject(e);
        } finally {
          isRefreshing = false;
        }
      });
    }

    return Promise.reject(error);
  }
);

export default api;