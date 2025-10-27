import { useQuery } from "@tanstack/react-query"
import { fetchUsers } from "../services/user.service"

export function useUsersModel() {
  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetchUsers("", 0, 100),
  })

  const getUserName = (user: any): string => {
    if (user.firstName || user.lastName) {
      return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
    }
    return user.name ?? user.email ?? String(user.id)
  }

  const getManagerCandidates = () => {
    return (users || []).filter(
      (u: any) =>
        u.role === "manager" ||
        u.role === "gerente" ||
        (Array.isArray(u.groups) && u.groups.some((g: any) => /gerente|manager/i.test(g?.name))),
    )
  }

  const getUserById = (id: string | number) => {
    return (users || []).find((u: any) => String(u.id) === String(id))
  }

  return {
    users,
    isLoading,
    isError,
    getUserName,
    getManagerCandidates,
    getUserById,
  }
}