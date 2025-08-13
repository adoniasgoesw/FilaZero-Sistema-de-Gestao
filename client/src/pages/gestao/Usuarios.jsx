import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import HeaderApp from "../../components/layout/HeaderApp";
import Sidebar from "../../components/layout/Sidebar";
import SearchBar from "../../components/layout/SearchBar";
import ModalBase from "../../components/modals/Base";
import Paginator from "../../components/layout/Paginator";
import ListagemUsuarios from "../../components/list/ListagemUsuarios";
import FormUsuario from "../../components/forms/FormUsuario";
import api from "../../services/api";

const Usuarios = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [usuarioEmEdicao, setUsuarioEmEdicao] = useState(null);

  const [estabelecimentoId, setEstabelecimentoId] = useState(() => Number(localStorage.getItem('estabelecimentoId')) || null);
  const [allUsuarios, setAllUsuarios] = useState([]);

  useEffect(() => {
    const id = estabelecimentoId || Number(localStorage.getItem('estabelecimentoId'));
    if (!id) return;
    setEstabelecimentoId(id);
    (async () => {
      try {
        const res = await api.get(`/usuarios/${id}`);
        const usuarios = (res.data.usuarios || []).map(u => ({
          id: u.id,
          nome: u.nome_completo,
          email: u.email,
          cpf: u.cpf,
          cargo: u.cargo,
          whatsapp: u.whatsapp,
        }));
        setAllUsuarios(usuarios);
      } catch (e) {
        console.error('Erro ao carregar usuários:', e);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!searchTerm) return allUsuarios;
    const q = searchTerm.toLowerCase();
    return allUsuarios.filter((u) =>
      u.nome.toLowerCase().includes(q) || u.cpf.toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
    );
  }, [allUsuarios, searchTerm]);

  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const pageStart = (currentPage - 1) * itemsPerPage;
  const pageItems = filtered.slice(pageStart, pageStart + itemsPerPage);

  const handleAdd = () => {
    setUsuarioEmEdicao(null);
    setIsAddModalOpen(true);
  };

  const handleClose = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setUsuarioEmEdicao(null);
  };

  const reload = async () => {
    const res = await api.get(`/usuarios/${estabelecimentoId}`);
    const usuarios = (res.data.usuarios || []).map(u => ({
      id: u.id,
      nome: u.nome_completo,
      email: u.email,
      cpf: u.cpf,
      cargo: u.cargo,
      whatsapp: u.whatsapp,
    }));
    setAllUsuarios(usuarios);
  };

  const handleSave = async (payload) => {
    try {
      if (!estabelecimentoId) {
        alert('ID do estabelecimento não encontrado. Faça login novamente.');
        return;
      }
      await api.post('/usuarios', {
        estabelecimento_id: estabelecimentoId,
        nome_completo: payload.nome,
        email: payload.email || undefined,
        whatsapp: payload.whatsapp || undefined,
        cpf: payload.cpf,
        senha: payload.senha,
        cargo: payload.cargo,
      });
      await reload();
      handleClose();
    } catch (e) {
      console.error('Erro ao salvar usuário:', e);
      alert('Erro ao salvar usuário. Tente novamente.');
    }
  };

  const handleEdit = (usuario) => {
    setUsuarioEmEdicao(usuario);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (usuario) => {
    if (!window.confirm(`Tem certeza que deseja deletar o usuário "${usuario.nome}"?`)) return;
    try {
      await api.delete(`/usuarios/${usuario.id}`);
      await reload();
      alert('Usuário deletado com sucesso!');
    } catch (e) {
      console.error('Erro ao deletar usuário:', e);
      alert('Erro ao deletar usuário. Tente novamente.');
    }
  };

  const handleUpdate = async (payload) => {
    try {
      if (!usuarioEmEdicao) return;
      await api.put(`/usuarios/${usuarioEmEdicao.id}`, {
        nome_completo: payload.nome,
        email: payload.email || undefined,
        whatsapp: payload.whatsapp || undefined,
        cpf: payload.cpf,
        senha: payload.senha, // pode estar vazio => ignorado no backend
        cargo: payload.cargo,
      });
      await reload();
      handleClose();
    } catch (e) {
      console.error('Erro ao atualizar usuário:', e);
      alert('Erro ao atualizar usuário. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <HeaderApp />
        <main className="pt-20 pb-16 lg:pb-0 px-4 lg:px-6">
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

          <h1 className="text-3xl font-bold text-[#1A99BA] mb-6">👥 Usuários</h1>

          <ListagemUsuarios
            usuarios={pageItems}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <Paginator
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            className="mt-8"
          />

          <ModalBase isOpen={isAddModalOpen} onClose={handleClose}>
            <FormUsuario onSubmit={handleSave} onCancel={handleClose} />
          </ModalBase>

          <ModalBase isOpen={isEditModalOpen} onClose={handleClose}>
            <FormUsuario onSubmit={handleUpdate} onCancel={handleClose} initialValues={usuarioEmEdicao} />
          </ModalBase>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Usuarios;
