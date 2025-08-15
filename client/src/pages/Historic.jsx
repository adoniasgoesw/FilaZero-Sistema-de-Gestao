import React, { useMemo, useState } from "react";
import Footer from "../components/layout/Footer";
import Sidebar from "../components/layout/Sidebar";
import ModalBase from "../components/modals/Base";
import FormCaixa from "../components/forms/FormCaixa";
import FormFecharCaixa from "../components/forms/FormFecharCaixa";
import ListagemPedidosHistorico from "../components/list/ListagemPedidosHistorico";
import Notification from "../components/elements/Notification";
import api from "../services/api";

const Historic = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);

  const formatCurrency = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const [rows, setRows] = useState([]);
  const [hasOpenCash, setHasOpenCash] = useState(false);
  const [pedidos, setPedidos] = useState([]); // mock por enquanto
  const [show24hNotif, setShow24hNotif] = useState(false);

  // Carrega caixas reais via API
  React.useEffect(() => {
    const estabelecimentoId = Number(localStorage.getItem('estabelecimentoId')) || null;
    if (!estabelecimentoId) return;
    (async () => {
      try {
        const res = await api.get(`/caixas/${estabelecimentoId}`);
        const caixas = res.data.caixas || [];
        setRows(caixas);
        setHasOpenCash(caixas.some(c => c.caixa_aberto));
        // Notificação 24h: verifica o mais recente aberto
        const abertoMaisRecente = caixas.find(c => c.caixa_aberto);
        if (abertoMaisRecente) {
          try {
            const openedAt = new Date(abertoMaisRecente.data_abertura);
            const now = new Date();
            const diffMs = now.getTime() - openedAt.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);
            if (diffHours >= 24) setShow24hNotif(true); else setShow24hNotif(false);
          } catch {}
        } else {
          setShow24hNotif(false);
        }
        // Carrega pedidos fictícios quando houver caixa aberto (mock por enquanto)
        if (caixas.some(c => c.caixa_aberto)) {
          setPedidos([
            { id: 1, data: '2025-08-12 09:10', codigo: '1001', cliente: 'Maria', total: 89.9, pagamento: 'Cartão', status: 'Pago' },
            { id: 2, data: '2025-08-12 09:25', codigo: '1002', cliente: 'João', total: 45.0, pagamento: 'Dinheiro', status: 'Pago' },
            { id: 3, data: '2025-08-12 09:40', codigo: '1003', cliente: '—', total: 29.5, pagamento: 'Pix', status: 'Pago' },
          ]);
        } else {
          setPedidos([]);
        }
      } catch (e) {
        console.error('Erro ao carregar caixas:', e);
      }
    })();
  }, []);

  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const q = searchTerm.toLowerCase();
    return rows.filter((r) =>
      String(r.data_abertura).toLowerCase().includes(q) ||
      String(r.valor_abertura).toLowerCase().includes(q) ||
      String(r.valor_fechamento ?? "").toLowerCase().includes(q) ||
      String(r.valor_total_vendas).toLowerCase().includes(q) ||
      (r.caixa_aberto ? "aberto" : "fechado").includes(q)
    );
  }, [rows, searchTerm]);

  const handleSubmitAbrirCaixa = async (calculatedTotal) => {
    try {
      const estabelecimentoId = Number(localStorage.getItem('estabelecimentoId')) || null;
      if (!estabelecimentoId) {
        alert('ID do estabelecimento não encontrado. Faça login novamente.');
        return;
      }
      await api.post('/caixas', {
        estabelecimento_id: estabelecimentoId,
        valor_abertura: calculatedTotal,
      });
      // Recarrega lista
      const res = await api.get(`/caixas/${estabelecimentoId}`);
      const caixas = res.data.caixas || [];
      setRows(caixas);
      setHasOpenCash(caixas.some(c => c.caixa_aberto));
      setIsOpenModal(false);
    } catch (e) {
      console.error('Erro ao abrir caixa:', e);
      alert('Erro ao abrir caixa. Tente novamente.');
    }
  };

  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isEntradaOpen, setIsEntradaOpen] = useState(false);
  const [isSaidaOpen, setIsSaidaOpen] = useState(false);
  const [entradaValor, setEntradaValor] = useState("");
  const [saidaValor, setSaidaValor] = useState("");
  const handleSubmitFecharCaixa = async (calculatedClosing) => {
    try {
      const estabelecimentoId = Number(localStorage.getItem('estabelecimentoId')) || null;
      if (!estabelecimentoId) {
        alert('ID do estabelecimento não encontrado. Faça login novamente.');
        return;
      }
      // Soma simples de pedidos mockados; quando integrar, trocar por soma real da API
      const totalVendas = pedidos.reduce((acc, p) => acc + (Number(p.total) || 0), 0);

      // Encontrar um caixa aberto para fechar
      const caixaAberto = rows.find(c => c.caixa_aberto);
      if (!caixaAberto) {
        alert('Nenhum caixa aberto encontrado.');
        return;
      }
      await api.put(`/caixas/${caixaAberto.id}`, {
        valor_fechamento: calculatedClosing,
        valor_total_vendas: totalVendas,
      });
      // Recarrega lista
      const res = await api.get(`/caixas/${estabelecimentoId}`);
      const caixas = res.data.caixas || [];
      setRows(caixas);
      setHasOpenCash(caixas.some(c => c.caixa_aberto));
      setIsCloseModalOpen(false);
    } catch (e) {
      console.error('Erro ao fechar caixa:', e);
      alert('Erro ao fechar caixa. Tente novamente.');
    }
  };

  const handleAddEntrada = async () => {
    try {
      const v = Number(entradaValor);
      if (!Number.isFinite(v) || v <= 0) { alert('Informe um valor válido.'); return; }
      const estabelecimentoId = Number(localStorage.getItem('estabelecimentoId')) || null;
      if (!estabelecimentoId) { alert('ID do estabelecimento não encontrado.'); return; }
      const caixaAberto = rows.find(c => c.caixa_aberto);
      if (!caixaAberto) { alert('Nenhum caixa aberto.'); return; }
      await api.post(`/caixas/${caixaAberto.id}/entrada`, { valor: v });
      const res = await api.get(`/caixas/${estabelecimentoId}`);
      const caixas = res.data.caixas || [];
      setRows(caixas);
      setHasOpenCash(caixas.some(c => c.caixa_aberto));
      setIsEntradaOpen(false);
      setEntradaValor("");
    } catch (e) {
      console.error('Erro ao adicionar entrada:', e);
      alert('Erro ao adicionar entrada.');
    }
  };

  const handleAddSaida = async () => {
    try {
      const v = Number(saidaValor);
      if (!Number.isFinite(v) || v <= 0) { alert('Informe um valor válido.'); return; }
      const estabelecimentoId = Number(localStorage.getItem('estabelecimentoId')) || null;
      if (!estabelecimentoId) { alert('ID do estabelecimento não encontrado.'); return; }
      const caixaAberto = rows.find(c => c.caixa_aberto);
      if (!caixaAberto) { alert('Nenhum caixa aberto.'); return; }
      await api.post(`/caixas/${caixaAberto.id}/saida`, { valor: v });
      const res = await api.get(`/caixas/${estabelecimentoId}`);
      const caixas = res.data.caixas || [];
      setRows(caixas);
      setHasOpenCash(caixas.some(c => c.caixa_aberto));
      setIsSaidaOpen(false);
      setSaidaValor("");
    } catch (e) {
      console.error('Erro ao adicionar saída:', e);
      alert('Erro ao adicionar saída.');
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar para telas grandes */}
      <Sidebar />

      {/* Conteúdo principal */}
      <div className="flex-1" style={{ marginLeft: 'var(--sidebar-w, 16rem)' }}>
        {/* Conteúdo da página */}
        <main className="py-6 px-4 lg:px-6 space-y-6">
          {/* Header com busca e ação */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
                <input
                  type="text"
                  placeholder="Pesquisar no histórico..."
                  value={searchTerm}
                  onChange={(e)=>setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A99BA] focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex-shrink-0 flex gap-2">
              {!hasOpenCash ? (
                <button
                  onClick={()=>setIsOpenModal(true)}
                  className="px-4 py-2 rounded-lg bg-[#1A99BA] text-white hover:bg-[#0f5f73] transition-colors duration-200"
                >Abrir caixa</button>
              ) : (
                <>
                  <button
                    onClick={()=>setIsEntradaOpen(true)}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors duration-200"
                  >Adicionar entrada</button>
                  <button
                    onClick={()=>setIsSaidaOpen(true)}
                    className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors duration-200"
                  >Adicionar saída</button>
                  <button
                    onClick={()=>setIsCloseModalOpen(true)}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
                  >Fechar caixa</button>
                </>
              )}
            </div>
          </div>

          {/* Notificação de 24h se o caixa está aberto há muito tempo */}
          {hasOpenCash && show24hNotif && (
            <Notification
              title="Caixa aberto há mais de 24 horas"
              message={<div>
                O caixa está aberto por mais de 24 horas. Considere fechar e abrir um novo caixa para organizar a receita.
              </div>}
              cancelText="OK"
              confirmText="Fechar caixa"
              onCancel={()=>setShow24hNotif(false)}
              onConfirm={()=>setIsCloseModalOpen(true)}
            />
          )}

          {!hasOpenCash ? (
            // Quando caixa fechado: lista caixas
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">Histórico de caixas</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 text-left text-sm text-gray-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Data de abertura</th>
                      <th className="px-4 py-3 font-medium">Valor abertura</th>
                      <th className="px-4 py-3 font-medium">Valor fechamento</th>
                      <th className="px-4 py-3 font-medium">Total vendas</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {filteredRows.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{r.data_abertura}</td>
                        <td className="px-4 py-3">{formatCurrency(r.valor_abertura)}</td>
                        <td className="px-4 py-3">{r.valor_fechamento == null ? '-' : formatCurrency(r.valor_fechamento)}</td>
                        <td className="px-4 py-3">{formatCurrency(r.valor_total_vendas)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${r.caixa_aberto ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {r.caixa_aberto ? 'Aberto' : 'Fechado'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredRows.length === 0 && (
                      <tr>
                        <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>Nenhum resultado</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            // Quando caixa aberto: cards + lista pedidos
            <>
              {/* Cards de resumo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="text-sm text-gray-500">Vendas</div>
                  <div className="text-2xl font-semibold text-gray-800">
                    {formatCurrency(pedidos.reduce((acc,p)=>acc+(Number(p.total)||0),0))}
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="text-sm text-gray-500">Valor de abertura</div>
                  <div className="text-2xl font-semibold text-gray-800">
                    {formatCurrency((rows.find(c=>c.caixa_aberto)?.valor_abertura) || 0)}
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="text-sm text-gray-500">Entradas</div>
                  <div className="text-2xl font-semibold text-gray-800">{formatCurrency((rows.find(c=>c.caixa_aberto)?.entradas)||0)}</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="text-sm text-gray-500">Saídas</div>
                  <div className="text-2xl font-semibold text-gray-800">{formatCurrency((rows.find(c=>c.caixa_aberto)?.saidas)||0)}</div>
                </div>
              </div>

              {/* Listagem em tabela */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800">Histórico de vendas</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 text-left text-sm text-gray-600">
                      <tr>
                        <th className="px-4 py-3 font-medium">Data</th>
                        <th className="px-4 py-3 font-medium">Cliente</th>
                        <th className="px-4 py-3 font-medium">Forma de pagamento</th>
                        <th className="px-4 py-3 font-medium">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {pedidos.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{p.data}</td>
                          <td className="px-4 py-3">{p.cliente || '—'}</td>
                          <td className="px-4 py-3">{p.pagamento}</td>
                          <td className="px-4 py-3">{formatCurrency(p.total)}</td>
                        </tr>
                      ))}
                      {pedidos.length === 0 && (
                        <tr>
                          <td className="px-4 py-6 text-center text-gray-500" colSpan={4}>Nenhuma venda encontrada</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Modal Abrir Caixa */}
          <ModalBase isOpen={isOpenModal} onClose={()=>setIsOpenModal(false)}>
            <FormCaixa onSubmit={handleSubmitAbrirCaixa} onCancel={()=>setIsOpenModal(false)} />
          </ModalBase>

          {/* Modal Fechar Caixa (visual) */}
          <ModalBase isOpen={isCloseModalOpen} onClose={()=>setIsCloseModalOpen(false)}>
            <FormFecharCaixa onSubmit={handleSubmitFecharCaixa} onCancel={()=>setIsCloseModalOpen(false)} />
          </ModalBase>

          {/* Modal Entrada */}
          <ModalBase isOpen={isEntradaOpen} onClose={()=>setIsEntradaOpen(false)}>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-[#1A99BA]">Adicionar entrada</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                <input
                  type="number"
                  step="0.01"
                  value={entradaValor}
                  onChange={(e)=>setEntradaValor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A99BA] focus:border-transparent"
                  placeholder="0,00"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50" onClick={()=>setIsEntradaOpen(false)}>Cancelar</button>
                <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700" onClick={handleAddEntrada}>Adicionar</button>
              </div>
            </div>
          </ModalBase>

          {/* Modal Saída */}
          <ModalBase isOpen={isSaidaOpen} onClose={()=>setIsSaidaOpen(false)}>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-[#1A99BA]">Adicionar saída</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                <input
                  type="number"
                  step="0.01"
                  value={saidaValor}
                  onChange={(e)=>setSaidaValor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A99BA] focus:border-transparent"
                  placeholder="0,00"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50" onClick={()=>setIsSaidaOpen(false)}>Cancelar</button>
                <button className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700" onClick={handleAddSaida}>Adicionar</button>
              </div>
            </div>
          </ModalBase>
        </main>

        {/* Footer apenas para telas pequenas */}
        <Footer />
      </div>
    </div>
  );
};

export default Historic;
