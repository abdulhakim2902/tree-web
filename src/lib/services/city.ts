import countries from "country-json/src/country-by-abbreviation.json";
import { startCase } from "lodash";

const API_KEY = process.env.NEXT_PUBLIC_API_NINJA_KEY;
const API_URL = process.env.NEXT_PUBLIC_API_NINJA_URL;

export type City = {
  name: string;
  country: string;
};

const countriesById = Object.fromEntries(countries.map((c) => [c.abbreviation, c.country]));

export const searchCities = async (name: string, signal?: AbortSignal) => {
  const response = await fetch(`${API_URL}/city?name=${name}&limit=15`, {
    method: "GET",
    signal,
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": API_KEY,
    } as HeadersInit,
  });

  if (response.status !== 200) {
    throw new Error(response.statusText);
  }

  const cities = await response.json();

  return cities.map((e: City) => {
    return {
      name: startCase(e.name),
      country: startCase(countriesById[e.country]),
    };
  }) as City[];
};
