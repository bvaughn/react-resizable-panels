let nonce: string | null;

export function getNonce(): string | null {
  return nonce;
}

export function setNonce(value: string | null) {
  nonce = value;
}
