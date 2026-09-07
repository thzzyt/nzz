import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Device from 'expo-device';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  PixelRatio,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AccountSheet from '../components/AccountSheet';
import { HEADER_HEIGHT } from '../components/Header';
import RedShape from '../components/RedShape';
import { theme } from '../theme';

const SENSI_API_URL = 'https://exemulator.pro/up/sensiia/';
const SENSI_ORIGIN = 'https://exemulator.pro/';
const TAB_BAR_HEIGHT = 68;
const INPUT_BOTTOM_GAP = 10;
const GENERATION_DELAY_MS = 1400;
const INPUT_BAR_HEIGHT = 56;
const DOCK_GAP = 16;
const PLAYER_DOCK_HEIGHT = 130;
const SIDE_INSET = 20;

const POINTER_SPEEDS = ['Lenta', 'Média', 'Rápida'];
const FONT_SIZES = ['P', 'M', 'G', 'EEP'];

type SensiFunction = {
  ajuda: string;
  img: string;
};

type PlayerItem = {
  name: string;
  url: string;
  pasta: string;
};

type SensiResponse = {
  mobile: PlayerItem[];
  emulador: PlayerItem[];
  functions: SensiFunction[];
};

type PlayerSource = 'mobile' | 'emulador';

type SensiResult = {
  dpi: number;
  geral: number;
  pontoVermelho: number;
  mira2x: number;
  mira4x: number;
  miraAwm: number;
  botaoPercent: number;
  velocidade: string;
  fonte: string;
};

type GeneratorResult = Record<string, string>;

type ChatMessage =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'bot'; text: string }
  | { id: string; role: 'loading' }
  | { id: string; role: 'result'; data: SensiResult; saved: boolean; version: number }
  | { id: string; role: 'choices'; stepIndex: number; options: string[] }
  | { id: string; role: 'generatorResult'; data: GeneratorResult; saved: boolean; version: number }
  | { id: string; role: 'deviceInfo'; text: string };

function fallbackIconFor(ajuda: string): keyof typeof Ionicons.glyphMap {
  const label = ajuda.toLowerCase();
  if (label.includes('mobile')) return 'phone-portrait-outline';
  if (label.includes('emulador')) return 'desktop-outline';
  if (label.includes('vídeo') || label.includes('video')) return 'videocam-outline';
  if (label.includes('i.a')) return 'sparkles-outline';
  return 'apps-outline';
}

