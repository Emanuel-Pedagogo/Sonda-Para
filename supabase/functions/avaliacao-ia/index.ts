// @ts-nocheck
// eslint-disable-next-line import/no-unresolved
const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.108.1');
import {
  buildRubricaTextoPorAno,
  getNiveisLeituraPorAno,
  normalizeNivel,
} from './rubrica-alfabetiza.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const STORAGE_BUCKET = 'audios-sondagem';

const PROMPT_TRANSCRICAO = `Você é um transcritor especializado em leitura infantil.

Transcreva exatamente o que foi falado.

Não corrija palavras.

Não interprete.

Não complete frases.

Retorne apenas a transcrição.`;

function buildPromptAnalise(params: {
  textoEsperado: string;
  transcricao: string;
  tempoTotalSegundos: number;
  anoEscolar: number;
}): string {
  const niveisValidos = getNiveisLeituraPorAno(params.anoEscolar);
  const rubricaTexto = buildRubricaTextoPorAno(params.anoEscolar);
  const niveisFormatados = niveisValidos.map((nivel) => `"${nivel}"`).join(', ');

  return `Você é um assistente pedagógico para avaliação de leitura. A IA apenas sugere; a decisão final é sempre do professor.

Compare o texto esperado com a transcrição do aluno.

Use a rubrica abaixo como referência de classificação:
${rubricaTexto}

Calcule:
- precisao: palavras corretas dividido pelo total de palavras esperadas multiplicado por 100
- omissoes: quantidade de palavras esperadas não lidas
- substituicoes: quantidade de palavras trocadas
- fluencia: palavras lidas por minuto, usando o tempo total informado
- nivel_sugerido: um destes valores exatos: ${niveisFormatados}
- confianca_ia: número de 0 a 100
- justificativa: explique em linguagem pedagógica simples, em 1 a 3 frases, por que a IA sugeriu esse nível. Cite evidências como precisão, fluência, omissões, substituições e trechos da transcrição quando útil.

Retorne apenas JSON válido neste formato:
{
  "precisao": 0,
  "omissoes": 0,
  "substituicoes": 0,
  "fluencia": 0,
  "nivel_sugerido": "",
  "confianca_ia": 0,
  "justificativa": ""
}

Texto esperado:
${params.textoEsperado}

Transcrição:
${params.transcricao}

Tempo total da leitura (segundos):
${params.tempoTotalSegundos}`;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function requireEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Variável de ambiente ausente: ${name}`);
  }

  return value;
}

function getBearerToken(authHeader: string | null): string {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Token de autenticação ausente.');
  }

  return authHeader.replace('Bearer ', '').trim();
}

function clampNumber(value: unknown, min: number, max: number): number {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    return min;
  }

  return Math.min(max, Math.max(min, numberValue));
}

function stripJsonFence(text: string): string {
  return text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function guessMimeType(path: string, fallback?: string): string {
  if (fallback) {
    return fallback;
  }

  if (path.endsWith('.webm')) {
    return 'audio/webm';
  }

  if (path.endsWith('.m4a')) {
    return 'audio/mp4';
  }

  if (path.endsWith('.wav')) {
    return 'audio/wav';
  }

  return 'application/octet-stream';
}

function audioFilenameFromPath(path: string): string {
  const fileName = path.split('/').pop();
  return fileName || 'leitura.m4a';
}

function extractTranscriptionText(payload: unknown): string {
  if (!payload || typeof payload !== 'object') {
    return '';
  }

  const response = payload as {
    text?: unknown;
    transcription?: unknown;
    segments?: { text?: unknown }[];
  };

  if (typeof response.text === 'string' && response.text.trim()) {
    return response.text.trim();
  }

  if (typeof response.transcription === 'string' && response.transcription.trim()) {
    return response.transcription.trim();
  }

  const segmentText = response.segments
    ?.map((segment) => (typeof segment.text === 'string' ? segment.text : ''))
    .join(' ')
    .trim();

  return segmentText ?? '';
}

async function transcribeAudioWithGroq(params: {
  apiKey: string;
  model: string;
  audioBlob: Blob;
  audioPath: string;
  mimeType: string;
}): Promise<string> {
  const audioFile = new Blob([params.audioBlob], { type: params.mimeType });
  const formData = new FormData();
  formData.append('file', audioFile, audioFilenameFromPath(params.audioPath));
  formData.append('model', params.model);
  formData.append('language', 'pt');
  formData.append('response_format', 'verbose_json');
  formData.append('prompt', 'Leitura infantil em português do Brasil.');

  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: formData,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message ?? 'Falha ao transcrever áudio com Groq.');
  }

  const text = extractTranscriptionText(payload);

  if (!text) {
    throw new Error(
      `Groq não retornou transcrição. Verifique se o áudio tem fala audível. Resposta: ${JSON.stringify(
        payload,
      ).slice(0, 500)}`,
    );
  }

  return text;
}

async function generateGroqChatText(params: {
  apiKey: string;
  model: string;
  prompt: string;
}): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: params.model,
      messages: [
        {
          role: 'system',
          content:
            'Você é um assistente pedagógico. Retorne somente JSON válido quando solicitado.',
        },
        {
          role: 'user',
          content: params.prompt,
        },
      ],
      temperature: 0.1,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message ?? 'Falha ao analisar texto com Groq.');
  }

  const text = payload?.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error('Groq não retornou análise.');
  }

  return text;
}

async function assertUserCanAccessAvaliacao(params: {
  supabase: ReturnType<typeof createClient>;
  userId: string;
  avaliacaoId: string;
}) {
  const { data: usuario, error: usuarioError } = await params.supabase
    .from('usuarios')
    .select('id, escola_id')
    .eq('id', params.userId)
    .single();

  if (usuarioError || !usuario?.escola_id) {
    throw new Error('Usuário sem escola vinculada.');
  }

  const { data: avaliacao, error: avaliacaoError } = await params.supabase
    .from('avaliacoes')
    .select('id, aluno_id, sondagem_id, audio_url')
    .eq('id', params.avaliacaoId)
    .single();

  if (avaliacaoError || !avaliacao) {
    throw new Error('Avaliação não encontrada.');
  }

  const { data: aluno, error: alunoError } = await params.supabase
    .from('alunos')
    .select('id, turma_id')
    .eq('id', avaliacao.aluno_id)
    .single();

  if (alunoError || !aluno) {
    throw new Error('Aluno da avaliação não encontrado.');
  }

  const { data: turma, error: turmaError } = await params.supabase
    .from('turmas')
    .select('id, escola_id, ano_escolar')
    .eq('id', aluno.turma_id)
    .single();

  if (turmaError || !turma || turma.escola_id !== usuario.escola_id) {
    throw new Error('Usuário sem permissão para analisar esta avaliação.');
  }

  const { data: sondagem, error: sondagemError } = await params.supabase
    .from('sondagens')
    .select('id, palavras, frase, texto')
    .eq('id', avaliacao.sondagem_id)
    .single();

  if (sondagemError || !sondagem) {
    throw new Error('Sondagem da avaliação não encontrada.');
  }

  return { avaliacao, sondagem, anoEscolar: turma.ano_escolar ?? 3 };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Método não permitido.' }, 405);
  }

  try {
    const supabaseUrl = requireEnv('SUPABASE_URL');
    const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
    const groqApiKey = requireEnv('GROQ_API_KEY');
    const groqTranscriptionModel =
      Deno.env.get('GROQ_TRANSCRIPTION_MODEL') ?? 'whisper-large-v3-turbo';
    const groqChatModel = Deno.env.get('GROQ_CHAT_MODEL') ?? 'llama-3.1-8b-instant';

    const token = getBearerToken(req.headers.get('Authorization'));
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return jsonResponse({ error: 'Sessão inválida.' }, 401);
    }

    const body = await req.json();
    const avaliacaoId = String(body?.avaliacaoId ?? '');
    const audioPathFromBody = body?.audioPath ? String(body.audioPath) : null;
    const tempoTotalSegundos = clampNumber(body?.tempoTotalSegundos, 1, 60 * 60);

    if (!avaliacaoId) {
      return jsonResponse({ error: 'avaliacaoId é obrigatório.' }, 400);
    }

    const { avaliacao, sondagem, anoEscolar } = await assertUserCanAccessAvaliacao({
      supabase,
      userId: authData.user.id,
      avaliacaoId,
    });

    const niveisValidos = getNiveisLeituraPorAno(anoEscolar);

    const audioPath = audioPathFromBody ?? avaliacao.audio_url;
    if (!audioPath) {
      return jsonResponse({ error: 'Avaliação sem áudio para analisar.' }, 400);
    }

    const { data: audioBlob, error: audioError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(audioPath);

    if (audioError || !audioBlob) {
      throw new Error(audioError?.message ?? 'Não foi possível baixar o áudio.');
    }

    const audioMimeType = guessMimeType(audioPath, audioBlob.type);

    const transcricao = await transcribeAudioWithGroq({
      apiKey: groqApiKey,
      model: groqTranscriptionModel,
      audioBlob,
      audioPath,
      mimeType: audioMimeType,
    });

    const textoEsperado = [sondagem.palavras, sondagem.frase, sondagem.texto]
      .filter(Boolean)
      .join('\n')
      .trim();

    if (!textoEsperado) {
      throw new Error('Sondagem sem texto esperado para análise.');
    }

    const promptAnalise = buildPromptAnalise({
      textoEsperado,
      transcricao,
      tempoTotalSegundos,
      anoEscolar,
    });
    const analiseText = await generateGroqChatText({
      apiKey: groqApiKey,
      model: groqChatModel,
      prompt: promptAnalise,
    });
    const analise = JSON.parse(stripJsonFence(analiseText));

    const updatePayload = {
      transcricao,
      precisao: clampNumber(analise.precisao, 0, 100),
      omissoes: Math.round(clampNumber(analise.omissoes, 0, 10000)),
      substituicoes: Math.round(clampNumber(analise.substituicoes, 0, 10000)),
      fluencia: clampNumber(analise.fluencia, 0, 10000),
      confianca_ia: clampNumber(analise.confianca_ia ?? analise.confianca, 0, 100),
      nivel_sugerido: normalizeNivel(analise.nivel_sugerido, niveisValidos),
      justificativa_ia:
        typeof analise.justificativa === 'string' ? analise.justificativa.trim() : null,
    };

    const { data: updated, error: updateError } = await supabase
      .from('avaliacoes')
      .update(updatePayload)
      .eq('id', avaliacaoId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    const nivelHistorico = updated.nivel_final ?? updated.nivel_sugerido;
    if (nivelHistorico) {
      const { error: historicoError } = await supabase.from('historico_niveis').upsert(
        {
          aluno_id: updated.aluno_id,
          avaliacao_id: updated.id,
          nivel: nivelHistorico,
          data_avaliacao: new Date().toISOString().slice(0, 10),
        },
        { onConflict: 'avaliacao_id' },
      );

      if (historicoError) {
        throw historicoError;
      }
    }

    await supabase.from('logs_ia').insert({
      avaliacao_id: avaliacaoId,
      prompt: JSON.stringify({
        transcricao: PROMPT_TRANSCRICAO,
        analise: promptAnalise,
      }),
      resposta: JSON.stringify({
        transcricao,
        analiseBruta: analiseText,
        analise,
      }),
    });

    return jsonResponse({ avaliacao: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido na análise por IA.';
    return jsonResponse({ error: message }, 500);
  }
});
