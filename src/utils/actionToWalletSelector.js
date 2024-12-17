import { transactions, utils } from "near-api-js";
import { fromBase64 } from "./utils.js";

const getAccessKey = (permission) => {
  if (permission === "FullAccess") {
    return transactions.fullAccessKey();
  }

  const { receiverId, methodNames = [] } = permission;
  const allowance = permission.allowance
    ? BigInt(permission.allowance)
    : undefined;

  return transactions.functionCallAccessKey(receiverId, methodNames, allowance);
};

export const mapActionForWalletSelector = (action) => {
  const type = action.type;
  switch (type) {
    case "CreateAccount":
      return action;
    case "DeployContract": {
      return { type, params: { code: fromBase64(action.codeBase64) } };
    }
    case "FunctionCall": {
      const { methodName, args, gas, deposit } = action.params;

      return transactions.functionCall(
        methodName,
        args,
        BigInt(gas),
        BigInt(deposit)
      );
    }
    case "Transfer": {
      return { type, params: { deposit: action.deposit } };
    }
    case "Stake": {
      const { stake, publicKey } = action.params;

      return transactions.stake(BigInt(stake), utils.PublicKey.from(publicKey));
    }
    case "AddKey": {
      const { publicKey, accessKey } = action.params;

      return transactions.addKey(
        utils.PublicKey.from(publicKey),
        // TODO: Use accessKey.nonce? near-api-js seems to think 0 is fine?
        getAccessKey(accessKey.permission)
      );
    }
    case "DeleteKey": {
      const { publicKey } = action.params;

      return transactions.deleteKey(utils.PublicKey.from(publicKey));
    }
    case "DeleteAccount": {
      const { beneficiaryId } = action.params;

      return transactions.deleteAccount(beneficiaryId);
    }
    default:
      throw new Error("Invalid action type");
  }
};
