const userServiceInternal = require("./services/user");
const groupServiceInternal = require("./services/group");
const transactionServiceInternal = require("./services/transaction");
const activityServiceInternal = require("./services/activity");
const authServiceInternal = require("./services/auth");

function fakeHandleTopicRequest(fname, message, callback) {
  console.log("message received for  ", fname);
  return fname.handle_request(message, callback);
}

function handleTopicRequest(topic_name, message, callback) {
  switch (topic_name) {
    case 'user-topic':
      fakeHandleTopicRequest(userServiceInternal, message, callback);
      break;
    case 'group-topic':
      fakeHandleTopicRequest(groupServiceInternal, message, callback);
      break;
    case 'transaction-topic':
      fakeHandleTopicRequest(transactionServiceInternal, message, callback);
      break;
    case 'activity-topic':
      fakeHandleTopicRequest(activityServiceInternal, message, callback);
      break;
    case 'auth-topic':
      fakeHandleTopicRequest(authServiceInternal, message, callback);
      break;
    default:
      throw new Error("Path not found");
  }
}

exports.handleTopicRequest = handleTopicRequest;
