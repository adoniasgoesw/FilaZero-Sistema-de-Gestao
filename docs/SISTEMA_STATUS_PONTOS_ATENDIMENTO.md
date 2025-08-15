# Sistema de Status Automático dos Pontos de Atendimento

## Visão Geral

O sistema implementa um controle automático de status para pontos de atendimento (mesas e comandas) com 4 estados distintos, gerenciando automaticamente as transições entre eles conforme as ações do usuário.

## Estados do Sistema

### 1. **Disponível** 🟢
- **Quando ocorre**: Estado inicial de todas as mesas/comandas
- **Características**:
  - Sem pedido ativo
  - Valor total = R$ 0,00
  - Sem cliente vinculado
  - Sem data de abertura
  - Sem tempo de atividade
- **Cor**: Verde
- **Ação permitida**: Pode ser aberta por qualquer usuário

### 2. **Aberto** 🟡
- **Quando ocorre**: Mesa foi acessada mas não tem itens
- **Características**:
  - Foi acessada pelo usuário
  - Sem itens no pedido
  - Valor total = R$ 0,00
  - Tem data de abertura
  - Tem tempo de atividade
- **Cor**: Amarelo
- **Ação permitida**: Pode ser acessada novamente pelo mesmo usuário

### 3. **Ocupada** 🔴
- **Quando ocorre**: Mesa tem pelo menos um item
- **Características**:
  - Tem pedido ativo
  - Tem itens listados
  - Valor total > R$ 0,00
  - Tem data de abertura
  - Tem tempo de atividade
- **Cor**: Vermelho
- **Ação permitida**: Pode ser acessada pelo usuário que criou o pedido

### 4. **Em Atendimento** 🔵
- **Quando ocorre**: Usuário está acessando a mesa no momento
- **Características**:
  - Bloqueia acesso de outros usuários
  - Status temporário (até usuário sair)
  - Timeout automático após 5 minutos de inatividade
- **Cor**: Azul
- **Ação permitida**: Apenas o usuário que está atendendo pode acessar

## Fluxo de Transições

```
Disponível → Usuário clica → Em Atendimento
     ↓
Usuário sai sem itens → Aberto
     ↓
Usuário adiciona item → Ocupada
     ↓
Usuário remove todos os itens → Disponível
```

## Implementação Técnica

### Backend

#### Novas Funções no Controller `pedidosAtivos.js`:

1. **`abrirPontoAtendimento`**
   - Muda status para "em_atendimento"
   - Verifica se não está sendo usado por outro usuário
   - Retorna erro 423 se bloqueado

2. **`fecharPontoAtendimento`**
   - Determina novo status baseado no estado atual
   - Se tem itens: mantém como "aberto"
   - Se não tem itens: volta para "disponível"

3. **`verificarDisponibilidadePonto`**
   - Verifica status atual do ponto
   - Implementa timeout de 5 minutos para "em_atendimento"
   - Retorna informações de disponibilidade

#### Rotas Adicionadas:

```javascript
POST /api/pontos-atendimento/abrir
POST /api/pontos-atendimento/fechar
GET /api/pontos-atendimento/disponibilidade/:estabelecimento_id/:identificacao_ponto
```

### Frontend

#### Hook Personalizado `useStatusPontosAtendimento`:

- Gerencia estado dos pontos em atendimento
- Implementa verificações automáticas de timeout
- Fornece funções para abrir/fechar pontos
- Sincroniza status em tempo real

#### Componente `ListagemPontosAtendimento`:

- Usa hook para gerenciar status
- Implementa lógica de clique duplo
- Verifica disponibilidade antes de abrir
- Exibe status visual com cores

#### Página `PontoAtendimento`:

- Fecha ponto automaticamente ao sair
- Implementa cleanup no unmount
- Gerencia transições de status

## Regras de Negócio

