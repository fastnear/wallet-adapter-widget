import { HereWallet } from "@here-wallet/core";

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

    async sendTransactions({ receiverId, actions, state }) {
      if (!state?.accountId) {
        throw new Error("Not signed in");
      }

      const here = await HereWallet.connect({ networkId: state?.networkId });

      const result = await here.signAndSendTransaction({
        signerId: state.accountId,
        receiverId,
        actions: actions.map(({ functionCall, ...action }) => {
          if (!functionCall) {
            throw new Error("Only functionCall actions are supported");
          }
          return {
            type: "FunctionCall",
            params: {
              methodName: functionCall.methodName,
              args: functionCall.args,
              gas: functionCall.gas.toString(),
              deposit: functionCall.deposit.toString(),
            },
          };
        }),
      });

      return { hash: result.transaction.hash };
    },
  };
}
