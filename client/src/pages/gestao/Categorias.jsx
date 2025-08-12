import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import HeaderApp from "../../components/layout/HeaderApp";
import Sidebar from "../../components/layout/Sidebar";
import SearchBar from "../../components/layout/SearchBar";
import ListagemCategorias from "../../components/list/ListagemCategorias";
import Paginator from "../../components/layout/Paginator";
import ModalBase from "../../components/modals/Base";
import FormCategoria from "../../components/forms/FormCategoria";
import api from "../../services/api";

const Categorias = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [categoriaEmEdicao, setCategoriaEmEdicao] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estabelecimentoId, setEstabelecimentoId] = useState(null);

  // Buscar estabelecimento_id priorizando localStorage (sem request)
  useEffect(() => {
    const estId = localStorage.getItem("estabelecimentoId");
    if (estId) {
      setEstabelecimentoId(Number(estId));
      return;
    }

    // Fallback: buscar via API user-details se necessário
    const userId = localStorage.getItem("userId") || localStorage.getItem("usuarioId");
    if (userId) {
      api.get(`/user-details/${userId}`)
        .then(response => {
          const id = response.data.estabelecimento_id;
          if (id) {
            setEstabelecimentoId(id);
            localStorage.setItem("estabelecimentoId", id);
          }
        })
        .catch(error => {
          console.error("Erro ao buscar dados do usuário:", error);
        });
    }
  }, []);

  // Buscar categorias quando estabelecimento_id estiver disponível
  useEffect(() => {
    if (estabelecimentoId) {
      fetchCategorias();
    }
  }, [estabelecimentoId]);

  const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

  const getCache = (key) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.timestamp > CACHE_TTL_MS) return null;
      return parsed.data;
    } catch {
      return null;
    }
  };

  const setCache = (key, data) => {
    localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data }));
  };

  const fetchCategorias = async () => {
    try {
      setLoading(true);

      // 1) Tenta cache
      const cacheKey = `categorias:${estabelecimentoId}`;
      const cacheData = getCache(cacheKey);
      if (cacheData) {
        setCategorias(cacheData);
      }

      // 2) Busca no servidor e atualiza cache
      const response = await api.get(`/categorias/${estabelecimentoId}`);
      setCategorias(response.data.categorias);
      setCache(cacheKey, response.data.categorias);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategoria = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setCategoriaEmEdicao(null);
  };

  const handleSaveCategoria = async (payload) => {
    try {
      if (!estabelecimentoId) {
        alert("Erro: ID do estabelecimento não encontrado. Faça login novamente.");
        return;
      }

      const formData = new FormData();
      formData.append('nome', payload.name);
      formData.append('estabelecimento_id', estabelecimentoId);
      if (payload.imageFile) {
        formData.append('imagem', payload.imageFile);
      }

      await api.post('/categorias', formData);

      // Atualiza cache e lista
      const response = await api.get(`/categorias/${estabelecimentoId}`);
      setCategorias(response.data.categorias);
      setCache(`categorias:${estabelecimentoId}`, response.data.categorias);
      handleCloseAddModal();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      alert("Erro ao salvar categoria. Tente novamente.");
    }
  };

  const handleEditCategoria = (categoria) => {
    setCategoriaEmEdicao(categoria);
    setIsEditModalOpen(true);
  };

  const handleDeleteCategoria = async (categoria) => {
    if (window.confirm(`Tem certeza que deseja deletar a categoria "${categoria.nome}"?`)) {
      try {
        await api.delete(`/categorias/${categoria.id}`);
        const response = await api.get(`/categorias/${estabelecimentoId}`);
        setCategorias(response.data.categorias);
        setCache(`categorias:${estabelecimentoId}`, response.data.categorias);
        alert("Categoria deletada com sucesso!");
      } catch (error) {
        console.error("Erro ao deletar categoria:", error);
        alert("Erro ao deletar categoria. Tente novamente.");
      }
    }
  };

  const handleUpdateCategoria = async (payload) => {
    try {
      if (!estabelecimentoId) {
        alert("Erro: ID do estabelecimento não encontrado. Faça login novamente.");
        return;
      }

      const formData = new FormData();
      formData.append('nome', payload.name);
      if (payload.imageFile) {
        formData.append('imagem', payload.imageFile);
      }

      await api.put(`/categorias/${categoriaEmEdicao.id}`, formData);

      // Atualiza cache e lista
      const response = await api.get(`/categorias/${estabelecimentoId}`);
      setCategorias(response.data.categorias);
      setCache(`categorias:${estabelecimentoId}`, response.data.categorias);
      handleCloseEditModal();
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      alert("Erro ao atualizar categoria. Tente novamente.");
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
          {/* Header com botão voltar e search bar */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
            <button
              onClick={() => navigate("/config")}
              className="flex items-center space-x-2 text-[#1A99BA] hover:text-[#0f5f73] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            
            <div className="lg:w-96">
              <SearchBar />
            </div>
          </div>

          {/* Título da página */}
          <h1 className="text-3xl font-bold text-[#1A99BA] mb-6">
            📂 Categorias
          </h1>

          {/* Listagem de Categorias */}
          <div className="mb-6">
            <ListagemCategorias
              categorias={categorias}
              loading={loading}
              onAdd={handleAddCategoria}
              onEdit={handleEditCategoria}
              onDelete={handleDeleteCategoria}
            />
          </div>

          {/* Paginator */}
          <Paginator
            currentPage={currentPage}
            totalPages={3}
            totalItems={25}
            itemsPerPage={10}
            onPageChange={setCurrentPage}
            className="mt-8"
          />

          {/* Modal: Nova Categoria */}
          <ModalBase isOpen={isAddModalOpen} onClose={handleCloseAddModal}>
            <FormCategoria onSubmit={handleSaveCategoria} onCancel={handleCloseAddModal} />
          </ModalBase>

          {/* Modal: Editar Categoria */}
          <ModalBase isOpen={isEditModalOpen} onClose={handleCloseEditModal}>
            <FormCategoria 
              onSubmit={handleUpdateCategoria} 
              onCancel={handleCloseEditModal}
              initialValues={categoriaEmEdicao}
            />
          </ModalBase>
        </main>
        
        {/* Footer apenas para telas pequenas */}
        <Footer />
      </div>
    </div>
  );
};

export default Categorias;