function sourceFor(ajuda: string): PlayerSource | null {
  const label = ajuda.toLowerCase();
  if (label.includes('mobile')) return 'mobile';
  if (label.includes('emulador')) return 'emulador';
  return null;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOne<T>(options: T[]): T {
  return options[randomInt(0, options.length - 1)];
}

function generateSensiResult(): SensiResult {
  return {
    dpi: randomInt(400, 1600),
    geral: randomInt(60, 200),
    pontoVermelho: randomInt(60, 200),
    mira2x: randomInt(60, 200),
    mira4x: randomInt(60, 200),
    miraAwm: randomInt(60, 200),
    botaoPercent: randomInt(40, 70),
    velocidade: pickOne(POINTER_SPEEDS),
    fonte: pickOne(FONT_SIZES),
  };
}

const GENERATOR_API_URL = 'https://exemulator.pro/ios/sensiia/gerador.php';

type GeneratorStep = {
  question: string;
  options?: string[];
  paramKey?: string;
  values?: Record<string, string>;
};

const GENERATOR_CONVERSATION: GeneratorStep[] = [
  {
    question:
      'Bem-vindo ao Sensi I.A!\n\nEstamos aqui para te ajudar a encontrar a melhor sensibilidade pro FF.',
  },
  {
    question:
      'Para encontrarmos a sua configuração ideal, vamos te fazer algumas perguntas para gerar uma sensibilidade exclusiva pra você. \n\nPrimeiramente precisamos saber o modelo do seu iPhone.',
    options: ['Identificar'],
  },
  {
    question: 'Você prefere utilizar sensibilidades mais baixas, médias ou mais altas?',
    options: ['BAIXAS', 'MÉDIAS', 'ALTAS'],
    paramKey: 'sensi',
    values: { BAIXAS: 'baixas', MÉDIAS: 'medias', ALTAS: 'altas' },
  },
  {
    question: 'Você quer mexer nas configurações do aparelho ou somente no jogo?',
    options: ['CONFIG COMPLETA', 'SOMENTE NO JOGO'],
    paramKey: 'config',
    values: { 'CONFIG COMPLETA': 'config_completa', 'SOMENTE NO JOGO': 'somente_no_jogo' },
  },
  {
    question:
      'Você deseja uma sensibilidade focada em algum estilo de jogo específico, ou uma que sirva pra tudo?',
    options: ['SENSI ESPECÍFICA', 'SENSI CORINGA'],
    paramKey: 'tipo',
    values: { 'SENSI ESPECÍFICA': 'sensi+especifica', 'SENSI CORINGA': 'sensi+coringa' },
  },
  {
    question: 'Selecione seu estilo de jogo:',
    options: ['X1', '4X4', 'CAMPEONATO', 'RANQUEADA'],
    paramKey: 'estilo',
    values: { X1: 'x1', '4X4': '4x4', CAMPEONATO: 'campeonato', RANQUEADA: 'ranqueada' },
  },
  {
    question:
      'Com base nas informações que nos forneceu, essa é a sensibilidade ideal para aperfeiçoar sua jogabilidade.',
  },
];

const GENERATOR_FIELD_ORDER = [
  'Geral',
  'Ponto_Vermelho',
  'Mira_2x',
  'Mira_4x',
  'Mira_AWM',
  'Tamanho_Botao',
  'Toque_Tatil',
  'Opacidade_Ocioso',
  'Espera_Inicial',
  'Velocidade_Maxima',
  'Sensibilidade_Rastreamento',
  'Tolerancia_Movimento',
  'Ciclos',
  'Cursor_Movel',
];

const GENERATOR_FIELD_LABELS: Record<string, string> = {
  Geral: 'Geral',
  Ponto_Vermelho: 'Ponto vermelho',
  Mira_2x: 'Mira 2X',
  Mira_4x: 'Mira 4X',
  Mira_AWM: 'Mira AWM',
  Tamanho_Botao: 'Tamanho do botão',
  Toque_Tatil: 'Toque tátil',
  Opacidade_Ocioso: 'Opacidade ocioso',
  Espera_Inicial: 'Espera inicial',
  Velocidade_Maxima: 'Velocidade máxima',
  Sensibilidade_Rastreamento: 'Sensibilidade de rastreamento',
  Tolerancia_Movimento: 'Tolerância de movimento',
  Ciclos: 'Ciclos',
  Cursor_Movel: 'Cursor móvel',
};

function buildGeneratorUrl(answers: Record<string, string>) {
  const query = ['sensi', 'config', 'tipo', 'estilo']
    .filter((key) => answers[key])
    .map((key) => `${key}=${answers[key]}`)
    .join('&');
  return `${GENERATOR_API_URL}?${query}`;
}

function buildDeviceInfoText() {
  const { width, height } = Dimensions.get('screen');
  const density = PixelRatio.get();
  const widthPx = Math.round(width * density);
  const heightPx = Math.round(height * density);
  const densidade = Math.round(density * 100);
  const dpiAtual = Math.round(density * 160);
  const modelo = [Device.brand, Device.modelName].filter(Boolean).join(', ') || 'Desconhecido';

  return `Modelo: ${modelo}\n\nAltura: ${heightPx}px\nLargura: ${widthPx}px\n\nDensidade: ${densidade}\nDPI atual: ${dpiAtual}\nTaxa de atualização: 60hz`;
}

function tokenizeWords(text: string): string[] {
  return text.match(/\S+\s*/g) ?? [text];
}

function BotTypingBubble({ text, onRevealed }: { text: string; onRevealed: () => void }) {
  const [phase, setPhase] = useState<'loading' | 'typing'>('loading');
  const [visibleWords, setVisibleWords] = useState(0);
  const tokens = useMemo(() => tokenizeWords(text), [text]);

  useEffect(() => {
    const loadTimeout = setTimeout(() => setPhase('typing'), randomInt(900, 2200));
    return () => clearTimeout(loadTimeout);
  }, []);

  useEffect(() => {
    if (phase !== 'typing') return;
    if (visibleWords >= tokens.length) {
      onRevealed();
      return;
    }
    const wordTimeout = setTimeout(() => setVisibleWords((count) => count + 1), randomInt(70, 140));
    return () => clearTimeout(wordTimeout);
  }, [phase, visibleWords, tokens.length]);

  if (phase === 'loading') {
    return (
      <View style={styles.botBubble}>
        <ActivityIndicator color={theme.colors.text} size="small" />
      </View>
    );
  }

  return (
    <View style={styles.botBubble}>
      <Text style={styles.botBubbleText}>{tokens.slice(0, visibleWords).join('')}</Text>
    </View>
  );
}

function GeneratorResultFields({
  data,
  onRevealed,
}: {
  data: GeneratorResult;
  onRevealed: () => void;
}) {
  const fields = useMemo(() => GENERATOR_FIELD_ORDER.filter((key) => data[key] !== undefined), [data]);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount >= fields.length) {
      onRevealed();
      return;
    }
    const timeoutId = setTimeout(() => setVisibleCount((count) => count + 1), 110);
    return () => clearTimeout(timeoutId);
  }, [visibleCount, fields.length]);

  return (
    <>
      {fields.slice(0, visibleCount).map((key) => (
        <Text key={key} style={styles.resultLine}>
          {GENERATOR_FIELD_LABELS[key] ?? key}: {data[key]}
        </Text>
      ))}
    </>
  );
}

