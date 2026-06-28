# Prompt mestre — Frontend NextJS para Bet Glaydson

Use este prompt em outra IA para gerar **somente o frontend** de um sistema de bolão de futebol chamado **Bet Glaydson**, com foco total em **NextJS**, experiência **mobile first**, tema escuro, visual moderno e integração com o backend NestJS já definido.

## Objetivo do sistema

Criar uma aplicação NextJS completa para um bolão de mata-mata, com login, onboarding inicial com guia de pontuação, telas de análise, estatísticas, palpites individuais, ranking geral, visualização de todos os palpites e um mapa estilo mata-mata muito intuitivo. A experiência deve ser pensada primeiro para celular, mas responsiva para desktop.

## Identidade visual

- Nome do app: **Bet Glaydson**.
- Tema predominante: escuro.
- Cores principais: vermelho e tons derivados, com contraste forte.
- Visual moderno, limpo e intuitivo.
- Usar muitos ícones relacionados a dinheiro, aposta, troféu, gráfico, calendário, escudo, bola e ranking.
- Priorizar componentes com aparência premium e leitura fácil em mobile.
- O menu deve ser bem estruturado e organizado por áreas claras.

## Stack obrigatória

- NextJS.
- TypeScript.
- Vite.
- React Router.
- Axios ou fetch centralizado.
- Zustand ou Context API para estado global, se necessário.
- Lucide React, React Icons ou equivalente moderno.
- Tailwind CSS ou outro sistema de styling moderno compatível com design mobile first.
- Modal, toast e componentes de interface reutilizáveis.
- Mapa estilo mata-mata com visual de bracket/tournament tree.

## Regras de acesso

- A página inicial pública pode existir sem login.
- Todas as áreas internas do sistema devem exigir login.
- Após autenticação, o usuário acessa as telas do bolão.
- Se o usuário não estiver logado, bloquear navegação para páginas privadas.
- Manter fluxo de login persistente com token.

## Integração com o backend

O frontend deve ser criado com base no backend já planejado, então a IA precisa considerar:

- JWT no login.
- Rota pública apenas para login.
- Rota protegida para perfil do usuário.
- Rotas para partidas, palpites, ranking, estatísticas, dashboard e fase.
- Usuário pode ver todos os palpites dos outros usuários.
- Usuário pode acompanhar o placar geral.
- Palpites são liberados por fase.
- Palpites só podem ser editados até 1 hora antes do jogo.
- O backend entrega dados consolidados de ranking, placar e status das fases.

## Variáveis de ambiente

Criar e documentar `.env` para o frontend com variáveis como:

```env
VITE_API_BASE_URL=
VITE_APP_NAME=Bet Glaydson
VITE_APP_THEME=dark
VITE_APP_PRIMARY_COLOR=red
```

A IA deve usar essas variáveis corretamente no React/Vite e explicar como configurar `.env`, `.env.development` e `.env.production`.

## Fluxo inicial do usuário

### Página pública inicial

- Deve existir uma landing page simples e objetiva.
- Essa página não precisa de login para ser vista.
- Deve apresentar o app, destacar a pontuação, os diferenciais e um CTA para entrar.
- Deve ser visualmente forte, com tema escuro e vermelho.

### Login

- Criar tela de login muito moderna.
- Campo de usuário e senha.
- Botão de entrar.
- Feedback visual de carregamento e erro.
- Layout otimizado para celular.
- Se o login for bem-sucedido, redirecionar para a área privada.

### Onboarding inicial

Ao entrar pela primeira vez, o usuário deve ver um **guia de pontuação** com navegação por etapas.

- A primeira vez no login deve abrir um onboarding explicando como funciona a pontuação.
- O guia deve ser curto, elegante e fácil de entender.
- Deve ter botões **“Seguinte”** e **“Pular”**.
- Deve funcionar em mobile com navegação em carrossel ou etapas.
- O guia deve explicar:
  - como funciona o mata a mata
  - como pontua por fase
  - como funciona o bônus de placar exato
  - que os palpites podem ser vistos por todos os usuários
  - que a fase atual pode ser destravada para palpites
  - que o palpite trava 1 hora antes do jogo

## Telas obrigatórias

A IA deve estruturar todas as telas abaixo, com navegação clara e componentes reutilizáveis.

### 1. Landing page pública

- Apresentação do Bet Glaydson.
- Destaques da pontuação.
- CTA para login.
- Blocos com ícones de dinheiro, troféu e campeonato.
- Pode mostrar um resumo simplificado do funcionamento, mas sem exigir login.

### 2. Login

- Formulário de autenticação.
- Design mobile first.
- Ícones modernos.
- Fundo escuro com destaque em vermelho.
- Validação de campos.

### 3. Onboarding de pontuação

- Sequência de telas ou cards.
- Botões “Seguinte” e “Pular”.
- Enfatizar a lógica de pontuação do bolão.
- Explicar fases do mata a mata de forma visual.

### 4. Dashboard principal

- Mostrar placar geral.
- Mostrar ranking geral.
- Mostrar fases liberadas e travadas.
- Mostrar próximos jogos.
- Mostrar status dos palpites.
- Mostrar como a pontuação funciona em destaque na home.
- Deve ser a tela mais importante após login.

### 5. Menu principal

