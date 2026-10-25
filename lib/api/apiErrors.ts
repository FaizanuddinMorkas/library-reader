import axios from "axios";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status = 0, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (axios.isAxiosError(error)) {
    return new ApiError(
      error.response?.data?.message ?? error.message ?? "Network error",
      error.response?.status ?? 0,
      error.response?.data,
    );
  }
  return new ApiError(error instanceof Error ? error.message : "Network error");
}
