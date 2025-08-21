# Sistema de Categorias - FilaZero

## Visão Geral

O sistema de categorias permite organizar produtos em grupos lógicos, com suporte a personalização visual através de imagens ou combinação de cor e ícone.

## Funcionalidades

### ✅ CRUD Completo
- **Criar**: Adicionar novas categorias
- **Listar**: Visualizar todas as categorias do estabelecimento
- **Editar**: Modificar categorias existentes
- **Excluir**: Remover categorias permanentemente
- **Status**: Ativar/desativar categorias

### 🎨 Personalização Visual
- **Imagem**: Upload de arquivo de imagem (JPG, PNG, GIF)
- **Cor + Ícone**: Seleção de cor personalizada e emoji/ícone
- **Regra**: Imagem OU cor+ícone (não ambos)

### 🔒 Segurança
- Validação de arquivos (tipo e tamanho)
- Nomes únicos por estabelecimento
- Controle de acesso por cargo

## Estrutura do Banco

```sql
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    estabelecimento_id INTEGER NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    imagem_url TEXT,
    cor VARCHAR(20),
    icone VARCHAR(50),
    status BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### POST `/api/categorias`
Criar nova categoria
```json
{
  "estabelecimento_id": 1,
  "nome": "Hambúrgueres",
  "descricao": "Hambúrgueres deliciosos",
  "cor": "#FF6B6B",
  "icone": "🍔"
}
```

### GET `/api/categorias/estabelecimento/:id`
Listar categorias por estabelecimento

### GET `/api/categorias/:id`
Buscar categoria por ID

### PUT `/api/categorias/:id`
Atualizar categoria

### DELETE `/api/categorias/:id`
Excluir categoria

## Upload de Imagens

### Configuração
- **Pasta**: `server/uploads/`
- **Tamanho máximo**: 5MB
- **Formatos**: JPG, PNG, GIF
- **Nomenclatura**: `categoria-{timestamp}-{random}.{ext}`

### Exemplo com FormData
```javascript
const formData = new FormData();
formData.append('estabelecimento_id', 1);
formData.append('nome', 'Hambúrgueres');
formData.append('descricao', 'Hambúrgueres deliciosos');
formData.append('imagem', fileInput.files[0]);

await categoriasAPI.criar(formData);
```

## Validações

### Campos Obrigatórios
- `estabelecimento_id`
- `nome`

### Regras de Negócio
1. **Nome único**: Não pode existir categoria com mesmo nome no mesmo estabelecimento
2. **Visual**: Deve ter imagem OU cor+ícone (não ambos)
3. **Estabelecimento**: Deve existir e estar ativo
4. **Arquivo**: Apenas imagens válidas até 5MB

## Componentes Frontend

### FormCategoria
- Formulário com tabs (Detalhes)
- Upload de imagem com preview
- Seletor de cor e ícone
- Validação em tempo real

### ListagemCategorias
- Tabela responsiva (desktop/mobile)
- Exibição de imagem ou cor+ícone
- Ações: editar, excluir, toggle status
- Loading states e feedback visual

## Fluxo de Uso

### 1. Criar Categoria
1. Acessar página de Categorias
2. Clicar em "Nova Categoria"
3. Preencher nome e descrição
4. Escolher: imagem OU cor+ícone
5. Clicar em "Cadastrar Categoria"

### 2. Editar Categoria
1. Clicar no botão "Editar" da categoria
2. Modificar campos desejados
3. Salvar alterações

### 3. Excluir Categoria
1. Clicar no botão "Excluir"
2. Confirmar exclusão
3. Categoria é removida permanentemente

### 4. Alterar Status
1. Clicar no botão de toggle
2. Status é alterado imediatamente
3. Feedback visual instantâneo

## Tratamento de Erros

### Erros Comuns
- **409**: Nome já existe no estabelecimento
- **400**: Campos obrigatórios não preenchidos
- **404**: Estabelecimento não encontrado
- **413**: Arquivo muito grande
- **415**: Tipo de arquivo não suportado

### Mensagens de Erro
- Validação de campos
- Conflitos de nome
- Problemas de upload
- Erros de banco de dados

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

### Sanitização
- Nomes e descrições são trimados
- URLs de imagem são validadas
- Cores são validadas como hex

## Performance

### Otimizações
- Índices no banco de dados
- Upload assíncrono
- Feedback visual imediato (optimistic updates)
- Lazy loading de imagens

### Monitoramento
- Logs de criação/edição/exclusão
- Tratamento de erros detalhado
- Validação de integridade

## Testes

### Cenários de Teste
1. Criar categoria com cor+ícone
2. Criar categoria com imagem
3. Editar categoria existente
4. Excluir categoria
5. Alterar status
6. Validações de erro
7. Upload de arquivos inválidos

## Manutenção

### Limpeza
- Imagens excluídas são removidas do servidor
- Logs são mantidos para auditoria
- Backup automático do banco de dados

### Monitoramento
- Verificar espaço em disco (uploads)
- Monitorar performance das queries
- Logs de erro e acesso

## Próximos Passos

### Melhorias Futuras
- Compressão automática de imagens
- CDN para imagens
- Cache de categorias
- Relatórios de uso
- Backup automático de imagens
