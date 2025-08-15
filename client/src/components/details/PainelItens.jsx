import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import SearchBar from "../layout/SearchBar";
import CounterBadge from "../elements/CounterBadge";

const PainelItens = ({ onAddProduto }) => {
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const estabelecimentoId = Number(localStorage.getItem('estabelecimentoId')) || null;
        if (!estabelecimentoId) {
          setLoading(false);
          return;
        }
        const [catsRes, prodsRes] = await Promise.all([
          api.get(`/categorias/${estabelecimentoId}`),
          api.get(`/produtos/${estabelecimentoId}`),
        ]);
        const cats = (catsRes.data.categorias || []).map(c => ({ id: c.id, nome: c.nome, imagem_url: c.imagem_url }));
        setCategorias(cats);
        const produtosMapeados = (prodsRes.data.produtos || []).map(p => ({
          id: p.id_produto,
          id_categoria: p.id_categoria,
          nome: p.nome_produto,
          precoVenda: p.valor_venda,
          imagem: p.imagem_produto,
        }));
        setProdutos(produtosMapeados);
        if (cats.length > 0) setSelectedCategoriaId(cats[0].id);
      } catch (e) {
        console.error('Erro ao carregar categorias/produtos:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredProdutos = useMemo(() => {
    let list = produtos;
    if (selectedCategoriaId) list = list.filter(p => p.id_categoria === selectedCategoriaId);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(p => String(p.nome).toLowerCase().includes(q));
    }
    return list;
  }, [produtos, selectedCategoriaId, searchTerm]);

  const formatCurrency = (n) => typeof n === 'number' ? n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : n;

  return (
    <div className="flex flex-col h-full">
      {/* Card único (parent fornece bg/border/padding) */}
      {/* Barra de pesquisa reutilizando componente */}
      <div className="mb-3">
        <SearchBar
          value={searchTerm}
          onChange={(e)=>setSearchTerm(e.target.value)}
          rightButtonType={undefined}
        />
      </div>

      {/* Categorias - linha com scroll horizontal e divisor */}
      <div className="mb-3 pb-3 border-b border-gray-200">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {loading && (<div className="text-gray-500">Carregando...</div>)}
          {!loading && categorias.length === 0 && (<div className="text-gray-500">Nenhuma categoria</div>)}
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={()=>setSelectedCategoriaId(cat.id)}
              className={`flex-shrink-0 flex flex-col items-center gap-2 focus:outline-none`}
              title={cat.nome}
            >
              <img
                src={cat.imagem_url || '/logo.png'}
                alt={cat.nome}
                className={`w-16 h-16 object-cover rounded-full border ${selectedCategoriaId === cat.id ? 'border-2 border-[#1A99BA]' : 'border-[#1A99BA]/60'} `}
              />
              <span className={`text-xs text-gray-700 max-w-[4rem] text-center truncate`}>{cat.nome}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Produtos - título e lista rolável */}
      <div className="text-base font-semibold text-gray-800 mb-2">Produtos</div>
      <div className="flex-1 overflow-y-auto">
        {loading && (<div className="text-gray-500">Carregando...</div>)}
        {!loading && filteredProdutos.length === 0 && (
          <div className="text-gray-500">Nenhum produto para esta categoria</div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-2">
          {filteredProdutos.map(prod => (
            <button key={prod.id} onClick={()=>{ onAddProduto?.(prod); setCounts((prev)=>({ ...prev, [prod.id]: (prev[prod.id]||0)+1 })); }} className="group bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow p-2 text-left relative">
              <div className="w-full h-24 bg-gray-100 rounded-md overflow-hidden border border-gray-200 relative">
                {prod.imagem ? (
                  <img src={prod.imagem} alt={prod.nome} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">IMG</div>
                )}
                <CounterBadge count={counts[prod.id]} />
              </div>
              <div className="mt-2">
                <div className="text-sm font-semibold text-gray-800 truncate" title={prod.nome}>{prod.nome}</div>
                <div className="text-sm text-[#1A99BA]">{formatCurrency(prod.precoVenda)}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PainelItens;


