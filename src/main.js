import { wallets } from "./wallets.js";

let params = {};

window.addEventListener("message", (event) => {
  // Only accept messages from the parent window
  if (event.source !== window.parent) {
    return;
  }

  if (event.data.method === "signIn") {
    params = event.data.params || {};

    handleLogin();
  } else if (event.data.method === "sendTransactions") {
    params = event.data.params || {};

    handleSend();
  }
});

async function handleLogin() {
  function setupWalletList() {
    const walletList = document.getElementById("walletList");
    walletList.innerHTML = wallets
      .map(
        (wallet) => `
      <li class="wallet-item">
        <button class="wallet-button" data-wallet-id="${wallet.id}">
          <img class="wallet-icon" src="${wallet.icon}" alt="${wallet.name} icon">
          ${wallet.name}
        </button>
      </li>
    `
      )
      .join("");

    walletList.addEventListener("click", handleWalletSelect);
  }

  async function handleWalletSelect(e) {
    const button = e.target.closest(".wallet-button");
    if (!button) return;

    const wallet = wallets.find((w) => w.id === button.dataset.walletId);
    if (!wallet) return;

    try {
      const result = await wallet.adapter.signIn(params);
      window.parent.postMessage(
        {
          type: "wallet-adapter",
          id: params.id,
          payload: {
            ...result,
            state: {
              ...result.state,
              lastWalletId: wallet.id,
            },
          },
        },
        "*"
      );
    } catch (error) {
      window.parent.postMessage(
        {
          type: "wallet-adapter",
          id: params.id,
          payload: { error: error.message },
        },
        "*"
      );
    }
  }

  document.getElementById("closeButton")?.addEventListener("click", () => {
    window.parent.postMessage(
      {
        type: "wallet-adapter",
        action: "close",
      },
      "*"
    );
  });

  setupWalletList();
}

async function handleSend() {
  const { state = {} } = params;
  const wallet = wallets.find((w) => w.id === state.lastWalletId);

  if (!wallet) {
    window.parent.postMessage(
      {
        type: "wallet-adapter",
        id: params.id,
        payload: { error: "No wallet selected" },
      },
      "*"
    );
    return;
  }

  if (state.lastWalletId === "meteor") {
    const sendButton = document.getElementById("sign-transaction");
    sendButton.addEventListener("click", async () => {
      try {
        const result = await wallet.adapter.sendTransactions(params);
        window.parent.postMessage(
          {
            type: "wallet-adapter",
            id: params.id,
            payload: result,
          },
          "*"
        );
      } catch (error) {
        window.parent.postMessage(
          {
            type: "wallet-adapter",
            id: params.id,
            payload: { error: error.message },
          },
          "*"
        );
      }
    });
  } else {
    try {
      const result = await wallet.adapter.sendTransactions(params);
      window.parent.postMessage(
        {
          type: "wallet-adapter",
          id: params.id,
          payload: result,
        },
        "*"
      );
    } catch (error) {
      window.parent.postMessage(
        {
          type: "wallet-adapter",
          id: params.id,
          payload: { error: error.message },
        },
        "*"
      );
    }
  }
}

export { handleLogin, handleSend };
