# 🦴 Bone Densitometry Simulator

Aplicativo **React Native / Expo** que simula um exame de **densitometria óssea (DXA)**
para fins **educacionais**. O operador fotografa ou carrega uma imagem do próprio
celular, define os pacientes, escolhe a região anatômica (coluna lombar, fêmur, punho
ou corpo total) e o app simula o escaneamento, calcula indicadores (T-score, Z-score,
BMD) e gera um relatório em PDF.

> ⚠️ **Aviso**: este software é um **simulador educacional**. Não substitui equipamento
> médico real e não deve ser utilizado para diagnóstico clínico.

---

## 📑 Sumário

- [Recursos](#-recursos)
- [Arquitetura](#-arquitetura)
- [Requisitos](#-requisitos)
- [Instalação](#-instalação)
- [Executando o app](#-executando-o-app)
- [Build de produção (EAS)](#-build-de-produção-eas)
- [Estrutura de pastas](#-estrutura-de-pastas)
- [Fluxo de navegação](#-fluxo-de-navegação)
- [Persistência de dados](#-persistência-de-dados)
- [Compatibilidade cross-platform](#-compatibilidade-cross-platform)
- [Boas práticas / Pegadinhas](#-boas-práticas--pegadinhas)
- [Scripts disponíveis](#-scripts-disponíveis)

---

## ✨ Recursos

- 📋 **Cadastro de pacientes** com dados pessoais, físicos, etnia e operador
- 📷 **Seleção de imagem da galeria** do próprio dispositivo (persistida em base64)
- 🎞️ **Animação de escaneamento** com reveal line de cima para baixo
- 🎯 **ROIs interativos** (regiões de interesse) para 4 tipos de exame:
  - Coluna Lombar (L1–L4)
  - Fêmur Proximal (Colo, Trocânter, Ward, Total)
  - Punho / Antebraço (Rádio 33%, Ultra-distal, Médio)
  - Corpo Total (regiões segmentadas)
- 📊 **Cálculos simulados** de BMD, T-score, Z-score
- 📄 **Relatório em PDF** (`expo-print`) com compartilhamento (`expo-sharing`)
- 💾 **Backups automáticos e manuais** (exporta/restaura estado completo)
- 🌗 **Tema claro / escuro** com persistência
- 🔒 Dados 100% **locais** (AsyncStorage). Nada é enviado para servidores externos.

---

## 🏗 Arquitetura

- **Framework**: [Expo SDK 54](https://docs.expo.dev/) + React Native 0.81 + React 19
- **Navegação**: `@react-navigation/native-stack` (headerShown: false; headers custom)
- **Persistência**: `@react-native-async-storage/async-storage`
- **Imagens**: `expo-image-picker` + `expo-file-system` (conversão para data URI base64)
- **PDF**: `expo-print` + `expo-sharing`
- **Ícones**: `@expo/vector-icons` (FontAwesome5)
- **Gráficos**: `react-native-svg`
- **Tema global**: `ThemeContext` ([src/contexts/ThemeContext.js](src/contexts/ThemeContext.js))

### Princípios do projeto

1. **Sem imagens estáticas "hardcoded" de exames**: o operador sempre fornece a
   imagem via galeria. Isso evita quebra de build no Metro por arquivo ausente.
2. **Platform-safe**: código escrito para rodar em Android, iOS **e** Web — sem
   depender de APIs específicas de plataforma sem fallback.
3. **Sem dados sensíveis em nuvem**: tudo roda offline.

---

## 📋 Requisitos

- Node.js **≥ 18**
- npm ou yarn
- Expo CLI (`npx expo` já basta — não precisa instalar global)
- Para build nativo:
  - **Android**: Android Studio + JDK 17 (ou usar EAS Build)
  - **iOS**: macOS + Xcode 15+ (ou usar EAS Build)
- Conta [Expo EAS](https://expo.dev/) para builds em nuvem

---

## 📦 Instalação

```bash
git clone <repo-url>
cd Bone-Densitometry-Simulator-master
npm install
```

---

## 🚀 Executando o app

### Desenvolvimento (Expo Go ou Dev Client)

```bash
npm run start        # abre o DevTools do Expo
npm run android      # roda em emulador/dispositivo Android
npm run ios          # roda em simulador/dispositivo iOS (requer macOS)
npm run web          # abre no navegador (http://localhost:8081)
```

Durante o desenvolvimento, se fizer alterações em assets e o Metro reclamar, limpe
o cache:

```bash
npx expo start -c
```

---

## 📦 Build de produção (EAS)

O projeto já tem [eas.json](eas.json) configurado com três perfis:

| Perfil | Distribuição | Descrição |
| --- | --- | --- |
| `development` | interna | Dev Client com Expo Dev Tools |
| `preview` | interna (APK) | APK instalável para QA em Android |
| `production` | loja | Auto-increment de versão, build para Play/App Store |

```bash
# Login na Expo
npx eas login

# Build preview (APK p/ Android)
npx eas build --profile preview --platform android

# Build produção para as duas plataformas
npx eas build --profile production --platform all

# Submit para as lojas
npx eas submit --platform android
npx eas submit --platform ios
```

O projeto id EAS está em [app.json](app.json) (`extra.eas.projectId`).

---

## 🗂 Estrutura de pastas

```
├── App.js                    # Entry point — NavigationContainer + Stack
├── index.js                  # registerRootComponent
├── app.json                  # Config do Expo (ícone, splash, bundle id)
├── eas.json                  # Perfis de build EAS
├── package.json
├── assets/
│   └── icons/                # Ícones do app (únicos assets estáticos)
├── screens/                  # Telas (uma por arquivo)
│   ├── HomeScreen.js
│   ├── CadastroScreen.js
│   ├── ListaScreen.js
│   ├── ExameDetalhesScreen.js
│   ├── ScanScreen.js
│   ├── ResultadoColunaScreen.js
│   ├── ResultadoFemurScreen.js
│   ├── ResultadoPunhoScreen.js
│   ├── ResultadoCorpoTotalScreen.js
│   ├── RelatorioScreen.js
│   ├── BackupsScreen.js
│   ├── ConfiguracoesScreen.js
│   ├── SobreScreen.js
│   ├── ManualScreen.js
│   ├── PrivacidadeScreen.js
│   └── TermosDeUsoScreen.js
├── src/
│   ├── components/
│   │   ├── BaseLayout.js
│   │   ├── CustomAlert.js        # Alert cross-platform estilizado
│   │   ├── DensitometryChart.js  # Gráfico BMD vs idade (SVG)
│   │   └── OptimizedImage.js     # Image + loader + error fallback
│   ├── contexts/
│   │   └── ThemeContext.js       # Tema claro/escuro persistido
│   ├── hooks/
│   │   └── useCustomAlert.js
│   └── styles/
│       └── theme.js              # Colors, spacing, typography legacy
└── utils/
    └── storage.js                # AsyncStorage CRUD + backups + hash imagens
```

---

## 🧭 Fluxo de navegação

```
Home
 ├─▶ Lista ─▶ ExameDetalhe ─▶ Relatorio
 ├─▶ Cadastro ─▶ Scan ─▶ ResultadoColuna / ResultadoFemur /
 │                         ResultadoPunho / ResultadoCorpoTotal ─▶ Relatorio
 ├─▶ Sobre
 └─▶ Configuracoes
       ├─▶ Backups
       ├─▶ Privacidade
       ├─▶ TermosDeUso
       └─▶ Manual
```

A tela de **Scan** escolhe dinamicamente qual `Resultado*Screen` abrir com base no
campo `exame`:

| `exame` (valor) | Tela destino |
| --- | --- |
| `Coluna Lombar` | `ResultadoColuna` |
| `Fêmur (Proximal)` | `ResultadoFemur` |
| `Punho (Antebraço)` | `ResultadoPunho` |
| `Corpo Total (Full Body)` | `ResultadoCorpoTotal` |

---

## 💾 Persistência de dados

Tudo é armazenado localmente via [AsyncStorage](https://react-native-async-storage.github.io/async-storage/),
em 3 chaves:

| Chave | Conteúdo |
| --- | --- |
| `PACIENTES` | Array de pacientes/exames completos |
| `IMAGENS_EXAMES` | Imagens serializadas em base64 com hash único |
| `BACKUPS_LISTA` | Snapshots completos de `PACIENTES` + `IMAGENS_EXAMES` |
| `theme_dark` | `"true"` \| `"false"` — tema ativo |

Cada imagem recebe um **hash** (ex: `IMG_ABC123_XYZ`) e é gravada como
`data:image/jpeg;base64,...`. O paciente armazena tanto a URI direta (`imagemCustomizada`)
quanto o hash (`imagemHash`) — assim o app pode recuperar imagens de pacientes
vindos de um backup mesmo que a URI do sistema de arquivos tenha mudado.

Funções principais em [utils/storage.js](utils/storage.js):

- `salvarPaciente(p)`, `atualizarPaciente(p)`, `deletarPaciente(id)`
- `carregarPacientes()`, `deletarTodosPacientes()`
- `salvarImagemExame(uri, tipo)`, `buscarImagemPorHash(hash)`
- `criarBackup(nome)`, `listarBackups()`, `restaurarBackup(id)`, `deletarBackup(id)`

---

## 🌐 Compatibilidade cross-platform

Este projeto foi revisado para funcionar igual em **Android**, **iOS** e **Web**.
Cuidados aplicados:

### 1. Imagens

- **Nenhum `require('../assets/xxx.jpg')` hardcoded** para imagens de exame.
  O Metro falha em **qualquer** plataforma se o arquivo não existir — iOS ainda
  é pior por ser case-sensitive.
- Imagens do usuário são salvas como **data URI base64**, portanto sobrevivem
  a restarts, backups e navegam entre plataformas sem depender de caminho de FS.
- No Web, `FileSystem.readAsStringAsync` não existe: usamos `fetch` + `FileReader`
  para converter blob em base64.

### 2. Image Picker

- `ImagePicker.MediaTypeOptions.Images` com fallback para `['images']` (SDK novo).
- `allowsEditing` é desativado no Web (não suportado).

### 3. Date Picker

- `@react-native-community/datetimepicker` só aparece como fallback.
  O calendário principal é um **Modal customizado** que funciona igual em
  todas as plataformas.

### 4. Alertas

- `Alert.alert` tem UI inconsistente no Web. Por isso usamos o componente
  [CustomAlert](src/components/CustomAlert.js) + hook [useCustomAlert](src/hooks/useCustomAlert.js)
  em todas as telas novas. `Alert.alert` só é usado em telas legadas (ex: confirmação
  de exclusão em ExameDetalhesScreen).

### 5. Fontes

- `Font.loadAsync({...FontAwesome5.font})` é feito no App.js antes de renderizar.
- Sem bloqueio em Web (onde fontes já são baixadas pelo browser).

### 6. Gestos e animações

- `useNativeDriver: true` sempre que possível (não funciona com `width`/`height` — nesses
  casos usamos `useNativeDriver: false`).
- `PanResponder` funciona em web via pointer events do `react-native-web`.

### 7. Orientação de tela

- `expo-screen-orientation` é usado nos `Resultado*Screen` para permitir landscape
  nos editores de ROI. É no-op no Web.

---

## ⚠️ Boas práticas / Pegadinhas

### Ao adicionar uma nova imagem estática no projeto
1. Coloque em `assets/` (ou subpasta).
2. Use `require('../assets/seu-arquivo.ext')` com string literal — o Metro **não
   aceita caminhos dinâmicos** (`require('./' + nome)` quebra o build).
3. Teste em Android **e** iOS (case-sensitive). `Foto.JPG` ≠ `foto.jpg` no iOS.

### Ao adicionar uma nova tela
1. Crie em `screens/` seguindo o padrão das demais.
2. Registre em [App.js](App.js) dentro do `Stack.Navigator`.
3. **Importe a tela no topo do arquivo**. (Já tivemos crash por esquecimento.)
4. Use `useTheme()` para cores — nunca hardcode.

### Ao carregar `route.params`
- Sempre use default seguro:
  ```js
  const { id, nome } = route.params || {};
  ```
  Isso evita crash ao abrir a tela direto por deep link sem params.

### Para a imagem do exame
- Use `{ uri: paciente.imagemCustomizada }` no `<Image>`.
- Se não houver URI, renderize um placeholder — nunca passe `null` direto.

---

## 🛠 Scripts disponíveis

```bash
npm run start       # expo start (DevTools)
npm run android     # expo run:android
npm run ios         # expo run:ios
npm run web         # expo start --web
```

---

## 📄 Licença

`0BSD` — veja [package.json](package.json).

---

## 👥 Créditos

Projeto desenvolvido como ferramenta educacional. Sem afiliação com fabricantes de
equipamentos DXA reais (GE Lunar, Hologic, etc.).
