import { createGroup, getAllGroupsForUser, getGroupDetails, joinGroup, leaveGroup, updateGroup } from "../../apis/group_api";

export const handle_request = async (message, callback) => {
  if (message.path === "group-create") {
    return createGroup(message, callback);
  } else if (message.path === "group-update") {
    return updateGroup(message, callback);
  } else if (message.path === "group-leave") {
    return leaveGroup(message, callback);
  } else if (message.path === "group-join") {
    return joinGroup(message, callback);
  } else if (message.path === "group-details"){
    return getGroupDetails(message, callback);
  } else if (message.path === "group-all-for-user"){
    return getAllGroupsForUser(message, callback);
  } {
    return callback({ status: 500, data: "no path found" }, null);
  }
}