### 1. **Bloqueio de Acesso**
- Ponto "em atendimento" bloqueia outros usuários
- Retorna erro 423 (Locked) se tentar acessar
- Mensagem: "Este ponto já está sendo usado por outro usuário"

### 2. **Timeout Automático**
- Status "em atendimento" expira após 5 minutos
- Sistema detecta automaticamente e muda para "aberto"
- Previne travamentos por usuários que saíram sem fechar

### 3. **Transições Automáticas**
- **Disponível → Em Atendimento**: Ao clicar na mesa
- **Em Atendimento → Aberto**: Ao sair sem itens
- **Em Atendimento → Ocupada**: Ao salvar primeiro item
- **Ocupada → Disponível**: Ao excluir todos os itens

### 4. **Validações**
- Usuário deve estar logado
- Estabelecimento deve ter caixa aberto
- Apenas usuário que abriu pode fechar
- Verificações de permissão em todas as operações

## Exemplos de Uso

### Cenário 1: Mesa Nova
1. Mesa 01 está **Disponível** (verde)
2. Usuário clica → Status muda para **Em Atendimento** (azul)
3. Usuário sai sem adicionar itens → Status muda para **Aberto** (amarelo)
4. Outro usuário pode acessar (não está bloqueada)

### Cenário 2: Mesa com Pedido
1. Mesa 02 está **Aberta** (amarela)
2. Usuário adiciona item e salva → Status muda para **Ocupada** (vermelha)
3. Usuário acessa novamente → Status muda para **Em Atendimento** (azul)
4. Usuário remove todos os itens → Status volta para **Disponível** (verde)

### Cenário 3: Conflito de Usuários
1. Usuário A abre Mesa 03 → Status: **Em Atendimento** (azul)
2. Usuário B tenta acessar → Erro: "Ponto bloqueado por outro usuário"
3. Usuário A sai → Status muda para **Aberto** (amarelo)
4. Usuário B pode acessar agora

## Monitoramento e Debug

### Logs do Backend:
```javascript
console.log('🔗 Ponto aberto:', identificacao_ponto);
console.log('🔒 Ponto bloqueado:', identificacao_ponto);
console.log('✅ Ponto fechado:', identificacao_ponto);
```

### Status HTTP:
- `200`: Operação realizada com sucesso
- `423`: Ponto bloqueado por outro usuário
- `403`: Usuário não tem permissão
- `404`: Ponto não encontrado
- `500`: Erro interno do servidor

### Verificações Automáticas:
- Timeout de status a cada 30 segundos no frontend
- Verificação de disponibilidade a cada 30 segundos
- Cleanup automático de pontos abandonados

## Configuração

### Variáveis de Ambiente:
```env
# Timeout para status "em atendimento" (em minutos)
PONTO_ATENDIMENTO_TIMEOUT=5

# Intervalo de verificação de status (em segundos)
PONTO_ATENDIMENTO_CHECK_INTERVAL=30
```

### Banco de Dados:
- Tabela `pontos_atendimento_pedidos` gerencia status
- Campo `status` armazena estado atual
- Campo `atualizado_em` controla timeout
- Campo `usuario_id` identifica usuário atual

## Troubleshooting

### Problema: Mesa não muda de status
**Solução**: Verificar se o usuário tem permissão e se não há conflitos

### Problema: Mesa fica travada em "em atendimento"
**Solução**: Sistema detecta automaticamente após 5 minutos e corrige

### Problema: Usuário não consegue acessar mesa
**Solução**: Verificar se não está sendo usada por outro usuário

### Problema: Status não sincroniza entre usuários
**Solução**: Verificar se as rotas estão funcionando e se o hook está sendo usado

## Próximos Passos

1. **Implementar notificações em tempo real** usando WebSockets
2. **Adicionar histórico de mudanças de status** para auditoria
3. **Implementar sistema de permissões** por tipo de usuário
4. **Adicionar métricas de uso** dos pontos de atendimento
5. **Implementar backup automático** dos status em caso de falha
