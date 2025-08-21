# Troubleshooting - Erro "Estabelecimento não encontrado"

## Problema
Ao tentar cadastrar um usuário, o sistema retorna o erro:
```
Erro na requisição para /usuarios/criar: Error: Estabelecimento não encontrado.
```

**OU**

```
Erro na requisição para /usuarios/criar: Error: Erro interno ao criar usuário.
```

## Causas Possíveis

### 1. Tabelas não existem no banco
- As tabelas `estabelecimentos` e `usuarios` podem não ter sido criadas
- O banco de dados pode estar vazio

### 2. Estabelecimento ID incorreto
- O `estabelecimento_id` está sendo enviado como `1` (hardcoded)
- O usuário não está logado ou o `estabelecimentoId` não está no localStorage

### 3. Estrutura das tabelas incorreta
- Campos obrigatórios podem estar faltando
- Constraints podem estar incorretos
- Campo `email` pode ter constraint NOT NULL incorreta

## Soluções

### Passo 1: Verificar se as tabelas existem
Execute no seu banco PostgreSQL:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('estabelecimentos', 'usuarios');
```

### Passo 2: Criar as tabelas se necessário
Execute o script `server/scripts/check_tables.sql` no seu banco de dados.

### Passo 2.1: Corrigir constraint do campo email (se necessário)
Se o erro for sobre constraint do campo email, execute:
```sql
-- Remover constraint NOT NULL do campo email
ALTER TABLE usuarios ALTER COLUMN email DROP NOT NULL;
```

Ou execute o script `server/scripts/fix_email_constraint.sql`

### Passo 3: Verificar se existem estabelecimentos
```sql
SELECT * FROM estabelecimentos;
```

Se não houver estabelecimentos, crie um:
```sql
INSERT INTO estabelecimentos (nome, cnpj, setor) 
VALUES ('Meu Estabelecimento', '12.345.678/0001-90', 'Restaurante');
```

### Passo 4: Verificar o localStorage
No navegador, abra o DevTools (F12) e verifique:
```javascript
localStorage.getItem('estabelecimentoId')
localStorage.getItem('userId')
localStorage.getItem('user')
```

### Passo 5: Testar a API
Acesse: `http://localhost:3000/test`

Deve retornar algo como:
```json
{
  "status": "success",
  "estabelecimentos": [
    {
      "id": 1,
      "nome": "Meu Estabelecimento",
      "status": true
    }
  ],
  "total_estabelecimentos": 1
}
```

## Fluxo Correto

1. **Registro**: Usuário se registra → Cria estabelecimento + usuário
2. **Login**: Usuário faz login → Salva dados no localStorage
3. **Criar Usuário**: Sistema pega `estabelecimentoId` do localStorage

## Verificações no Código

### Frontend (FormUsuario.jsx)
```javascript
// Pega o estabelecimento_id do usuário logado
const estabelecimentoId = localStorage.getItem('estabelecimentoId');

if (!estabelecimentoId) {
  setError('Usuário não está logado ou estabelecimento não encontrado.');
  return;
}
```

### Backend (usuario.js)
```javascript
// Verifica se o estabelecimento existe
const estabelecimento = await db.query(
  'SELECT id, nome FROM estabelecimentos WHERE id = $1 AND status = true',
  [estabelecimento_id]
);
```

## Logs para Debug

O sistema agora gera logs detalhados:
- Dados recebidos para criar usuário
- Verificação de estabelecimento
- Criação do usuário
- Erros específicos

## Comandos para Testar

1. **Reiniciar o servidor**:
   ```bash
   cd server
   npm run dev
   ```

2. **Verificar logs do servidor** para identificar onde está falhando

3. **Testar endpoint de teste**: `http://localhost:3000/test`

4. **Verificar localStorage** no navegador

## Se o problema persistir

1. Verifique se o banco de dados está acessível
2. Confirme se as variáveis de ambiente estão corretas
3. Verifique se as tabelas têm a estrutura correta
4. Teste com um estabelecimento ID válido

## Funcionalidade de Toggle Status

### Como funciona:
- **Status `true` (ativo)**: Botão laranja para esquerda (ToggleLeft) - "Desativar"
- **Status `false` (inativo)**: Botão verde para direita (ToggleRight) - "Ativar"

### Teste da funcionalidade:
Execute o script `server/scripts/test_toggle_status.sql` para verificar se o toggle status está funcionando.

### Logs para debug:
O sistema gera logs detalhados quando o status é alterado:
- Feedback visual imediato (otimistic update)
- Chamada para API
- Recarregamento da lista
- Tratamento de erros com reversão visual
