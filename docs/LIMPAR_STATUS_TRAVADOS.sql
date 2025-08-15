-- Script para limpar status travados dos pontos de atendimento
-- Execute este script no seu banco de dados PostgreSQL para resolver problemas de bloqueio

-- 1. Verificar pontos com status "em_atendimento"
SELECT 
    pap.id,
    pap.identificacao,
    pap.status,
    pap.criado_em,
    pap.atualizado_em,
    p.valor_total,
    p.id as pedido_id,
    EXTRACT(EPOCH FROM (NOW() - pap.atualizado_em))/60 as minutos_inativo
FROM pontos_atendimento_pedidos pap
LEFT JOIN pedidos p ON pap.id = p.ponto_atendimento_id 
    AND p.status_pedido IN ('pendente', 'em_preparo', 'pronto')
WHERE pap.status = 'em_atendimento'
ORDER BY pap.atualizado_em;

-- 2. Limpar TODOS os status "em_atendimento" (use com cuidado!)
-- Este comando força todos os pontos para "disponível" ou "aberto"
UPDATE pontos_atendimento_pedidos 
SET 
    status = CASE 
        WHEN EXISTS (
            SELECT 1 FROM pedidos p 
            WHERE p.ponto_atendimento_id = pontos_atendimento_pedidos.id 
            AND p.status_pedido IN ('pendente', 'em_preparo', 'pronto')
            AND p.valor_total > 0
        ) THEN 'aberto'
        ELSE 'Disponível'
    END,
    atualizado_em = CURRENT_TIMESTAMP
WHERE status = 'em_atendimento';

-- 3. Verificar resultado após limpeza
SELECT 
    pap.id,
    pap.identificacao,
    pap.status,
    pap.atualizado_em
FROM pontos_atendimento_pedidos pap
ORDER BY pap.identificacao;

-- 4. Resetar completamente um ponto específico (substitua 'Mesa 01' pelo nome desejado)
-- UPDATE pontos_atendimento_pedidos 
-- SET 
--     status = 'Disponível',
--     nome_ponto = '',
--     criado_em = NULL,
--     atualizado_em = CURRENT_TIMESTAMP
-- WHERE identificacao = 'Mesa 01';

-- 5. Verificar se há pontos órfãos (sem pedidos ativos)
SELECT 
    pap.id,
    pap.identificacao,
    pap.status,
    pap.nome_ponto
FROM pontos_atendimento_pedidos pap
LEFT JOIN pedidos p ON pap.id = p.ponto_atendimento_id 
    AND p.status_pedido IN ('pendente', 'em_preparo', 'pronto')
WHERE p.id IS NULL 
    AND pap.status IN ('ocupada', 'aberto')
    AND pap.nome_ponto != '';

-- 6. Corrigir pontos órfãos
UPDATE pontos_atendimento_pedidos 
SET 
    status = 'Disponível',
    nome_ponto = '',
    criado_em = NULL,
    atualizado_em = CURRENT_TIMESTAMP
WHERE id IN (
    SELECT pap.id
    FROM pontos_atendimento_pedidos pap
    LEFT JOIN pedidos p ON pap.id = p.ponto_atendimento_id 
        AND p.status_pedido IN ('pendente', 'em_preparo', 'pronto')
    WHERE p.id IS NULL 
        AND pap.status IN ('ocupada', 'aberto')
        AND pap.nome_ponto != ''
);

-- INSTRUÇÕES DE USO:
-- 1. Execute primeiro o SELECT para ver o que está travado
-- 2. Use o UPDATE para limpar todos os status travados
-- 3. Verifique o resultado com o segundo SELECT
-- 4. Se necessário, use os comandos específicos para pontos órfãos
-- 5. Reinicie o servidor após as alterações

-- ATENÇÃO: Este script modifica dados no banco. Faça backup antes de executar!
