# 📚 Documentação do Sistema Bet Glaydson

## 🎯 Visão Geral

Sistema completo de bolão para a Copa do Mundo 2026, com suporte a **fase de grupos** (87 jogos em 12 grupos) e **mata-mata** (16 avos até final).

---

## 📁 Arquivos de Documentação

### 1. [prompt_v1.md](prompt_v1.md)
**Prompt Mestre do Frontend**
- Especificação completa do frontend Next.js
- Design system (tema escuro + vermelho)
- Regras de pontuação
- Mobile first
- Todas as telas e funcionalidades

### 2. [MIGRACAO_BACKEND.md](MIGRACAO_BACKEND.md)
**Guia de Migração do Backend**
- Adaptação dos schemas MongoDB para fase de grupos
- Script de migração dos 87 jogos do sistema antigo
- Novos endpoints (classificação, oitavas, placares manuais)
- Sistema de pontuação unificado
- Estrutura de dados do JSON antigo

### 3. [MIGRACAO_FRONTEND.md](MIGRACAO_FRONTEND.md) ⭐
**Guia de Migração do Frontend** (ATUALIZADO)
- **🆕 Novos endpoints de classificação em tempo real**
- **🆕 Geração automática de oitavas de final**
- **⚠️ Mapeamento crítico de jogos (placeholder → reais)**
- Componentes de grupos (GroupStandings, MatchCard)
- Páginas de grupos e classificação
- Exemplos práticos de uso dos endpoints
- Checklist completo de integração

---

## 🚀 Quick Start

### Backend (NestJS + MongoDB)
```bash
# Porta: 3001
npm install
npm run start:dev

# Swagger docs: http://localhost:3001/api/docs
```

### Frontend (Next.js)
```bash
# Porta: 3006
npm install
npm run dev

# Acesso: http://localhost:3006
```

---

## 🔑 Credenciais de Teste

### Admin
- **Email**: `alefe.gla@bolao.com`
- **Senha**: `419604`

### Usuário Normal
- **Email**: `user@example.com`
- **Senha**: `user123`

---

## 📡 Endpoints Principais

### Autenticação
- `POST /api/v1/auth/login` - Login

### Classificação (Tempo Real)
- `GET /api/v1/matches/standings/groups` - Classificação dos 12 grupos

### Admin
- `POST /api/v1/matches/generate-knockout` - Gerar oitavas de final
- `PATCH /api/v1/matches/:id/manual-score` - Definir placar manual
- `DELETE /api/v1/matches/:id/manual-score` - Remover placar manual

### Jogos
- `GET /api/v1/matches` - Todos os jogos (usar índice para mapear)
- `GET /api/v1/matches/stage/GROUP_STAGE` - Jogos da fase de grupos
- `GET /api/v1/matches/group/:group` - Jogos por grupo (A-L)
- `GET /api/v1/matches/round/:round` - Jogos por rodada (1-3)

### Palpites
- `GET /api/v1/predictions/my` - Meus palpites
- `POST /api/v1/predictions/:matchId` - Criar/atualizar palpite
- `GET /api/v1/predictions/match/:matchId` - Palpites de um jogo

---

## ⚠️ IMPORTANTE - Mapeamento de Jogos

Os jogos no banco estão com **times placeholder** até a API oficial da Copa 2026 ter dados.

### Como Mapear Corretamente:

```typescript
// ❌ ERRADO
const jogo5 = await fetch('/api/v1/matches/5')

// ✅ CERTO
const matches = await fetch('/api/v1/matches')
const data = await matches.json()
const jogo5 = data[4]  // Jogo 5 = índice 4
const jogo87 = data[86] // Jogo 87 = índice 86
```

**Os primeiros 87 jogos no array correspondem aos IDs 1-87 do sistema antigo.**

---

## 🤖 Processos Automáticos (Cron Jobs)

- **A cada 30 minutos**: Sync API + Classificação + Oitavas
- **A cada 5 minutos**: Calcular pontos dos palpites
- **Diariamente à meia-noite**: Limpar cache

---

## 📊 Estrutura do Sistema Antigo

### Palpites (87 jogos)
- **16 participantes**
- Formato: `"X x Y"` (string com espaços)
- Exemplo: `"2 x 1"`
- Arquivo: `palpites_bolao.json`

### Distribuição dos Jogos
- **Fase de Grupos**: 48 jogos (12 grupos × 4 jogos cada)
- **Oitavas**: 8 jogos
- **Quartas**: 4 jogos
- **Semis**: 2 jogos
- **3º Lugar**: 1 jogo
- **Final**: 1 jogo
- **TOTAL**: 87 jogos

---

## 🎨 Design System

- **Tema**: Escuro
- **Cor Principal**: Vermelho (#DC2626)
- **Layout**: Mobile first (bottom nav + sidebar desktop)
- **Ícones**: Lucide React
- **Componentes**: Cards, Badges, Buttons, Modal, Toast

---

## 📱 Páginas Principais

### Públicas
- `/` - Landing page
- `/login` - Autenticação

### Protegidas
- `/dashboard` - Dashboard principal
- `/groups` - Fase de grupos (filtros e palpites)
- `/standings` - Classificação dos grupos
- `/predictions` - Meus palpites
- `/predictions/all` - Todos os palpites
- `/bracket` - Mapa do mata-mata
- `/ranking` - Ranking geral
- `/statistics` - Estatísticas
- `/analysis` - Análise e insights
- `/profile` - Perfil do usuário

---

## ✅ Status de Implementação

### ✅ Concluído (Frontend)
- [x] Autenticação e rotas protegidas
- [x] Landing page com regras de pontuação
- [x] Onboarding inicial
- [x] Dashboard com stats e ranking top 5
- [x] Todas as páginas de mata-mata
- [x] Página de fase de grupos com filtros
- [x] Página de classificação dos grupos
- [x] Componente de classificação em tempo real
- [x] Botão admin para gerar oitavas
- [x] Modal de placar manual (admin)
- [x] Validação de datas e tratamento de erros
- [x] Mobile first em todas as telas

### 🔄 Pendente (Backend)
- [ ] Implementação do NestJS
- [ ] Migração dos 87 jogos
- [ ] Migração dos palpites do JSON antigo
- [ ] Endpoints de classificação
- [ ] Geração automática de oitavas
- [ ] Cron jobs de sincronização

---

## 🔗 Links Úteis

- **Swagger Backend**: http://localhost:3001/api/docs
- **Frontend Dev**: http://localhost:3006
- **GitHub Repository**: [seu-repo]
- **Documentação Next.js**: https://nextjs.org/docs
- **Documentação NestJS**: https://docs.nestjs.com

---

## 💡 Próximos Passos

1. ✅ **Frontend completo** - CONCLUÍDO
2. ⏳ **Implementar backend NestJS** - EM ANDAMENTO
3. ⏳ **Migrar dados do sistema antigo** - AGUARDANDO
4. ⏳ **Testar integração completa** - AGUARDANDO
5. ⏳ **Deploy em produção** - AGUARDANDO

---

## 📞 Suporte

Para dúvidas ou problemas, consulte:
1. [MIGRACAO_FRONTEND.md](MIGRACAO_FRONTEND.md) - Exemplos práticos
2. [MIGRACAO_BACKEND.md](MIGRACAO_BACKEND.md) - Estrutura de dados
3. Swagger docs do backend em `/api/docs`

---

**Última atualização**: 2026-06-22  
**Versão do Sistema**: 2.0 (Grupos + Mata-mata)
