import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View as RNView,
} from 'react-native';

import { KeyboardAwareScrollView } from '@/components/KeyboardAwareScrollView';
import { Text } from '@/components/Themed';
import type { SondagemPayload } from '@/src/services/sondagens/sondagens.service';
import { normalizeOptionalText, parseOptionalInt } from '@/src/utils/sondagens';

interface SondagemFormProps {
  initialValues?: SondagemPayload;
  submitLabel: string;
  onSubmit: (payload: SondagemPayload) => Promise<void>;
}

const emptyValues: SondagemPayload = {
  titulo: '',
  mes: null,
  ano: null,
  palavras: null,
  frase: null,
  texto: null,
};

export function SondagemForm({ initialValues, submitLabel, onSubmit }: SondagemFormProps) {
  const scrollRef = useRef<ScrollView>(null);
  const fieldOffsets = useRef<Record<string, number>>({});

  const [titulo, setTitulo] = useState(initialValues?.titulo ?? emptyValues.titulo);
  const [mes, setMes] = useState(initialValues?.mes != null ? String(initialValues.mes) : '');
  const [ano, setAno] = useState(initialValues?.ano != null ? String(initialValues.ano) : '');
  const [palavras, setPalavras] = useState(initialValues?.palavras ?? '');
  const [frase, setFrase] = useState(initialValues?.frase ?? '');
  const [texto, setTexto] = useState(initialValues?.texto ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function scrollToField(fieldKey: string) {
    const y = fieldOffsets.current[fieldKey];
    if (y == null) {
      return;
    }

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 24), animated: true });
    });
  }

  async function handleSubmit() {
    if (!titulo.trim()) {
      setError('Informe o título da sondagem.');
      return;
    }

    const mesValue = parseOptionalInt(mes);
    const anoValue = parseOptionalInt(ano);

    if (mes.trim() && (mesValue == null || mesValue < 1 || mesValue > 12)) {
      setError('O mês deve estar entre 1 e 12.');
      return;
    }

    if (ano.trim() && (anoValue == null || anoValue < 2000)) {
      setError('Informe um ano válido.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        titulo: titulo.trim(),
        mes: mesValue,
        ano: anoValue,
        palavras: normalizeOptionalText(palavras),
        frase: normalizeOptionalText(frase),
        texto: normalizeOptionalText(texto),
      });
    } catch {
      setError('Não foi possível salvar a sondagem.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAwareScrollView
      ref={scrollRef}
      contentContainerStyle={styles.container}
      keyboardVerticalOffset={88}
    >
      <RNView
        onLayout={(event) => {
          fieldOffsets.current.titulo = event.nativeEvent.layout.y;
        }}
      >
        <Text style={styles.label}>Título</Text>
        <TextInput
          placeholder="Ex.: Sondagem Setembro 2026"
          style={styles.input}
          value={titulo}
          onChangeText={setTitulo}
          onFocus={() => scrollToField('titulo')}
        />
      </RNView>

      <RNView style={styles.row}>
        <RNView
          style={styles.halfField}
          onLayout={(event) => {
            fieldOffsets.current.mes = event.nativeEvent.layout.y;
          }}
        >
          <Text style={styles.label}>Mês (1-12)</Text>
          <TextInput
            keyboardType="number-pad"
            placeholder="9"
            style={styles.input}
            value={mes}
            onChangeText={setMes}
            onFocus={() => scrollToField('mes')}
          />
        </RNView>
        <RNView
          style={styles.halfField}
          onLayout={(event) => {
            fieldOffsets.current.ano = event.nativeEvent.layout.y;
          }}
        >
          <Text style={styles.label}>Ano</Text>
          <TextInput
            keyboardType="number-pad"
            placeholder="2026"
            style={styles.input}
            value={ano}
            onChangeText={setAno}
            onFocus={() => scrollToField('ano')}
          />
        </RNView>
      </RNView>

      <RNView
        onLayout={(event) => {
          fieldOffsets.current.palavras = event.nativeEvent.layout.y;
        }}
      >
        <Text style={styles.label}>Palavras</Text>
        <Text style={styles.hint}>Uma palavra por linha. Ex.: CASA, BOLA, MALA</Text>
        <TextInput
          multiline
          placeholder={'CASA\nBOLA\nMALA\nPATO'}
          style={[styles.input, styles.textArea]}
          value={palavras}
          onChangeText={setPalavras}
          onFocus={() => scrollToField('palavras')}
        />
      </RNView>

      <RNView
        onLayout={(event) => {
          fieldOffsets.current.frase = event.nativeEvent.layout.y;
        }}
      >
        <Text style={styles.label}>Frase</Text>
        <TextInput
          multiline
          placeholder='Ex.: "O gato correu para casa."'
          style={[styles.input, styles.textAreaSmall]}
          value={frase}
          onChangeText={setFrase}
          onFocus={() => scrollToField('frase')}
        />
      </RNView>

      <RNView
        onLayout={(event) => {
          fieldOffsets.current.texto = event.nativeEvent.layout.y;
        }}
      >
        <Text style={styles.label}>Texto</Text>
        <TextInput
          multiline
          placeholder="Texto simples utilizado na sondagem do período."
          style={[styles.input, styles.textArea]}
          value={texto}
          onChangeText={setTexto}
          onFocus={() => scrollToField('texto')}
        />
      </RNView>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        disabled={isSubmitting}
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={handleSubmit}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{submitLabel}</Text>
        )}
      </Pressable>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 8,
    paddingBottom: 40,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
  },
  hint: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D6DEE6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#1F2937',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  textAreaSmall: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  button: {
    backgroundColor: '#1B6CA8',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  error: {
    color: '#B00020',
    marginTop: 8,
  },
});
