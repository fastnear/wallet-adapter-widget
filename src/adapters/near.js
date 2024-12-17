import { KeyPair } from "near-api-js";
import { serializeTransaction } from "../utils/transaction";
import { toBase58, toBase64 } from "../utils/utils.js";

const walletUrl = (networkId) =>
  networkId === "testnet"
    ? "https://testnet.mynearwallet.com"
    : "https://app.mynearwallet.com";

export function createNearAdapter() {
  return {
    async signIn({ networkId, contractId, callbackUrl, publicKey }) {
      const url = new URL(`${walletUrl(networkId)}/login`);
      url.searchParams.set("contract_id", contractId);
      url.searchParams.set("public_key", publicKey);
      url.searchParams.set("success_url", callbackUrl);
      url.searchParams.set("failure_url", callbackUrl);

      return {
        url: url.toString(),
        state: {
          publicKey,
          networkId,
        },
      };
    },

    async sendTransactions({ state, transactions, callbackUrl }) {
      console.log(
        "sendTransactions",
        JSON.stringify({ state, transactions, callbackUrl })
      );
      if (!state?.accountId) {
        throw new Error("Not signed in");
      }

      const url = new URL("sign", walletUrl(state?.networkId));
      transactions = transactions.map(({ signerId, receiverId, actions }) => {
        if (signerId && signerId !== state.accountId) {
          throw new Error("Invalid signer");
        }
        return {
          signerId: state.accountId,
          receiverId,
          actions,
          publicKey: `ed25519:${toBase58(new Uint8Array(32))}`,
          nonce: 0,
          blockHash: toBase58(new Uint8Array(32)),
        };
      });

      url.searchParams.set(
        "transactions",
        transactions
          .map((transaction) => serializeTransaction(transaction))
          .map((serialized) => Buffer.from(serialized).toString("base64"))
          .join(",")
      );
      url.searchParams.set("callbackUrl", callbackUrl);

      return { url: url.toString() };
    },
  };
}
