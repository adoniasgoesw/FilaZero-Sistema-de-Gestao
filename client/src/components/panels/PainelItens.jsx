import React, { useState, useEffect } from 'react';
import SearchBar from '../layout/SearchBar.jsx';
import InfoButton from '../buttons/InfoButton.jsx';
import CancelButton from '../buttons/CancelButton.jsx';
import { Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';

const PainelItens = ({ 
  searchTerm, 
  onSearchChange, 
  onCancel, 
  onSave, 
  onInfo
}) => {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProdutos, setLoadingProdutos] = useState(true);

  // Carregar categorias e produtos ao montar o componente
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
    setCategoriaSelecionada(categoriaId);
  };

  const handleVoltar = () => {
    navigate('/home'); // Volta para a página Home
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] flex flex-col">
             {/* Header com Barra de Pesquisa - FIXO */}
       <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
         {/* Botão Voltar e Barra de Pesquisa na mesma linha */}
         <div className="flex items-center gap-3 mb-4">
           {/* Botão Voltar - só aparece em telas pequenas */}
           <div className="lg:hidden">
             <button
               onClick={handleVoltar}
               className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors shadow-sm flex-shrink-0"
               title="Voltar para Home"
             >
               <ArrowLeft className="h-5 w-5 text-gray-600" />
             </button>
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
      
      {/* Categorias - FIXAS */}
      <div className="border-b border-gray-200 flex-shrink-0">
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex gap-4 sm:gap-6 pb-2 min-w-max">
                {categorias.map((categoria) => (
                  <div 
                    key={categoria.id} 
                    className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform outline-none focus:outline-none"
                    onClick={() => handleCategoriaClick(categoria.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleCategoriaClick(categoria.id);
                      }
                    }}
                    tabIndex={0}
                  >
                    {/* Imagem ou Cor/Ícone */}
                                         <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-blue-500 overflow-hidden mb-2 sm:mb-3 flex items-center justify-center">
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
                            className="w-full h-full flex items-center justify-center text-xl sm:text-2xl"
                            style={{ backgroundColor: categoria.cor || '#FF6B6B', display: 'none' }}
                          >
                            {categoria.icone || '🏷️'}
                          </div>
                        </>
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center text-xl sm:text-2xl"
                          style={{ backgroundColor: categoria.cor || '#FF6B6B' }}
                        >
                          {categoria.icone || '🏷️'}
                        </div>
                      )}
                    </div>
                    
                                         {/* Nome da Categoria */}
                     <div className="text-xs font-medium text-gray-700 text-center max-w-16 sm:max-w-20 leading-tight truncate">
                       {categoria.nome}
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Listagem de Produtos - COM SCROLL */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {loadingProdutos ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : produtosFiltrados.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {produtosFiltrados.map((produto) => (
              <div 
                key={produto.id} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-3 cursor-pointer hover:shadow-md transition-shadow"
              >
                {/* Imagem do Produto */}
                <div className="w-full aspect-square rounded-lg overflow-hidden mb-2 bg-gray-100">
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
                
                {/* Nome do Produto */}
                <div className="text-xs sm:text-sm font-medium text-gray-900 mb-1 leading-tight text-left line-clamp-2">
                  {produto.nome}
                </div>
                
                {/* Preço do Produto */}
                <div className="text-sm sm:text-base font-bold text-orange-600 text-left">
                  R$ {parseFloat(produto.valor_venda).toFixed(2).replace('.', ',')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-base sm:text-lg">Nenhum produto encontrado.</p>
            <p className="text-sm">Selecione uma categoria para ver os produtos.</p>
          </div>
        )}
      </div>

      {/* Footer com Botões - FIXO */}
      <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* Lado esquerdo - vazio para manter espaçamento */}
          <div></div>
          
          {/* Botões à direita */}
          <div className="flex items-center gap-3">
            {/* Botão de Informação - só aparece em telas pequenas */}
            <div className="lg:hidden">
              <InfoButton onClick={onInfo} />
            </div>
            
            <CancelButton onClick={onCancel}>
              Cancelar
            </CancelButton>
            
            <button
              onClick={onSave}
              className="px-6 sm:px-8 py-2 sm:py-3 bg-orange-600 text-white font-medium rounded-xl transition-all duration-200 text-sm sm:text-base hover:bg-orange-700 flex items-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4 sm:w-5 sm:h-5" />
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PainelItens;
