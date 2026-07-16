import type { NivelLeitura } from '@/src/constants/niveis-leitura';
import type { PerfilUsuario } from '@/src/constants/perfis';

export interface Escola {
  id: string;
  nome: string;
  municipio: string | null;
  created_at: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  escola_id: string | null;
  created_at: string;
}

export interface Turma {
  id: string;
  escola_id: string;
  nome: string;
  ano_escolar: number;
  created_at: string;
}

export interface Aluno {
  id: string;
  turma_id: string;
  nome: string;
  data_nascimento: string | null;
  created_at: string;
}

export interface Sondagem {
  id: string;
  titulo: string;
  mes: number | null;
  ano: number | null;
  palavras: string | null;
  frase: string | null;
  texto: string | null;
  created_at: string;
}

export interface Avaliacao {
  id: string;
  aluno_id: string;
  sondagem_id: string;
  audio_url: string | null;
  transcricao: string | null;
  precisao: number | null;
  omissoes: number | null;
  substituicoes: number | null;
  fluencia: number | null;
  confianca_ia: number | null;
  nivel_sugerido: NivelLeitura | null;
  justificativa_ia: string | null;
  nivel_final: NivelLeitura | null;
  observacao_professor: string | null;
  created_at: string;
}

export interface HistoricoNivel {
  id: string;
  aluno_id: string;
  avaliacao_id: string;
  nivel: NivelLeitura | null;
  data_avaliacao: string | null;
}

export interface LogIA {
  id: string;
  avaliacao_id: string;
  prompt: string | null;
  resposta: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      escolas: {
        Row: Escola;
        Insert: Omit<Escola, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Escola>;
        Relationships: [];
      };
      usuarios: {
        Row: Usuario;
        Insert: Omit<Usuario, 'created_at'> & { created_at?: string };
        Update: Partial<Usuario>;
        Relationships: [];
      };
      turmas: {
        Row: Turma;
        Insert: Omit<Turma, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Turma>;
        Relationships: [];
      };
      alunos: {
        Row: Aluno;
        Insert: Omit<Aluno, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Aluno>;
        Relationships: [];
      };
      sondagens: {
        Row: Sondagem;
        Insert: Omit<Sondagem, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Sondagem>;
        Relationships: [];
      };
      avaliacoes: {
        Row: Avaliacao;
        Insert: Omit<Avaliacao, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Avaliacao>;
        Relationships: [];
      };
      historico_niveis: {
        Row: HistoricoNivel;
        Insert: Omit<HistoricoNivel, 'id'> & { id?: string };
        Update: Partial<HistoricoNivel>;
        Relationships: [];
      };
      logs_ia: {
        Row: LogIA;
        Insert: Omit<LogIA, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<LogIA>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
