# Plano de Piloto Real — Professores Parceiros de Santarém

Plano de arquitetura e execução para colocar o Sonda Leitura em uso real com um pequeno grupo de professores parceiros em Santarém-PA, com captura de dados estruturada para análise e replanejamento contínuo.

Estado atual verificado no Supabase do projeto (`Sonda-Leitura`, ref `mxjjphtjvibmqpyucfqk`): 3 escolas, 1 usuário, 6 turmas, 15 alunos, 1 sondagem, 5 avaliações cadastradas — ou seja, hoje há apenas dados de teste interno, nenhum piloto real rodando ainda.

---

## 1. Escopo do piloto

- **Participantes:** 3 a 5 professores parceiros, de preferência de escolas diferentes já cadastradas, com turmas de tamanho gerenciável (não a maior escola da rede).
- **Duração:** 4 a 6 semanas — tempo suficiente para cobrir **um ciclo completo de sondagem mensal**.
- **Fora do escopo deste piloto** (ainda não implementado no app, não bloqueia o teste): onboarding automatizado, dashboard do coordenador, export de relatório em PDF, modo offline. O piloto roda com o app atual + suporte manual intenso.

---

## 2. Seleção e preparação dos professores parceiros

- **Critérios de seleção:** já aplicam sondagem do Alfabetiza Pará hoje, disponibilidade para dar feedback recorrente, abertura para lidar com um app em fase de teste (bugs esperados).
- **Onboarding:** sessão de 30–45 min (presencial ou remota) com criação manual de conta — hoje não existe cadastro self-service nem fluxo de onboarding no app.
- **Canal de suporte direto:** grupo dedicado (WhatsApp ou similar) para dúvidas e bugs em tempo real durante o piloto. Essencial enquanto o app não tem onboarding nem tratamento de erro amigável para usuário leigo.

---

## 3. LGPD e consentimento — crítico, envolve dados de crianças

- **Termo de consentimento aos responsáveis** para gravação de voz do aluno (dado sensível de menor), específico para o período do piloto se não houver termo guarda-chuva do programa Alfabetiza Pará que já cubra isso — confirmar com a SEMED antes de iniciar.
- **Termo de uso do piloto para os professores parceiros**, deixando claro que dados de uso (não só pedagógicos) serão analisados para melhorar o produto.
- **Política de retenção definida antes de começar:** por quanto tempo os áudios do piloto ficam no Storage e quando são expurgados. Hoje não existe expurgo automático — decisão manual até existir.

---

## 4. Arquitetura técnica para captura automática de dados

Os dados pedagógicos (`avaliacoes`, `logs_ia`, `historico_niveis`) já são capturados automaticamente pelo app a cada sondagem — isso não muda. O que falta é visibilidade **operacional** do piloto (uso, erros, tempo gasto), que hoje não é registrada em lugar nenhum.

### a) Nova tabela `eventos_uso` (telemetria leve, sem dado de aluno)

| Coluna | Descrição |
|--------|-----------|
| `usuario_id` | Professor que gerou o evento |
| `tipo_evento` | `login`, `sondagem_iniciada`, `avaliacao_salva`, `upload_audio_falhou`, `ia_concluida`, `nivel_alterado_pelo_professor`, `erro_app` |
| `metadata` | jsonb — duração da gravação, tempo total da avaliação, plataforma (android/web), mensagem de erro quando aplicável |
| `created_at` | timestamp |

Serviço cliente `telemetria.service.ts`: insere eventos de forma assíncrona e **fail-silent** — telemetria nunca pode travar o fluxo do professor em sala.

### b) Captura de erros

Reaproveitar `eventos_uso` com `tipo_evento = 'erro_app'` em vez de introduzir uma dependência externa nova (ex. Sentry) logo de cara — simples o bastante para o volume de um piloto de 3–5 professores. Migrar para uma ferramenta dedicada só se o produto avançar para a Fase B do plano macro.

### c) Concordância IA vs. professor

Já existe no schema atual: comparar `nivel_sugerido` com `nivel_final` em `avaliacoes`. Não precisa de tabela nova, só de uma query de análise.

