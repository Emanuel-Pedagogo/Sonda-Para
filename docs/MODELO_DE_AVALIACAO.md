# MODELO DE AVALIAÇÃO - SONDA PARÁ

## 1. Objetivo

Definir os critérios pedagógicos utilizados pelo sistema Sonda Pará para análise automática das leituras realizadas pelos estudantes.

A Inteligência Artificial tem função de apoio à avaliação.

A decisão final sempre pertence ao professor.

---

# 2. Princípios Pedagógicos

O sistema não substitui a avaliação docente.

A IA:

* Analisa o áudio.
* Transcreve a leitura.
* Compara com o texto esperado.
* Calcula indicadores.
* Sugere um nível leitor.

O professor:

* Observa a leitura.
* Considera aspectos qualitativos.
* Confirma ou altera a classificação.

---

# 3. Estrutura da Sondagem

Cada sondagem será composta por:

## Etapa 1

Leitura de palavras canônicas.

Exemplos:

* CASA
* BOLA
* MALA
* PATO

---

## Etapa 2

Leitura de palavras não canônicas.

Exemplos:

* PRATO
* FLOR
* BRINCO
* TRATOR

---

## Etapa 3

Leitura de frase.

Exemplo:

"O gato correu para casa."

---

## Etapa 4

Leitura de texto simples.

Exemplo:

Texto utilizado na sondagem oficial do período.

---

# 4. Indicadores Avaliados

## Precisão

Percentual de palavras lidas corretamente.

Fórmula:

Precisão = Palavras Corretas ÷ Total de Palavras × 100

---

## Omissões

Quantidade de palavras ignoradas.

Exemplo:

Texto:

"O gato correu para casa."

Aluno:

"O gato para casa."

Resultado:

1 omissão.

---

## Substituições

Quantidade de palavras trocadas.

Exemplo:

Texto:

"O gato correu para casa."

Aluno:

"O gato foi para casa."

Resultado:

1 substituição.

---

## Hesitações

Pausas excessivas.

Exemplo:

GA...
TO...
COR...
REU...

---

## Fluência

Palavras lidas por minuto.

Indicador complementar.

Não será usado isoladamente para classificação.

---

# 5. Níveis de Leitura

## Nível 0 - Não Leitor

Características:

* Não consegue ler palavras.
* Reconhece poucas letras.
* Não realiza leitura funcional.

Indicadores típicos:

Precisão abaixo de 20%.

---

## Nível 1 - Leitor de Palavras

Características:

* Consegue ler palavras isoladas.
* Não consegue ler frases completas com autonomia.

Indicadores típicos:

* Acerto de palavras isoladas.
* Grande dificuldade em frases e textos.

---

## Nível 2 - Leitor de Frases

Características:

* Lê frases simples.
* Compreende estruturas básicas.

Indicadores típicos:

* Bom desempenho em palavras.
* Leitura parcial de textos.

---

## Nível 3 - Leitor de Texto

Características:

* Lê textos simples.
* Mantém sequência da leitura.
* Demonstra autonomia.

Indicadores típicos:

* Precisão superior a 85%.
* Poucas omissões.
* Poucas substituições.

---

# 6. Critérios Utilizados pela IA

A IA deverá analisar:

## Reconhecimento de Palavras

* Quantidade correta.
* Quantidade incorreta.

---

## Leitura da Frase

Verificar:

* Leitura completa.
* Leitura parcial.
* Leitura inexistente.

---

## Leitura do Texto

Verificar:

* Continuidade.
* Omissões.
* Trocas.

---

## Fluência

Registrar:

* Palavras por minuto.

Sem interferir diretamente na classificação.

---

# 7. Sugestão Automática da IA

A IA retornará:

```json
{
  "precisao": 87,
  "omissoes": 2,
  "substituicoes": 1,
  "fluencia": 58,
  "nivel_sugerido": "Leitor de Texto",
  "confianca": 92
}
```

---

# 8. Validação Docente

O professor poderá:

* Confirmar resultado.
* Alterar classificação.
* Inserir observações.

Exemplos:

"Aluno apresentou nervosismo."

"Áudio com muito ruído."

"Leitura melhor do que a captada pela IA."

---

# 9. Histórico de Evolução

O sistema armazenará:

* Data.
* Sondagem.
* Nível.
* Fluência.
* Precisão.

Objetivo:

Permitir acompanhamento longitudinal da alfabetização.

---

# 10. Melhorias Futuras

Versão 2:

* Detecção de sílabas.
* Consciência fonológica.

Versão 3:

* Sugestão automática de intervenção pedagógica.

Versão 4:

* Integração com Karaokê da Leitura.

Versão 5:

* Integração com Sistema de Gestão Pedagógica.

---

# 11. Regra Fundamental

A Inteligência Artificial não possui autonomia para emitir resultado definitivo.

Toda classificação deve ser validada por um professor.
