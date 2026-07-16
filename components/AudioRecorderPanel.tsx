import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import { obterUrlAudioAvaliacao } from '@/src/services/avaliacao-audio/avaliacao-audio.service';
import type { PendingAudioRecording } from '@/src/services/avaliacao-audio/avaliacao-audio.service';

interface AudioRecorderPanelProps {
  existingAudioPath?: string | null;
  disabled?: boolean;
  onRecordingChange: (recording: PendingAudioRecording | null) => void;
}

function extensionFromUri(uri: string): string {
  const cleanUri = uri.split('?')[0] ?? uri;
  const dotIndex = cleanUri.lastIndexOf('.');
  if (dotIndex === -1) {
    return Platform.OS === 'web' ? '.webm' : '.m4a';
  }

  return cleanUri.slice(dotIndex).toLowerCase();
}

function formatDuration(durationMillis: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMillis / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function AudioRecorderPanel({
  existingAudioPath,
  disabled = false,
  onRecordingChange,
}: AudioRecorderPanelProps) {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const player = useAudioPlayer(null);
  const playerStatus = useAudioPlayerStatus(player);

  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [remoteUri, setRemoteUri] = useState<string | null>(null);
  const [isLoadingRemote, setIsLoadingRemote] = useState(false);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        if (!isMounted) {
          return;
        }

        setPermissionGranted(status.granted);
        if (!status.granted) {
          setPanelError('Permissão de microfone negada.');
          return;
        }

        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      } catch {
        if (isMounted) {
          setPermissionGranted(false);
          setPanelError('Não foi possível preparar o microfone.');
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!existingAudioPath || localUri) {
      setRemoteUri(null);
      return;
    }

    let isMounted = true;
    setIsLoadingRemote(true);

    obterUrlAudioAvaliacao(existingAudioPath)
      .then((url) => {
        if (isMounted) {
          setRemoteUri(url);
        }
      })
      .catch(() => {
        if (isMounted) {
          setPanelError('Não foi possível carregar o áudio salvo.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingRemote(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [existingAudioPath, localUri]);

  async function handleStartRecording() {
    if (disabled || !permissionGranted || recorderState.isRecording) {
      return;
    }

    setPanelError(null);
    setIsPreparing(true);
    setLocalUri(null);
    onRecordingChange(null);

    try {
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao iniciar gravação.';
      setPanelError(
        Platform.OS === 'web'
          ? 'Gravação indisponível no navegador. Use o app no celular ou acesse via HTTPS/localhost.'
          : message,
      );
    } finally {
      setIsPreparing(false);
    }
  }

  async function handleStopRecording() {
    if (!recorderState.isRecording) {
      return;
    }

    setPanelError(null);
    const durationMillis = recorderState.durationMillis;

    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (!uri) {
        setPanelError('A gravação não gerou um arquivo de áudio.');
        return;
      }

      setLocalUri(uri);
      onRecordingChange({
        localUri: uri,
        extension: extensionFromUri(uri),
        durationMillis,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao parar gravação.';
      setPanelError(message);
    }
  }

  async function handlePlay() {
    const source = localUri ?? remoteUri;
    if (!source) {
      return;
    }

    setPanelError(null);

    try {
      player.replace(source);
      player.seekTo(0);
      player.play();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao reproduzir áudio.';
      setPanelError(message);
    }
  }

  function handleRedo() {
    setLocalUri(null);
    setPanelError(null);
    onRecordingChange(null);
  }

  const hasLocalRecording = Boolean(localUri);
  const hasSavedRecording = Boolean(existingAudioPath && !localUri);
  const canPlay = Boolean(localUri ?? remoteUri);
  const isBusy = disabled || isPreparing || recorderState.isRecording;

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Gravação da leitura</Text>
      <Text style={styles.panelHint}>
        Grave a leitura do aluno antes de avançar. Você pode ouvir e refazer se necessário.
      </Text>

      {Platform.OS === 'web' ? (
        <Text style={styles.webHint}>
          No navegador a gravação pode não funcionar em todos os ambientes. O fluxo segue sem áudio.
        </Text>
      ) : null}

      {recorderState.isRecording ? (
        <Text style={styles.recordingBadge}>
          Gravando · {formatDuration(recorderState.durationMillis)}
        </Text>
      ) : null}

      {hasLocalRecording ? (
        <Text style={styles.statusOk}>Gravação pronta para envio ao avançar.</Text>
      ) : null}

      {hasSavedRecording ? (
        <Text style={styles.statusOk}>Áudio deste aluno já salvo na sondagem.</Text>
      ) : null}

      {isLoadingRemote ? <ActivityIndicator color="#1B6CA8" /> : null}

      {panelError ? <Text style={styles.error}>{panelError}</Text> : null}

      <View style={styles.actions}>
        {!recorderState.isRecording ? (
          <Pressable
            disabled={isBusy || permissionGranted === false}
            style={[styles.primaryButton, isBusy && styles.buttonDisabled]}
            onPress={handleStartRecording}
          >
            {isPreparing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {hasLocalRecording || hasSavedRecording ? 'Gravar novamente' : 'Iniciar gravação'}
              </Text>
            )}
          </Pressable>
        ) : (
          <Pressable
            disabled={disabled}
            style={[styles.dangerButton, disabled && styles.buttonDisabled]}
            onPress={handleStopRecording}
          >
            <Text style={styles.primaryButtonText}>Parar gravação</Text>
          </Pressable>
        )}

        <Pressable
          disabled={!canPlay || recorderState.isRecording || disabled}
          style={[
            styles.secondaryButton,
            (!canPlay || recorderState.isRecording || disabled) && styles.buttonDisabled,
          ]}
          onPress={handlePlay}
        >
          <Text style={styles.secondaryButtonText}>
            {playerStatus.playing ? 'Reproduzindo...' : 'Ouvir gravação'}
          </Text>
        </Pressable>

        {hasLocalRecording ? (
          <Pressable
            disabled={recorderState.isRecording || disabled}
            style={[
              styles.secondaryButton,
              (recorderState.isRecording || disabled) && styles.buttonDisabled,
            ]}
            onPress={handleRedo}
          >
            <Text style={styles.secondaryButtonText}>Refazer gravação</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    borderColor: '#D6DEE6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    backgroundColor: '#fff',
    gap: 10,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  panelHint: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  webHint: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
  },
  recordingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FDECEC',
    color: '#B42318',
    fontWeight: '700',
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  statusOk: {
    fontSize: 14,
    color: '#1B7F4B',
  },
  actions: {
    gap: 10,
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: '#1B6CA8',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#B42318',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#D6DEE6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  secondaryButtonText: {
    color: '#1B6CA8',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  error: {
    color: '#B00020',
    fontSize: 14,
  },
});
