import { fetchGrupos, createGrupo, updateGrupo, deleteGrupo } from '../services/grupos.service';

describe('Grupos Service', () => {
  let grupos;

  beforeAll(async () => {
    grupos = await fetchGrupos();
  });

  test('should fetch grupos', async () => {
    expect(grupos).toBeDefined();
    expect(Array.isArray(grupos)).toBe(true);
  });

  test('should create a new grupo', async () => {
    const newGrupo = {
      nome: 'Grupo Teste',
      lider: 'Líder Teste',
      metaMensal: 10000,
      descricao: 'Descrição do grupo teste',
    };

    const createdGrupo = await createGrupo(newGrupo);
    expect(createdGrupo).toMatchObject(newGrupo);
  });

  test('should update an existing grupo', async () => {
    const grupoToUpdate = grupos[0];
    const updatedData = { ...grupoToUpdate, nome: 'Grupo Atualizado' };

    const updatedGrupo = await updateGrupo(grupoToUpdate.id, updatedData);
    expect(updatedGrupo.nome).toBe('Grupo Atualizado');
  });

  test('should delete a grupo', async () => {
    const grupoToDelete = grupos[0];
    const response = await deleteGrupo(grupoToDelete.id);
    expect(response).toBe(true);
  });
});