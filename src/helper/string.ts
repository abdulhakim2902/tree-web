import { capitalize } from "lodash";

export function parseJSON<T>(data?: string | null): T | null {
  if (!data) return null;

  try {
    const result = JSON.parse(data);
    return result;
  } catch {
    //
  }

  return null;
}

export function startCase(v: string) {
  return v.split(" ").map((e) => capitalize(e)).join(" ");
}