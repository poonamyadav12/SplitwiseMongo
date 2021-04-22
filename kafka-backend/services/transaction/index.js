import { addComment, createTransaction, deleteComment, getAllTransactionsForFriend, getAllTransactionsForGroup, getAllTransactionsForUser, settleTransactions, updateTransactions } from "../../apis/transactions_api";

export const handle_request = async (message, callback) => {
  if (message.path === "transaction-create") {
    return createTransaction(message, callback);
  } else if (message.path === "transaction-update") {
    return updateTransactions(message, callback);
  } else if (message.path === "transaction-settle") {
    return settleTransactions(message, callback);
  } else if (message.path === "transaction-friend") {
    return getAllTransactionsForFriend(message, callback);
  } else if (message.path === "transaction-user") {
    return getAllTransactionsForUser(message, callback);
  } else if (message.path === "transaction-group") {
    return getAllTransactionsForGroup(message, callback);
  } else if (message.path === "transaction-comment") {
    return addComment(message, callback);
  } else if (message.path === "transaction-comment-delete") {
    return deleteComment(message, callback);
  }
  
  else {
    return callback({ status: 500, data: "no path found" }, null);
  }
}