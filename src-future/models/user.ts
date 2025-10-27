import { useState, useEffect } from 'react';
import { fetchUsers, updateUser } from '../services/api.client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ativo' | 'inativo' | 'licenca';
}

export const useUsersModel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const fetchedUsers = await fetchUsers();
        setUsers(fetchedUsers);
      } catch (err) {
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const updateUserStatus = async (userId: string, status: 'ativo' | 'inativo' | 'licenca') => {
    try {
      await updateUser(userId, { status });
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userId ? { ...user, status } : user))
      );
    } catch (err) {
      setError('Failed to update user status');
    }
  };

  return {
    users,
    loading,
    error,
    updateUserStatus,
  };
};