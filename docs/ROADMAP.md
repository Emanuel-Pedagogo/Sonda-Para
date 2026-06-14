# ROADMAP - SONDA PARÁ

## Visão Geral

O desenvolvimento do Sonda Pará será dividido em fases incrementais.

Cada fase deve gerar uma versão funcional do sistema.

Objetivo principal:

Entregar valor rapidamente e reduzir riscos técnicos.

---

# FASE 0 - PREPARAÇÃO

## Objetivo

Preparar ambiente de desenvolvimento.

## Entregas

* Criar repositório GitHub.
* Criar projeto no Supabase.
* Criar projeto Expo.
* Configurar TypeScript.
* Configurar Expo Router.
* Configurar ESLint.
* Configurar Prettier.
* Configurar GitHub Actions.

## Critério de Conclusão

Aplicação abre no navegador e no Android sem erros.

---

# FASE 1 - AUTENTICAÇÃO

## Objetivo

Permitir acesso seguro ao sistema.

## Funcionalidades

* Login.
* Logout.
* Recuperação de senha.
* Controle de sessão.

## Perfis

* Professor.
* Coordenador.

## Telas

* Login.
* Esqueci minha senha.

## Critério de Conclusão

Usuário consegue entrar e sair do sistema.

---

# FASE 2 - ESTRUTURA ESCOLAR

## Objetivo

Cadastrar estrutura da rede.

## Funcionalidades

* Escolas.
* Turmas.
* Alunos.

## Telas

* Lista de Turmas.
* Lista de Alunos.
* Perfil do Aluno.

## Critério de Conclusão

Professor consegue visualizar todos os alunos da turma.

---

# FASE 3 - SONDAGENS

## Objetivo

Cadastrar avaliações.

## Funcionalidades

* Criar sondagem.
* Editar sondagem.
* Excluir sondagem.
* Visualizar sondagens.

## Estrutura

* Palavras.
* Frase.
* Texto.

## Critério de Conclusão

Professor consegue abrir uma sondagem pronta.

---

# FASE 4 - APLICAÇÃO DA AVALIAÇÃO

## Objetivo

Executar a sondagem.

## Funcionalidades

* Selecionar turma.
* Avaliar todos.
* Navegar para próximo aluno.
* Salvar progresso.

## Fluxo

Turma
↓
Iniciar Sondagem
↓
Aluno 1
↓
Aluno 2
↓
Aluno 3

## Critério de Conclusão

Professor consegue avaliar toda a turma.

---

# FASE 5 - GRAVAÇÃO DE ÁUDIO

## Objetivo

Capturar a leitura.

## Funcionalidades

* Iniciar gravação.
* Pausar.
* Finalizar.
* Reproduzir áudio.

## Armazenamento

Supabase Storage.

## Critério de Conclusão

Áudio salvo corretamente.

---

# FASE 6 - TRANSCRIÇÃO COM IA

## Objetivo

Transformar áudio em texto.

## Funcionalidades

* Enviar áudio.
* Receber transcrição.
* Salvar resultado.

## IA

Gemini.

## Critério de Conclusão

Sistema apresenta a transcrição automaticamente.

---

# FASE 7 - ANÁLISE AUTOMÁTICA

## Objetivo

Comparar leitura com texto esperado.

## Funcionalidades

* Precisão.
* Omissões.
* Substituições.
* Fluência.

## Critério de Conclusão

Sistema calcula indicadores automaticamente.

---

# FASE 8 - CLASSIFICAÇÃO

## Objetivo

Sugerir nível leitor.

## Níveis

* Não Leitor.
* Leitor de Palavras.
* Leitor de Frases.
* Leitor de Texto.

## Funcionalidades

* Sugestão automática.
* Justificativa.
* Grau de confiança.

## Critério de Conclusão

Sistema apresenta classificação sugerida.

---

# FASE 9 - VALIDAÇÃO DOCENTE

## Objetivo

Garantir decisão humana.

## Funcionalidades

* Confirmar resultado.
* Alterar classificação.
* Inserir observações.

## Critério de Conclusão

Professor consegue homologar a avaliação.

---

# FASE 10 - RELATÓRIOS

## Objetivo

Transformar dados em informação pedagógica.

## Relatórios

### Individual

* Histórico.
* Evolução.

### Turma

* Distribuição por níveis.

### Escola

* Consolidado.

## Critério de Conclusão

Relatórios exportáveis em PDF.

---

# FASE 11 - DASHBOARD PEDAGÓGICO

## Objetivo

Monitorar alfabetização.

## Indicadores

* Não leitores.
* Leitores de palavras.
* Leitores de frases.
* Leitores de texto.

## Gráficos

* Evolução mensal.
* Comparação entre turmas.

## Critério de Conclusão

Coordenador consegue monitorar toda a escola.

---

# FASE 12 - OTIMIZAÇÕES

## Objetivo

Melhorar experiência.

## Funcionalidades

* Cache offline.
* Sincronização automática.
* Melhorias de desempenho.

## Critério de Conclusão

Sistema utilizável em escolas com internet instável.

---

# FASE 13 - INTEGRAÇÃO COM KARAOKÊ DA LEITURA

## Objetivo

Compartilhar informações.

## Integrações

* Alunos.
* Turmas.
* Histórico de leitura.
* Fluência leitora.

## Critério de Conclusão

Dados sincronizados entre plataformas.

---

# FASE 14 - INTEGRAÇÃO COM SISTEMA DE GESTÃO PEDAGÓGICA

## Objetivo

Criar ecossistema único.

## Integrações

* Usuários.
* Escolas.
* Turmas.
* Indicadores.

## Critério de Conclusão

Login único e compartilhamento de dados.

---

# MVP OFICIAL

O MVP será considerado concluído ao final da FASE 9.

O MVP deverá permitir:

* Login.
* Turmas.
* Alunos.
* Aplicação da sondagem.
* Gravação de áudio.
* Análise por IA.
* Sugestão de classificação.
* Validação do professor.

---

# VISÃO DE LONGO PRAZO

Ecossistema Alfabetiza+

├── Sistema de Gestão Pedagógica
├── Karaokê da Leitura
├── Sonda Pará
└── Painel de Alfabetização

Todos compartilhando:

* Usuários
* Escolas
* Turmas
* Indicadores
* Histórico de aprendizagem
