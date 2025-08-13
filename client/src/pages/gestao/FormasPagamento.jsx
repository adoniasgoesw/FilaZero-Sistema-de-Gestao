import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import Sidebar from "../../components/layout/Sidebar";
import SearchBar from "../../components/layout/SearchBar";
import ModalBase from "../../components/modals/Base";
import Paginator from "../../components/layout/Paginator";
import ListagemFormasPagamento from "../../components/list/ListagemFormasPagamento";
import FormFormaPagamento from "../../components/forms/FormFormaPagamento";
import api from "../../services/api";

const FormasPagamento = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [fpEdicao, setFpEdicao] = useState(null);
  const [estabelecimentoId, setEstabelecimentoId] = useState(() => Number(localStorage.getItem('estabelecimentoId')) || null);
  const [formas, setFormas] = useState([]);
  const [tiposPermitidos, setTiposPermitidos] = useState(["Dinheiro","Débito","Crédito","PIX"]);

  useEffect(() => {
    const id = estabelecimentoId || Number(localStorage.getItem('estabelecimentoId'));
    if (!id) return;
    setEstabelecimentoId(id);
    (async () => {
      try {
        const res = await api.get(`/formas-pagamento/${id}`);
        setFormas(res.data.formas || []);
        if (Array.isArray(res.data.allowedTipos) && res.data.allowedTipos.length) {
          setTiposPermitidos(res.data.allowedTipos);
        }
      } catch (e) {
        console.error('Erro ao carregar formas de pagamento:', e);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!searchTerm) return formas;
    const q = searchTerm.toLowerCase();
    return formas.filter(f => f.nome.toLowerCase().includes(q) || f.tipo.toLowerCase().includes(q));
  }, [formas, searchTerm]);

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const pageStart = (currentPage - 1) * itemsPerPage;
  const pageItems = filtered.slice(pageStart, pageStart + itemsPerPage);

  const reload = async () => {
    const res = await api.get(`/formas-pagamento/${estabelecimentoId}`);
    setFormas(res.data.formas || []);
    if (Array.isArray(res.data.allowedTipos) && res.data.allowedTipos.length) {
      setTiposPermitidos(res.data.allowedTipos);
    }
  };

  const handleAdd = () => { setFpEdicao(null); setIsAddOpen(true); };
  const handleClose = () => { setIsAddOpen(false); setIsEditOpen(false); setFpEdicao(null); };
  const handleEdit = (f) => { setFpEdicao(f); setIsEditOpen(true); };
  const handleDelete = async (f) => {
    if (!window.confirm(`Excluir a forma de pagamento "${f.nome}"?`)) return;
    try {
      await api.delete(`/formas-pagamento/${f.id}`);
      await reload();
      alert('Forma de pagamento deletada com sucesso!');
    } catch (e) {
      console.error('Erro ao deletar forma de pagamento:', e);
      alert('Erro ao deletar forma de pagamento. Tente novamente.');
    }
  };
  const handleSave = async (payload) => {
    try {
      await api.post('/formas-pagamento', { ...payload, estabelecimento_id: estabelecimentoId });
      await reload();
      handleClose();
    } catch (e) {
      console.error('Erro ao salvar forma de pagamento:', e);
      const status = e?.response?.status;
      const msg = e?.response?.data?.message;
      if ((status === 409 || status === 400) && msg) {
        alert(msg);
      } else {
        alert('Erro ao salvar forma de pagamento. Tente novamente.');
      }
    }
  };
  const handleUpdate = async (payload) => {
    try {
      await api.put(`/formas-pagamento/${fpEdicao.id}`, payload);
      await reload();
      handleClose();
    } catch (e) {
      console.error('Erro ao atualizar forma de pagamento:', e);
      const status = e?.response?.status;
      const msg = e?.response?.data?.message;
      if ((status === 409 || status === 400) && msg) {
        alert(msg);
      } else {
        alert('Erro ao atualizar forma de pagamento. Tente novamente.');
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar para telas grandes */}
      <Sidebar />
      
      {/* Conteúdo principal */}
      <div className="flex-1" style={{ marginLeft: 'var(--sidebar-w, 16rem)' }}>
        {/* Conteúdo da página */}
        <main className="py-6 px-4 lg:px-6">
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
              <SearchBar
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                rightButtonType="filter"
                onRightButtonClick={() => alert('Filtros: A-Z, Z-A, Mais recentes, Mais antigos')}
              />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-[#1A99BA] mb-6">💳 Formas de Pagamento</h1>

          <ListagemFormasPagamento
            formas={pageItems}
            loading={false}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* Paginator removido conforme solicitação */}

          {/* Modais */}
          <ModalBase isOpen={isAddOpen} onClose={handleClose}>
            <FormFormaPagamento onSubmit={handleSave} onCancel={handleClose} tiposPermitidos={tiposPermitidos} />
          </ModalBase>
          <ModalBase isOpen={isEditOpen} onClose={handleClose}>
            <FormFormaPagamento onSubmit={handleUpdate} onCancel={handleClose} initialValues={fpEdicao} tiposPermitidos={tiposPermitidos} />
          </ModalBase>
        </main>
        
        {/* Footer apenas para telas pequenas */}
        <Footer />
      </div>
    </div>
  );
};

export default FormasPagamento;
