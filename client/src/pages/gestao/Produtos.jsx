import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import BackButton from '../../components/buttons/BackButton.jsx';
import AdicionarButton from '../../components/buttons/AdicionarButton.jsx';
import ListagemProdutos from '../../components/list/ListagemProdutos.jsx';
import ModalBase from '../../components/modals/Base.jsx';
import FormProduto from '../../components/forms/FormProduto.jsx';
import Notification from '../../components/elements/Notification.jsx';
import useNotification from '../../components/elements/useNotification.js';
import api from '../../services/api.js';
import { Package, Search } from 'lucide-react';

const Produtos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalProdutoOpen, setModalProdutoOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingProducts, setProcessingProducts] = useState(new Set());
  
  // Hook de notificação
  const { notification, showError, showConfirm, hideNotification } = useNotification();

  // Verifica se o usuário logado é administrador
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.cargo === 'Administrador';

  // Carregar produtos ao montar o componente
  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
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

      const response = await api.get(`/produtos/estabelecimento/${estabelecimentoId}`);
      const data = response.data;
      setProdutos(data.produtos || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setError(error.message || 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleAddProduto = () => {
    setModalProdutoOpen(true);
  };

  const handleCloseModal = () => {
    setModalProdutoOpen(false);
  };

  const handleCloseModalEditar = () => {
    setModalEditarOpen(false);
    setProdutoEditando(null);
  };

  const handleSubmitProduto = async (dadosProduto, imagem = null) => {
    try {
      if (imagem) {
        // Se tem imagem, usa FormData
        const formData = new FormData();
        formData.append('estabelecimento_id', localStorage.getItem('estabelecimentoId'));
        formData.append('categoria_id', dadosProduto.categoria_id);
        formData.append('nome', dadosProduto.nome);
        formData.append('descricao', dadosProduto.descricao || '');
        formData.append('valor_venda', dadosProduto.valor_venda);
        formData.append('valor_custo', dadosProduto.valor_custo || '');
        formData.append('habilitar_estoque', dadosProduto.habilitar_estoque);
        formData.append('quantidade_estoque', dadosProduto.quantidade_estoque);
        formData.append('habilitar_tempo_preparo', dadosProduto.habilitar_tempo_preparo);
        formData.append('tempo_preparo', dadosProduto.tempo_preparo);
        formData.append('imagem', imagem);
        
        await api.post('/produtos', formData);
      } else {
        // Se não tem imagem, usa dados normais
        await api.post('/produtos', dadosProduto);
      }
      
      // Recarrega a lista de produtos
      await carregarProdutos();
      
      // Fecha o modal
    setModalProdutoOpen(false);
      
      // Não mostra notificação - apenas fecha o modal
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      // O erro será tratado pelo FormProduto
    }
  };

  const handleSalvarEdicao = async (dadosEditados, imagem = null) => {
    try {
      if (imagem) {
        // Se tem nova imagem, usa FormData
        const formData = new FormData();
        formData.append('nome', dadosEditados.nome);
        formData.append('categoria_id', dadosEditados.categoria_id);
        formData.append('descricao', dadosEditados.descricao || '');
        formData.append('valor_venda', dadosEditados.valor_venda);
        formData.append('valor_custo', dadosEditados.valor_custo || '');
        formData.append('habilitar_estoque', dadosEditados.habilitar_estoque);
        formData.append('quantidade_estoque', dadosEditados.quantidade_estoque);
        formData.append('habilitar_tempo_preparo', dadosEditados.habilitar_tempo_preparo);
        formData.append('tempo_preparo', dadosEditados.tempo_preparo);
        formData.append('imagem', imagem);
        
        await api.put(`/produtos/${produtoEditando.id}`, formData);
      } else {
        // Se não tem nova imagem, usa dados normais
        await api.put(`/produtos/${produtoEditando.id}`, dadosEditados);
      }
      
      // Atualiza o produto na lista local
      setProdutos(prev => prev.map(p => 
        p.id === produtoEditando.id 
          ? { ...p, ...dadosEditados }
          : p
      ));
      
      // Fecha o modal de edição
      setModalEditarOpen(false);
      setProdutoEditando(null);
      
      // Não mostra notificação - apenas fecha o modal
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      showError('Erro ao Atualizar', 'Não foi possível atualizar o produto. Tente novamente.');
    }
  };

  const handleEditProduto = (id) => {
    const produto = produtos.find(p => p.id === id);
    if (produto) {
      setProdutoEditando(produto);
      setModalEditarOpen(true);
    }
  };

  const handleDeleteProduto = async (id) => {
    const produto = produtos.find(p => p.id === id);
    if (produto) {
      showConfirm(
        'Confirmar Exclusão',
        `Tem certeza que deseja excluir o produto "${produto.nome}"?`,
        async () => {
          try {
            // Chama a API para excluir o produto
            await api.delete(`/produtos/${id}`);
            
            // Remove o produto da lista local imediatamente (otimistic update)
            setProdutos(prev => prev.filter(p => p.id !== id));
            
            // NÃO mostra notificação de sucesso - apenas remove da lista
            
          } catch (error) {
            console.error('Erro ao excluir produto:', error);
            
            // Se for erro de foreign key, mostra mensagem específica
            if (error.message && error.message.includes('registros vinculados')) {
              showError('Não é Possível Excluir', 'Este produto possui registros vinculados no sistema. Remova primeiro todos os registros associados.');
            } else {
              showError('Erro ao Excluir', 'Não foi possível excluir o produto. Tente novamente.');
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
      // Busca o produto atual para ver o status
      const produto = produtos.find(p => p.id === id);
      if (!produto) return;

      // Marca o produto como sendo processado
      setProcessingProducts(prev => new Set(prev).add(id));

      // Atualiza o status (inverte o atual)
      const novoStatus = !produto.status;
      
      // Mostra feedback visual imediato (otimistic update)
      setProdutos(prev => prev.map(p => 
        p.id === id ? { ...p, status: novoStatus } : p
      ));
      
      // Chama a API
              await api.put(`/produtos/${id}`, { status: novoStatus });
      
      // NÃO recarrega a lista inteira - apenas confirma que deu certo
      // A mudança visual já foi feita acima (otimistic update)
      
      // Não mostra notificação - apenas atualiza visualmente
      
    } catch (error) {
      console.error('Erro ao alterar status do produto:', error);
      
      // Reverte a mudança visual em caso de erro
      setProdutos(prev => prev.map(p => 
        p.id === id ? { ...p, status: !p.status } : p
      ));
      
      showError('Erro ao Alterar Status', 'Não foi possível alterar o status do produto. Tente novamente.');
    } finally {
      // Remove o produto da lista de processamento
      setProcessingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const produtosFiltrados = produtos.filter(produto =>
    produto.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.categoria_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
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
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="h-6 w-6 text-indigo-600" />
                </div>
                
                {/* Barra de Pesquisa - ocupa o espaço restante */}
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Pesquisar produtos..."
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Segunda linha em telas pequenas, segunda coluna em telas grandes */}
              <div className="flex justify-start lg:flex-shrink-0 w-full lg:w-auto">
                <AdicionarButton onClick={handleAddProduto} color="indigo" className="w-full lg:w-auto">
                  Novo Produto
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando produtos...</p>
            </div>
          ) : (
            /* Lista de Produtos */
          <ListagemProdutos 
            produtos={produtosFiltrados}
            onEdit={handleEditProduto}
            onDelete={handleDeleteProduto}
            onToggleStatus={handleToggleStatus}
              processingProducts={processingProducts}
              isAdmin={isAdmin}
          />
          )}
        </div>
      </div>

      {/* Modal para Novo Produto */}
      <ModalBase 
        isOpen={modalProdutoOpen} 
        onClose={handleCloseModal}
      >
        <FormProduto 
          onClose={handleCloseModal}
          onSubmit={handleSubmitProduto}
        />
      </ModalBase>

      {/* Modal para Editar Produto */}
      <ModalBase 
        isOpen={modalEditarOpen} 
        onClose={handleCloseModalEditar}
      >
        <FormProduto 
          onClose={handleCloseModalEditar}
          onSubmit={handleSalvarEdicao}
          produtoEditando={produtoEditando}
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

export default Produtos;
