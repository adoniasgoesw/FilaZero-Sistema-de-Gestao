-- Script para corrigir a constraint do campo email na tabela usuarios
-- Execute este script no seu banco de dados PostgreSQL

-- 1. Verificar a estrutura atual da tabela usuarios
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND column_name = 'email';

-- 2. Remover a constraint NOT NULL do campo email (se existir)
ALTER TABLE usuarios ALTER COLUMN email DROP NOT NULL;

-- 3. Verificar se a alteração foi aplicada
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND column_name = 'email';

-- 4. Verificar se existem registros com email NULL
SELECT COUNT(*) as usuarios_sem_email FROM usuarios WHERE email IS NULL;

-- 5. Verificar a estrutura completa da tabela usuarios
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;
