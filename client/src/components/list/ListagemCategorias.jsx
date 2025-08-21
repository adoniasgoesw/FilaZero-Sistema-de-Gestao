import React from 'react';
import { Tag, ToggleLeft, ToggleRight, Edit, Trash2, Image } from 'lucide-react';
import AcaoButton from '../buttons/AcaoButton.jsx';

const ListagemCategorias = ({ categorias, onEdit, onDelete, onToggleStatus, processingCategories = new Set(), isAdmin = true }) => {
  const renderCategoriaVisual = (categoria) => {
    if (categoria.imagem_url) {
      // Se tem imagem, mostra a imagem
      return (
        <div className="w-8 h-8 rounded-lg overflow-hidden">
          <img 
            src={`http://localhost:3001${categoria.imagem_url}`} 
            alt={categoria.nome}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs" style={{ display: 'none' }}>
            <Image className="h-4 w-4" />
          </div>
        </div>
      );
    } else {
      // Se não tem imagem, mostra cor e ícone
      return (
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
          style={{ backgroundColor: categoria.cor || '#FF6B6B' }}
        >
          {categoria.icone || '🏷️'}
        </div>
      );
    }
  };

  const renderCategoriaVisualMobile = (categoria) => {
    if (categoria.imagem_url) {
      // Se tem imagem, mostra a imagem
      return (
        <div className="w-10 h-10 rounded-lg overflow-hidden">
          <img 
            src={`http://localhost:3001${categoria.imagem_url}`} 
            alt={categoria.nome}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs" style={{ display: 'none' }}>
            <Image className="h-5 w-5" />
          </div>
        </div>
      );
    } else {
      // Se não tem imagem, mostra cor e ícone
      return (
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
          style={{ backgroundColor: categoria.cor || '#FF6B6B' }}
        >
          {categoria.icone || '🏷️'}
        </div>
      );
    }
  };

  const getStatusText = (status) => {
    return status ? 'Ativo' : 'Inativo';
  };

  const getStatusColor = (status) => {
    return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Categoria</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Descrição</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Status</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Tipo</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((categoria) => (
              <tr key={categoria.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    {renderCategoriaVisual(categoria)}
                    <span className="font-medium text-gray-900">{categoria.nome}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-gray-600 max-w-xs">
                  <span className="truncate block">{categoria.descricao || 'Sem descrição'}</span>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(categoria.status)}`}>
                    {getStatusText(categoria.status)}
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-600">
                  <span className="text-sm">
                    {categoria.imagem_url ? 'Imagem' : 'Cor + Ícone'}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <AcaoButton
                      onClick={() => onToggleStatus(categoria.id)}
                      icon={categoria.status ? ToggleLeft : ToggleRight}
                      color={categoria.status ? 'orange' : 'green'}
                      disabled={processingCategories.has(categoria.id)}
                      loading={processingCategories.has(categoria.id)}
                    />
                    <AcaoButton
                      onClick={() => onEdit(categoria.id)}
                      icon={Edit}
                      color="blue"
                    />
                    {isAdmin && (
                      <AcaoButton
                        onClick={() => onDelete(categoria.id)}
                        icon={Trash2}
                        color="red"
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden divide-y divide-gray-200">
        {categorias.map((categoria) => (
          <div key={categoria.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {renderCategoriaVisualMobile(categoria)}
                <div>
                  <h3 className="font-medium text-gray-900">{categoria.nome}</h3>
                  <p className="text-sm text-gray-600">{categoria.descricao || 'Sem descrição'}</p>
                </div>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(categoria.status)}`}>
                {getStatusText(categoria.status)}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
              <span>Tipo: {categoria.imagem_url ? 'Imagem' : 'Cor + Ícone'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleStatus(categoria.id)}
                disabled={processingCategories.has(categoria.id)}
                className={`flex-1 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 border disabled:opacity-50 disabled:cursor-not-allowed ${
                  categoria.status
                    ? 'text-orange-600 border-orange-300 hover:bg-orange-50'
                    : 'text-green-600 border-green-300 hover:bg-green-50'
                }`}
              >
                {processingCategories.has(categoria.id) ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : (
                  <>
                    {categoria.status ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                    {categoria.status ? 'Desativar' : 'Ativar'}
                  </>
                )}
              </button>
              <button
                onClick={() => onEdit(categoria.id)}
                className="flex-1 px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </button>
              {isAdmin && (
                <button
                  onClick={() => onDelete(categoria.id)}
                  className="flex-1 px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mensagem quando não há categorias */}
      {categorias.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏷️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma categoria encontrada</h3>
          <p className="text-gray-500">Crie uma nova categoria para começar</p>
        </div>
      )}
    </div>
  );
};

export default ListagemCategorias;
