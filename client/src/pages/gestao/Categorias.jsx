import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import BackButton from '../../components/buttons/BackButton.jsx';
import AdicionarButton from '../../components/buttons/AdicionarButton.jsx';
import ListagemCategorias from '../../components/list/ListagemCategorias.jsx';
import ModalBase from '../../components/modals/Base.jsx';
import FormCategoria from '../../components/forms/FormCategoria.jsx';
import Notification from '../../components/elements/Notification.jsx';
import useNotification from '../../components/elements/useNotification.js';
import api from '../../services/api.js';
import { Tag, Search } from 'lucide-react';

const Categorias = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalCategoriaOpen, setModalCategoriaOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingCategories, setProcessingCategories] = useState(new Set());
  
  // Hook de notificação
  const { notification, showError, showConfirm, hideNotification } = useNotification();

  // Verifica se o usuário logado é administrador
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.cargo === 'Administrador';

  // Carregar categorias ao montar o componente
  useEffect(() => {
    carregarCategorias();
  }, []);

  const carregarCategorias = async () => {
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

      const response = await api.get(`/categorias/estabelecimento/${estabelecimentoId}`);
      const data = response.data;
      setCategorias(data.categorias || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      setError(error.message || 'Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleAddCategoria = () => {
    setModalCategoriaOpen(true);
  };

  const handleCloseModal = () => {
    setModalCategoriaOpen(false);
  };

  const handleCloseModalEditar = () => {
    setModalEditarOpen(false);
    setCategoriaEditando(null);
  };

  const handleSubmitCategoria = async (dadosCategoria, imagem = null) => {
    try {
      if (imagem) {
        // Se tem imagem, usa FormData
        const formData = new FormData();
        formData.append('estabelecimento_id', localStorage.getItem('estabelecimentoId'));
        formData.append('nome', dadosCategoria.nome);
        formData.append('descricao', dadosCategoria.descricao || '');
        formData.append('imagem', imagem);
        
        await api.post('/categorias', formData);
      } else {
        // Se não tem imagem, usa dados normais
        await api.post('/categorias', dadosCategoria);
      }
      
      // Recarrega a lista de categorias
      await carregarCategorias();
      
      // Fecha o modal
    setModalCategoriaOpen(false);
      
      // Não mostra notificação - apenas fecha o modal
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      // O erro será tratado pelo FormCategoria
    }
  };

  const handleSalvarEdicao = async (dadosEditados, imagem = null) => {
    try {
      if (imagem) {
        // Se tem nova imagem, usa FormData
        const formData = new FormData();
        formData.append('nome', dadosEditados.nome);
        formData.append('descricao', dadosEditados.descricao || '');
        formData.append('imagem', imagem);
        
        await api.put(`/categorias/${categoriaEditando.id}`, formData);
      } else {
        // Se não tem nova imagem, usa dados normais
        await api.put(`/categorias/${categoriaEditando.id}`, dadosEditados);
      }
      
      // Atualiza a categoria na lista local
      setCategorias(prev => prev.map(c => 
        c.id === categoriaEditando.id 
          ? { ...c, ...dadosEditados }
          : c
      ));
      
      // Fecha o modal de edição
      setModalEditarOpen(false);
      setCategoriaEditando(null);
      
      // Não mostra notificação - apenas fecha o modal
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      showError('Erro ao Atualizar', 'Não foi possível atualizar a categoria. Tente novamente.');
    }
  };

  const handleEditCategoria = (id) => {
    const categoria = categorias.find(c => c.id === id);
    if (categoria) {
      setCategoriaEditando(categoria);
      setModalEditarOpen(true);
    }
  };

  const handleDeleteCategoria = async (id) => {
    const categoria = categorias.find(c => c.id === id);
    if (categoria) {
      showConfirm(
        'Confirmar Exclusão',
        `Tem certeza que deseja excluir a categoria "${categoria.nome}"?`,
        async () => {
          try {
            // Chama a API para excluir a categoria
            await api.delete(`/categorias/${id}`);
            
            // Remove a categoria da lista local imediatamente (otimistic update)
            setCategorias(prev => prev.filter(c => c.id !== id));
            
            // NÃO mostra notificação de sucesso - apenas remove da lista
            
          } catch (error) {
            console.error('Erro ao excluir categoria:', error);
            
            // Se for erro de foreign key, mostra mensagem específica
            if (error.message && error.message.includes('produtos vinculados')) {
              showError('Não é Possível Excluir', 'Esta categoria possui produtos vinculados no sistema. Remova primeiro todos os produtos associados.');
            } else {
              showError('Erro ao Excluir', 'Não foi possível excluir a categoria. Tente novamente.');
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
      // Busca a categoria atual para ver o status
      const categoria = categorias.find(c => c.id === id);
      if (!categoria) return;

      // Marca a categoria como sendo processada
      setProcessingCategories(prev => new Set(prev).add(id));

      // Atualiza o status (inverte o atual)
      const novoStatus = !categoria.status;
      
      // Mostra feedback visual imediato (otimistic update)
      setCategorias(prev => prev.map(c => 
        c.id === id ? { ...c, status: novoStatus } : c
      ));
      
      // Chama a API
      await api.put(`/categorias/${id}`, { status: novoStatus });
      
      // NÃO recarrega a lista inteira - apenas confirma que deu certo
      // A mudança visual já foi feita acima (otimistic update)
      
      // Não mostra notificação - apenas atualiza visualmente
      
    } catch (error) {
      console.error('Erro ao alterar status da categoria:', error);
      
      // Reverte a mudança visual em caso de erro
      setCategorias(prev => prev.map(c => 
        c.id === id ? { ...c, status: !c.status } : c
      ));
      
      showError('Erro ao Alterar Status', 'Não foi possível alterar o status da categoria. Tente novamente.');
    } finally {
      // Remove a categoria da lista de processamento
      setProcessingCategories(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const categoriasFiltradas = categorias.filter(categoria =>
    categoria.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    categoria.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
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
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Tag className="h-6 w-6 text-orange-600" />
                </div>
                
                {/* Barra de Pesquisa - ocupa o espaço restante */}
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Pesquisar categorias..."
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Segunda linha em telas pequenas, segunda coluna em telas grandes */}
              <div className="flex justify-start lg:flex-shrink-0 w-full lg:w-auto">
                <AdicionarButton onClick={handleAddCategoria} color="orange" className="w-full lg:w-auto">
                  Nova Categoria
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando categorias...</p>
            </div>
          ) : (
            /* Lista de Categorias */
              <ListagemCategorias 
                categorias={categoriasFiltradas}
                onEdit={handleEditCategoria}
                onDelete={handleDeleteCategoria}
                onToggleStatus={handleToggleStatus}
              processingCategories={processingCategories}
              isAdmin={isAdmin}
              />
          )}
        </div>
      </div>

      {/* Modal para Nova Categoria */}
      <ModalBase 
        isOpen={modalCategoriaOpen} 
        onClose={handleCloseModal}
      >
        <FormCategoria 
          onClose={handleCloseModal}
          onSubmit={handleSubmitCategoria}
        />
      </ModalBase>

      {/* Modal para Editar Categoria */}
      <ModalBase 
        isOpen={modalEditarOpen} 
        onClose={handleCloseModalEditar}
      >
        <FormCategoria 
          onClose={handleCloseModalEditar}
          onSubmit={handleSalvarEdicao}
          categoriaEditando={categoriaEditando}
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

export default Categorias;
