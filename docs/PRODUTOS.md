# Sistema de Produtos - FilaZero

## Visão Geral

O sistema de produtos permite cadastrar e gerenciar todos os itens vendidos pelo estabelecimento, com suporte a categorias, controle de estoque, tempo de preparo e personalização visual.

## Funcionalidades

### ✅ CRUD Completo
- **Criar**: Adicionar novos produtos
- **Listar**: Visualizar todos os produtos do estabelecimento
- **Editar**: Modificar produtos existentes
- **Excluir**: Remover produtos permanentemente
- **Status**: Ativar/desativar produtos

### 🎨 Personalização Visual
- **Imagem**: Upload de arquivo de imagem (JPG, PNG, GIF)
- **Cor + Ícone**: Seleção de cor personalizada e emoji/ícone
- **Regra**: Imagem OU cor+ícone (não ambos)

### 📊 Controles de Negócio
- **Estoque**: Controle opcional de quantidade em estoque
- **Tempo de Preparo**: Controle opcional de tempo de preparo
- **Preços**: Valor de venda (obrigatório) e custo (opcional)
- **Categorias**: Vinculação obrigatória a categorias existentes

### 🔒 Segurança
- Validação de arquivos (tipo e tamanho)
- Nomes únicos por estabelecimento
- Controle de acesso por cargo
- Validação de categorias por estabelecimento

## Estrutura do Banco

```sql
CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    estabelecimento_id INTEGER NOT NULL,
    categoria_id INTEGER NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    imagem_url TEXT,
    cor VARCHAR(20),
    icone VARCHAR(50),
    valor_venda DECIMAL(10,2) NOT NULL,
    valor_custo DECIMAL(10,2),
    habilitar_estoque BOOLEAN DEFAULT false,
    quantidade_estoque INTEGER DEFAULT 0,
    habilitar_tempo_preparo BOOLEAN DEFAULT false,
    tempo_preparo INTEGER DEFAULT 0,
    status BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### POST `/api/produtos`
Criar novo produto
```json
{
  "estabelecimento_id": 1,
  "categoria_id": 2,
  "nome": "X-Burger",
  "descricao": "Hambúrguer delicioso",
  "valor_venda": 25.90,
  "valor_custo": 15.00,
  "habilitar_estoque": true,
  "quantidade_estoque": 50,
  "habilitar_tempo_preparo": true,
  "tempo_preparo": 15,
  "cor": "#FF6B6B",
  "icone": "🍔"
}
```

### GET `/api/produtos/estabelecimento/:id`
Listar produtos por estabelecimento

### GET `/api/produtos/:id`
Buscar produto por ID

### PUT `/api/produtos/:id`
Atualizar produto

### DELETE `/api/produtos/:id`
Excluir produto

## Upload de Imagens

### Configuração
- **Pasta**: `server/uploads/`
- **Tamanho máximo**: 5MB
- **Formatos**: JPG, PNG, GIF
- **Nomenclatura**: `produto-{timestamp}-{random}.{ext}`

### Exemplo com FormData
```javascript
const formData = new FormData();
formData.append('estabelecimento_id', 1);
formData.append('categoria_id', 2);
formData.append('nome', 'X-Burger');
formData.append('valor_venda', 25.90);
formData.append('imagem', fileInput.files[0]);

