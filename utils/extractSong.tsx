export function extractSong(text: unknown): { title: string; artist: string } | null {
  if (typeof text !== 'string') {
    return null;
  }

  const match = text.match(/Song suggestion:\s*'(.+?)'\s*by\s*([^\.]+)/);

  if (match) {
    const [, title, artist] = match;
    return {
      title: title.trim(),
      artist: artist.trim(),
    };
  }

  return null;
}
