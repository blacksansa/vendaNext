import Api from "./api";
import { UserGroup } from "./types";

const userApi = new Api<any, string>("/users");

export const getUserGroups = (userId: string): Promise<UserGroup[]> => {
  return userApi.list(0, 1000, `/${userId}/groups`);
};
