export function exclude<News, Key extends keyof News>(
  news: News,
  keys: Key[]
): Omit<News, Key> {
  for (let key of keys) {
    delete news[key];
  }
  return news;
}
