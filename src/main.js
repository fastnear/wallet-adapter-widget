import { wallets } from './wallets.js';

const params = Object.fromEntries(new URLSearchParams(window.location.search));
for (const [key, value] of Object.entries(params)) {
  try {
    params[key] = JSON.parse(value);
  } catch {}
}

async function handleLogin() {
  function setupWalletList() {
    const walletList = document.getElementById('walletList');
    walletList.innerHTML = wallets.map(wallet => `
      <li class="wallet-item">
        <button class="wallet-button" data-wallet-id="${wallet.id}">
          <img class="wallet-icon" src="${wallet.icon}" alt="${wallet.name} icon">
          ${wallet.name}
        </button>
      </li>
    `).join('');

    walletList.addEventListener('click', handleWalletSelect);
  }

  async function handleWalletSelect(e) {
    const button = e.target.closest('.wallet-button');
    if (!button) return;

    const wallet = wallets.find(w => w.id === button.dataset.walletId);
    if (!wallet) return;

    try {
      const result = await wallet.adapter.signIn(params);
      window.parent.postMessage({
        type: 'wallet-adapter',
        id: params.id,
        payload: {
          ...result,
          state: {
            ...result.state,
            lastWalletId: wallet.id
          }
        }
      }, '*');
    } catch (error) {
      window.parent.postMessage({
        type: 'wallet-adapter',
        id: params.id,
        payload: { error: error.message }
      }, '*');
    }
  }

  document.getElementById('closeButton')?.addEventListener('click', () => {
    window.parent.postMessage({
      type: 'wallet-adapter',
      action: 'close'
    }, '*');
  });

  setupWalletList();
}

async function handleSign() {
  const { state = {} } = params;
  const wallet = wallets.find(w => w.id === state.lastWalletId);
  
  if (!wallet) {
    window.parent.postMessage({
      type: 'wallet-adapter',
      id: params.id,
      payload: { error: 'No wallet selected' }
    }, '*');
    return;
  }

  try {
    const result = await wallet.adapter.sendTransaction(params);
    window.parent.postMessage({
      type: 'wallet-adapter',
      id: params.id,
      payload: result
    }, '*');
  } catch (error) {
    window.parent.postMessage({
      type: 'wallet-adapter',
      id: params.id,
      payload: { error: error.message }
    }, '*');
  }
}

if (window.location.pathname.includes('login.html')) {
  handleLogin();
} else if (window.location.pathname.includes('sign.html')) {
  handleSign();
}