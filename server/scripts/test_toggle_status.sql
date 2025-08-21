-- Script para testar a funcionalidade de toggle status
-- Execute este script para verificar se o status está funcionando

-- 1. Verificar usuários existentes e seus status
SELECT 
    id,
    nome_completo,
    email,
    cargo,
    status,
    criado_em
FROM usuarios 
ORDER BY id;

-- 2. Testar alteração de status (ativar usuário inativo)
-- Substitua o ID pelo ID de um usuário inativo
UPDATE usuarios 
SET status = true 
WHERE id = 1 
RETURNING id, nome_completo, status;

-- 3. Testar alteração de status (desativar usuário ativo)
-- Substitua o ID pelo ID de um usuário ativo
UPDATE usuarios 
SET status = false 
WHERE id = 1 
RETURNING id, nome_completo, status;

-- 4. Verificar se as alterações foram aplicadas
SELECT 
    id,
    nome_completo,
    status,
    CASE 
        WHEN status = true THEN '✅ Ativo'
        WHEN status = false THEN '❌ Inativo'
        ELSE '❓ Desconhecido'
    END as status_descricao
FROM usuarios 
ORDER BY id;

-- 5. Verificar se a constraint do email foi corrigida
SELECT 
    column_name,
    is_nullable,
    data_type
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND column_name = 'email';
