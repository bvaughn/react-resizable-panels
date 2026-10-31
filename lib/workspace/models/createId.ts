// crypto.randomUUID() is only available in secure contexts (e.g. not over http on a phone),
// but crypto.getRandomValues() is available everywhere
export function createId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}
