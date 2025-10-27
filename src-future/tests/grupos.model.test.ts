import { Grupo } from '../models/grupo';
import { describe, it, expect } from 'vitest';

describe('Grupo Model', () => {
  it('should create a new group with the correct properties', () => {
    const grupo = new Grupo({
      id: '1',
      nome: 'Grupo Teste',
      lider: 'Líder Teste',
      membros: 5,
      metaMensal: 100000,
      vendidoMes: 50000,
      descricao: 'Descrição do grupo teste',
      status: 'ativo',
    });

    expect(grupo.id).toBe('1');
    expect(grupo.nome).toBe('Grupo Teste');
    expect(grupo.lider).toBe('Líder Teste');
    expect(grupo.membros).toBe(5);
    expect(grupo.metaMensal).toBe(100000);
    expect(grupo.vendidoMes).toBe(50000);
    expect(grupo.descricao).toBe('Descrição do grupo teste');
    expect(grupo.status).toBe('ativo');
  });

  it('should calculate performance correctly', () => {
    const grupo = new Grupo({
      id: '2',
      nome: 'Grupo Teste 2',
      lider: 'Líder Teste 2',
      membros: 3,
      metaMensal: 150000,
      vendidoMes: 75000,
      descricao: 'Descrição do grupo teste 2',
      status: 'ativo',
    });

    const performance = grupo.calcularPerformance();
    expect(performance).toBe(50);
  });

  it('should update group properties', () => {
    const grupo = new Grupo({
      id: '3',
      nome: 'Grupo Teste 3',
      lider: 'Líder Teste 3',
      membros: 4,
      metaMensal: 200000,
      vendidoMes: 100000,
      descricao: 'Descrição do grupo teste 3',
      status: 'ativo',
    });

    grupo.nome = 'Grupo Teste Atualizado';
    grupo.metaMensal = 250000;

    expect(grupo.nome).toBe('Grupo Teste Atualizado');
    expect(grupo.metaMensal).toBe(250000);
  });
});