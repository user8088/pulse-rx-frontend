/**
 * Reads a user-friendly error message from a failed fetch Response.
 * Tries to parse JSON errors from Laravel (e.g. { errors: { field: [msg] }, message: "..." }).
 */
export async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { 
      errors?: Record<string, unknown[] | string>; 
      message?: string 
    };
    
    if (data?.errors && typeof data.errors === "object") {
      const firstKey = Object.keys(data.errors)[0];
      const first = firstKey ? data.errors[firstKey] : undefined;
      if (Array.isArray(first) && first[0]) return String(first[0]);
      if (typeof first === "string") return first;
    }
    
    if (data?.message) return String(data.message);
  } catch {
    // ignore
  }
  
  return `Request failed (${res.status})`;
}
