export function extractValidInformation(text: string): string {
  const endMarker = text.indexOf("<|end_of_text|>");
  if (endMarker !== -1) {
    return text
      .slice(0, endMarker)
      .trim()
      .replace(/https?:\/\/[^\s]+/g, "")
      .trim();
  }
  return text.trim();
}

export function stripThinkingTags(response: string): string {
  return response.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}

export function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}\n\n[Document truncated due to length…]`;
}