type SensiResultLine = { key: string; text: string; sectionTitle?: boolean; spacedTop?: boolean };

function buildSensiResultLines(data: SensiResult): SensiResultLine[] {
  return [
    { key: 'dpi', text: `DPI: ${data.dpi}` },
    { key: 'section', text: 'Sensibilidade do jogo:', sectionTitle: true },
    { key: 'geral', text: `Geral: ${data.geral}` },
    { key: 'pontoVermelho', text: `Ponto vermelho: ${data.pontoVermelho}` },
    { key: 'mira2x', text: `Mira 2X: ${data.mira2x}` },
    { key: 'mira4x', text: `Mira 4X: ${data.mira4x}` },
    { key: 'miraAwm', text: `Mira AWM: ${data.miraAwm}` },
    { key: 'botao', text: `Tamanho do botão: ${data.botaoPercent}%`, spacedTop: true },
    { key: 'velocidade', text: `Velocidade do ponteiro: ${data.velocidade}` },
    { key: 'fonte', text: `Tamanho da fonte: ${data.fonte}` },
  ];
}

function SensiResultFields({ data, onRevealed }: { data: SensiResult; onRevealed: () => void }) {
  const lines = useMemo(() => buildSensiResultLines(data), [data]);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount >= lines.length) {
      onRevealed();
      return;
    }
    const timeoutId = setTimeout(() => setVisibleCount((count) => count + 1), 110);
    return () => clearTimeout(timeoutId);
  }, [visibleCount, lines.length]);

  return (
    <>
      {lines.slice(0, visibleCount).map((line) => (
        <Text
          key={line.key}
          style={[
            styles.resultLine,
            line.sectionTitle && styles.resultSectionTitle,
            line.spacedTop && styles.resultSpacedTop,
          ]}
        >
          {line.text}
        </Text>
      ))}
    </>
  );
}

function isPendingReveal(prevMessage: ChatMessage | undefined, revealedIds: Set<string>) {
  if (!prevMessage) return false;
  if (prevMessage.role !== 'bot' && prevMessage.role !== 'deviceInfo') return false;
  return !revealedIds.has(prevMessage.id);
}

function isBotFamily(message: ChatMessage | undefined) {
  return !!message && (message.role === 'bot' || message.role === 'deviceInfo');
}

function formatSensiResult(data: SensiResult) {
  return [
    `DPI: ${data.dpi}`,
    'Sensibilidade do jogo:',
    `Geral: ${data.geral}`,
    `Ponto vermelho: ${data.pontoVermelho}`,
    `Mira 2X: ${data.mira2x}`,
    `Mira 4X: ${data.mira4x}`,
    `Mira AWM: ${data.miraAwm}`,
    `Tamanho do botão: ${data.botaoPercent}%`,
    `Velocidade do ponteiro: ${data.velocidade}`,
    `Tamanho da fonte: ${data.fonte}`,
  ].join('\n');
}

function formatGeneratorResult(data: GeneratorResult) {
  return GENERATOR_FIELD_ORDER.filter((key) => data[key] !== undefined)
    .map((key) => `${GENERATOR_FIELD_LABELS[key] ?? key}: ${data[key]}`)
    .join('\n');
}

type Props = {
  onGoToSaved?: () => void;
};

