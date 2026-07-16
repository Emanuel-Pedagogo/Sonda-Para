# Contexto do Projeto — Sonda Leitura (Sonda-Para)

Documento para usar como contexto em outra IA. Repositório: `C:\dev\Sonda-Para`.

---

## 1. O que é o projeto

**Sonda Leitura** é uma plataforma digital de **avaliação diagnóstica da leitura** para professores e coordenadores de redes públicas de ensino, integrada ao ecossistema **Alfabetiza Pará** (Programa Alfabetiza Pará / SEMED Santarém-PA).

O professor aplica sondagens mensais em sala: o aluno lê palavras/frases/texto, o app grava o áudio, a IA transcreve e analisa a leitura, sugere um **nível leitor** com base na rubrica oficial, e o professor **confirma ou altera** a classificação. O sistema gera histórico individual, visão da turma e relatório consolidado.

**Princípio pedagógico central:** a IA **apenas sugere**; a decisão final é **sempre do professor**.

---

## 2. Problema que resolve

Hoje as sondagens exigem aplicação individual, registro manual, consolidação em planilhas e muito tempo do professor. O Sonda Leitura automatiza gravação, transcrição, métricas, sugestão de nível e consolidação de dados.

---

## 3. Público-alvo

| Perfil | Responsabilidades |
|--------|-------------------|
| **Professor** | Aplicar sondagens, gravar leituras, validar classificação, consultar relatórios |
| **Coordenador** | Monitorar turmas, indicadores e evolução (parcialmente implementado) |

---

## 4. Stack tecnológica

| Camada | Tecnologia |
|--------|------------|
| App mobile/web | **Expo SDK 56**, **React Native 0.85**, **React 19**, **TypeScript** |
| Roteamento | **Expo Router** (file-based routing) |
| Backend | **Supabase** (PostgreSQL, Auth, Storage, Edge Functions) |
| IA | **Groq API** via Edge Function (Whisper para transcrição + Llama para análise) |
| Áudio | `expo-audio`, `expo-file-system` |
| Persistência local | `expo-secure-store` (sessão de avaliação em andamento) |
| Plataformas MVP | **Android** e **Web** (iOS futuro) |

**Importante:** antes de escrever código Expo, consultar docs versionadas em https://docs.expo.dev/versions/v56.0.0/

---

## 5. Arquitetura geral

```
[App Expo (professor)]
    │
    ├── Supabase Auth (login/sessão)
    ├── Supabase PostgreSQL (dados + RLS por escola)
    ├── Supabase Storage bucket `audios-sondagem` (áudios privados)
    └── Edge Function `avaliacao-ia`
            ├── Download do áudio do Storage
            ├── Groq Whisper → transcrição
            ├── Groq Llama → análise JSON (precisão, fluência, nível, justificativa)
            └── Update em `avaliacoes` + upsert em `historico_niveis`
```

Chaves de IA (**GROQ_API_KEY**) ficam **somente na Edge Function**, nunca no cliente.

---

## 6. Modelo de dados (Supabase PostgreSQL)

### Tabelas principais

| Tabela | Finalidade |
|--------|------------|
| `escolas` | Escolas participantes |
| `usuarios` | Professores/coordenadores vinculados a uma escola |
| `turmas` | Turmas por escola (`ano_escolar`: 1–9) |
| `alunos` | Alunos por turma |
| `sondagens` | Instrumentos de sondagem (`titulo`, `mes`, `ano`, `palavras`, `frase`, `texto`) |
| `avaliacoes` | Uma avaliação por aluno+sondagem (áudio, transcrição, métricas, níveis) |
| `historico_niveis` | Histórico para gráficos/evolução (1 registro por avaliação) |
| `logs_ia` | Auditoria de prompts/respostas da IA |

### Campos relevantes em `avaliacoes`

- `audio_url` — caminho no Storage
- `transcricao` — texto falado pelo aluno
- `precisao`, `omissoes`, `substituicoes`, `fluencia`, `confianca_ia`
- `nivel_sugerido` — sugestão da IA
- `nivel_final` — classificação confirmada pelo professor
- `justificativa_ia` — explicação pedagógica da sugestão
- `observacao_professor` — observação opcional do docente

### Storage

- **Bucket:** `audios-sondagem` (privado)
- **Estrutura:** `{ano}/{mes}/{escola-id}/{turma-id}/{aluno-id}.wav` (ou extensão equivalente)

### Segurança

- **RLS (Row Level Security)** em todas as tabelas sensíveis
- Usuário só acessa dados da **própria escola**
- Scripts idempotentes de correção em `supabase/scripts/` (ex.: `fix_avaliacoes_rls.sql`, `fix_historico_niveis_rls.sql`, `fix_storage_avaliacoes_rls.sql`)

---

## 7. Rubrica pedagógica (Programa Alfabetiza Pará)

Baseada nas fichas oficiais em `docs/Ficha Alfabetiza/` (PDFs da SEMED Santarém). Implementada em:

