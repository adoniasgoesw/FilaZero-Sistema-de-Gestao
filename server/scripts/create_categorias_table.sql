-- Script para criar a tabela de categorias
-- Execute este script no seu banco de dados PostgreSQL

CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    estabelecimento_id INTEGER NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    imagem_url TEXT,
    cor VARCHAR(20),
    icone VARCHAR(50),
    status BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_categorias_estabelecimento 
        FOREIGN KEY (estabelecimento_id) 
        REFERENCES estabelecimentos(id) 
        ON DELETE CASCADE,
    
    -- Nome deve ser único por estabelecimento
    CONSTRAINT uk_categorias_nome_estabelecimento 
        UNIQUE (estabelecimento_id, nome)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_categorias_estabelecimento_id ON categorias(estabelecimento_id);
CREATE INDEX IF NOT EXISTS idx_categorias_status ON categorias(status);
CREATE INDEX IF NOT EXISTS idx_categorias_nome ON categorias(nome);

-- Comentários na tabela
COMMENT ON TABLE categorias IS 'Tabela para armazenar categorias de produtos por estabelecimento';
COMMENT ON COLUMN categorias.estabelecimento_id IS 'ID do estabelecimento que possui esta categoria';
COMMENT ON COLUMN categorias.nome IS 'Nome da categoria (deve ser único por estabelecimento)';
COMMENT ON COLUMN categorias.descricao IS 'Descrição opcional da categoria';
COMMENT ON COLUMN categorias.imagem_url IS 'URL da imagem da categoria (opcional)';
COMMENT ON COLUMN categorias.cor IS 'Cor da categoria (usada quando não há imagem)';
COMMENT ON COLUMN categorias.icone IS 'Ícone da categoria (usado quando não há imagem)';
COMMENT ON COLUMN categorias.status IS 'Status da categoria (true = ativa, false = inativa)';
COMMENT ON COLUMN categorias.criado_em IS 'Data e hora de criação da categoria';

-- Regra de negócio: deve ter imagem OU cor+ícone, não ambos
-- Isso será validado no código da aplicação
