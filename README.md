# Sonda Leitura

Aplicação mobile para **sondagem de fluência leitora** com suporte a gravação de áudio, permitindo que professores avaliem e acompanhem o desenvolvimento da leitura dos alunos de forma objetiva e gamificada.

## Características

- 📱 **Multiplataforma**: iOS, Android e Web (via Expo)
- 🎤 **Gravação de áudio**: Captura a leitura do aluno com precisão
- 📊 **Dashboard do professor**: Acompanhamento individual e coletivo
- 🎯 **Gamificação**: Sistema de XP e missões para engajar alunos
- 🔐 **Segurança**: Autenticação via Supabase + armazenamento seguro

## Stack

| Camada      | Tecnologia                    |
|------------|-------------------------------|
| Frontend   | React Native + Expo 56        |
| Linguagem  | TypeScript                    |
| Navegação  | Expo Router                   |
| Backend    | Supabase (Auth + Database)    |
| Áudio      | Expo Audio                    |
| Armazenamento | Supabase Storage + Expo File System |

## Instalação

### Pré-requisitos
- Node.js 18+ e npm
- Expo CLI (`npm install -g expo-cli`)
- Emulador Android/iOS ou dispositivo físico

### Setup

```bash
# 1. Instalar dependências
npm install

# 2. Copiar variáveis de ambiente (se houver)
cp .env.example .env

# 3. Iniciar o servidor
npm start
```

### Executar em diferentes plataformas

```bash
npm run android    # Android Emulator
npm run ios        # iOS Simulator (apenas macOS)
npm run web        # Web Browser
npm start:lan      # Conexão via LAN (escaneie QR code no Expo app)
npm start:tunnel   # Conexão via tunnel (sem estar na mesma rede)
```

## Desenvolvimento

### Estrutura de pastas

```
sonda-para/
├── app/                  # Rotas e telas (Expo Router)
│   ├── (auth)/          # Fluxo de autenticação
│   ├── (app)/           # Telas autenticadas
│   └── index.tsx        # Entrada
├── components/          # Componentes reutilizáveis
├── lib/                 # Utilitários e configuração
├── assets/              # Imagens e fontes
├── package.json
├── app.json            # Configuração Expo
└── tsconfig.json       # Configuração TypeScript
```

### Scripts úteis

```bash
npm run lint           # Verificar com ESLint
npm run lint:fix       # Corrigir automaticamente
npm run format         # Formatar código com Prettier
npm run typecheck      # Verificar tipos TypeScript
```

## Variáveis de ambiente

Configure em `.env` ou diretamente no código:

```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica
```

## Publicação

### Android (Google Play Store)

Consulte a documentação oficial do Expo para EAS Build:
```bash
eas build --platform android
eas submit --platform android
```

### iOS (Apple App Store)

```bash
eas build --platform ios
eas submit --platform ios
```

## Permissões necessárias

- **Microfone**: Gravação de áudio da leitura
- **Armazenamento**: Salvar arquivos temporários
- **Câmera**: (futuro) Reconhecimento facial opcional

## Troubleshooting

### App não inicia
```bash
npm install --legacy-peer-deps
npx expo start --clear
```

### Erro de permissões no Android
Verifique as permissões em `app.json` e conceda manualmente no dispositivo.

### Problema com Supabase
Valide `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` em `.env`.

## Roadmap

- [ ] Dashboard detalhado do professor
- [ ] Análise de prosódia e ritmo
- [ ] Integração com IA para feedback automático
- [ ] Relatórios em PDF
- [ ] Modo offline

## Contribuindo

1. Crie uma branch: `git checkout -b feature/sua-feature`
2. Faça commit: `git commit -am 'Adiciona feature'`
3. Faça push: `git push origin feature/sua-feature`
4. Abra um Pull Request

## Suporte

Para dúvidas ou relatos de bugs, abra uma [Issue](https://github.com/Emanuel-Pedagogo/Sonda-Para/issues).

## Licença

Projeto educacional — uso interno da instituição contratante.
