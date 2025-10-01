import { UserRole } from "./permissions";

export const aplicationRoles: Record<string, UserRole> = {
    manageUsers: "admin",
    manageTeams: "manager",
    manageSellers: "team_leader",
    default: "viewer"
};
