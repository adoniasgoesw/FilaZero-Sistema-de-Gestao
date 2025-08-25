import React, { useState, useEffect } from 'react';
import SearchBar from '../layout/SearchBar.jsx';
import api from '../../services/api.js';
import ConfirmButton from '../buttons/ConfirmButton.jsx';
import CancelButton from '../buttons/CancelButton.jsx';
import InfoButton from '../buttons/InfoButton.jsx';
import BackButton from '../buttons/BackButton.jsx';
import { useNavigate } from 'react-router-dom';

const PainelItens = ({ 
  searchTerm, 
  onSearchChange,
  onInfoClick,
  onBackToHome,
  showInfoButton = true
}) => {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProdutos, setLoadingProdutos] = useState(true);
  const [itensSelecionados, setItensSelecionados] = useState([]);

  // Carregar categorias ao montar o componente
  useEffect(() => {
    carregarCategorias();
    carregarProdutos();
  }, []);

  // Filtrar produtos quando categoria for selecionada ou produtos mudarem
  useEffect(() => {
    if (categoriaSelecionada) {
      const filtrados = produtos.filter(produto => produto.categoria_id === categoriaSelecionada);
      setProdutosFiltrados(filtrados);
    } else {
      setProdutosFiltrados(produtos);
    }
  }, [categoriaSelecionada, produtos]);

  const carregarCategorias = async () => {
    try {
      setLoading(true);
      const estabelecimentoId = localStorage.getItem('estabelecimentoId') || '9';
      const response = await api.get(`/categorias/estabelecimento/${estabelecimentoId}`);
      const categoriasData = response.data.categorias || [];
      setCategorias(categoriasData);
      
      // Selecionar primeira categoria por padrão
      if (categoriasData.length > 0 && !categoriaSelecionada) {
        setCategoriaSelecionada(categoriasData[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarProdutos = async () => {
    try {
      setLoadingProdutos(true);
      const estabelecimentoId = localStorage.getItem('estabelecimentoId') || '9';
      const response = await api.get(`/produtos/estabelecimento/${estabelecimentoId}`);
      setProdutos(response.data.produtos || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoadingProdutos(false);
    }
  };

  const handleCategoriaClick = (categoriaId) => {
    console.log('Categoria selecionada:', categoriaId);
    setCategoriaSelecionada(categoriaId);
  };

  const handleProdutoClick = (produto) => {
    setItensSelecionados(prev => {
      const itemExistente = prev.find(item => item.id === produto.id);
      
      if (itemExistente) {
        // Se o item já existe, incrementa a quantidade
        return prev.map(item => 
          item.id === produto.id 
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      } else {
        // Se o item não existe, adiciona com quantidade 1
        return [...prev, { ...produto, quantidade: 1 }];
      }
    });
  };

  const handleSalvar = () => {
    console.log('Itens selecionados:', itensSelecionados);
    // Aqui você pode implementar a lógica para salvar os itens
  };

  const handleCancelar = () => {
    // Navegar para a página Home
    navigate('/home');
  };

  const handleInfo = () => {
    if (onInfoClick) {
      onInfoClick();
    } else {
      console.log('Informações dos itens selecionados:', itensSelecionados);
    }
  };

  const handleBackToHome = () => {
    if (onBackToHome) {
      onBackToHome();
    } else {
      navigate('/home');
    }
  };

  const getQuantidadeItem = (produtoId) => {
    const item = itensSelecionados.find(item => item.id === produtoId);
    return item ? item.quantidade : 0;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full flex flex-col overflow-hidden">
      {/* Header com Barra de Pesquisa e Botão Voltar - Primeiro */}
      <div className="flex-shrink-0 p-3 sm:p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {/* Botão Voltar - Só aparece em telas pequenas, usando o BackButton existente */}
          <div className="block lg:hidden">
            <div onClick={handleBackToHome}>
              <BackButton />
            </div>
          </div>
          
          {/* Barra de Pesquisa */}
          <div className="flex-1">
            <SearchBar 
              value={searchTerm}
              onChange={onSearchChange}
              placeholder="Pesquisar itens..."
            />
          </div>
        </div>
      </div>

      {/* Categorias - Segundo, com scroll horizontal e barra invisível */}
      <div className="flex-shrink-0 p-3 sm:p-4 border-b border-gray-200 relative z-10">
        {loading ? (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <div className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide">
            {categorias.map((categoria) => (
              <div 
                key={categoria.id} 
                className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform outline-none focus:outline-none flex-shrink-0"
                onClick={() => handleCategoriaClick(categoria.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCategoriaClick(categoria.id);
                  }
                }}
                tabIndex={0}
              >
                {/* Imagem ou Cor/Ícone - Redonda com borda azul */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-3 border-blue-500 overflow-hidden mb-2 flex items-center justify-center">
                  {categoria.imagem_url ? (
                    <>
                      <img 
                        src={`http://localhost:3001${categoria.imagem_url}`} 
                        alt={categoria.nome}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div 
                        className="w-full h-full flex items-center justify-center text-lg sm:text-xl"
                        style={{ backgroundColor: categoria.cor || '#FF6B6B', display: 'none' }}
                      >
                        {categoria.icone || '🏷️'}
                      </div>
                    </>
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center text-lg sm:text-xl"
                      style={{ backgroundColor: categoria.cor || '#FF6B6B' }}
                    >
                      {categoria.icone || '🏷️'}
                    </div>
                  )}
                </div>
                
                {/* Nome da Categoria */}
                <div className="text-xs font-medium text-gray-700 text-center max-w-14 sm:max-w-16 leading-tight truncate">
                  {categoria.nome}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Listagem de Produtos - Terceiro, cards organizados */}
      <div className="flex-1 p-3 sm:p-4 overflow-hidden">
        {loadingProdutos ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : produtosFiltrados.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {produtosFiltrados.map((produto) => {
              const quantidade = getQuantidadeItem(produto.id);
              return (
                <div 
                  key={produto.id} 
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 cursor-pointer hover:shadow-md transition-shadow relative flex flex-col h-40 sm:h-44"
                  onClick={() => handleProdutoClick(produto)}
                >
                  {/* Contador de Quantidade */}
                  {quantidade > 0 && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold z-10">
                      {quantidade}
                    </div>
                  )}
                  
                  {/* Imagem do Produto - Altura fixa */}
                  <div className="w-full h-20 sm:h-24 rounded-lg overflow-hidden mb-3 bg-gray-100 flex-shrink-0">
                    {produto.imagem_url ? (
                      <>
                        <img 
                          src={`http://localhost:3001${produto.imagem_url}`} 
                          alt={produto.nome}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div 
                          className="w-full h-full flex items-center justify-center text-lg sm:text-xl text-gray-400"
                          style={{ display: 'none' }}
                        >
                          🍽️
                        </div>
                      </>
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center text-lg sm:text-xl text-gray-400"
                        style={{ backgroundColor: produto.cor || '#F3F4F6' }}
                      >
                        {produto.icone || '🍽️'}
                      </div>
                    )}
                  </div>
                  
                  {/* Nome do Produto - Sem cortes, altura flexível */}
                  <div className="text-sm font-medium text-gray-900 mb-2 leading-tight text-left flex-1 min-h-0">
                    <div className="line-clamp-2 break-words">
                      {produto.nome}
                    </div>
                  </div>
                  
                  {/* Preço do Produto - Altura fixa */}
                  <div className="text-base font-bold text-orange-600 text-left flex-shrink-0 mt-auto">
                    R$ {parseFloat(produto.valor_venda).toFixed(2).replace('.', ',')}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center text-gray-500">
            <div>
              <p className="text-base sm:text-lg mb-2">Nenhum produto encontrado.</p>
              <p className="text-sm">Selecione uma categoria para ver os produtos.</p>
            </div>
          </div>
        )}
      </div>

      {/* Botões de Ação - Quarto (Footer) */}
      <div className="flex-shrink-0 p-3 sm:p-4 border-t border-gray-200 bg-white">
        <div className="flex justify-between items-center">
          {/* Botão de Informação - Só aparece em telas pequenas quando showInfoButton é true */}
          {showInfoButton && (
            <div className="block lg:hidden">
              <InfoButton onClick={handleInfo} />
            </div>
          )}
          
          {/* Espaçador invisível para telas grandes */}
          <div className="hidden lg:block"></div>
          
          {/* Botões Salvar e Cancelar */}
          <div className="flex gap-3">
            <button
              onClick={handleCancelar}
              className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm"
            >
              Cancelar
            </button>
            <ConfirmButton 
              onClick={handleSalvar}
              disabled={itensSelecionados.length === 0}
            >
              Salvar ({itensSelecionados.length})
            </ConfirmButton>
          </div>
        </div>
      </div>

      {/* CSS para esconder a barra de rolagem */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;  /* Internet Explorer 10+ */
          scrollbar-width: none;  /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;  /* Safari and Chrome */
        }
      `}</style>
    </div>
  );
};

export default PainelItens;