---

## 5. Como os dados chegam até a análise — e o que "automático" significa na prática

É importante ser preciso aqui para não criar expectativa errada:

- **O que já é automático hoje:** os dados pedagógicos e (após a migration da seção 4) os eventos de uso chegam continuamente ao Supabase assim que o professor usa o app — sem nenhuma ação manual de exportação.
- **O que eu (Claude) consigo fazer:** tenho acesso direto e ao vivo a esse banco (projeto `Sonda-Leitura` já conectado via MCP Supabase). Em qualquer sessão em que você me pedir "analisa os dados do piloto", eu consulto os dados atualizados na hora — não preciso de export manual nem de planilha intermediária.
- **O que eu NÃO faço sozinho:** não fico monitorando o banco de forma passiva e contínua fora de uma conversa. Para isso virar "automático" no sentido de gerar um relatório sem você precisar pedir, a peça que falta é uma **tarefa agendada** (ex.: toda sexta-feira às 18h, um agente roda, consulta `eventos_uso` + `avaliacoes` + `logs_ia` da semana, gera um resumo curto e atualiza uma seção "Acompanhamento do Piloto" neste diretório `docs/`, sinalizando riscos e sugestões de ajuste).

Essa automação semanal é opcional e é uma configuração persistente — não vou criá-la sem sua confirmação explícita. Se quiser, definimos o agendamento depois de aprovar este plano.

---

## 6. Cronograma

| Semana | Atividade |
|--------|-----------|
| 0 | Preparação: termos de LGPD, migration de `eventos_uso`, criação manual das contas dos professores parceiros, teste interno |
| 1 | Onboarding dos professores parceiros |
| 2–5 | Piloto ativo: um ciclo completo de sondagem mensal, suporte via canal dedicado, checkpoint semanal de dados (sem mudanças grandes de arquitetura no meio do piloto — só ajustes pontuais) |
| 6 | Encerramento: análise consolidada, entrevista/questionário qualitativo com os professores, documento de replanejamento do roadmap |

---

## 7. Métricas de sucesso (KPIs do piloto)

- **Adoção:** % de sondagens planejadas que foram de fato aplicadas no app vs. abandono no meio do fluxo.
- **Eficiência:** tempo médio por avaliação (início → salvar), comparado à estimativa do professor para o processo manual anterior.
- **Confiança na IA:** % de avaliações em que o professor manteve `nivel_sugerido` vs. alterou para `nivel_final` diferente.
- **Confiabilidade técnica:** taxa de erro (falhas de upload de áudio, falhas de transcrição) via `eventos_uso`.
- **Satisfação qualitativa:** entrevista curta com cada professor parceiro ao final.

---

## 8. Riscos específicos do piloto

- **Amostra pequena (3–5 professores):** resultados são direcionais, não estatísticos — deixar isso explícito no relatório final, para não embasar decisões grandes em dado insuficiente.
- **Conectividade instável em sala:** pode misturar "erro real do app" com "falha de rede" — registrar contexto de rede no evento quando possível.
- **Falta de onboarding automatizado:** exige suporte manual intenso; aceitável para 3–5 professores, não escala além disso sem construir o onboarding real.
- **Piloto roda no mesmo projeto Supabase de produção** (não há ambiente separado): cuidado redobrado com RLS, já que dados reais de crianças estarão no mesmo banco usado para desenvolvimento. Considerar checagem de `get_advisors` do Supabase antes de iniciar, para garantir que não há policy de RLS aberta por engano.

---

## 9. Entregável final

Relatório consolidado (quantitativo + qualitativo) que alimenta diretamente:
- Ajustes no roadmap técnico (`docs/ROADMAP.md`).
- Validação ou revisão das premissas do [`docs/PLANO_MACRO_COMERCIALIZACAO.md`](PLANO_MACRO_COMERCIALIZACAO.md) antes de avançar para a Fase B (expansão a municípios vizinhos).

---

*Gerado em julho/2026 como plano de arquitetura para o primeiro teste real do Sonda Leitura com professores parceiros de Santarém.*
