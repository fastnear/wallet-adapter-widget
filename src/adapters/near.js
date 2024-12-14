import { KeyPair } from "near-api-js";

export function createNearAdapter() {
  return {
    async signIn({ networkId, contractId }) {
      const walletUrl = networkId === 'mainnet' 
        ? 'https://app.mynearwallet.com'
        : 'https://testnet.mynearwallet.com';

      const keyPair = KeyPair.fromRandom('ed25519');
      
      const url = new URL(`${walletUrl}/login`);
      url.searchParams.set('contract_id', contractId);
      url.searchParams.set('public_key', keyPair.getPublicKey().toString());
      url.searchParams.set('success_url', window.location.href);
      url.searchParams.set('failure_url', window.location.href);

      return {
        url: url.toString(),
        state: {
          publicKey: keyPair.getPublicKey().toString(),
          privateKey: keyPair.toString(),
          walletUrl
        }
      };
    },

    async sendTransaction({ receiverId, actions, state }) {
      if (!state?.accountId) {
        throw new Error('Not signed in');
      }

      const url = new URL(`${state.walletUrl}/sign`);
      url.searchParams.set('transactions', JSON.stringify([{
        signerId: state.accountId,
        receiverId,
        actions
      }]));

      return { url: url.toString() };
    }
  };
}