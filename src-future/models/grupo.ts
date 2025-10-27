import { makeAutoObservable } from "mobx";

class Grupo {
  id: string;
  nome: string;
  lider: string;
  liderUserId: string;
  descricao: string;
  metaMensal: number;
  vendidoMes: number;
  membros: number;
  status: string;
  vendedores: Array<{ nome: string; vendas: number; status: string }>;

  constructor(grupoData: any) {
    this.id = grupoData.id;
    this.nome = grupoData.nome;
    this.lider = grupoData.lider;
    this.liderUserId = grupoData.liderUserId;
    this.descricao = grupoData.descricao;
    this.metaMensal = grupoData.metaMensal;
    this.vendidoMes = grupoData.vendidoMes;
    this.membros = grupoData.membros;
    this.status = grupoData.status;
    this.vendedores = grupoData.vendedores || [];
    makeAutoObservable(this);
  }

  updateGrupo(data: Partial<Grupo>) {
    Object.assign(this, data);
  }

  addVendedor(vendedor: { nome: string; vendas: number; status: string }) {
    this.vendedores.push(vendedor);
    this.membros += 1;
  }

  removeVendedor(index: number) {
    this.vendedores.splice(index, 1);
    this.membros -= 1;
  }

  calcularPerformance() {
    return ((this.vendidoMes / this.metaMensal) * 100).toFixed(1);
  }
}

export default Grupo;