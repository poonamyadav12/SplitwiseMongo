import { getUserByEmailId } from "../../apis/user_api";

export const handle_request = async (message, callback) => {
  if (message.path === "user-auth") {
    return getUserByEmailId(message.body, callback);
  }
  else {
    return callback({ status: 500, data: "no path found" }, null);
  }
}