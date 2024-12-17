import { HereWallet } from "@here-wallet/core";
import { mapActionForWalletSelector } from "../utils/actionToWalletSelector.js";

export function createHereAdapter() {
  return {
    async signIn({ networkId, contractId }) {
      const here = await HereWallet.connect({ networkId });
      const accountId = await here.signIn({ contractId });
      const key = await here.authStorage.getKey(networkId, accountId);

      return {
        state: {
          accountId,
          privateKey: key.toString(),
          networkId,
        },
      };
    },

    async sendTransactions({ state, transactions }) {
      if (!state?.accountId) {
        throw new Error("Not signed in");
      }

      const wallet = await HereWallet.connect({ networkId: state?.networkId });

      try {
        const response = await wallet.signAndSendTransactions({
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
        console.log(error);
        // if (
        //   error.message === "User cancelled the action" ||
        //   error.message ===
        //     "User closed the window before completing the action"
        // ) {
        //   return { rejected: true };
        // }
        throw new Error(error);
      }
    },
  };
}