export default function ChatScreen({ onGoToSaved }: Props) {
  const insets = useSafeAreaInsets();
  const [sensiData, setSensiData] = useState<SensiResponse | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activePlayers, setActivePlayers] = useState<{ source: PlayerSource; players: PlayerItem[] } | null>(
    null
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [optionsMenuVisible, setOptionsMenuVisible] = useState(false);
  const [accountSheetVisible, setAccountSheetVisible] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [playersGateId, setPlayersGateId] = useState<string | null>(null);
  const [generatorRegeneratingId, setGeneratorRegeneratingId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const messageCount = useRef(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const generatorAnswersRef = useRef<Record<string, string>>({});
  const autoAdvanceRef = useRef<Record<string, number>>({});

  useEffect(() => {
    fetch(SENSI_API_URL)
      .then((response) => response.json())
      .then((data: SensiResponse) => setSensiData(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const nextId = (prefix: string) => {
    messageCount.current += 1;
    return `${prefix}-${messageCount.current}`;
  };

  const markRevealed = (id: string) => {
    setRevealedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    const nextStep = autoAdvanceRef.current[id];
    if (nextStep !== undefined) {
      delete autoAdvanceRef.current[id];
      advanceGenerator(nextStep);
    }
  };

  const handleToolPress = (item: SensiFunction) => {
    if (item.ajuda.toLowerCase().includes('i.a')) {
      startGeneratorFlow(item.ajuda);
      return;
    }

    const source = sourceFor(item.ajuda);

    setMessages((prev) => [...prev, { id: nextId('u'), role: 'user', text: item.ajuda }]);

    if (!source) {
      setActivePlayers(null);
      return;
    }

    const gateId = nextId('b');
    setMessages((prev) => [
      ...prev,
      {
        id: gateId,
        role: 'bot',
        text: 'Escolha um jogador para que eu possa criar uma sensibilidade de Android idêntica à que ele usaria:',
      },
    ]);
    setPlayersGateId(gateId);
    setActivePlayers({ source, players: sensiData?.[source] ?? [] });
  };

  const startGeneratorFlow = (label: string) => {
    generatorAnswersRef.current = {};
    setMessages((prev) => [...prev, { id: nextId('u'), role: 'user', text: label }]);
    advanceGenerator(0);
  };

  const advanceGenerator = (stepIndex: number) => {
    const step = GENERATOR_CONVERSATION[stepIndex];
    if (!step) return;

    if (stepIndex === GENERATOR_CONVERSATION.length - 1) {
      const loadingId = nextId('l');
      setMessages((prev) => [...prev, { id: loadingId, role: 'loading' }]);

      fetch(buildGeneratorUrl(generatorAnswersRef.current))
        .then((response) => response.json())
        .then((data: GeneratorResult) => {
          setMessages((prev) => [
            ...prev.filter((message) => message.id !== loadingId),
            { id: nextId('b'), role: 'bot', text: step.question },
            { id: nextId('gr'), role: 'generatorResult', data, saved: false, version: 0 },
          ]);
        })
        .catch(() => {
          setMessages((prev) => [
            ...prev.filter((message) => message.id !== loadingId),
            {
              id: nextId('b'),
              role: 'bot',
              text: 'Não foi possível gerar sua sensibilidade agora. Tente novamente mais tarde.',
            },
          ]);
        });
      return;
    }

    const messageId = nextId('b');
    setMessages((prev) => [...prev, { id: messageId, role: 'bot', text: step.question }]);

    if (step.options && step.options.length > 0) {
      setMessages((prev) => [
        ...prev,
        { id: nextId('c'), role: 'choices', stepIndex, options: step.options! },
      ]);
    } else {
      autoAdvanceRef.current[messageId] = stepIndex + 1;
    }
  };

  const handleGeneratorChoice = (stepIndex: number, option: string) => {
    const step = GENERATOR_CONVERSATION[stepIndex];
    const value = step.values?.[option];
    if (step.paramKey && value) {
      generatorAnswersRef.current = { ...generatorAnswersRef.current, [step.paramKey]: value };
    }

    setMessages((prev) => [
      ...prev.filter((message) => !(message.role === 'choices' && message.stepIndex === stepIndex)),
      { id: nextId('u'), role: 'user', text: option },
    ]);

    if (option === 'Identificar') {
      setMessages((prev) => [
        ...prev,
        { id: nextId('d'), role: 'deviceInfo', text: buildDeviceInfoText() },
        { id: nextId('c'), role: 'choices', stepIndex, options: ['Dispositivo identificado'] },
      ]);
      return;
    }

    advanceGenerator(stepIndex + 1);
  };

  const handleSelectPlayer = (name: string) => {
    setActivePlayers(null);
    const loadingId = nextId('l');

    setMessages((prev) => [
      ...prev,
      { id: nextId('u'), role: 'user', text: name },
      { id: nextId('b'), role: 'bot', text: 'Jogador selecionado. Preparando Sensibilidade...' },
      { id: loadingId, role: 'loading' },
    ]);

    const timeoutId = setTimeout(() => {
      setMessages((prev) => [
        ...prev.filter((message) => message.id !== loadingId),
        { id: nextId('b'), role: 'bot', text: 'Sensibilidade do Android idêntica à que ele usaria:' },
        { id: nextId('r'), role: 'result', data: generateSensiResult(), saved: false, version: 0 },
      ]);
    }, GENERATION_DELAY_MS);
    timeoutsRef.current.push(timeoutId);
  };

  const handleRegenerate = (id: string) => {
    setRevealedIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setMessages((prev) =>
      prev.map((message) =>
        message.id === id && message.role === 'result'
          ? { ...message, data: generateSensiResult(), saved: false, version: message.version + 1 }
          : message
      )
    );
  };

  const handleCopy = async (id: string, data: SensiResult) => {
    await Clipboard.setStringAsync(formatSensiResult(data));
    setCopiedId(id);
    const timeoutId = setTimeout(() => {
      setCopiedId((current) => (current === id ? null : current));
    }, 1500);
    timeoutsRef.current.push(timeoutId);
  };

  const handleShare = async (data: SensiResult) => {
    try {
      await Share.share({ message: formatSensiResult(data) });
    } catch {}
  };

  const handleToggleSave = (id: string) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === id && message.role === 'result'
          ? { ...message, saved: !message.saved }
          : message
      )
    );
  };

  const handleGeneratorCopy = async (id: string, data: GeneratorResult) => {
    await Clipboard.setStringAsync(formatGeneratorResult(data));
    setCopiedId(id);
    const timeoutId = setTimeout(() => {
      setCopiedId((current) => (current === id ? null : current));
    }, 1500);
    timeoutsRef.current.push(timeoutId);
  };

  const handleGeneratorShare = async (data: GeneratorResult) => {
    try {
      await Share.share({ message: formatGeneratorResult(data) });
    } catch {}
  };

  const handleToggleGeneratorSave = (id: string) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === id && message.role === 'generatorResult'
          ? { ...message, saved: !message.saved }
          : message
      )
    );
  };

  const resetChat = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    autoAdvanceRef.current = {};
    generatorAnswersRef.current = {};
    setMessages([]);
    setActivePlayers(null);
    setCopiedId(null);
    setRevealedIds(new Set());
    setPlayersGateId(null);
  };

  const handleSwitchTool = () => {
    setOptionsMenuVisible(false);
    resetChat();
  };

  const handleGeneratorRegenerate = (id: string) => {
    if (generatorRegeneratingId) return;
    setGeneratorRegeneratingId(id);

    fetch(buildGeneratorUrl(generatorAnswersRef.current))
      .then((response) => response.json())
      .then((data: GeneratorResult) => {
        setRevealedIds((prev) => {
          if (!prev.has(id)) return prev;
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setMessages((prev) =>
          prev.map((message) =>
            message.id === id && message.role === 'generatorResult'
              ? { ...message, data, saved: false, version: message.version + 1 }
              : message
          )
        );
      })
      .catch(() => {})
      .finally(() => setGeneratorRegeneratingId(null));
  };

  const handleReportProblem = () => {
    setOptionsMenuVisible(false);
    setAccountSheetVisible(true);
  };

  const functions = sensiData?.functions ?? [];
  const headerClearance = HEADER_HEIGHT + insets.top;
  const inputBarBottom = TAB_BAR_HEIGHT + INPUT_BOTTOM_GAP;
  const dockBottom = inputBarBottom + INPUT_BAR_HEIGHT + DOCK_GAP;
  const chatBottomPadding =
    inputBarBottom + INPUT_BAR_HEIGHT + DOCK_GAP + (activePlayers ? PLAYER_DOCK_HEIGHT + DOCK_GAP : 0);

  return (
    <View style={styles.container}>
      {messages.length === 0 ? (
        <View
          style={[
            styles.centerWrap,
            { paddingTop: headerClearance, paddingBottom: inputBarBottom + INPUT_BAR_HEIGHT + DOCK_GAP },
          ]}
        >
          <RedShape size={64} radius={22}>
            <Ionicons name="chatbubble-ellipses" size={30} color={theme.colors.text} />
          </RedShape>

          <Text style={styles.title}>Com qual ferramenta de{'\n'}sensibilidade posso te ajudar?</Text>

          <View style={styles.grid}>
            {functions.map((item) => (
              <Pressable key={item.ajuda} style={styles.card} onPress={() => handleToolPress(item)}>
                <View style={styles.iconBox}>
                  {item.img.startsWith('http') ? (
                    <Image source={{ uri: item.img }} style={styles.icon} resizeMode="contain" />
                  ) : (
                    <Ionicons name={fallbackIconFor(item.ajuda)} size={18} color={theme.colors.accent} />
                  )}
                </View>
                <Text style={styles.cardText} numberOfLines={1}>
                  {item.ajuda}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <>
          <ScrollView
            ref={scrollRef}
            style={styles.chatScroll}
            contentContainerStyle={[
              styles.chatContent,
              { paddingTop: headerClearance + 16, paddingBottom: chatBottomPadding },
            ]}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((message, index, array) => {
              if (message.role === 'user') {
                return (
                  <View key={message.id} style={styles.userBubbleRow}>
                    <Text style={styles.userBubbleText}>{message.text}</Text>
                  </View>
                );
              }

              if (message.role === 'bot') {
                const showHeader = !isBotFamily(array[index - 1]);
                return (
                  <View key={message.id} style={styles.botGroup}>
                    {showHeader && (
                      <View style={styles.botHeader}>
                        <RedShape size={26} radius={9}>
                          <Ionicons name="chatbubble-ellipses" size={14} color={theme.colors.text} />
                        </RedShape>
                        <Text style={styles.botName}>SENSI I.A</Text>
                      </View>
                    )}
                    <BotTypingBubble text={message.text} onRevealed={() => markRevealed(message.id)} />
                  </View>
                );
              }

              if (message.role === 'loading') {
                return (
                  <View key={message.id} style={styles.loadingGroup}>
                    <View style={styles.loadingBox}>
                      <ActivityIndicator color={theme.colors.text} size="small" />
                    </View>
                    <View style={styles.loadingBox}>
                      <ActivityIndicator color={theme.colors.text} size="small" />
                    </View>
                  </View>
                );
              }

              if (message.role === 'choices') {
                if (isPendingReveal(array[index - 1], revealedIds)) return null;
                return (
                  <View key={message.id} style={styles.choicesWrap}>
                    {message.options.map((option) => (
                      <Pressable
                        key={option}
                        style={styles.choiceButton}
                        onPress={() => handleGeneratorChoice(message.stepIndex, option)}
                      >
                        <Text style={styles.choiceButtonText}>{option}</Text>
                      </Pressable>
                    ))}
                  </View>
                );
              }

              if (message.role === 'generatorResult') {
                if (isPendingReveal(array[index - 1], revealedIds)) return null;
                const isFieldsRevealed = revealedIds.has(message.id);
                const isGeneratorCopied = copiedId === message.id;
                return (
                  <View key={message.id} style={styles.resultGroup}>
                    <View style={styles.resultRow}>
                      <View style={styles.resultCard}>
                        <GeneratorResultFields
                          key={`${message.id}-${message.version}`}
                          data={message.data}
                          onRevealed={() => markRevealed(message.id)}
                        />
                      </View>

                      {isFieldsRevealed && (
                        <View style={styles.resultActions}>
                          <Pressable
                            style={styles.regenButton}
                            onPress={() => handleGeneratorRegenerate(message.id)}
                            disabled={generatorRegeneratingId === message.id}
                          >
                            {generatorRegeneratingId === message.id ? (
                              <ActivityIndicator color={theme.colors.text} size="small" />
                            ) : (
                              <Ionicons name="refresh" size={18} color={theme.colors.text} />
                            )}
                          </Pressable>
                          <Pressable
                            style={styles.copyButton}
                            onPress={() => handleGeneratorCopy(message.id, message.data)}
                          >
                            <Ionicons
                              name={isGeneratorCopied ? 'checkmark' : 'copy-outline'}
                              size={16}
                              color={theme.colors.text}
                            />
                          </Pressable>
                          <Pressable
                            style={styles.shareButton}
                            onPress={() => handleGeneratorShare(message.data)}
                          >
                            <Ionicons name="share-social-outline" size={16} color={theme.colors.text} />
                          </Pressable>
                        </View>
                      )}
                    </View>

                    {isFieldsRevealed && (
                      <>
                        <Pressable
                          style={styles.settingRow}
                          onPress={() => handleToggleGeneratorSave(message.id)}
                        >
                          <Ionicons name="bookmark-outline" size={18} color={theme.colors.text} />
                          <Text style={styles.settingText}>Salvar Sensi</Text>
                          <View style={styles.flagButton}>
                            <Ionicons
                              name={message.saved ? 'checkmark-circle' : 'checkmark-circle-outline'}
                              size={14}
                              color={message.saved ? theme.colors.accent : theme.colors.text}
                            />
                          </View>
                        </Pressable>

                        <Pressable style={styles.settingRow} onPress={onGoToSaved}>
                          <Ionicons name="albums-outline" size={18} color={theme.colors.text} />
                          <Text style={styles.settingText}>Ver itens salvos</Text>
                          <RedShape size={28} radius={14}>
                            <Ionicons name="chevron-forward" size={14} color={theme.colors.text} />
                          </RedShape>
                        </Pressable>
                      </>
                    )}
                  </View>
                );
              }

              if (message.role === 'deviceInfo') {
                const isRevealed = revealedIds.has(message.id);
                const showHeader = !isBotFamily(array[index - 1]);
                return (
                  <View key={message.id} style={styles.botGroup}>
                    {showHeader && (
                      <View style={styles.botHeader}>
                        <RedShape size={26} radius={9}>
                          <Ionicons name="chatbubble-ellipses" size={14} color={theme.colors.text} />
                        </RedShape>
                        <Text style={styles.botName}>SENSI I.A</Text>
                      </View>
                    )}
                    <BotTypingBubble text={message.text} onRevealed={() => markRevealed(message.id)} />
                    {isRevealed && (
                      <View style={styles.botBubble}>
                        <Text style={styles.botBubbleText}>
                          Modelo e especificações identificados. Podemos prosseguir.
                        </Text>
                      </View>
                    )}
                  </View>
                );
              }

              if (isPendingReveal(array[index - 1], revealedIds)) return null;

              const isCopied = copiedId === message.id;
              const isSensiFieldsRevealed = revealedIds.has(message.id);
              return (
                <View key={message.id} style={styles.resultGroup}>
                  <View style={styles.resultRow}>
                    <View style={styles.resultCard}>
                      <SensiResultFields
                        key={`${message.id}-${message.version}`}
                        data={message.data}
                        onRevealed={() => markRevealed(message.id)}
                      />
                    </View>

                    {isSensiFieldsRevealed && (
                      <View style={styles.resultActions}>
                        <Pressable
                          style={styles.regenButton}
                          onPress={() => handleRegenerate(message.id)}
                        >
                          <Ionicons name="refresh" size={18} color={theme.colors.text} />
                        </Pressable>
                        <Pressable
                          style={styles.copyButton}
                          onPress={() => handleCopy(message.id, message.data)}
                        >
                          <Ionicons
                            name={isCopied ? 'checkmark' : 'copy-outline'}
                            size={16}
                            color={theme.colors.text}
                          />
                        </Pressable>
                        <Pressable style={styles.shareButton} onPress={() => handleShare(message.data)}>
                          <Ionicons name="share-social-outline" size={16} color={theme.colors.text} />
                        </Pressable>
                      </View>
                    )}
                  </View>

                  {isSensiFieldsRevealed && (
                    <>
                      <Pressable style={styles.settingRow} onPress={() => handleToggleSave(message.id)}>
                        <Ionicons name="bookmark-outline" size={18} color={theme.colors.text} />
                        <Text style={styles.settingText}>Salvar Sensi</Text>
                        <View style={styles.flagButton}>
                          <Ionicons
                            name={message.saved ? 'checkmark-circle' : 'checkmark-circle-outline'}
                            size={14}
                            color={message.saved ? theme.colors.accent : theme.colors.text}
                          />
                        </View>
                      </Pressable>

                      <Pressable style={styles.settingRow} onPress={onGoToSaved}>
                        <Ionicons name="albums-outline" size={18} color={theme.colors.text} />
                        <Text style={styles.settingText}>Ver itens salvos</Text>
                        <RedShape size={28} radius={14}>
                          <Ionicons name="chevron-forward" size={14} color={theme.colors.text} />
                        </RedShape>
                      </Pressable>
                    </>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </>
      )}

      <LinearGradient
        pointerEvents="none"
        colors={['transparent', theme.colors.background]}
        style={[styles.bottomFade, { height: inputBarBottom + INPUT_BAR_HEIGHT + 70 }]}
      />

      {activePlayers && (!playersGateId || revealedIds.has(playersGateId)) && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.playerDock, { bottom: dockBottom }]}
          contentContainerStyle={styles.playerList}
        >
          {activePlayers.players.map((player) => (
            <View key={player.name} style={styles.playerCard}>
              <Image
                source={{ uri: SENSI_ORIGIN + encodeURI(player.url) }}
                style={styles.playerAvatar}
              />
              <Text style={styles.playerName} numberOfLines={1}>
                {player.name}
              </Text>
              <Pressable style={styles.selectButton} onPress={() => handleSelectPlayer(player.name)}>
                <Text style={styles.selectButtonText}>Selecionar</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={[styles.inputBar, { bottom: inputBarBottom }]}>
        <TextInput
          style={styles.input}
          placeholder="Digite algo..."
          placeholderTextColor={theme.colors.textMuted}
        />
        <Pressable style={styles.moreButton} onPress={() => setOptionsMenuVisible(true)}>
          <Ionicons name="ellipsis-vertical" size={18} color={theme.colors.text} />
        </Pressable>
        <Pressable style={styles.sendButton}>
          <Ionicons name="send" size={18} color={theme.colors.text} />
        </Pressable>
      </View>

      <Modal
        visible={optionsMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOptionsMenuVisible(false)}
      >
        <Pressable style={styles.menuBackdrop} onPress={() => setOptionsMenuVisible(false)}>
          <View
            style={[styles.menuCard, { bottom: inputBarBottom + INPUT_BAR_HEIGHT + 12 }]}
            onStartShouldSetResponder={() => true}
          >
            <Pressable style={styles.menuRow} onPress={handleSwitchTool}>
              <Ionicons name="swap-horizontal-outline" size={18} color={theme.colors.text} />
              <Text style={styles.menuRowText}>Trocar ferramenta</Text>
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable style={styles.menuRow} onPress={handleReportProblem}>
              <Ionicons name="alert-circle-outline" size={18} color={theme.colors.text} />
              <Text style={styles.menuRowText}>Relatar um problema</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <AccountSheet visible={accountSheetVisible} onClose={() => setAccountSheetVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center'
  },
  centerWrap: {
    flex: 1,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 18,
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
  },
  grid: {
    width: '100%',
    marginVertical: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  card: {
    width: '48%',
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.background,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    gap: 2,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 20,
    height: 20,
  },
  cardText: {
    flexShrink: 1,
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  chatScroll: {
    flex: 1,
    width: '100%',
  },
  chatContent: {
    paddingTop: 16,
    paddingBottom: 10,
    gap: 16,
    paddingHorizontal: 25,
  },
  userBubbleRow: {
    alignSelf: 'flex-end',
    maxWidth: '75%',
    backgroundColor: theme.colors.accent,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  userBubbleText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  botGroup: {
    alignSelf: 'flex-start',
    maxWidth: '90%',
    gap: 8,
  },
  botHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  botName: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  botBubble: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  botBubbleText: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  loadingGroup: {
    alignSelf: 'flex-start',
    gap: 8,
  },
  loadingBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choicesWrap: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  choiceButton: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceButtonText: {
    color: theme.colors.background,
    fontSize: 13,
    fontWeight: '700',
  },
  resultGroup: {
    alignSelf: 'flex-start',
    width: '85%',
    gap: 10,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
  },
  resultCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 16,
    gap: 4,
  },
  resultLine: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 20,
  },
  resultSectionTitle: {
    marginTop: 6,
    fontWeight: '700',
  },
  resultSpacedTop: {
    marginTop: 10,
  },
  resultActions: {
    justifyContent: 'center',
    gap: 15,
  },
  regenButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  flagButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  playerDock: {
    position: 'absolute',
    left: SIDE_INSET,
    right: SIDE_INSET,
    flexGrow: 0,
  },
  playerList: {
    gap: 14,
    paddingRight: 20,
  },
  playerCard: {
    width: 84,
    alignItems: 'center',
    gap: 6,
  },
  playerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 15,
    backgroundColor: theme.colors.surface,
  },
  playerName: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectButton: {
    marginTop: 2,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: theme.colors.accent,
  },
  selectButtonText: {
    color: theme.colors.text,
    fontSize: 9,
    fontWeight: '700',
  },
  inputBar: {
    position: 'absolute',
    left: SIDE_INSET,
    right: SIDE_INSET,
    height: INPUT_BAR_HEIGHT,
    borderRadius: 18,
    backgroundColor: theme.colors.background,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 6,
    gap: 5,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  menuCard: {
    position: 'absolute',
    right: 20,
    minWidth: 210,
    backgroundColor: '#141414',
    borderRadius: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuRowText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 16,
  },
});