- Menu bem estruturado.
- Pode ser inferior no mobile e lateral no desktop.
- Itens claros, intuitivos e com ícones modernos.
- Deve conter pelo menos:
  - Início
  - Palpites
  - Ranking
  - Estatísticas
  - Análise
  - Mapa do mata a mata
  - Perfil
  - Sair

### 6. Mapa estilo mata a mata

- Tela visual do bracket.
- Mostrar os confrontos por fase.
- Destacar quem já está classificado, quem ainda tem jogo e o status de cada partida.
- Permitir navegação visual por 16 avos, oitavas, quartas, semifinal e final.
- Essa tela deve ser bonita, clara e muito intuitiva no mobile.
- Exibir placares e palpites associados aos jogos.

### 7. Palpites gerais

- Tela para ver todos os palpites dos usuários.
- Mostrar por fase, por jogo e por usuário.
- Deve permitir comparação entre amigos.
- Deve ficar claro quem palpitou o quê.
- Ideal para provocar disputa entre os participantes.

### 8. Palpite individual

- Tela de palpites de cada usuário.
- Mostrar apenas o que o usuário apostou e também a relação com o restante do grupo se permitido.
- Destaque para placar previsto, pontuação e status do palpite.
- Mostrar se ainda está editável ou bloqueado.

### 9. Ranking

- Tela de ranking geral.
- Mostrar posição, nome, pontos, placares exatos e desempate.
- Visual forte, com badges, cores e destaque dos primeiros colocados.
- Mostrar também placar geral acumulado do bolão.

### 10. Análise

- Tela analítica com visão estratégica do bolão.
- Mostrar tendências de palpites, fases abertas, jogos com mais apostas e distribuição dos palpites.
- Cards visuais com ícones e números.
- Foco em visualização simples e agradável no mobile.

### 11. Estatísticas

- Tela com gráficos e cards.
- Estatísticas por usuário.
- Estatísticas por partida.
- Percentual de acertos.
- Quantidade de placares exatos.
- Pontos por fase.
- Mostrar dados consumidos do backend de forma clara.

### 12. Perfil

- Dados do usuário autenticado.
- Pontuação total.
- Últimos palpites.
- Estatísticas pessoais.
- Status de acesso.

## Requisitos de UX

- Tudo deve ser muito intuitivo.
- Priorizar leitura rápida e ações simples.
- O aplicativo deve funcionar bem principalmente no mobile.
- Usar cards, badges, progress bars, chips e listas visuais.
- Animar transições com suavidade.
- Preferir poucos cliques para chegar ao que importa.
- Exibir feedback visual em carregamento, erro, sucesso e bloqueio.
- A navegação deve deixar claro onde o usuário está.

## Requisitos visuais extras

- Usar muitos ícones modernos.
- Usar destaque visual para dinheiro, apostas e premiação.
- Tema escuro dominante com vermelho como cor de ação.
- Tipografia forte e limpa.
- Componentes com aparência premium.
- Header compacto.
- Botões grandes no mobile.
- Espaçamento confortável.

## Estrutura de pastas esperada

A IA deve propor uma estrutura organizada como:

- `src/components`
- `src/pages`
- `src/layouts`
- `src/routes`
- `src/services`
- `src/hooks`
- `src/context` ou `src/store`
- `src/utils`
- `src/assets`
- `src/styles`
- `src/types`

## Componentes que devem existir

- Navbar/Menu.
- Bottom navigation para mobile.
- Card de pontuação.
- Card de ranking.
- Card de jogo.
- Card de fase.
- Card de estatística.
- Bracket/mata a mata.
- Modal de onboarding.
- Loading skeleton.
- Toast de feedback.
- Botão primário e secundário.
- Badge de status.
- Seletor de fase.

## Integração de dados

A IA deve gerar o frontend considerando consumo real da API do backend, incluindo:

- login
- perfil autenticado
- ranking
- palpites do usuário
- palpites de todos os usuários
- partidas por fase
- status das fases
- dashboard
- estatísticas
- análise

## Regras específicas de acesso

- Todos os posts e telas internas só podem ser acessados com login.
- A página inicial pública não exige login.
- Depois de logado, o usuário não deve voltar para login salvo logout.
- Deve haver proteção de rotas e redirecionamento automático.

## Documentação esperada no frontend

- Criar README do frontend.
- Explicar setup local.
- Explicar `.env`.
- Explicar como apontar para o backend.
- Explicar como rodar em desenvolvimento e produção.
- Explicar estrutura de pastas.
- Explicar fluxo de autenticação e onboarding.

## Qualidade de código exigida

- Código limpo e escalável.
- Componentização correta.
- Evitar repetição.
- Separar lógica de UI e serviços.
- Tipagem forte com TypeScript.
- Responsividade real.
- Acessibilidade básica.
- Não deixar a tela poluída.

## Saída esperada da IA

A resposta deve entregar:

1. Estrutura completa do frontend.
2. Lista de telas com rotas.
3. Componentes principais.
4. Fluxo de login e onboarding.
5. Layout mobile first.
6. Tema escuro vermelho.
7. Ícones modernos.
8. Exemplo de integração com backend.
9. Arquivo `.env.example`.
10. README do frontend.

## Instrução final para a IA

Gere um frontend completo em **NextJS**, com foco em **mobile first**, tema escuro, visual moderno, navegação intuitiva e telas bem estruturadas para o bolão **Bet Glaydson**. O resultado deve parecer pronto para produção visual e funcionar perfeitamente em conjunto com o backend NestJS já planejado.
