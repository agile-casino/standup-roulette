export function formatName(name: string | null): string {
  if (name) {
    name = name.replace(/\s*<.+/, ""); // eslint-disable-line sonarjs/slow-regex

    const reverseMatch = /^(\w+), (.+).*$/.exec(name); // eslint-disable-line sonarjs/slow-regex

    if (reverseMatch) {
      return `${reverseMatch[2]} ${reverseMatch[1]}`;
    }

    const match = /^(\w+) (.+)$/.exec(name);

    if (match) {
      return `${match[1]} ${match[2]}`;
    }
  }
  return name ?? "";
}
