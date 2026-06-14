# SONDA PARÁ – PRD V1.0

## 1. Visão Geral

O Sonda Pará é uma plataforma digital de avaliação diagnóstica da leitura destinada a professores e coordenadores pedagógicos das redes públicas de ensino.

O sistema utilizará Inteligência Artificial para analisar leituras realizadas pelos estudantes e sugerir automaticamente o nível de leitura, mantendo a validação final sob responsabilidade do professor.

O objetivo é tornar o processo de sondagem mais rápido, padronizado, confiável e útil para o acompanhamento pedagógico.

---

# 2. Problema

Atualmente as sondagens de leitura exigem:

* Aplicação individual.
* Registro manual.
* Consolidação de resultados em planilhas.
* Análises demoradas.
* Grande esforço dos professores.

O processo consome tempo e dificulta o acompanhamento contínuo da evolução dos estudantes.

---

# 3. Objetivos

## Objetivo Geral

Automatizar a aplicação, registro e análise das sondagens de leitura.

## Objetivos Específicos

* Reduzir o tempo de avaliação.
* Produzir relatórios automáticos.
* Gerar histórico individual dos estudantes.
* Acompanhar a evolução das turmas.
* Apoiar o planejamento pedagógico.
* Possibilitar integração futura com outros sistemas educacionais.

---

# 4. Público-Alvo

## Professor

Responsável por:

* Aplicar sondagens.
* Validar resultados.
* Consultar relatórios.

## Coordenador Pedagógico

Responsável por:

* Monitorar turmas.
* Analisar indicadores.
* Planejar intervenções.

---

# 5. Plataformas

## MVP

* Android
* Web

## Futuro

* iOS

---

# 6. Fluxo Principal

## Seleção de Turma

O usuário seleciona uma turma.

Exemplo:

* 1º Ano A
* 1º Ano B
* 2º Ano A

---

## Iniciar Avaliação

Botão:

"Iniciar Sondagem"

---

## Avaliar Todos

O sistema apresenta os estudantes sequencialmente.

Exemplo:

Aluno 1 de 23

João Silva

Após concluir:

Aluno 2 de 23

Maria Souza

E assim sucessivamente até o término da turma.

---

# 7. Processo de Avaliação

## Etapa 1

Professor seleciona a turma.

## Etapa 2

Professor inicia a sondagem.

## Etapa 3

Sistema apresenta o texto da avaliação.

## Etapa 4

Aluno realiza a leitura.

## Etapa 5

Sistema grava o áudio.

## Etapa 6

Áudio é enviado para análise.

## Etapa 7

IA processa:

* Transcrição.
* Precisão.
* Omissões.
* Substituições.
* Hesitações.
* Fluência.

## Etapa 8

IA sugere classificação.

## Etapa 9

Professor valida ou corrige.

## Etapa 10

Resultado é armazenado.

---

# 8. Níveis de Leitura

## Nível 0

Não Leitor

Características:

* Não consegue realizar leitura funcional.
* Não reconhece palavras isoladas.

## Nível 1

Leitor de Palavras

Características:

* Lê palavras isoladas.
* Não consegue ler frases completas com autonomia.

## Nível 2

Leitor de Frases

Características:

* Lê frases simples.
* Apresenta dificuldades em textos.

## Nível 3

Leitor de Texto

Características:

* Lê textos simples.
* Demonstra autonomia na leitura.

---

# 9. Funcionalidades do MVP

## Autenticação

* Login.
* Recuperação de senha.

## Turmas

* Listagem.
* Consulta.

## Alunos

* Listagem.
* Histórico.

## Avaliação

* Gravação de áudio.
* Envio para IA.
* Validação do professor.

## Relatórios

* Individual.
* Turma.

---

# 10. Dashboard

## Indicadores

* Não leitores.
* Leitores de palavras.
* Leitores de frases.
* Leitores de texto.

## Evolução

Visualização mensal dos resultados.

---

# 11. Banco de Dados Inicial

## escolas

* id
* nome

## usuarios

* id
* nome
* email
* perfil

## turmas

* id
* escola_id
* nome
* ano

## alunos

* id
* turma_id
* nome

## sondagens

* id
* titulo
* mes
* ano
* texto

## avaliacoes

* id
* aluno_id
* sondagem_id
* audio_url
* transcricao
* resultado_ia
* resultado_final
* created_at

---

# 12. Tecnologias

## Frontend

* React Native
* Expo
* TypeScript

## Backend

* Supabase

## IA

* Gemini

## Hospedagem

* Vercel
* Expo EAS

---

# 13. Integrações Futuras

## Karaokê da Leitura

Compartilhamento de:

* Alunos.
* Turmas.
* Histórico de leitura.
* Fluência leitora.

## Sistema de Gestão Pedagógica

Compartilhamento de:

* Usuários.
* Escolas.
* Turmas.
* Indicadores.

---

# 14. Roadmap

## Fase 1

Autenticação.

## Fase 2

Cadastro de turmas.

## Fase 3

Cadastro de alunos.

## Fase 4

Gravação de áudio.

## Fase 5

Integração com Gemini.

## Fase 6

Classificação automática.

## Fase 7

Relatórios.

## Fase 8

Dashboard do coordenador.

## Fase 9

Integração com Karaokê da Leitura.

## Fase 10

Integração com Sistema de Gestão Pedagógica.

---

# 15. Critério de Sucesso do MVP

O sistema será considerado funcional quando:

* Permitir avaliar uma turma completa.
* Gravar e analisar leituras.
* Sugerir automaticamente um nível leitor.
* Permitir validação do professor.
* Gerar relatórios por aluno e por turma.
* Funcionar em Android e Web.
