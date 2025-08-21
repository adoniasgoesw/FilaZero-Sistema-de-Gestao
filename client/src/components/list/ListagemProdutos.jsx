import React from 'react';
import { Package, Tag, DollarSign, ToggleLeft, ToggleRight, Edit, Trash2, Image } from 'lucide-react';
import AcaoButton from '../buttons/AcaoButton.jsx';

const ListagemProdutos = ({ produtos, onEdit, onDelete, onToggleStatus, processingProducts = new Set(), isAdmin = true }) => {
  const renderProdutoVisual = (produto) => {
    if (produto.imagem_url) {
      // Se tem imagem, mostra a imagem
      return (
        <div className="w-8 h-8 rounded-lg overflow-hidden">
          <img 
            src={`http://localhost:3001${produto.imagem_url}`} 
            alt={produto.nome}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="w-full h-full bg-indigo-100 rounded-lg flex items-center justify-center" style={{ display: 'none' }}>
            <Image className="h-4 w-4 text-indigo-600" />
          </div>
        </div>
      );
    } else {
      // Se não tem imagem, mostra cor e ícone
      return (
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
          style={{ backgroundColor: produto.cor || '#FF6B6B' }}
        >
          {produto.icone || '🍕'}
        </div>
      );
    }
  };

  const formatarPreco = (preco) => {
    if (!preco) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  const formatarEstoque = (produto) => {
    if (!produto.habilitar_estoque) return 'N/A';
    return produto.quantidade_estoque || 0;
  };

  const formatarTempoPreparo = (produto) => {
    if (!produto.habilitar_tempo_preparo) return 'N/A';
    return `${produto.tempo_preparo || 0} min`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Produto</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Categoria</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Preço</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Status</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Estoque</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Tempo</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((produto) => (
              <tr key={produto.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    {renderProdutoVisual(produto)}
                    <div>
                      <span className="font-medium text-gray-900">{produto.nome}</span>
                      <p className="text-xs text-gray-500 max-w-xs truncate">{produto.descricao}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <Tag className="h-3 w-3 text-gray-400" />
                    <span className="text-sm text-gray-600">{produto.categoria_nome}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3 w-3 text-green-500" />
                    <span className="font-medium text-gray-900">{formatarPreco(produto.valor_venda)}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    produto.status 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {produto.status ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-600 font-medium">{formatarEstoque(produto)}</td>
                <td className="py-4 px-6 text-gray-600 font-medium">{formatarTempoPreparo(produto)}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <AcaoButton
                      onClick={() => onToggleStatus(produto.id)}
                      icon={produto.status ? ToggleLeft : ToggleRight}
                      color={produto.status ? 'orange' : 'green'}
                      loading={processingProducts.has(produto.id)}
                      disabled={!isAdmin}
                    />
                    <AcaoButton
                      onClick={() => onEdit(produto.id)}
                      icon={Edit}
                      color="blue"
                      disabled={!isAdmin}
                    />
                    <AcaoButton
                      onClick={() => onDelete(produto.id)}
                      icon={Trash2}
                      color="red"
                      disabled={!isAdmin}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden divide-y divide-gray-200">
        {produtos.map((produto) => (
          <div key={produto.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {renderProdutoVisual(produto)}
                <div>
                  <h3 className="font-medium text-gray-900">{produto.nome}</h3>
                  <p className="text-sm text-gray-600">{produto.descricao}</p>
                </div>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                produto.status 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {produto.status ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Categoria</p>
                <p className="text-sm font-medium text-gray-900">{produto.categoria_nome}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Preço</p>
                <p className="text-sm font-medium text-gray-900">{formatarPreco(produto.valor_venda)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Estoque</p>
                <p className="text-sm font-medium text-gray-900">{formatarEstoque(produto)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Tempo</p>
                <p className="text-sm font-medium text-gray-900">{formatarTempoPreparo(produto)}</p>
              </div>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2">
                <AcaoButton
                  onClick={() => onToggleStatus(produto.id)}
                  icon={produto.status ? ToggleLeft : ToggleRight}
                  color={produto.status ? 'orange' : 'green'}
                  loading={processingProducts.has(produto.id)}
                />
                <AcaoButton
                  onClick={() => onEdit(produto.id)}
                  icon={Edit}
                  color="blue"
                />
                <AcaoButton
                  onClick={() => onDelete(produto.id)}
                  icon={Trash2}
                  color="red"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {produtos.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
          <p className="text-gray-500">Comece cadastrando seu primeiro produto</p>
        </div>
      )}
    </div>
  );
};

export default ListagemProdutos;
