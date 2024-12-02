export function formatName(name: string | null): string {
  let result = name;
  if (result) {
    result = result.replace(/\s*<.+/, "");

    const reverseMatch = /^(\w+), (.+).*$/.exec(result);

    if (reverseMatch) {
      return `${reverseMatch[2]} ${reverseMatch[1]}`;
    }

    const match = /^(\w+) (.+)$/.exec(result);

    if (match) {
      return `${match[1]} ${match[2]}`;
    }
  }
  return result ?? "";
}
