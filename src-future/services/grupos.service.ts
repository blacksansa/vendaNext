import apiClient from './api.client';
import { Grupo } from '../models/grupo';

export const fetchGrupos = async (): Promise<Grupo[]> => {
  const response = await apiClient.get('/grupos');
  return response.data;
};

export const createGrupo = async (grupo: Grupo): Promise<Grupo> => {
  const response = await apiClient.post('/grupos', grupo);
  return response.data;
};

export const updateGrupo = async (grupoId: string, grupo: Partial<Grupo>): Promise<Grupo> => {
  const response = await apiClient.put(`/grupos/${grupoId}`, grupo);
  return response.data;
};

export const deleteGrupo = async (grupoId: string): Promise<void> => {
  await apiClient.delete(`/grupos/${grupoId}`);
};