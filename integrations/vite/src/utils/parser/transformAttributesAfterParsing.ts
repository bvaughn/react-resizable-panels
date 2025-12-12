export function transformAttributesAfterParsing(name: string) {
  while (true) {
    const match = name.match(/_([a-z])/);
    if (match === null) {
      return name;
    }

    const [total, letter] = match;

    name = name.replace(total, letter.toUpperCase());
  }
}