- `src/constants/rubrica-alfabetiza.ts` (app)
- `supabase/functions/avaliacao-ia/rubrica-alfabetiza.ts` (Edge Function)

Os níveis variam conforme o **`ano_escolar` da turma**:

### Ciclo de Alfabetização (1º–2º ano)

- Pré-leitor 1, 2, 3, 4
- Leitor Iniciante
- Leitor Fluente

### Anos Iniciais (3º–5º ano)

- Pré-leitor
- Leitor de Palavras Sem/Com Fluência
- Leitor de Texto Sem/Com Fluência
- Leitor com Fluência, Respeita Ritmo, Intensidade e Entonação

### Anos Finais / EJA (6º–9º ano)

- Mesmos níveis anteriores + Leitor de Frases Sem/Com Fluência

**Nota:** a rubrica de **escrita** existe nos PDFs mas **ainda não está implementada** no app (só leitura). Referência em `docs/Alfabetiza/Escrita`.

---

## 8. Fluxos principais do usuário

### 8.1 Autenticação

Login → sessão Supabase → acesso às telas protegidas em `app/(app)/`.

### 8.2 Estrutura escolar

Professor visualiza turmas → alunos da turma → perfil do aluno com histórico.

### 8.3 Criação de sondagem

Professor cria sondagem informando título, mês/ano e conteúdo (`palavras`, `frase`, `texto`). **Upload de PDF ainda não implementado** — hoje é digitação manual.

### 8.4 Aplicação mensal da sondagem (fluxo principal)

1. Turma → selecionar sondagem → **Iniciar avaliação**
2. Navegação **sequencial** aluno a aluno (ex.: "Aluno 3 de 23")
3. Exibe conteúdo da sondagem (palavras, frase, texto)
4. Professor grava áudio da leitura (`AudioRecorderPanel`)
5. Ao avançar ("Salvar e próximo aluno") ou finalizar:
   - Salva registro em `avaliacoes`
   - Faz upload do áudio no Storage
   - Dispara análise IA automaticamente (se houver gravação nova)
6. Painel mostra: transcrição, precisão, fluência, omissões, substituições, nível sugerido, justificativa
7. Professor **confirma ou altera** o nível + observação pedagógica
8. Ao finalizar turma → redireciona para **relatório consolidado**

### 8.5 Relatórios

- **Perfil do aluno** (`app/(app)/alunos/[id].tsx`): último nível, médias, histórico detalhado
- **Turma** (`app/(app)/turmas/[id]/index.tsx`): resumo com distribuição por nível, médias, pendentes
- **Consolidado** (`app/(app)/turmas/[id]/consolidado.tsx`): visão detalhada pós-sondagem

---

## 9. Estado de implementação por fase (ROADMAP)

| Fase | Descrição | Status |
|------|-----------|--------|
| 0 | Setup (Expo, Supabase, TS, lint) | Concluída |
| 1 | Autenticação (login, logout, recuperar senha) | Concluída |
| 2 | Estrutura escolar (turmas, alunos) | Concluída (visualização; cadastro pode ser limitado) |
| 3 | Sondagens (CRUD básico) | Concluída (sem upload PDF) |
| 4 | Aplicação sequencial da avaliação | Concluída |
| 5 | Gravação de áudio | Concluída |
| 6 | Transcrição com IA | Concluída (Groq Whisper) |
| 7 | Análise automática (métricas) | Concluída |
| 8 | Classificação sugerida + justificativa | Concluída (rubrica Alfabetiza Pará) |
| 9 | Validação docente | Concluída |
| 10 | Relatórios | Parcial (consolidado básico; sem export PDF) |
| 11 | Dashboard coordenador/escola | Não implementado |
| 12 | Offline/cache | Não implementado |
| 13–14 | Integrações (Karaokê, Gestão Pedagógica) | Futuro |

**MVP oficial** = até Fase 9 → **atingido**.

---

## 10. Estrutura de pastas relevante

```
app/
  (auth)/login.tsx, forgot-password.tsx
  (app)/
    (tabs)/index.tsx, turmas.tsx, sondagens.tsx
    turmas/[id]/index.tsx              # detalhe da turma
    turmas/[id]/consolidado.tsx        # relatório consolidado
    turmas/[id]/avaliar/[sondagemId].tsx  # TELA PRINCIPAL de avaliação
    alunos/[id].tsx                    # perfil e evolução do aluno
    sondagens/criar.tsx, [id]/editar.tsx

components/
  AudioRecorderPanel.tsx             # gravação/reprodução de áudio
  SondagemForm.tsx
  KeyboardAwareScrollView.tsx

src/
  constants/
    rubrica-alfabetiza.ts            # rubrica oficial por ciclo
    niveis-leitura.ts                # níveis dinâmicos por ano escolar
  services/
    avaliacoes/avaliacoes.service.ts
    avaliacao-audio/avaliacao-audio.service.ts
    avaliacao-sessao/avaliacao-sessao.storage.ts  # progresso local SecureStore
    ia/avaliacao-ia.service.ts       # chama Edge Function
    turmas/, alunos/, sondagens/, auth/
  lib/supabase/client.ts, storage.ts
  types/database.ts

supabase/
  migrations/                        # schema + RLS
  functions/avaliacao-ia/index.ts  # pipeline IA completo
  scripts/                           # fixes SQL idempotentes

docs/
  SONDA_PARA_PRD_V1.md              # PRD completo
  ROADMAP.md
  BANCO_DE_DADOS.md
  MODELO_DE_AVALIACAO.md
  Ficha Alfabetiza/                 # PDFs oficiais da rubrica
```

