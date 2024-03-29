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
  return v
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((e) => capitalize(e))
    .join(" ");
}

export function getNameSymbol(name?: string): string {
  if (!name) return "U";
  const names = name.split(" ");
  if (names.length === 1) {
    return names[0][0];
  }

  return `${names[0][0]}${names[1][0]}`.toUpperCase();
}
