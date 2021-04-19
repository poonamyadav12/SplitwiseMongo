import { getActivities, getActivitiesV2 } from "../../apis/activity_api";

export const handle_request = async (message, callback) => {
  console.log('Path ', message.path);
  if (message.path === "user-activity") {
    return getActivities(message, callback);
  }
  if (message.path === "user-activity-v2") {
    return getActivitiesV2(message, callback);
  }
  else {
    return callback({ status: 500, data: "no path found" }, null);
  }
}