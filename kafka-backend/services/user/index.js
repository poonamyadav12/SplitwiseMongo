import { createUser, getUsersBySearchString, updateExistingUser, validateLogin } from '../../apis/user_api';

export const handle_request = async (message, callback) => {
  if (message.path === "user_signup") {
    return createUser(message, callback);
  } else if (message.path === "user-update") {
    return updateExistingUser(message, callback);
  } else if (message.path === "user-login") {
    return validateLogin(message, callback);
  } else if (message.path === "user-search") {
    return getUsersBySearchString(message, callback);
  } else {
    return callback({ status: 500, data: "no path found" }, null);
  }
}