await produtosAPI.criar(formData);
```

## Validações

### Campos Obrigatórios
- `estabelecimento_id`
- `categoria_id`
- `nome`
- `valor_venda`

### Regras de Negócio
1. **Nome único**: Não pode existir produto com mesmo nome no mesmo estabelecimento
2. **Visual**: Deve ter imagem OU cor+ícone (não ambos)
3. **Estabelecimento**: Deve existir e estar ativo
4. **Categoria**: Deve existir, estar ativa e pertencer ao estabelecimento
5. **Arquivo**: Apenas imagens válidas até 5MB
6. **Estoque**: Se habilitado, quantidade é obrigatória
7. **Tempo**: Se habilitado, tempo é obrigatório

## Componentes Frontend

### FormProduto
- Formulário com tabs (Detalhes, Complementos, Receita)
- Upload de imagem com preview
- Seletor de cor e ícone
- Dropdown de categorias do banco
- Controles de estoque e tempo de preparo
- Validação em tempo real

### ListagemProdutos
- Tabela responsiva (desktop/mobile)
- Exibição de imagem ou cor+ícone
- Informações de categoria, preço, estoque e tempo
- Ações: editar, excluir, toggle status
- Loading states e feedback visual

## Fluxo de Uso

### 1. Criar Produto
1. Acessar página de Produtos
2. Clicar em "Novo Produto"
3. Preencher nome, categoria e valor de venda
4. Escolher: imagem OU cor+ícone
5. Configurar estoque e tempo de preparo (opcional)
6. Clicar em "Cadastrar Produto"

### 2. Editar Produto
1. Clicar no botão "Editar" do produto
2. Modificar campos desejados
3. Salvar alterações

### 3. Excluir Produto
1. Clicar no botão "Excluir"
2. Confirmar exclusão
3. Produto é removido permanentemente

### 4. Alterar Status
1. Clicar no botão de toggle
2. Status é alterado imediatamente
3. Feedback visual instantâneo

## Integração com Categorias

### Dropdown Dinâmico
- As categorias são carregadas automaticamente do banco
- Apenas categorias ativas do estabelecimento são exibidas
- Validação de categoria no backend

### Relacionamento
- Produto deve pertencer a uma categoria válida
- Categoria deve pertencer ao mesmo estabelecimento
- Exclusão de categoria é restrita se houver produtos vinculados

## Tratamento de Erros

### Erros Comuns
- **409**: Nome já existe no estabelecimento
- **400**: Campos obrigatórios não preenchidos
- **404**: Estabelecimento ou categoria não encontrado
- **413**: Arquivo muito grande
- **415**: Tipo de arquivo não suportado

### Mensagens de Erro
- Validação de campos
- Conflitos de nome
- Problemas de upload
- Erros de banco de dados
- Validações de negócio

## Configuração do Servidor

### Dependências
```bash
npm install multer
```

### Middleware
- Multer configurado para uploads
- Validação de tipos de arquivo
- Limite de tamanho (5MB)
- Pasta de destino configurável

### Servir Arquivos Estáticos
```javascript
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

## Segurança

### Validações
- Tipo de arquivo (MIME)
- Tamanho máximo
- Nomes únicos por estabelecimento
- Controle de acesso por cargo
- Validação de categorias

### Sanitização
- Nomes e descrições são trimados
- URLs de imagem são validadas
- Cores são validadas como hex
- Valores numéricos são parseados

## Performance

### Otimizações
- Índices no banco de dados
- Upload assíncrono
- Feedback visual imediato (optimistic updates)
- Lazy loading de imagens
- JOIN otimizado com categorias

### Monitoramento
- Logs de criação/edição/exclusão
- Tratamento de erros detalhado
- Validação de integridade

## Testes

### Cenários de Teste
1. Criar produto com cor+ícone
2. Criar produto com imagem
3. Editar produto existente
4. Excluir produto
5. Alterar status
6. Validações de erro
7. Upload de arquivos inválidos
8. Validação de categorias
9. Controles de estoque e tempo

## Manutenção

### Limpeza
- Imagens excluídas são removidas do servidor
- Logs são mantidos para auditoria
- Backup automático do banco de dados

### Monitoramento
- Verificar espaço em disco (uploads)
- Monitorar performance das queries
- Logs de erro e acesso
- Validação de integridade referencial

## Próximos Passos

### Melhorias Futuras
- Compressão automática de imagens
- CDN para imagens
- Cache de produtos
- Relatórios de vendas
- Controle de variações de produto
- Sistema de complementos
- Gestão de receitas
- Integração com sistema de vendas

## Exemplo de Uso Completo

### 1. Criar Categoria Primeiro
```sql
INSERT INTO categorias (estabelecimento_id, nome, cor, icone) 
VALUES (1, 'Hambúrgueres', '#FF6B6B', '🍔');
```

### 2. Criar Produto
```javascript
const produtoData = {
  estabelecimento_id: 1,
  categoria_id: 1,
  nome: 'X-Burger',
  descricao: 'Hambúrguer com queijo, alface e tomate',
  valor_venda: 25.90,
  valor_custo: 15.00,
  habilitar_estoque: true,
  quantidade_estoque: 50,
  habilitar_tempo_preparo: true,
  tempo_preparo: 15,
  cor: '#FF6B6B',
  icone: '🍔'
};

await produtosAPI.criar(produtoData);
```

### 3. Listar Produtos
```javascript
const produtos = await produtosAPI.listarPorEstabelecimento(1);
console.log(produtos);
```

## Suporte

Para dúvidas ou problemas:
1. Verificar logs do servidor
2. Validar estrutura do banco de dados
3. Testar endpoints individualmente
4. Verificar permissões de usuário
5. Validar formato dos dados enviados
