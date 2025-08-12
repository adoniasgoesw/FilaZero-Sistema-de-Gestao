import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import HeaderApp from "../../components/layout/HeaderApp";
import Sidebar from "../../components/layout/Sidebar";
import SearchBar from "../../components/layout/SearchBar";
import ListagemProdutos from "../../components/list/ListagemProdutos";
import Paginator from "../../components/layout/Paginator";
import ModalBase from "../../components/modals/Base";
import FormProduto from "../../components/forms/FormProduto";
import api from "../../services/api";

const Produtos = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);

  const [estabelecimentoId, setEstabelecimentoId] = useState(() => Number(localStorage.getItem('estabelecimentoId')) || null);
  const [categorias, setCategorias] = useState([]);
  const [allProdutos, setAllProdutos] = useState([]);

  // Carrega categorias e produtos reais
  useEffect(() => {
    const id = estabelecimentoId || Number(localStorage.getItem('estabelecimentoId'));
    if (!id) return;
    setEstabelecimentoId(id);

    (async () => {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          api.get(`/categorias/${id}`),
          api.get(`/produtos/${id}`),
        ]);
        setCategorias(catsRes.data.categorias || []);
        const produtosMapeados = (prodsRes.data.produtos || []).map(p => ({
          id: p.id_produto,
          nome: p.nome_produto,
          precoVenda: p.valor_venda,
          precoCompra: p.valor_custo,
          categoria: p.categoria_nome,
          estoque: p.estoque_qtd,
          imagem: p.imagem_produto,
        }));
        setAllProdutos(produtosMapeados);
      } catch (e) {
        // fallback: mock mínimo de 5 linhas
        const categoriasMock = ["Bebidas", "Lanches", "Sobremesas", "Combos", "Outros"];
        setCategorias(categoriasMock.map((n, i) => ({ id: i + 1, nome: n })));
        setAllProdutos(Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          nome: `Produto ${i + 1}`,
          precoVenda: 9.9 + (i % 5) * 2,
          precoCompra: 6.5 + (i % 5) * 1.5,
          categoria: categoriasMock[i % categoriasMock.length],
          estoque: (i * 7) % 50,
        })));
      }
    })();
  }, []);

  // Filtro por busca simples
  const filtered = useMemo(() => {
    if (!searchTerm) return allProdutos;
    const q = searchTerm.toLowerCase();
    return allProdutos.filter((p) =>
      p.nome.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q)
    );
  }, [allProdutos, searchTerm]);

  // Paginação (5 linhas por página)
  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const pageStart = (currentPage - 1) * itemsPerPage;
  const pageItems = filtered.slice(pageStart, pageStart + itemsPerPage);

  const handleAddProduto = () => {
    setProdutoEmEdicao(null);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setProdutoEmEdicao(null);
  };

  const handleSaveProduto = async (payload) => {
    try {
      if (!estabelecimentoId) {
        alert('ID do estabelecimento não encontrado. Faça login novamente.');
        return;
      }
      const formData = new FormData();
      formData.append('id_estabelecimento', estabelecimentoId);
      formData.append('id_categoria', payload.id_categoria);
      formData.append('nome_produto', payload.nome);
      formData.append('valor_venda', payload.precoVenda);
      formData.append('valor_custo', payload.precoCompra);
      formData.append('habilita_estoque', payload.habilita_estoque);
      if (payload.estoque_qtd) formData.append('estoque_qtd', payload.estoque_qtd);
      formData.append('habilita_tempo_preparo', payload.habilita_tempo_preparo);
      if (payload.tempo_preparo_min) formData.append('tempo_preparo_min', payload.tempo_preparo_min);
      if (payload.imagemFile) formData.append('imagem', payload.imagemFile);

      await api.post('/produtos', formData);

      // Recarrega produtos
      const prodsRes = await api.get(`/produtos/${estabelecimentoId}`);
      const produtosMapeados = (prodsRes.data.produtos || []).map(p => ({
        id: p.id_produto,
        nome: p.nome_produto,
        precoVenda: p.valor_venda,
        precoCompra: p.valor_custo,
        categoria: p.categoria_nome,
        estoque: p.estoque_qtd,
        imagem: p.imagem_produto,
      }));
      setAllProdutos(produtosMapeados);
      handleCloseModal();
    } catch (e) {
      console.error('Erro ao salvar produto:', e);
      alert('Erro ao salvar produto. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar para telas grandes */}
      <Sidebar />
      
      {/* Conteúdo principal */}
      <div className="flex-1 lg:ml-64">
        <HeaderApp />
        
        {/* Conteúdo da página */}
        <main className="pt-20 pb-16 lg:pb-0 px-4 lg:px-6">
          {/* Header com voltar e busca */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
            <button
              onClick={() => navigate("/config")}
              className="flex items-center space-x-2 text-[#1A99BA] hover:text-[#0f5f73] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>

            <div className="lg:w-96">
              <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-[#1A99BA] mb-6">📦 Produtos</h1>

          {/* Listagem */}
          <ListagemProdutos produtos={pageItems} onAdd={handleAddProduto} />

          {/* Paginator */}
          <Paginator
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            className="mt-8"
          />
        </main>

        {/* Modal: Novo Produto */}
        <ModalBase isOpen={isAddModalOpen} onClose={handleCloseModal}>
          <FormProduto onSubmit={handleSaveProduto} onCancel={handleCloseModal} categorias={categorias} />
        </ModalBase>
        
        {/* Footer apenas para telas pequenas */}
        <Footer />
      </div>
    </div>
  );
};

export default Produtos;
