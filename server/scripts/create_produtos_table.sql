-- Script para criar a tabela de produtos
-- Execute este script no seu banco de dados PostgreSQL

CREATE TABLE IF NOT EXISTS produtos (
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
    tempo_preparo INTEGER DEFAULT 0, -- em minutos
    status BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_produtos_estabelecimento 
        FOREIGN KEY (estabelecimento_id) 
        REFERENCES estabelecimentos(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_produtos_categoria 
        FOREIGN KEY (categoria_id) 
        REFERENCES categorias(id) 
        ON DELETE RESTRICT,
    
    -- Nome deve ser único por estabelecimento
    CONSTRAINT uk_produtos_nome_estabelecimento 
        UNIQUE (estabelecimento_id, nome),
    
    -- Validações
    CONSTRAINT chk_produtos_valor_venda 
        CHECK (valor_venda >= 0),
    
    CONSTRAINT chk_produtos_valor_custo 
        CHECK (valor_custo >= 0),
    
    CONSTRAINT chk_produtos_quantidade_estoque 
        CHECK (quantidade_estoque >= 0),
    
    CONSTRAINT chk_produtos_tempo_preparo 
        CHECK (tempo_preparo >= 0)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_produtos_estabelecimento_id ON produtos(estabelecimento_id);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria_id ON produtos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_produtos_status ON produtos(status);
CREATE INDEX IF NOT EXISTS idx_produtos_nome ON produtos(nome);
CREATE INDEX IF NOT EXISTS idx_produtos_valor_venda ON produtos(valor_venda);

-- Comentários na tabela
COMMENT ON TABLE produtos IS 'Tabela para armazenar produtos por estabelecimento';
COMMENT ON COLUMN produtos.estabelecimento_id IS 'ID do estabelecimento que possui este produto';
COMMENT ON COLUMN produtos.categoria_id IS 'ID da categoria do produto';
COMMENT ON COLUMN produtos.nome IS 'Nome do produto (deve ser único por estabelecimento)';
COMMENT ON COLUMN produtos.descricao IS 'Descrição opcional do produto';
COMMENT ON COLUMN produtos.imagem_url IS 'URL da imagem do produto (opcional)';
COMMENT ON COLUMN produtos.cor IS 'Cor do produto (usada quando não há imagem)';
COMMENT ON COLUMN produtos.icone IS 'Ícone do produto (usado quando não há imagem)';
COMMENT ON COLUMN produtos.valor_venda IS 'Preço de venda do produto';
COMMENT ON COLUMN produtos.valor_custo IS 'Preço de custo do produto (opcional)';
COMMENT ON COLUMN produtos.habilitar_estoque IS 'Se o produto deve ter controle de estoque';
COMMENT ON COLUMN produtos.quantidade_estoque IS 'Quantidade atual em estoque';
COMMENT ON COLUMN produtos.habilitar_tempo_preparo IS 'Se o produto deve ter tempo de preparo';
COMMENT ON COLUMN produtos.tempo_preparo IS 'Tempo de preparo em minutos';
COMMENT ON COLUMN produtos.status IS 'Status do produto (true = ativo, false = inativo)';
COMMENT ON COLUMN produtos.criado_em IS 'Data e hora de criação do produto';

-- Regra de negócio: deve ter imagem OU cor+ícone, não ambos
-- Isso será validado no código da aplicação
