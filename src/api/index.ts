import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const auddApi = axios.create({
  baseURL: import.meta.env.VITE_AUD_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
  params: {
    api_token: import.meta.env.VITE_AUD_TOKEN,
  },
});
