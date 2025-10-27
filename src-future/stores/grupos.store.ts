import { makeAutoObservable } from "mobx";
import { fetchGrupos, createGrupo, updateGrupo, deleteGrupo } from "../services/grupos.service";

class GruposStore {
  grupos = [];
  loading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchGrupos() {
    this.loading = true;
    try {
      const data = await fetchGrupos();
      this.grupos = data;
    } catch (error) {
      this.error = error;
    } finally {
      this.loading = false;
    }
  }

  async addGrupo(grupo) {
    try {
      const newGrupo = await createGrupo(grupo);
      this.grupos.push(newGrupo);
    } catch (error) {
      this.error = error;
    }
  }

  async editGrupo(grupoId, updatedData) {
    try {
      const updatedGrupo = await updateGrupo(grupoId, updatedData);
      this.grupos = this.grupos.map(grupo => (grupo.id === grupoId ? updatedGrupo : grupo));
    } catch (error) {
      this.error = error;
    }
  }

  async removeGrupo(grupoId) {
    try {
      await deleteGrupo(grupoId);
      this.grupos = this.grupos.filter(grupo => grupo.id !== grupoId);
    } catch (error) {
      this.error = error;
    }
  }
}

export const gruposStore = new GruposStore();