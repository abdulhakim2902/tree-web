export function createFetch() {
  const fetchMap: Record<string, Promise<Response>> = {};

  return (url: string, options?: RequestInit) => {
    if (!fetchMap[url]) {
      fetchMap[url] = fetch(url, options);
    }

    return fetchMap[url];
  };
}
