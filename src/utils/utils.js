import {
  binary_to_base58 as toBase58,
  base58_to_binary as fromBase58,
} from "base58-js";

export { toBase58, fromBase58 };

export const keyFromString = (key) =>
  fromBase58(
    key.includes(":")
      ? (() => {
          const [curve, keyPart] = key.split(":");
          if (curve !== "ed25519") {
            throw new Error(`Unsupported curve: ${curve}`);
          }
          return keyPart;
        })()
      : key
  );

export const keyToString = (key) => `ed25519:${toBase58(key)}`;

export function toBase64(data) {
  return Buffer.from(data).toString("base64");
}

export function fromBase64(data) {
  return Buffer.from(data, "base64");
}
