# Sistema de Pedidos - FilaZero

## Visão Geral

O sistema de pedidos foi completamente reestruturado para usar as tabelas criadas pelo usuário:

1. **pontos_atendimento_pedidos** - Gerencia os pontos de atendimento ativos (mesas, comandas) com pedidos
2. **pedidos** - Armazena os pedidos realizados
3. **itens_pedido** - Contém os itens de cada pedido
4. **complementos** - Para uso futuro
5. **complementos_produtos** - Para uso futuro
6. **complementos_item** - Para uso futuro

**Nota**: A tabela `pontos_atendimento` existente é usada apenas para **configuração** (quantas mesas, comandas, etc.), enquanto `pontos_atendimento_pedidos` armazena os **pedidos ativos** por ponto.

## Estrutura das Tabelas

### 1. pontos_atendimento_pedidos (CRIADA PELO USUÁRIO)
```sql
CREATE TABLE pontos_atendimento_pedidos (
    id SERIAL PRIMARY KEY,
    estabelecimento_id INT NOT NULL REFERENCES estabelecimentos(id),
    identificacao VARCHAR(50) NOT NULL,  -- "Mesa 1", "Comanda 4", etc.
    nome_ponto VARCHAR(150) NOT NULL,   -- Nome do pedido (ex: "Pedido João")
    status VARCHAR(20) NOT NULL DEFAULT 'ocupada',
    usuario_id INT REFERENCES usuarios(id),  -- Usuário que está atendendo
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2. pedidos (CRIADA PELO USUÁRIO)
```sql
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    estabelecimento_id INT NOT NULL REFERENCES estabelecimentos(id),
    ponto_atendimento_id INT NOT NULL REFERENCES pontos_atendimento_pedidos(id),
    id_forma_pagamento INT REFERENCES formas_pagamento(id),
    status_pedido VARCHAR(20) NOT NULL DEFAULT 'pendente',
    desconto NUMERIC(10,2) DEFAULT 0,
    acrescimo NUMERIC(10,2) DEFAULT 0,
    valor_total NUMERIC(10,2) DEFAULT 0,
    cliente_id INT REFERENCES clientes(id),
    data_abertura TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_fechamento TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 3. itens_pedido (CRIADA PELO USUÁRIO)
