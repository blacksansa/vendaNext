// src/types/index.ts
export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: 'admin' | 'manager' | 'team_leader' | 'salesperson';
  groups?: Group[];
}

export interface Group {
  id: string;
  nome: string;
  descricao: string;
  lider: string;
  liderUserId: string;
  metaMensal: number;
  vendidoMes: number;
  membros: number;
  status: 'ativo' | 'inativo' | 'pausado';
  vendedores: User[];
}

export interface NewGroup {
  nome: string;
  lider: string;
  liderUserId: string;
  descricao: string;
  metaMensal: number;
}

export interface UpdateGroup {
  id: string;
  nome?: string;
  liderUserId?: string;
  descricao?: string;
  metaMensal?: number;
}

export interface Member {
  id: string;
  nome: string;
  vendas: number;
  status: 'ativo' | 'inativo' | 'licenca';
}