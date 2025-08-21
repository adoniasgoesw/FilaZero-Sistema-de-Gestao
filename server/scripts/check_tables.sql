-- Script para verificar e corrigir a estrutura das tabelas
-- Execute este script no seu banco de dados PostgreSQL

-- 1. Verificar se a tabela estabelecimentos existe e tem a estrutura correta
DO $$
BEGIN
    -- Verifica se a tabela estabelecimentos existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'estabelecimentos') THEN
        CREATE TABLE estabelecimentos (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            cnpj VARCHAR(18),
            setor VARCHAR(50),
            plano_atual VARCHAR(30) DEFAULT 'gratuito',
            status BOOLEAN DEFAULT true,
            criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        RAISE NOTICE 'Tabela estabelecimentos criada';
    ELSE
        RAISE NOTICE 'Tabela estabelecimentos já existe';
    END IF;
END $$;

-- 2. Verificar se a tabela usuarios existe e tem a estrutura correta
DO $$
BEGIN
    -- Verifica se a tabela usuarios existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'usuarios') THEN
        CREATE TABLE usuarios (
            id SERIAL PRIMARY KEY,
            estabelecimento_id INTEGER NOT NULL,
            nome_completo VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE, -- Campo opcional (pode ser NULL)
            whatsapp VARCHAR(20),
            cpf VARCHAR(14) UNIQUE NOT NULL,
            senha TEXT NOT NULL,
            cargo VARCHAR(20) DEFAULT 'Administrador',
            criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            status BOOLEAN NOT NULL DEFAULT true,
            FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos(id)
        );
        RAISE NOTICE 'Tabela usuarios criada';
    ELSE
        RAISE NOTICE 'Tabela usuarios já existe';
    END IF;
END $$;

-- 3. Verificar se a tabela categorias existe e tem a estrutura correta
DO $$
BEGIN
    -- Verifica se a tabela categorias existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'categorias') THEN
        CREATE TABLE categorias (
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
        CREATE INDEX idx_categorias_estabelecimento_id ON categorias(estabelecimento_id);
        CREATE INDEX idx_categorias_status ON categorias(status);
        CREATE INDEX idx_categorias_nome ON categorias(nome);
        
        RAISE NOTICE 'Tabela categorias criada';
    ELSE
        RAISE NOTICE 'Tabela categorias já existe';
    END IF;
END $$;

-- 4. Verificar se a tabela produtos existe e tem a estrutura correta
DO $$
BEGIN
    -- Verifica se a tabela produtos existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'produtos') THEN
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
        CREATE INDEX idx_produtos_estabelecimento_id ON produtos(estabelecimento_id);
        CREATE INDEX idx_produtos_categoria_id ON produtos(categoria_id);
        CREATE INDEX idx_produtos_status ON produtos(status);
        CREATE INDEX idx_produtos_nome ON produtos(nome);
        CREATE INDEX idx_produtos_valor_venda ON produtos(valor_venda);
        
        RAISE NOTICE 'Tabela produtos criada';
    ELSE
        RAISE NOTICE 'Tabela produtos já existe';
    END IF;
END $$;

-- 5. Verificar se existem dados de teste
DO $$
BEGIN
    -- Verifica se existem estabelecimentos
    IF NOT EXISTS (SELECT FROM estabelecimentos LIMIT 1) THEN
        INSERT INTO estabelecimentos (nome, cnpj, setor) VALUES 
        ('Estabelecimento Teste', '12.345.678/0001-90', 'Restaurante');
        RAISE NOTICE 'Estabelecimento de teste criado';
    END IF;
    
    -- Verifica se existem usuários
    IF NOT EXISTS (SELECT FROM usuarios LIMIT 1) THEN
        INSERT INTO usuarios (estabelecimento_id, nome_completo, email, cpf, senha, cargo) VALUES 
        (1, 'Usuário Teste', 'teste@email.com', '123.456.789-00', '$2a$10$teste', 'Administrador');
        RAISE NOTICE 'Usuário de teste criado';
    END IF;
    
    -- Verifica se existem categorias de teste
    IF NOT EXISTS (SELECT FROM categorias LIMIT 1) THEN
        INSERT INTO categorias (estabelecimento_id, nome, descricao, cor, icone) VALUES 
        (1, 'Categoria Teste', 'Categoria para testes', '#FF6B6B', '🏷️');
        RAISE NOTICE 'Categoria de teste criada';
    END IF;
    
    -- Verifica se existem produtos de teste
    IF NOT EXISTS (SELECT FROM produtos LIMIT 1) THEN
        INSERT INTO produtos (estabelecimento_id, categoria_id, nome, descricao, valor_venda, cor, icone) VALUES 
        (1, 1, 'Produto Teste', 'Produto para testes', 10.50, '#FF6B6B', '🍕');
        RAISE NOTICE 'Produto de teste criado';
    END IF;
END $$;

-- 6. Verificar a estrutura atual das tabelas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('estabelecimentos', 'usuarios', 'categorias', 'produtos')
ORDER BY table_name, ordinal_position;

-- 7. Verificar dados existentes
SELECT 'estabelecimentos' as tabela, COUNT(*) as total FROM estabelecimentos
UNION ALL
SELECT 'usuarios' as tabela, COUNT(*) as total FROM usuarios
UNION ALL
SELECT 'categorias' as tabela, COUNT(*) as total FROM categorias
UNION ALL
SELECT 'produtos' as tabela, COUNT(*) as total FROM produtos;
