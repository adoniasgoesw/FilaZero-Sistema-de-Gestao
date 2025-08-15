import db from '../config/db.js';

export const criarPedidoAtivo = async (req, res) => {
  const {
    estabelecimento_id,
    ponto_atendimento_id,
    caixa_id,
    cliente_id = null,
    nome_pedido = null,
    valor_total = 0,
    itens = [],
    usuarios_id = null,
    identificacao_ponto = null,
  } = req.body || {};

  console.log('📝 Dados recebidos:', {
    estabelecimento_id,
    identificacao_ponto,
    nome_pedido,
    valor_total,
    itens: itens.length,
    usuarios_id
  });

  const estId = Number(estabelecimento_id);
  const userId = Number(usuarios_id);
  
  if (!estId || !identificacao_ponto) {
    return res.status(400).json({ message: 'estabelecimento_id e identificacao_ponto são obrigatórios.' });
  }

  // Valida itens antes de processar
  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ message: 'É necessário pelo menos um item para criar o pedido.' });
  }

  // Valida se todos os itens têm ID válido
  const itensInvalidos = itens.filter(item => !item.id || Number(item.id) <= 0);
  if (itensInvalidos.length > 0) {
    console.error('❌ Itens com ID inválido:', itensInvalidos);
    return res.status(400).json({ message: 'Todos os itens devem ter um ID de produto válido.' });
  }

  try {
    // Determina caixa_id se não enviado
    let caixaId = caixa_id;
    if (!caixaId) {
      const cxRes = await db.query('SELECT id FROM caixas WHERE estabelecimento_id = $1 AND caixa_aberto = true ORDER BY data_abertura DESC LIMIT 1', [estId]);
      if (cxRes.rows.length === 0) return res.status(400).json({ message: 'Nenhum caixa aberto.' });
      caixaId = cxRes.rows[0].id;
    }

    // 1. SALVA/ATUALIZA NA TABELA pontos_atendimento_pedidos
    let pontoAtendimentoId;
    try {
      // Primeiro tenta buscar se já existe um ponto com esta identificação
      const existingPontoRes = await db.query(
        `SELECT id FROM pontos_atendimento_pedidos 
         WHERE estabelecimento_id = $1 AND identificacao = $2`,
        [estId, identificacao_ponto]
      );
      
      if (existingPontoRes.rows.length > 0) {
        // Se já existe, atualiza para "ocupada" (tem itens)
        const updateRes = await db.query(
          `UPDATE pontos_atendimento_pedidos 
           SET nome_ponto = $1, status = 'ocupada', usuario_id = $2, atualizado_em = CURRENT_TIMESTAMP
           WHERE id = $3
           RETURNING id`,
          [
            nome_pedido || `Pedido ${identificacao_ponto}`,
            userId,
            existingPontoRes.rows[0].id
          ]
        );
        pontoAtendimentoId = updateRes.rows[0].id;
      } else {
        // Se não existe, insere novo com status "ocupada" (tem itens)
        const pontoRes = await db.query(
          `INSERT INTO pontos_atendimento_pedidos (
            estabelecimento_id, identificacao, nome_ponto, status, usuario_id
          ) VALUES ($1, $2, $3, $4, $5)
          RETURNING id`,
          [
            estId,
            identificacao_ponto,
            nome_pedido || `Pedido ${identificacao_ponto}`,
            'ocupada',
            userId
          ]
        );
        pontoAtendimentoId = pontoRes.rows[0].id;
      }
    } catch (error) {
      console.error('Erro ao gerenciar ponto de atendimento:', error);
      return res.status(500).json({ message: 'Erro ao gerenciar ponto de atendimento.' });
    }

    // 2. SALVA NA TABELA pedidos
    const pedidoRes = await db.query(
      `INSERT INTO pedidos (
        estabelecimento_id, ponto_atendimento_id, status_pedido, valor_total, 
        data_abertura, cliente_id
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id`,
      [
        estId,
        pontoAtendimentoId,
        'pendente',
        Number(valor_total) || 0,
        new Date(),
        cliente_id
      ]
    );
    
    const pedidoId = pedidoRes.rows[0].id;

    // 3. SALVA NA TABELA itens_pedido
    if (Array.isArray(itens) && itens.length > 0) {
      console.log('📦 Salvando itens:', itens.length);
      
      const values = [];
      const params = [];
      
      itens.forEach((item, idx) => {
        const base = idx * 6;
        params.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`);
        values.push(
          estId,                    // estabelecimento_id
          pedidoId,                 // pedido_id
          item.id || 0,            // id_produto
          item.nome || '',         // nome_item
          Number(item.quantidade) || 1,  // quantidade
          Number(item.valor) || 0  // preco_unitario
        );
        
        console.log(`📋 Item ${idx + 1}:`, {
          estabelecimento_id: estId,
          pedido_id: pedidoId,
          id_produto: item.id,
          nome_item: item.nome,
          quantidade: item.quantidade,
          preco_unitario: item.valor
        });
      });

      if (params.length > 0) {
        console.log('💾 Executando INSERT com', params.length, 'itens');
        await db.query(
          `INSERT INTO itens_pedido (
            estabelecimento_id, pedido_id, id_produto, nome_item, quantidade, preco_unitario
          ) VALUES ${params.join(',')}`,
          values
        );
        console.log('✅ Itens salvos com sucesso');
      }
    }

    // 4. Atualiza tabela antiga pedidos_ativos para compatibilidade (se existir)
    try {
      await db.query(
        `INSERT INTO pedidos_ativos (
          caixa_id, ponto_atendimento_id, estabelecimento_id, numero_pedido, cliente_id,
          status, valor_total, horario_abertura, nome_pedido
        ) VALUES ($1, $2, $3, $4, $5, 'aberto', $6, NOW(), $7)`,
        [caixaId, ponto_atendimento_id, estId, 1, cliente_id, valor_total, nome_pedido]
      );
    } catch (_) {
      // Ignora erro se tabela não existir
    }

    return res.status(201).json({
      message: 'Pedido salvo com sucesso.',
      pedido_id: pedidoId,
      ponto_atendimento_id: pontoAtendimentoId,
      valor_total: valor_total,
      // Retorna dados completos para atualização em tempo real
      pedido_completo: {
        id: pedidoId,
        estabelecimento_id: estId,
        ponto_atendimento_id: pontoAtendimentoId,
        status_pedido: 'pendente',
        valor_total: valor_total,
        data_abertura: new Date(),
        cliente_id: cliente_id
      },
      ponto_atendimento: {
        id: pontoAtendimentoId,
        estabelecimento_id: estId,
        identificacao: identificacao_ponto,
        nome_ponto: nome_pedido || `Pedido ${identificacao_ponto}`,
        status: 'ocupada',
        usuario_id: userId,
        criado_em: new Date()
      },
      itens: itens.map(item => ({
        id: item.id,
        nome: item.nome,
        quantidade: item.quantidade,
        valor: item.valor,
        total: Number(item.quantidade) * Number(item.valor)
      }))
    });

  } catch (error) {
    console.error('Erro ao criar pedido ativo:', error);
    return res.status(500).json({ message: 'Erro interno ao criar pedido.' });
  }
};

export const getPedidoAtivoPorPonto = async (req, res) => {
  const { ponto_id, estabelecimento_id } = req.params;
  if (!ponto_id || !estabelecimento_id) return res.status(400).json({ message: 'Parâmetros inválidos.' });
  
  try {
    // Busca na nova estrutura usando identificacao
    const pedidoRes = await db.query(
      `SELECT p.*, pap.identificacao, pap.nome_ponto
       FROM pedidos p
       JOIN pontos_atendimento_pedidos pap ON p.ponto_atendimento_id = pap.id
       WHERE pap.estabelecimento_id = $1 
       AND pap.identificacao = $2
       AND p.status_pedido IN ('pendente','em_preparo','pronto')
       ORDER BY p.id DESC LIMIT 1`,
      [estabelecimento_id, ponto_id]
    );

    if (pedidoRes.rows.length === 0) {
      return res.status(200).json({ pedido: null, itens: [] });
    }

    const pedido = pedidoRes.rows[0];
    
    // Busca itens do pedido
    const itensRes = await db.query(
      'SELECT * FROM itens_pedido WHERE pedido_id = $1 ORDER BY id',
      [pedido.id]
    );

    return res.status(200).json({ 
      pedido, 
      itens: itensRes.rows 
    });

  } catch (error) {
    console.error('Erro ao buscar pedido ativo:', error);
    return res.status(500).json({ message: 'Erro interno ao buscar pedido.' });
  }
};

// Nova função para buscar todos os pontos de atendimento ativos
export const getTodosPontosAtendimento = async (req, res) => {
  const { estabelecimento_id } = req.params;
  if (!estabelecimento_id) return res.status(400).json({ message: 'ID do estabelecimento é obrigatório.' });
  
  try {
    // Primeiro busca a configuração dos pontos de atendimento
    const configRes = await db.query(
      'SELECT * FROM pontos_atendimento WHERE estabelecimento_id = $1',
      [estabelecimento_id]
    );
    
    if (configRes.rows.length === 0) {
      return res.status(200).json({ pontos: [], total: 0 });
    }
    
    const config = configRes.rows[0];
    const pontos = [];
    
    // Gera pontos baseados na configuração (como estava antes)
    if (config.atendimento_mesas) {
      const qty = Number(config.quantidade_mesas) || 0;
      for (let i = 1; i <= qty; i += 1) {
        const identificacao = `Mesa ${String(i).padStart(2, '0')}`;
        
        // Busca se existe pedido ativo para esta mesa
        const pedidoRes = await db.query(
          `SELECT p.*, pap.nome_ponto, pap.status, pap.criado_em
           FROM pontos_atendimento_pedidos pap
           LEFT JOIN pedidos p ON pap.id = p.ponto_atendimento_id 
             AND p.status_pedido IN ('pendente', 'em_preparo', 'pronto')
           WHERE pap.estabelecimento_id = $1 
           AND pap.identificacao = $2
           ORDER BY p.id DESC LIMIT 1`,
          [estabelecimento_id, identificacao]
        );
        
        const pedido = pedidoRes.rows[0];
        
        // Determina o status correto baseado nas regras de negócio
        let statusCorreto = 'Disponível';
        if (pedido) {
          if (pedido.valor_total > 0) {
            statusCorreto = 'ocupada';
          } else {
            statusCorreto = 'aberto';
          }
        }

        pontos.push({
          id: `mesa-${i}`,
          identificacao: identificacao,
          nome: identificacao,
          status: statusCorreto,
          valor: pedido ? Number(pedido.valor_total) : 0,
          abertura: pedido ? pedido.data_abertura : null,
          criado_em: pedido ? pedido.criado_em : null, // Adiciona criado_em para cálculo de atividade
          pedido_id: pedido ? pedido.id : null,
          status_pedido: pedido ? pedido.status_pedido : null,
          nome_pedido: pedido ? pedido.nome_ponto : null,
          tipo: 'Mesa',
          em_atendimento: false // Será atualizado pelo frontend
        });
      }
    }
    
    if (config.atendimento_comandas) {
      const qty = Number(config.quantidade_comandas) || 0;
      const pref = config.prefixo_comanda || 'CMD';
      for (let i = 1; i <= qty; i += 1) {
        const identificacao = `${pref} ${String(i).padStart(2, '0')}`;
        
        // Busca se existe pedido ativo para esta comanda
        const pedidoRes = await db.query(
          `SELECT p.*, pap.nome_ponto, pap.status, pap.criado_em
           FROM pontos_atendimento_pedidos pap
           LEFT JOIN pedidos p ON pap.id = p.ponto_atendimento_id 
             AND p.status_pedido IN ('pendente', 'em_preparo', 'pronto')
           WHERE pap.estabelecimento_id = $1 
           AND pap.identificacao = $2
           ORDER BY p.id DESC LIMIT 1`,
          [estabelecimento_id, identificacao]
        );
        
        const pedido = pedidoRes.rows[0];
        
        // Determina o status correto baseado nas regras de negócio
        let statusCorreto = 'Disponível';
        if (pedido) {
          if (pedido.valor_total > 0) {
            statusCorreto = 'ocupada';
          } else {
            statusCorreto = 'aberto';
          }
        }

        pontos.push({
          id: `comanda-${i}`,
          identificacao: identificacao,
          nome: identificacao,
          status: statusCorreto,
          valor: pedido ? Number(pedido.valor_total) : 0,
          abertura: pedido ? pedido.data_abertura : null,
          criado_em: pedido ? pedido.criado_em : null, // Adiciona criado_em para cálculo de atividade
          pedido_id: pedido ? pedido.id : null,
          status_pedido: pedido ? pedido.status_pedido : null,
          nome_pedido: pedido ? pedido.nome_ponto : null,
          tipo: 'Comanda',
          em_atendimento: false // Será atualizado pelo frontend
        });
      }
    }

    return res.status(200).json({ 
      pontos,
      total: pontos.length
    });

  } catch (error) {
    console.error('Erro ao buscar pontos de atendimento:', error);
    return res.status(500).json({ message: 'Erro interno ao buscar pontos de atendimento.' });
  }
};

// Nova função para excluir pedido e resetar ponto de atendimento
export const excluirPedido = async (req, res) => {
  console.log('🗑️ Função excluirPedido chamada');
  console.log('🗑️ Body recebido:', req.body);
  
  const { estabelecimento_id, identificacao_ponto } = req.body;
  
  console.log('🗑️ Dados extraídos:', { estabelecimento_id, identificacao_ponto });
  
  if (!estabelecimento_id || !identificacao_ponto) {
    console.log('🗑️ Erro: dados obrigatórios faltando');
    return res.status(400).json({ message: 'estabelecimento_id e identificacao_ponto são obrigatórios.' });
  }

  try {
    console.log('🗑️ Excluindo pedido para:', identificacao_ponto);
    
    // 1. Busca o ponto de atendimento
    const pontoRes = await db.query(
      `SELECT id FROM pontos_atendimento_pedidos 
       WHERE estabelecimento_id = $1 AND identificacao = $2`,
      [estabelecimento_id, identificacao_ponto]
    );
    
    console.log('🗑️ Resultado busca ponto:', pontoRes.rows);
    
    if (pontoRes.rows.length === 0) {
      console.log('🗑️ Ponto não encontrado');
      return res.status(404).json({ message: 'Ponto de atendimento não encontrado.' });
    }
    
    const pontoId = pontoRes.rows[0].id;
    console.log('🗑️ Ponto ID encontrado:', pontoId);
    
    // 2. Busca o pedido ativo
    const pedidoRes = await db.query(
      `SELECT id FROM pedidos 
       WHERE ponto_atendimento_id = $1 
       AND status_pedido IN ('pendente', 'em_preparo', 'pronto')`,
      [pontoId]
    );
    
    console.log('🗑️ Resultado busca pedido:', pedidoRes.rows);
    
    if (pedidoRes.rows.length === 0) {
      console.log('🗑️ Pedido não encontrado');
      return res.status(404).json({ message: 'Pedido ativo não encontrado.' });
    }
    
    const pedidoId = pedidoRes.rows[0].id;
    console.log('🗑️ Pedido ID encontrado:', pedidoId);
    
    // 3. Exclui itens do pedido (CASCADE deve fazer isso automaticamente)
    console.log('🗑️ Excluindo itens do pedido:', pedidoId);
    
    // 4. Exclui o pedido
    await db.query('DELETE FROM pedidos WHERE id = $1', [pedidoId]);
    console.log('🗑️ Pedido excluído:', pedidoId);
    
    // 5. Reseta o ponto de atendimento para disponível (sem itens)
    await db.query(
      `UPDATE pontos_atendimento_pedidos 
       SET nome_ponto = '', 
           status = 'Disponível', 
           usuario_id = NULL, 
           criado_em = NULL,  -- Zera o tempo de abertura
           atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [pontoId]
    );
    console.log('🗑️ Ponto de atendimento resetado:', pontoId);
    
    // 6. Atualiza tabela antiga pedidos_ativos para compatibilidade (se existir)
    try {
      await db.query(
        `DELETE FROM pedidos_ativos 
         WHERE estabelecimento_id = $1 AND ponto_atendimento_id = $2`,
        [estabelecimento_id, identificacao_ponto]
      );
    } catch (_) {
      // Ignora erro se tabela não existir
    }

    console.log('🗑️ Exclusão concluída com sucesso');
    return res.status(200).json({
      message: 'Pedido excluído com sucesso.',
      identificacao_ponto,
      ponto_resetado: true
    });

  } catch (error) {
    console.error('❌ Erro ao excluir pedido:', error);
    return res.status(500).json({ message: 'Erro interno ao excluir pedido.' });
  }
};

// Nova função para abrir um ponto de atendimento (mudar para "em atendimento")
export const abrirPontoAtendimento = async (req, res) => {
  const { estabelecimento_id, identificacao_ponto, usuario_id } = req.body;
  
  if (!estabelecimento_id || !identificacao_ponto || !usuario_id) {
    return res.status(400).json({ 
      message: 'estabelecimento_id, identificacao_ponto e usuario_id são obrigatórios.' 
    });
  }

  try {
    // Verifica se o ponto já está sendo atendido por outro usuário
    const pontoEmAtendimentoRes = await db.query(
      `SELECT id, usuario_id, status 
       FROM pontos_atendimento_pedidos 
       WHERE estabelecimento_id = $1 AND identificacao = $2 AND status = 'em_atendimento'`,
      [estabelecimento_id, identificacao_ponto]
    );

    if (pontoEmAtendimentoRes.rows.length > 0) {
      const ponto = pontoEmAtendimentoRes.rows[0];
      if (ponto.usuario_id !== Number(usuario_id)) {
        return res.status(423).json({ 
          message: 'Ponto de atendimento já está sendo usado por outro usuário.',
          bloqueado: true,
          usuario_atual: ponto.usuario_id
        });
      }
    }

    // Busca ou cria o ponto de atendimento
    let pontoAtendimentoId;
    const existingPontoRes = await db.query(
      `SELECT id, status FROM pontos_atendimento_pedidos 
       WHERE estabelecimento_id = $1 AND identificacao = $2`,
      [estabelecimento_id, identificacao_ponto]
    );

    if (existingPontoRes.rows.length > 0) {
      // Atualiza status para "em atendimento"
      const updateRes = await db.query(
        `UPDATE pontos_atendimento_pedidos 
         SET status = 'em_atendimento', usuario_id = $1, atualizado_em = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING id`,
        [usuario_id, existingPontoRes.rows[0].id]
      );
      pontoAtendimentoId = updateRes.rows[0].id;
    } else {
      // Cria novo ponto com status "em atendimento"
      const pontoRes = await db.query(
        `INSERT INTO pontos_atendimento_pedidos (
          estabelecimento_id, identificacao, nome_ponto, status, usuario_id
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING id`,
        [
          estabelecimento_id,
          identificacao_ponto,
          `Ponto ${identificacao_ponto}`,
          'em_atendimento',
          usuario_id
        ]
      );
      pontoAtendimentoId = pontoRes.rows[0].id;
    }

    return res.status(200).json({
      message: 'Ponto de atendimento aberto com sucesso.',
      ponto_atendimento_id: pontoAtendimentoId,
      status: 'em_atendimento'
    });

  } catch (error) {
    console.error('Erro ao abrir ponto de atendimento:', error);
    return res.status(500).json({ message: 'Erro interno ao abrir ponto de atendimento.' });
  }
};

// Nova função para fechar um ponto de atendimento (mudar para "aberto" ou "disponível")
export const fecharPontoAtendimento = async (req, res) => {
  const { estabelecimento_id, identificacao_ponto, usuario_id } = req.body;
  
  if (!estabelecimento_id || !identificacao_ponto || !usuario_id) {
    return res.status(400).json({ 
      message: 'estabelecimento_id, identificacao_ponto e usuario_id são obrigatórios.' 
    });
  }

  try {
    // Busca o ponto de atendimento
    const pontoRes = await db.query(
      `SELECT pap.id, pap.status, p.valor_total, p.id as pedido_id
       FROM pontos_atendimento_pedidos pap
       LEFT JOIN pedidos p ON pap.id = p.ponto_atendimento_id 
         AND p.status_pedido IN ('pendente', 'em_preparo', 'pronto')
       WHERE pap.estabelecimento_id = $1 AND pap.identificacao = $2`,
      [estabelecimento_id, identificacao_ponto]
    );

    if (pontoRes.rows.length === 0) {
      return res.status(404).json({ message: 'Ponto de atendimento não encontrado.' });
    }

    const ponto = pontoRes.rows[0];
    
    // Verifica se o usuário atual é quem está atendendo
    if (ponto.usuario_id !== Number(usuario_id)) {
      return res.status(403).json({ 
        message: 'Apenas o usuário que está atendendo pode fechar este ponto.' 
      });
    }

    // Determina o novo status baseado no estado atual
    let novoStatus = 'Disponível';
    let nomePonto = '';
    let usuarioId = null;
    let criadoEm = null;

    if (ponto.pedido_id && ponto.valor_total > 0) {
      // Se tem pedido com valor, mantém como "aberto"
      novoStatus = 'aberto';
      nomePonto = `Ponto ${identificacao_ponto}`;
      usuarioId = usuario_id;
      criadoEm = new Date();
    } else {
      // Se não tem pedido ou valor é zero, volta para "disponível"
      novoStatus = 'Disponível';
      nomePonto = '';
      usuarioId = null;
      criadoEm = null;
    }

    // Atualiza o status
    await db.query(
      `UPDATE pontos_atendimento_pedidos 
       SET status = $1, nome_ponto = $2, usuario_id = $3, criado_em = $4, atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [novoStatus, nomePonto, usuarioId, criadoEm, ponto.id]
    );

    return res.status(200).json({
      message: 'Ponto de atendimento fechado com sucesso.',
      novo_status: novoStatus,
      ponto_atendimento_id: ponto.id
    });

  } catch (error) {
    console.error('Erro ao fechar ponto de atendimento:', error);
    return res.status(500).json({ message: 'Erro interno ao fechar ponto de atendimento.' });
  }
};

// Função para verificar se um ponto está disponível para atendimento
export const verificarDisponibilidadePonto = async (req, res) => {
  const { estabelecimento_id, identificacao_ponto } = req.params;
  
  if (!estabelecimento_id || !identificacao_ponto) {
    return res.status(400).json({ 
      message: 'estabelecimento_id e identificacao_ponto são obrigatórios.' 
    });
  }

  try {
    const pontoRes = await db.query(
      `SELECT pap.id, pap.status, pap.usuario_id, pap.criado_em,
              p.valor_total, p.id as pedido_id, p.data_abertura
       FROM pontos_atendimento_pedidos pap
       LEFT JOIN pedidos p ON pap.id = p.ponto_atendimento_id 
         AND p.status_pedido IN ('pendente', 'em_preparo', 'pronto')
       WHERE pap.estabelecimento_id = $1 AND pap.identificacao = $2`,
      [estabelecimento_id, identificacao_ponto]
    );

    if (pontoRes.rows.length === 0) {
      // Ponto não existe, está disponível
      return res.status(200).json({
        disponivel: true,
        status: 'Disponível',
        mensagem: 'Ponto disponível para atendimento'
      });
    }

    const ponto = pontoRes.rows[0];
    
    // Determina o status real baseado nas regras de negócio
    let statusReal = ponto.status;
    
    if (ponto.status === 'em_atendimento') {
      // Verifica se ainda está sendo atendido (timeout de 5 minutos)
      const agora = new Date();
      const ultimaAtualizacao = new Date(ponto.atualizado_em || ponto.criado_em);
      const diffMinutos = (agora - ultimaAtualizacao) / (1000 * 60);
      
      if (diffMinutos > 5) {
        // Timeout - considera como abandonado
        statusReal = 'aberto';
      }
    }

    // Determina disponibilidade baseada no status real
    const disponivel = statusReal === 'Disponível' || statusReal === 'aberto';
    
    return res.status(200).json({
      disponivel,
      status: statusReal,
      usuario_atual: ponto.usuario_id,
      pedido_id: ponto.pedido_id,
      valor_total: ponto.valor_total,
      data_abertura: ponto.data_abertura,
      mensagem: disponivel ? 'Ponto disponível para atendimento' : 'Ponto não disponível no momento'
    });

  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error);
    return res.status(500).json({ message: 'Erro interno ao verificar disponibilidade.' });
  }
};


