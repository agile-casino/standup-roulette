export function formatName(name: string | null): string {
  if (name) {
    name = name.replace(/\s*<.+/, "");

    const reverseMatch = name.match(/^(\w+), (.+).*$/);

    if (reverseMatch) {
      return `${reverseMatch[2]} ${reverseMatch[1]}`;
    }

    const match = name.match(/^(\w+) (.+)$/);

    if (match) {
      return `${match[1]} ${match[2]}`;
    }
  }
  return name ?? "";
}
