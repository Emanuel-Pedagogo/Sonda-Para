# Plano Macro de Comercialização — Sonda Leitura

Documento estratégico para transformar o Sonda Leitura de piloto (Alfabetiza Pará / SEMED Santarém) em produto vendável para redes de ensino do Pará e, depois, do Brasil.

---

## 1. Tese central

O ativo mais valioso do projeto não é o app em si — é a **rubrica oficial de sondagem implementada + o relacionamento já construído com a SEMED Santarém**. Isso é o diferencial competitivo real frente a concorrentes genéricos de fluência leitora (ex.: ferramentas internacionais): o Sonda Leitura fala a língua exata da avaliação que o professor já é obrigado a aplicar.

**Argumento central de venda:** "A IA sugere, o professor decide." Isso não é só princípio pedagógico — é a resposta direta à objeção nº 1 de qualquer secretário de educação: medo de terceirizar avaliação pedagógica para uma IA. Deve abrir qualquer apresentação comercial.

---

## 2. Modelo de negócio

**B2G (venda para o poder público), não B2C.** Professor individual não paga por ferramenta pedagógica no Brasil. Quem paga é a Secretaria (municipal ou estadual), porque:

- A sondagem mensal já é obrigação institucional — o custo já existe hoje em papel/planilha. Vende-se **redução de custo e tempo**, não uma feature nova.
- Existe **verba federal específica**: o Compromisso Nacional Criança Alfabetizada (CNCA) e a Política Nacional de Alfabetização (PNA) financiam instrumentos de avaliação de leitura em municípios. É o gancho de venda mais forte disponível — mapear editais/chamadas do MEC ligados ao CNCA é prioridade antes de qualquer pitch formal.

**Estrutura de preço:** licença por rede (município ou estado), cobrada por aluno/ano ou por escola/ano — nunca por professor individual.

**Canal de entrada freemium (não é o modelo de receita):** versão limitada para professor avulso fora de contrato, que vira evangelista dentro da própria rede e pressiona a coordenação a comprar.

---

## 3. Go-to-market: Pará → Brasil

### Fase A — Provar com números (Santarém)
Transformar o piloto atual em case mensurável antes de vender qualquer coisa nova:
- Horas economizadas por professor/mês.
- Taxa de sondagens efetivamente aplicadas vs. processo anterior (papel).
- Tempo de consolidação de turma/escola.

Sem esses números, é demonstração, não venda.

### Fase B — Municípios vizinhos no Pará
Expansão via a própria rede do programa Alfabetiza Pará. SEMEDs se conectam entre si; coordenadores pedagógicos trocam referências em eventos da UNDIME-PA.

### Fase C — SEDUC-PA (estado)
Só após 3–5 municípios como referência. Venda estadual sem prova social é procurement lento e politicamente arriscado.

### Fase D — Brasil
Obstáculo principal: **cada rede tem sua própria rubrica/instrumento de sondagem** (SP, Ceará etc. têm referências próprias e consolidadas). Expandir para fora do Pará exige que a rubrica deixe de ser fixa em código e vire **configurável por rede** — decisão de arquitetura, não só de vendas (ver seção 4).

---

## 4. Mudanças de produto/arquitetura necessárias para vender

O estado atual do app (ver `CONTEXTO_PROJETO.md`) foi construído para um único programa (Alfabetiza Pará). Para virar produto multi-cliente:

| Item | Situação atual | Necessário para venda |
|------|-----------------|------------------------|
| Escopo de dados | RLS por `escola` | Nova camada `rede`/`município` acima de `escola`, com RLS por rede |
| Rubrica pedagógica | Fixa em código (`rubrica-alfabetiza.ts`) para o ciclo Pará | Rubrica como **dado configurável por rede** no banco, não hardcoded |
| Privacidade/LGPD | Tratado como requisito técnico | Tratar como **argumento de venda**: termo de consentimento explícito dos responsáveis, política clara de retenção/expurgo de áudio ("app apaga o áudio após X dias, decisão sempre do professor") — secretarias têm aversão a risco de exposição de dado de menor |
| Modo offline | Não implementado (Fase 12 do roadmap) | Bloqueador real fora de capitais — grande parte do Pará tem internet instável em escola rural, exatamente o público que mais precisa da ferramenta |
| Onboarding/LGPD no app | Não implementado | Necessário para qualquer rede nova assumir o produto sem suporte manual constante |
| Exportação de relatórios em PDF | Não implementado | Coordenadores e secretarias pedem documento formal para prestação de contas |

Essas mudanças devem ser priorizadas **antes** da Fase D (expansão nacional) e idealmente antes da Fase C (SEDUC-PA), já que uma rede estadual tende a exigir configurabilidade e conformidade LGPD mais cedo que municípios pequenos.

---

## 5. Riscos e mitigação

- **Ciclo de compra do setor público é lento.** Mitigar priorizando municípios pequenos/ágeis primeiro (Fase B) e usando verba federal carimbada (CNCA/PNA) como atalho de orçamento já aprovado.
- **Dependência de um único programa/rubrica.** Mitigar tornando a rubrica configurável cedo, mesmo antes de haver cliente fora do Pará, para não travar negociações futuras.
- **Conectividade em escolas rurais.** Mitigar priorizando modo offline no roadmap técnico antes de expansão geográfica ampla.
- **Percepção de risco com dados de menores.** Mitigar transformando política de privacidade em diferencial explícito de pitch, não em rodapé de contrato.
- **Perda de foco pedagógico ao virar produto comercial.** Manter "decisão final é do professor" como restrição de produto inegociável — é also o que sustenta a credibilidade junto a pedagogos.

---

## 6. Sequência recomendada (macro)

1. Consolidar métricas de impacto do piloto Santarém.
2. Priorizar no roadmap técnico: rubrica configurável por rede, modo offline, LGPD/consentimento, export PDF.
3. Mapear editais/chamadas do CNCA e PNA para financiamento municipal.
4. Expandir comercialmente dentro do Pará (municípios vizinhos) usando o case Santarém.
5. Buscar SEDUC-PA com 3–5 referências municipais consolidadas.
6. Só então avaliar expansão para outros estados, rede por rede, validando compatibilidade de rubrica em cada negociação.

---

*Gerado em julho/2026 a partir de discussão estratégica (arquitetura de software + alfabetização + visão de negócio) para o Sonda Leitura.*
