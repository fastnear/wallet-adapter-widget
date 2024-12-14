import { KeyPair } from "near-api-js";

export function createNearAdapter() {
  return {
    async signIn({ networkId, contractId, callbackUrl }) {
      const walletUrl = networkId === 'mainnet' 
        ? 'https://app.mynearwallet.com'
        : 'https://testnet.mynearwallet.com';

      const keyPair = KeyPair.fromRandom('ed25519');
      
      const url = new URL(`${walletUrl}/login`);
      url.searchParams.set('contract_id', contractId);
      url.searchParams.set('public_key', keyPair.getPublicKey().toString());
      url.searchParams.set('success_url', callbackUrl);
      url.searchParams.set('failure_url', callbackUrl);

      return {
        url: url.toString(),
        state: {
          publicKey: keyPair.getPublicKey().toString(),
          privateKey: keyPair.toString(),
          walletUrl
        }
      };
    },

    async sendTransaction({ receiverId, actions, state, callbackUrl }) {
      if (!state?.accountId) {
        throw new Error('Not signed in');
      }

      const url = new URL('sign', state.walletUrl);
      const transactions = [{
        signerId: state.accountId,
        receiverId,
        actions
      }];

      url.searchParams.set('transactions', transactions
        .map(transaction => Buffer.from(JSON.stringify(transaction)).toString('base64'))
        .join(','));
      url.searchParams.set('callbackUrl', callbackUrl);

      return { url: url.toString() };
    }
  };
}