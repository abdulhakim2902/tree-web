import { capitalize } from "lodash";
import { Nickname } from "../types/tree";

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
    return names[0][0].toUpperCase();
  }

  return `${names[0][0]}${names[1][0]}`.toUpperCase();
}

export function getNickname(nicknames: Nickname[] = []) {
  const nickname = nicknames.find((e) => e.selected === true)?.name;
  return nickname;
}

export const getPlace = (country?: string, city?: string) => {
  if (country && city) {
    return `${startCase(country)}, ${startCase(city)}`;
  }

  if (country) {
    return startCase(country);
  }

  if (city) {
    return startCase(city);
  }

  return undefined;
};
