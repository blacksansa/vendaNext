import { apiClient } from './api.client';
import { Grupo } from '../models/grupo';
import { User } from '../models/user';

export const syncData = async () => {
  try {
    const [grupos, users] = await Promise.all([
      apiClient.get<Grupo[]>('/grupos'),
      apiClient.get<User[]>('/users'),
    ]);

    return { grupos, users };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to sync data');
  }
};

export const updateGrupo = async (grupo: Grupo) => {
  try {
    const response = await apiClient.put(`/grupos/${grupo.id}`, grupo);
    return response.data;
  } catch (error) {
    console.error('Error updating grupo:', error);
    throw new Error('Failed to update grupo');
  }
};

export const updateUser = async (user: User) => {
  try {
    const response = await apiClient.put(`/users/${user.id}`, user);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user');
  }
};