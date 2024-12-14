import { connect, KeyPair } from "near-api-js";
import { BrowserLocalStorageKeyStore } from 'near-api-js/lib/key_stores';
import { MeteorWallet } from "@fastnear/meteorwallet-sdk";

async function createMeteorWalletInstance({ networkId = "mainnet" }) {
  const keyStore = new BrowserLocalStorageKeyStore(window.localStorage, "_meteor_wallet");

  const near = await connect({
    keyStore,
    networkId,
    nodeUrl: networkId === 'mainnet' ? 'https://rpc.mainnet.near.org' : 'https://rpc.testnet.near.org',
  });

  return new MeteorWallet({ near, appKeyPrefix: "near_app" });
}

export function createMeteorAdapter() {
  return {
    async signIn({ networkId, contractId }) {
      const keyPair = KeyPair.fromRandom('ed25519');
      const wallet = await createMeteorWalletInstance({ networkId });

      const { success, payload: { accountId } } = await wallet.requestSignIn({
        contract_id: contractId,
        type: "ALL_METHODS",
        keyPair
      });

      if (!success) {
        throw new Error('Meteor Wallet sign in failed');
      }

      return {
        state: {
          accountId,
          privateKey: keyPair.toString()
        }
      };
    },

    async sendTransaction({ receiverId, actions, state }) {
      if (!state?.accountId) {
        throw new Error('Not signed in');
      }

      const wallet = await createMeteorWalletInstance();
      const account = wallet.account();

      const response = await account.signAndSendTransaction_direct({
        receiverId,
        actions
      });

      return { hash: response.transaction.hash };
    }
  };
}