```sql
CREATE TABLE itens_pedido (
    id SERIAL PRIMARY KEY,
    estabelecimento_id INT NOT NULL REFERENCES estabelecimentos(id),
    pedido_id INT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    id_produto INT NOT NULL REFERENCES produtos(id_produto),
    nome_item VARCHAR(150),
    quantidade NUMERIC(10,2) NOT NULL,
    preco_unitario NUMERIC(10,2) NOT NULL,
    total_item NUMERIC(10,2) GENERATED ALWAYS AS (quantidade * preco_unitario) STORED,
    status_item VARCHAR(20) DEFAULT 'aguardando_preparo',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 4. pontos_atendimento (EXISTENTE - APENAS CONFIGURAÇÃO)
```sql
-- Esta tabela já existe e gerencia a configuração dos pontos
-- NÃO é usada para armazenar pedidos ativos
CREATE TABLE pontos_atendimento (
  id SERIAL PRIMARY KEY,
  estabelecimento_id INTEGER UNIQUE NOT NULL,
  atendimento_mesas BOOLEAN DEFAULT false,
  atendimento_comandas BOOLEAN DEFAULT false,
  quantidade_mesas INTEGER DEFAULT 0,
  quantidade_comandas INTEGER DEFAULT 0,
  prefixo_comanda VARCHAR(20),
  atualizado_em TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  criado_em TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

## Fluxo de Funcionamento

### 1. Criação do Pedido
Quando o usuário clica em "Salvar" na página de ponto de atendimento:

1. **Frontend** envia:
   - `estabelecimento_id`
   - `nome_pedido` (do campo de texto)
   - `identificacao_ponto` (nome do ponto: "Mesa 1", "Comanda 4")
   - `itens` (array com produtos selecionados)
   - `valor_total` (soma dos itens)
   - `usuarios_id` (ID do usuário que está atendendo)

2. **Backend** processa:
   - Cria/atualiza registro em `pontos_atendimento_pedidos`
   - Cria registro em `pedidos`
   - Cria registros em `itens_pedido`
   - Retorna IDs criados

### 2. Dados Salvos

#### pontos_atendimento_pedidos
- `estabelecimento_id`: ID do estabelecimento
- `identificacao`: "Mesa 1", "Comanda 4", etc.
- `nome_ponto`: Nome do pedido (ex: "Pedido João")
- `status`: "ocupada"
- `usuario_id`: ID do usuário que está atendendo

#### pedidos
- `estabelecimento_id`: ID do estabelecimento
- `ponto_atendimento_id`: Referência ao ponto de atendimento
- `status_pedido`: "pendente"
- `valor_total`: Soma de todos os itens
- `data_abertura`: Timestamp atual

#### itens_pedido
- `estabelecimento_id`: ID do estabelecimento
- `pedido_id`: Referência ao pedido
- `id_produto`: ID do produto selecionado
- `nome_item`: Nome do produto
- `quantidade`: Quantidade selecionada
- `preco_unitario`: Preço do produto
- `total_item`: Calculado automaticamente (quantidade × preço)

## Endpoints

### POST /api/pedidos-ativos
Cria um novo pedido completo.

**Request Body:**
```json
{
  "estabelecimento_id": 1,
  "nome_pedido": "Pedido João",
  "identificacao_ponto": "Mesa 1",
  "valor_total": 45.50,
  "usuarios_id": 123,
  "itens": [
    {
      "id": 1,
      "nome": "Hambúrguer",
      "quantidade": 2,
      "valor": 22.75
    }
  ]
}
```

**Response:**
```json
{
  "message": "Pedido salvo com sucesso.",
  "pedido_id": 123,
  "ponto_atendimento_id": 456,
  "valor_total": 45.50
}
```

### GET /api/pedidos-ativos/:ponto_id/:estabelecimento_id
Busca pedido ativo por ponto de atendimento.

### POST /api/pedidos-ativos/excluir
Exclui um pedido e reseta o ponto de atendimento para disponível.

**Request Body:**
```json
{
  "estabelecimento_id": 1,
  "identificacao_ponto": "Mesa 01"
}
```

**Response:**
```json
{
  "message": "Pedido excluído com sucesso.",
  "identificacao_ponto": "Mesa 01",
  "ponto_resetado": true
}
```

## Funcionalidade de Exclusão

### **Como Funciona:**

1. **Clique no botão excluir** (lixeira vermelha) no Painel Detalhes
2. **Notificação de confirmação** aparece
3. **Clique em "Excluir"** para confirmar
4. **Sistema exclui**:
   - Todos os itens do pedido
   - O pedido
   - Reseta o ponto de atendimento

### **O que Acontece ao Excluir:**

- ✅ **Itens**: Todos os produtos são removidos
- ✅ **Pedido**: Registro do pedido é excluído
- ✅ **Ponto de atendimento**: Resetado para disponível
- ✅ **Status**: Muda de "ocupada" para "Disponível"
- ✅ **Nome do pedido**: Limpo (NULL)
- ✅ **Valor total**: Zera (R$ 0,00)
- ✅ **Tempo de abertura**: Limpo
- ✅ **Tempo de atividade**: Limpo
- ✅ **Usuário**: Limpo (NULL)

### **Resultado Final:**

```
ANTES (ocupada):
┌─────────────────────────┐
│ Mesa 01          [Ocupada] │
│ Pedido: João              │
│ Valor Total: R$ 45,50     │
│ Abertura: 14:30           │
│ Atividade: 15min          │
└─────────────────────────┘

DEPOIS (disponível):
┌─────────────────────────┐
│ Mesa 01        [Disponível] │
│ Valor Total: R$ 0,00        │
│ Abertura: --:--              │
│ Atividade: -                 │
└─────────────────────────┘
```

## Inicialização

As tabelas já foram criadas pelo usuário. O sistema apenas verifica se elas existem ao iniciar.

## Compatibilidade

O sistema mantém compatibilidade com:
- Tabela existente `pontos_atendimento` (configuração)
- Tabela antiga `pedidos_ativos` (se existir)
- Funcionalidades existentes de configuração de pontos

## Separação de Responsabilidades

- **`pontos_atendimento`**: Configuração (quantas mesas, comandas, etc.)
- **`pontos_atendimento_pedidos`**: Pedidos ativos por ponto (NÃO duplica)
- **`pedidos`**: Dados dos pedidos
- **`itens_pedido`**: Itens de cada pedido

## Como Funciona a Listagem

### 1. **Exibe TODAS as mesas/comandas configuradas**
- Se você configurou 4 mesas, exibe Mesa 01, Mesa 02, Mesa 03, Mesa 04
- Se você configurou 3 comandas, exibe CMD 01, CMD 02, CMD 03

### 2. **Não duplica pontos**
- Cada mesa/comanda aparece apenas UMA vez
- Ao salvar pedido, atualiza o ponto existente (não cria novo)

### 3. **Status e cores (Sistema Automático)**
- **🟢 Disponível**: Verde (sem pedido ativo, pronta para uso)
- **🟡 Aberto**: Amarelo (foi acessada mas sem itens)
- **🔴 Ocupada**: Vermelho (com pedido ativo e itens)
- **🔵 Em Atendimento**: Azul (usuário acessando no momento)

### 4. **Dados exibidos**
- **Identificação**: Mesa 01, CMD 02, etc.
- **Nome do pedido**: Nome digitado pelo usuário
- **Valor total**: Soma de todos os itens
- **Tempo de abertura**: Usa `criado_em` da tabela `pontos_atendimento_pedidos`
- **Tempo de atividade**: Calculado em tempo real no frontend (atualiza a cada minuto)
- **Status do pedido**: pendente, em_preparo, pronto

### 5. **Sistema de Status Automático**
- **Transições automáticas** baseadas nas ações do usuário
- **Bloqueio de acesso** quando mesa está "em atendimento"
- **Timeout automático** após 5 minutos de inatividade
- **Sincronização em tempo real** entre usuários

## Sistema de Tempo

### **Como Funciona:**

1. **`criado_em`** - Salva automaticamente quando o ponto é criado
2. **Horário de abertura** - Exibe o `criado_em` formatado (ex: 14:30)
3. **Tempo de atividade** - Calculado em tempo real:
   - Pega o `criado_em` atual
   - Calcula diferença com o momento atual
   - Atualiza automaticamente a cada minuto
   - Formato: "15min", "2h 30min"

### **Exemplo:**
```
Mesa 01 criada às 14:30
Às 14:45: Atividade: 15min
Às 15:00: Atividade: 30min  
Às 16:00: Atividade: 1h 30min
```

### **Vantagens:**
- ✅ **Tempo real** - Sempre atualizado
- ✅ **Sem banco** - Cálculo no frontend
- ✅ **Performance** - Não sobrecarrega o servidor
- ✅ **Precisão** - Atualiza a cada minuto

## Sistema de Status Automático

### Implementado ✅

O sistema agora inclui um **controle automático de status** para pontos de atendimento com as seguintes funcionalidades:

- **4 estados distintos**: Disponível, Aberto, Ocupada, Em Atendimento
- **Transições automáticas** baseadas nas ações do usuário
- **Bloqueio de acesso** quando mesa está sendo usada
- **Timeout automático** para prevenir travamentos
- **Sincronização em tempo real** entre usuários

### Documentação Completa

Para mais detalhes sobre o sistema de status, consulte:
- [SISTEMA_STATUS_PONTOS_ATENDIMENTO.md](./SISTEMA_STATUS_PONTOS_ATENDIMENTO.md)

### Como Usar

1. **Clique uma vez** na mesa para selecionar
2. **Clique novamente** para abrir (status muda para "Em Atendimento")
3. **Adicione itens** e salve (status muda para "Ocupada")
4. **Saia da mesa** (status muda para "Aberto" ou "Disponível")

### Benefícios

- **Controle total** sobre quem está usando cada mesa
- **Prevenção de conflitos** entre usuários
- **Status visual claro** com cores distintas
- **Operação automática** sem necessidade de configuração manual
