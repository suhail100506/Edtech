import axios, { AxiosError } from "axios";
import { APP_CONFIG } from "../constants";

export const apiClient = axios.create({
  baseURL: APP_CONFIG.defaultApiUrl,
  timeout: 6000,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface ApiError {
  message: string;
  statusCode?: number;
  details?: unknown;
}

export function normalizeError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<{ message?: string; detail?: string }>;
    return {
      message:
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "An unexpected network error occurred",
      statusCode: err.response?.status,
      details: err.response?.data,
    };
  }
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: "An unknown error occurred" };
}
