export interface AvaliacaoSessao {
  turmaId: string;
  sondagemId: string;
  alunoIndex: number;
  avaliacaoIdsByAluno: Record<string, string>;
  updatedAt: string;
}
