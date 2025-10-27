import { useEffect, useState } from "react";
import { fetchGrupos, createGrupo, updateGrupo, deleteGrupo } from "@/services/grupos.service";

export const useGruposModel = () => {
  const [gruposFiltrados, setGruposFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadGrupos = async () => {
      try {
        const grupos = await fetchGrupos();
        setGruposFiltrados(grupos);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadGrupos();
  }, []);

  const criarGrupo = async (novoGrupo) => {
    try {
      const grupoCriado = await createGrupo(novoGrupo);
      setGruposFiltrados((prev) => [...prev, grupoCriado]);
    } catch (err) {
      setError(err);
    }
  };

  const editarGrupo = async (grupoEditado) => {
    try {
      const grupoAtualizado = await updateGrupo(grupoEditado);
      setGruposFiltrados((prev) =>
        prev.map((grupo) => (grupo.id === grupoAtualizado.id ? grupoAtualizado : grupo))
      );
    } catch (err) {
      setError(err);
    }
  };

  const removerGrupo = async (grupoId) => {
    try {
      await deleteGrupo(grupoId);
      setGruposFiltrados((prev) => prev.filter((grupo) => grupo.id !== grupoId));
    } catch (err) {
      setError(err);
    }
  };

  return {
    gruposFiltrados,
    loading,
    error,
    criarGrupo,
    editarGrupo,
    removerGrupo,
  };
};