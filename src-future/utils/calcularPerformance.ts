export function calcularPerformance(vendidoMes: number, metaMensal: number): number {
  if (metaMensal === 0) {
    return 0; // Avoid division by zero
  }
  return (vendidoMes / metaMensal) * 100;
}