type UserRole = "admin" | "manager" | "team_leader" | "viewer";

export const aplicationRoles: Record<string, UserRole> = {
    manageUsers: "admin",
    manageTeams: "manager",
    manageSellers: "team_leader",
    default: "viewer"
};
