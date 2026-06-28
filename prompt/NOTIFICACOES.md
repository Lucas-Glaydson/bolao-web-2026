# 🔔 Sistema de Notificações - Bet Glaydson

## Funcionalidades Implementadas

### 1. **Notificações de Pontos Conquistados**
O sistema monitora automaticamente seus palpites e notifica quando você ganha pontos:

- **+1 ponto** - Acertou o resultado (vitória, empate ou derrota)
- **+2 pontos** - Acertou o placar exato! 🎯

### 2. **Tipos de Notificações**

#### 📱 Toast (Notificação In-App)
- Sempre ativo
- Aparece no canto superior direito
- Duração: 6 segundos
- Verde especial para placares exatos
- Emojis: ✅ (acerto) e 🎯 (placar exato)

#### 🔔 Notificação do Navegador
- Requer permissão do usuário
- Funciona mesmo com a aba fechada
- Permite que você seja notificado em tempo real
- Pode ser configurada nas configurações do navegador

### 3. **Como Ativar Notificações**

#### Primeira Vez:
1. Ao entrar no app, aguarde 3 segundos
2. Um card aparecerá no canto da tela
3. Clique em **"Ativar"** para receber notificações
4. Ou clique em **"Agora Não"** para decidir depois

#### Depois:
1. Vá em **Perfil** (ícone do usuário)
2. Role até **"Notificações de Pontos"**
3. Clique em **"Ativar Notificações"**

### 4. **Monitoramento Automático**

O sistema verifica seus pontos automaticamente:
- ✅ **A cada 1 minuto** quando você está logado
- ✅ **Automaticamente** quando você abre o app
- ✅ **Apenas quando conectado** ao backend real

**Nota**: No modo mock (desenvolvimento), o monitoramento está desativado para economizar recursos.

### 5. **Privacidade e Segurança**

- ✅ Funciona apenas quando você está autenticado
- ✅ Dados salvos localmente (localStorage)
- ✅ Não envia dados pessoais
- ✅ Você pode desativar a qualquer momento

### 6. **Exemplo de Notificação**

```
🎯 Placar Exato!
+2 pontos em Brasil x Argentina
```

```
✅ Você Pontuou!
+1 ponto em França x Alemanha
```

## 🧪 Testando (Modo Development)

Com o modo mock ativo (`NEXT_PUBLIC_USE_MOCK_DATA=true`):

1. Os dados de pontos já estão mockados
2. O monitoramento automático está desativado
3. Use os toasts de sucesso ao salvar palpites para testar

## 🔧 Configuração Técnica

### Arquivos Criados:
- `lib/notifications.ts` - Serviço de notificações
- `lib/hooks/usePointsMonitor.ts` - Hook de monitoramento
- `components/ui/notification-prompt.tsx` - UI de permissão

### Integração:
- Adicionado em `app/(protected)/layout.tsx`
- Botão de toggle em `app/(protected)/profile/page.tsx`

## ⚙️ Configurações do Navegador

### Chrome/Edge:
1. Clique no ícone de cadeado na barra de endereço
2. Vá em "Configurações do site"
3. Procure "Notificações"
4. Ative ou desative

### Firefox:
1. Clique no ícone de escudo/informação na barra
2. Vá em "Permissões"
3. Ative ou desative "Notificações"

### Safari:
1. Safari → Preferências → Sites
2. Notificações
3. Localize o site e configure

## 📊 Status do Monitoramento

O sistema exibe no console:
- 🔔 "Monitoramento de pontos iniciado"
- 🔕 "Monitoramento de pontos parado"

## 🐛 Troubleshooting

**Notificações não aparecem?**
- Verifique se deu permissão ao navegador
- Verifique se está com o app aberto e logado
- Verifique o console para erros

**Recebeu notificação duplicada?**
- Normal se abrir o app em múltiplas abas
- O sistema salva o último estado conhecido

**Quer testar sem esperar?**
- Use o botão "Atualizar" na página de palpites
- O sistema verifica imediatamente

## 🎯 Próximas Melhorias

- [ ] Notificações de jogos próximos (deadline)
- [ ] Notificações de ranking (subiu de posição)
- [ ] Configurações personalizadas de notificação
- [ ] Histórico de notificações
- [ ] Sons customizados

---

**Desenvolvido para Bet Glaydson** 💰⚽