---

## 11. Pipeline de IA (Edge Function `avaliacao-ia`)

**Entrada:** `{ avaliacaoId, audioPath, tempoTotalSegundos }`

**Passos:**

1. Valida JWT do usuário e permissão (aluno pertence à escola do professor)
2. Busca `ano_escolar` da turma para selecionar rubrica correta
3. Download do áudio do bucket `audios-sondagem`
4. **Transcrição:** Groq `whisper-large-v3-turbo` (response `verbose_json`)
5. Monta texto esperado: concatena `sondagem.palavras + frase + texto`
6. **Análise:** Groq `llama-3.1-8b-instant` com prompt pedagógico + rubrica do ciclo
7. Parse JSON: `precisao`, `omissoes`, `substituicoes`, `fluencia`, `nivel_sugerido`, `confianca_ia`, `justificativa`
8. Update em `avaliacoes`
9. Upsert em `historico_niveis` (nível final ou sugerido)

**Deploy necessário após alterações:**

```bash
supabase functions deploy avaliacao-ia
```

---

## 12. Variáveis de ambiente

### Cliente (`.env`)

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

### Edge Function (secrets Supabase)

```
GROQ_API_KEY=
GROQ_TRANSCRIPTION_MODEL=whisper-large-v3-turbo
GROQ_CHAT_MODEL=llama-3.1-8b-instant
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

**Nota Windows:** scripts npm usam `NODE_OPTIONS=--use-system-ca` para evitar erros de certificado SSL.

---

## 13. Casos de uso planejados (visão do produto)

1. **Onboarding:** boas-vindas, LGPD, guia para cadastrar turmas/alunos/sondagens → **não implementado**
2. **Criação de sondagem:** digitar palavras/textos ou importar PDF da administração → **só digitação implementada**
3. **Sondagem mensal em sala:** gravar → IA analisa → professor valida → consolidado → **implementado**

---

## 14. Problemas já resolvidos (histórico técnico)

- `SecureStore` rejeitava chaves com `:` → trocado por `_`
- RLS de `avaliacoes` bloqueava insert → migrations/scripts de fix
- `fetch()` em URI local no mobile falhava → `expo-file-system` com `arrayBuffer()`
- Gemini deprecado/quota → migrado para **Groq**
- Transcrição Groq vazia → parse de `verbose_json` com fallback
- Rubrica genérica (4 níveis) → substituída pela **rubrica oficial Alfabetiza Pará** por ano escolar

---

## 15. Pendências conhecidas / próximos passos

- **Onboarding** e fluxo LGPD
- **Upload/importação de PDF** para criar sondagens
- **Rubrica de escrita** (existe nos PDFs, não no app)
- **Exportação de relatórios em PDF**
- **Dashboard do coordenador** (visão escola, comparação entre turmas)
- **Modo offline** para escolas com internet instável
- **Integrações** com Karaokê da Leitura e Sistema de Gestão Pedagógica
- Redeploy da Edge Function após mudanças na rubrica
- Aplicar migrations pendentes no Supabase remoto (`justificativa_ia`, RLS de `historico_niveis`, etc.)

---

## 16. Comandos úteis

```bash
npm run web          # desenvolvimento web
npm run android      # desenvolvimento Android
npm run typecheck    # verificação TypeScript
npm run lint         # ESLint
supabase functions deploy avaliacao-ia
```

---

## 17. Regras para desenvolvimento neste projeto

- Responder em **português**
- **Não commitar** sem pedido explícito do usuário
- Mudanças **pequenas e focadas**; seguir convenções existentes
- Consultar **Expo SDK 56 docs** antes de código Expo
- IA no cliente **nunca** — sempre via Edge Function
- Decisão pedagógica final = **professor**, não a IA

---

## 18. Documentação interna

| Arquivo | Conteúdo |
|---------|----------|
| `docs/SONDA_PARA_PRD_V1.md` | Product Requirements Document |
| `docs/ROADMAP.md` | Fases de desenvolvimento |
| `docs/BANCO_DE_DADOS.md` | Schema e Storage |
| `docs/MODELO_DE_AVALIACAO.md` | Critérios pedagógicos |
| `docs/PROMPTS_IA.md` | Prompts de IA |
| `docs/Ficha Alfabetiza/*.pdf` | Fichas oficiais de leitura/escrita |

---

*Gerado em julho/2026 — Sonda Leitura v1.0.0*
