import { connect, KeyPair } from "near-api-js";
import { BrowserLocalStorageKeyStore } from "near-api-js/lib/key_stores";
import { MeteorWallet } from "@fastnear/meteorwallet-sdk";
import { mapActionForWalletSelector } from "../utils/actionToWalletSelector.js";

async function createMeteorWalletInstance({ networkId = "mainnet" }) {
  const keyStore = new BrowserLocalStorageKeyStore(
    window.localStorage,
    "_meteor_wallet"
  );

  const near = await connect({
    keyStore,
    networkId,
    nodeUrl:
      networkId === "mainnet"
        ? "https://rpc.mainnet.near.org"
        : "https://rpc.testnet.near.org",
  });

  return new MeteorWallet({ near, appKeyPrefix: "near_app" });
}

export function createMeteorAdapter() {
  return {
    async signIn({ networkId, contractId }) {
      const keyPair = KeyPair.fromRandom("ed25519");
      const wallet = await createMeteorWalletInstance({ networkId });

      const {
        success,
        payload: { accountId },
      } = await wallet.requestSignIn({
        contract_id: contractId,
        type: "ALL_METHODS",
        keyPair,
      });

      if (!success) {
        throw new Error("Meteor Wallet sign in failed");
      }

      return {
        state: {
          accountId,
          privateKey: keyPair.toString(),
          networkId,
        },
      };
    },

    async sendTransactions({ state, transactions }) {
      if (!state?.accountId) {
        throw new Error("Not signed in");
      }

      const wallet = await createMeteorWalletInstance({
        networkId: state?.networkId,
      });
      try {
        const response = await wallet.requestSignTransactions({
          transactions: transactions.map(
            ({ signerId, receiverId, actions }) => {
              if (signerId && signerId !== state.accountId) {
                throw new Error("Invalid signer");
              }
              return {
                signerId: state.accountId,
                receiverId,
                actions: actions.map(mapActionForWalletSelector),
              };
            }
          ),
        });

        return { outcomes: response };
      } catch (error) {
        if (
          error.message === "User cancelled the action" ||
          error.message ===
            "User closed the window before completing the action"
        ) {
          return { rejected: true };
        }
        console.log(error);
        throw new Error(error);
      }
    },
  };
}
