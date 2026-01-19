// Shared API base URL resolver (client + server).
// Keeps behavior consistent between axios client and server actions.

export function getApiBaseURL() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // In production, ensure we have a valid API URL (not localhost)
  if (process.env.NODE_ENV === "production") {
    if (!apiUrl || apiUrl.includes("localhost") || apiUrl.includes("127.0.0.1")) {
      console.warn(
        "NEXT_PUBLIC_API_URL is not set or points to localhost in production. " +
          "Please set it in your deployment environment variables."
      );
      // Return empty string to prevent invalid requests
      return "";
    }
  }

  return apiUrl || "http://localhost:8000/api";
}

