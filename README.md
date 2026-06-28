# 💰 Bet Glaydson - Bolão Mata-mata

Sistema completo de palpites para competições de futebol no formato mata-mata. Desenvolvido com Next.js 16, React 19, TypeScript e Tailwind CSS.

## 🚀 Tecnologias

- **Next.js 16.2.9** - App Router
- **React 19.2.4** - Latest version
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Styling
- **Zustand 5** - State management
- **Axios** - HTTP client
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **date-fns** - Date formatting

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd bolao-mata-mata
```

2. Instale as dependências:
```bash
npm install --legacy-peer-deps
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

Edite `.env.local` com suas configurações:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_NAME="Bet Glaydson"
NEXT_PUBLIC_APP_THEME="dark"
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

5. Acesse http://localhost:3006

## 🏗️ Estrutura do Projeto

```
bolao-mata-mata/
├── app/                          # Next.js App Router
│   ├── (protected)/             # Rotas protegidas
│   │   ├── dashboard/           # Dashboard principal
│   │   ├── predictions/         # Palpites
│   │   ├── ranking/             # Ranking de usuários
│   │   ├── bracket/             # Mapa mata-mata
│   │   ├── statistics/          # Estatísticas
│   │   ├── analysis/            # Análise estratégica
│   │   ├── profile/             # Perfil do usuário
│   │   └── layout.tsx           # Layout com navegação
│   ├── login/                   # Página de login
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
│
├── components/                   # Componentes reutilizáveis
│   ├── ui/                      # Componentes base
│   │   ├── button.tsx           # Botão com variantes
│   │   ├── card.tsx             # Card container
│   │   ├── badge.tsx            # Status badges
│   │   ├── input.tsx            # Input com label
│   │   ├── loading.tsx          # Loading spinner
│   │   └── modal.tsx            # Modal dialog
│   ├── auth/                    # Componentes de autenticação
│   │   └── protected-route.tsx  # Route guard
│   ├── navigation/              # Navegação
│   │   ├── navbar.tsx           # Top bar
│   │   ├── bottom-nav.tsx       # Mobile bottom nav
│   │   └── sidebar.tsx          # Desktop sidebar
│   └── onboarding/              # Onboarding
│       └── onboarding-modal.tsx # Tutorial de 6 passos
│
├── lib/                         # Lógica de negócio
│   ├── api/                     # Serviços de API
│   │   ├── client.ts            # Axios instance
│   │   ├── auth.ts              # Autenticação
│   │   ├── matches.ts           # Partidas
│   │   ├── predictions.ts       # Palpites
│   │   ├── ranking.ts           # Ranking
│   │   └── stats.ts             # Estatísticas
│   ├── store/                   # Zustand stores
│   │   ├── auth.ts              # Auth state
│   │   └── onboarding.ts        # Onboarding state
│   ├── types.ts                 # TypeScript definitions
│   ├── constants.ts             # App constants
│   ├── utils.ts                 # Utility functions
│   └── date-utils.ts            # Date functions
│
└── public/                      # Assets estáticos
```

## 🎯 Funcionalidades

### ✅ Implementadas

- **Sistema de Autenticação**
  - Login com JWT
  - Proteção de rotas
  - Store de autenticação com Zustand

- **Navegação Completa**
  - Navbar responsiva
  - Sidebar desktop
  - Bottom nav mobile
  - Transições suaves

- **Onboarding**
  - Tutorial de 6 passos
  - Explicação do sistema
  - Regras de pontuação

- **Componentes UI**
  - Button (5 variantes)
  - Card e CardHeader
  - Badge (6 variantes)
  - Input com ícones
  - Loading states
  - Modal dialog

- **Landing Page**
  - Hero section
  - Explicação do sistema
  - Sistema de pontuação
  - CTAs

- **Dashboard**
  - Estatísticas gerais
  - Top 5 ranking
  - Próximas partidas
  - Ações rápidas

### 🚧 Em Desenvolvimento

- Página de Palpites (lista e formulário)
- Página de Ranking completo
- Mapa Mata-mata visual
- Página de Estatísticas
- Página de Análise
- Página de Perfil
- Visualização de todos os palpites

## 🔐 Credenciais de Teste

```
Admin:
  Email: admin@example.com
  Senha: admin123

Usuário:
  Email: user@example.com
  Senha: user123
```

## 📊 Sistema de Pontuação

| Fase | Pontos Base | Bônus Placar Exato |
|------|-------------|-------------------|
| 16 Avos de Final | 1 pt | 2 pts (1x2) |
| Oitavas de Final | 1 pt | 2 pts (1x2) |
| Quartas de Final | 1 pt | 2 pts (1x2) |
| Semifinal | 2 pts | 4 pts (2x2) |
| Final | 2 pts | 4 pts (2x2) |

### Regras

- ✅ Acerte o vencedor = pontos da fase
- 🎯 Acerte o placar exato = DOBRO dos pontos
- 🔒 Prazo de 1 hora antes do jogo
- 📢 Palpites públicos após o prazo
- 🔓 Fases desbloqueiam progressivamente

## 🎨 Design System

### Cores

```css
Primária: Red-600 (#dc2626)
Fundo: Slate-950 (#020617)
Cards: Slate-900 (#0f172a)
Bordas: Slate-800 (#1e293b)
Texto: Slate-50 (#f8fafc)
Texto Secundário: Slate-400 (#94a3b8)
```

### Breakpoints

```css
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

## 🛠️ Scripts

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start

# Lint
npm run lint
```

## 🌐 Backend

O frontend se conecta a uma API NestJS em:
```
http://localhost:3001/api/v1
```

### Endpoints principais:

```
POST   /auth/login
GET    /auth/profile
GET    /matches
GET    /matches/:id
POST   /predictions/:matchId
GET    /predictions/my
GET    /predictions/board
GET    /ranking
GET    /stats/dashboard
```

## 📝 Próximos Passos

1. ✅ Setup inicial do projeto
2. ✅ Sistema de autenticação
3. ✅ Componentes UI base
4. ✅ Navegação completa
5. ✅ Landing page e login
6. ✅ Dashboard
7. 🚧 Páginas de funcionalidades
8. ⏳ Testes unitários
9. ⏳ Documentação da API
10. ⏳ Deploy em produção

## 📄 Licença

Este projeto é privado e confidencial.

## 👥 Contato

Para dúvidas ou sugestões, entre em contato com o time de desenvolvimento.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
