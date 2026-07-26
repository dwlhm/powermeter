import axios from "axios";

export interface Api<T> {
    status: string,
    results: T
  }

// Backend mengembalikan 400 {"detail": "no data"} ketika koleksi data kosong.
export function isNoDataError(error: unknown): boolean {
    return (
      axios.isAxiosError(error) &&
      error.response?.status === 400 &&
      (error.response?.data as { detail?: string })?.detail === "no data"
    );
  }
  