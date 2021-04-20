
import axios from "axios";
import { SERVER_URL } from "../_constants";

export async function fetchData(userId) {
  const response = await axios.get(SERVER_URL + '/user/groups?userId=' + userId);
  let friendsMap = new Map();
  response.data.flatMap(group => JSON.parse(JSON.stringify(group.members))).filter((member) => member.email !== userId).forEach((member_1) => (friendsMap.set(member_1.email, member_1)));
  return { groups: response.data, friends: Array.from(friendsMap.values()) };
}