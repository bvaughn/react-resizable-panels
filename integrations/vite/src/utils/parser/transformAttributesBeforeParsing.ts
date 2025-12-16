export function transformAttributesBeforeParsing(code: string) {
  while (true) {
    const match = code.match(/([a-z]+[A-Z][a-zA-Z]+)=(["{])/);
    if (match === null) {
      return code;
    }

    const [total, attribute, token] = match;

    const newAttribute = attribute.replace(/([A-Z])/g, "_$1".toLowerCase());

    code = code.replace(total, `${newAttribute}=${token}`);
  }
}
