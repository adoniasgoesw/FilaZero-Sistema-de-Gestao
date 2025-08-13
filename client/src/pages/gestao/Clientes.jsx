import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import Sidebar from "../../components/layout/Sidebar";
import SearchBar from "../../components/layout/SearchBar";
import ModalBase from "../../components/modals/Base";
import Paginator from "../../components/layout/Paginator";
import ListagemClientes from "../../components/list/ListagemClientes";
import FormCliente from "../../components/forms/FormCliente";
import api from "../../services/api";

const Clientes = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [clienteEdicao, setClienteEdicao] = useState(null);
  const [estabelecimentoId, setEstabelecimentoId] = useState(() => Number(localStorage.getItem('estabelecimentoId')) || null);
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    const id = estabelecimentoId || Number(localStorage.getItem('estabelecimentoId'));
    if (!id) return;
    setEstabelecimentoId(id);
    (async () => {
      try {
        const res = await api.get(`/clientes/${id}`);
        setClientes(res.data.clientes || []);
      } catch (e) {
        console.error('Erro ao carregar clientes:', e);
      }
    })();
  }, []);

  const reload = async () => {
    const res = await api.get(`/clientes/${estabelecimentoId}`);
    setClientes(res.data.clientes || []);
  };

  const filtered = useMemo(() => {
    if (!searchTerm) return clientes;
    const q = searchTerm.toLowerCase();
    return clientes.filter((c) =>
      c.nome.toLowerCase().includes(q) ||
      (c.cpf_cnpj || "").toLowerCase().includes(q) ||
      (c.endereco || "").toLowerCase().includes(q) ||
      (c.telefone || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q)
    );
  }, [clientes, searchTerm]);

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const pageStart = (currentPage - 1) * itemsPerPage;
  const pageItems = filtered.slice(pageStart, pageStart + itemsPerPage);

  const handleAdd = () => { setClienteEdicao(null); setIsAddOpen(true); };
  const handleClose = () => { setIsAddOpen(false); setIsEditOpen(false); setClienteEdicao(null); };
  const handleEdit = (c) => { setClienteEdicao(c); setIsEditOpen(true); };
  const handleDelete = async (c) => {
    if (!window.confirm(`Excluir o cliente "${c.nome}"?`)) return;
    try {
      await api.delete(`/clientes/${c.id}`);
      await reload();
      alert('Cliente deletado com sucesso!');
    } catch (e) {
      console.error('Erro ao deletar cliente:', e);
      alert('Erro ao deletar cliente. Tente novamente.');
    }
  };
  const handleSave = async (payload) => {
    try {
      await api.post('/clientes', { ...payload, estabelecimento_id: estabelecimentoId });
      await reload();
      handleClose();
    } catch (e) {
      console.error('Erro ao salvar cliente:', e);
      const status = e?.response?.status;
      const msg = e?.response?.data?.message;
      if ((status === 409 || status === 400) && msg) {
        alert(msg);
      } else {
        alert('Erro ao salvar cliente. Tente novamente.');
      }
    }
  };
  const handleUpdate = async (payload) => {
    try {
      await api.put(`/clientes/${clienteEdicao.id}`, payload);
      await reload();
      handleClose();
    } catch (e) {
      console.error('Erro ao atualizar cliente:', e);
      const status = e?.response?.status;
      const msg = e?.response?.data?.message;
      if ((status === 409 || status === 400) && msg) {
        alert(msg);
      } else {
        alert('Erro ao atualizar cliente. Tente novamente.');
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

          <h1 className="text-3xl font-bold text-[#1A99BA] mb-6">📇 Clientes</h1>

          <ListagemClientes
            clientes={pageItems}
            loading={false}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* Paginator removido conforme solicitação */}

          {/* Modais */}
          <ModalBase isOpen={isAddOpen} onClose={handleClose}>
            <FormCliente onSubmit={handleSave} onCancel={handleClose} />
          </ModalBase>
          <ModalBase isOpen={isEditOpen} onClose={handleClose}>
            <FormCliente onSubmit={handleUpdate} onCancel={handleClose} initialValues={clienteEdicao} />
          </ModalBase>
        </main>
        
        {/* Footer apenas para telas pequenas */}
        <Footer />
      </div>
    </div>
  );
};

export default Clientes;
