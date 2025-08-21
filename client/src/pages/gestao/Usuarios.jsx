import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import BackButton from '../../components/buttons/BackButton.jsx';
import AdicionarButton from '../../components/buttons/AdicionarButton.jsx';
import ListagemUsuarios from '../../components/list/ListagemUsuarios.jsx';
import ModalBase from '../../components/modals/Base.jsx';
import FormUsuario from '../../components/forms/FormUsuario.jsx';
import Notification from '../../components/elements/Notification.jsx';
import useNotification from '../../components/elements/useNotification.js';
// import StatusChecker from '../../components/elements/StatusChecker.jsx';
import api from '../../services/api.js';
import { Users, Search } from 'lucide-react';

const Usuarios = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalUsuarioOpen, setModalUsuarioOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingUsers, setProcessingUsers] = useState(new Set());
  
  // Hook de notificação
  const { notification, showError, showConfirm, hideNotification } = useNotification();

  // Verifica se o usuário logado é administrador
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.cargo === 'Administrador';

  // Carregar usuários ao montar o componente
  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Pega o estabelecimento_id do usuário logado
      const estabelecimentoId = localStorage.getItem('estabelecimentoId');
      
      if (!estabelecimentoId) {
        setError('Usuário não está logado ou estabelecimento não encontrado.');
        setLoading(false);
        return;
      }

      const response = await api.get(`/usuarios/estabelecimento/${estabelecimentoId}`);
      const data = response.data;
      setUsuarios(data.usuarios || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setError(error.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleAddUser = () => {
    setModalUsuarioOpen(true);
  };

  const handleCloseModal = () => {
    setModalUsuarioOpen(false);
  };

  const handleCloseModalEditar = () => {
    setModalEditarOpen(false);
    setUsuarioEditando(null);
  };

  const handleSubmitUsuario = async (dadosUsuario) => {
    try {
      // Usa a API para criar o usuário
      await api.post('/usuarios', dadosUsuario);
      
      // Recarrega a lista de usuários
      await carregarUsuarios();
      
      // Fecha o modal
      setModalUsuarioOpen(false);
      
      // Não mostra notificação - apenas fecha o modal
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      // O erro será tratado pelo FormUsuario
    }
  };

  const handleSalvarEdicao = async (dadosEditados) => {
    try {
      // Usa a API para atualizar o usuário
      await api.put(`/usuarios/${usuarioEditando.id}`, dadosEditados);
      
      // Atualiza o usuário na lista local
      setUsuarios(prev => prev.map(u => 
        u.id === usuarioEditando.id 
          ? { ...u, ...dadosEditados }
          : u
      ));
      
      // Fecha o modal de edição
      setModalEditarOpen(false);
      setUsuarioEditando(null);
      
      // Não mostra notificação - apenas fecha o modal
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      showError('Erro ao Atualizar', 'Não foi possível atualizar o usuário. Tente novamente.');
    }
  };

  const handleEditUser = (id) => {
    const usuario = usuarios.find(u => u.id === id);
    if (usuario) {
      setUsuarioEditando(usuario);
      setModalEditarOpen(true);
    }
  };

  const handleDeleteUser = async (id) => {
    const usuario = usuarios.find(u => u.id === id);
    if (usuario) {
      showConfirm(
        'Confirmar Exclusão',
        `Tem certeza que deseja excluir o usuário "${usuario.nome_completo}"?`,
        async () => {
          try {
            // Chama a API para excluir o usuário
            await api.delete(`/usuarios/${id}`);
            
            // Remove o usuário da lista local imediatamente (otimistic update)
            setUsuarios(prev => prev.filter(u => u.id !== id));
            
            // NÃO mostra notificação de sucesso - apenas remove da lista
            
          } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            
            // Se for erro de foreign key, mostra mensagem específica
            if (error.message && error.message.includes('registros vinculados')) {
              showError('Não é Possível Excluir', 'Este usuário possui registros vinculados no sistema. Remova primeiro todos os registros associados.');
            } else {
              showError('Erro ao Excluir', 'Não foi possível excluir o usuário. Tente novamente.');
            }
          }
        },
        () => {
          // Usuário cancelou a exclusão - não faz nada
        },
        'Sim, Excluir',
        'Cancelar',
        'danger'
      );
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      // Busca o usuário atual para ver o status
      const usuario = usuarios.find(u => u.id === id);
      if (!usuario) return;

      // Marca o usuário como sendo processado
      setProcessingUsers(prev => new Set(prev).add(id));

      // Atualiza o status (inverte o atual)
      const novoStatus = !usuario.status;
      
      // Mostra feedback visual imediato (otimistic update)
      setUsuarios(prev => prev.map(u => 
        u.id === id ? { ...u, status: novoStatus } : u
      ));
      
      // Chama a API
              await api.put(`/usuarios/${id}`, { status: novoStatus });
      
      // NÃO recarrega a lista inteira - apenas confirma que deu certo
      // A mudança visual já foi feita acima (otimistic update)
      
      // Não mostra notificação - apenas atualiza visualmente
      
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      
      // Reverte a mudança visual em caso de erro
      setUsuarios(prev => prev.map(u => 
        u.id === id ? { ...u, status: !u.status } : u
      ));
      
      showError('Erro ao Alterar Status', 'Não foi possível alterar o status do usuário. Tente novamente.');
    } finally {
      // Remove o usuário da lista de processamento
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const usuariosFiltrados = usuarios.filter(usuario =>
    usuario.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.whatsapp?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.cargo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <StatusChecker /> */}
      <Sidebar />
      <Footer />
      
      {/* Conteúdo principal */}
      <div className="lg:ml-20 pb-20 lg:pb-0 min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Header */}
          <div className="mb-8">
            {/* Layout responsivo: em telas grandes tudo na mesma linha ocupando 100% da largura */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-3 w-full">
              {/* Primeira linha em telas pequenas, primeira coluna em telas grandes */}
              <div className="flex items-center gap-3 w-full lg:flex-1">
                {/* Botão Voltar */}
                <BackButton />
                
                {/* Ícone da página */}
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                
                {/* Barra de Pesquisa - ocupa o espaço restante */}
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Pesquisar por nome, e-mail, WhatsApp ou cargo..."
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Segunda linha em telas pequenas, segunda coluna em telas grandes */}
              <div className="flex justify-start lg:flex-shrink-0 w-full lg:w-auto">
                <AdicionarButton onClick={handleAddUser} color="blue" className="w-full lg:w-auto">
                  Novo Usuário
                </AdicionarButton>
              </div>
            </div>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando usuários...</p>
            </div>
          ) : (
            /* Lista de Usuários */
            <ListagemUsuarios 
              usuarios={usuariosFiltrados}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              onToggleStatus={handleToggleStatus}
              processingUsers={processingUsers}
              isAdmin={isAdmin}
            />
          )}
        </div>
      </div>

      {/* Modal para Novo Usuário */}
      <ModalBase 
        isOpen={modalUsuarioOpen} 
        onClose={handleCloseModal}
      >
        <FormUsuario 
          onClose={handleCloseModal}
          onSubmit={handleSubmitUsuario}
        />
      </ModalBase>

      {/* Modal para Editar Usuário */}
      <ModalBase 
        isOpen={modalEditarOpen} 
        onClose={handleCloseModalEditar}
      >
        <FormUsuario 
          onClose={handleCloseModalEditar}
          onSubmit={handleSalvarEdicao}
          usuarioEditando={usuarioEditando}
          modo="editar"
        />
      </ModalBase>

      {/* Sistema de Notificação Unificado */}
      <Notification
        isOpen={notification.isOpen}
        onClose={hideNotification}
        title={notification.title}
        message={notification.message}
        duration={notification.duration}
        showButtons={notification.showButtons}
        confirmText={notification.confirmText}
        cancelText={notification.cancelText}
        onConfirm={notification.onConfirm}
        onCancel={notification.onCancel}
        type={notification.type}
      />
    </div>
  );
};

export default Usuarios;
