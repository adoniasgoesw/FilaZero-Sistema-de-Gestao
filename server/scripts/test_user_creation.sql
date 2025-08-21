-- Script de teste para verificar criação de usuário
-- Execute este script após corrigir as constraints

-- 1. Verificar se existe pelo menos um estabelecimento
SELECT 'Estabelecimentos' as tipo, COUNT(*) as total FROM estabelecimentos;

-- 2. Verificar a estrutura da tabela usuarios
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;

-- 3. Testar inserção de usuário com email NULL (deve funcionar agora)
DO $$
DECLARE
    estabelecimento_id INTEGER;
    novo_usuario_id INTEGER;
BEGIN
    -- Pega o primeiro estabelecimento disponível
    SELECT id INTO estabelecimento_id FROM estabelecimentos LIMIT 1;
    
    IF estabelecimento_id IS NULL THEN
        RAISE EXCEPTION 'Nenhum estabelecimento encontrado';
    END IF;
    
    -- Tenta inserir um usuário de teste
    INSERT INTO usuarios (
        estabelecimento_id, 
        nome_completo, 
        email,  -- NULL (deve funcionar agora)
        cpf, 
        senha, 
        cargo
    ) VALUES (
        estabelecimento_id,
        'Usuário Teste',
        NULL,  -- Email NULL
        '111.222.333-44',
        '$2a$10$teste',
        'Atendente'
    ) RETURNING id INTO novo_usuario_id;
    
    RAISE NOTICE 'Usuário criado com sucesso! ID: %', novo_usuario_id;
    
    -- Limpa o usuário de teste
    DELETE FROM usuarios WHERE id = novo_usuario_id;
    RAISE NOTICE 'Usuário de teste removido';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao criar usuário: %', SQLERRM;
END $$;

-- 4. Verificar se a constraint foi removida
SELECT 
    column_name,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND column_name = 'email';
