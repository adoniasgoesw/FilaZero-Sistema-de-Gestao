import React from 'react';
import { CreditCard, ToggleLeft, ToggleRight, Edit, Trash2 } from 'lucide-react';
import AcaoButton from '../buttons/AcaoButton.jsx';

const ListagemFormasPagamento = ({ formasPagamento, onEdit, onDelete, onToggleStatus }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Forma de Pagamento</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Tipo</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Status</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Taxa</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Prazo</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {formasPagamento.map((forma) => (
              <tr key={forma.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="font-medium text-gray-900">{forma.nome}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-gray-600">{forma.tipo}</td>
                <td className="py-4 px-6">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    forma.status === 'Ativo' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {forma.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-600">{forma.taxa}</td>
                <td className="py-4 px-6 text-gray-600">{forma.prazo}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <AcaoButton
                      onClick={() => onToggleStatus(forma.id)}
                      icon={forma.status === 'Ativo' ? ToggleLeft : ToggleRight}
                      color={forma.status === 'Ativo' ? 'orange' : 'green'}
                    />
                    <AcaoButton
                      onClick={() => onEdit(forma.id)}
                      icon={Edit}
                      color="blue"
                    />
                    <AcaoButton
                      onClick={() => onDelete(forma.id)}
                      icon={Trash2}
                      color="red"
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
        {formasPagamento.map((forma) => (
          <div key={forma.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{forma.nome}</h3>
                  <p className="text-sm text-gray-600">{forma.tipo}</p>
                </div>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                forma.status === 'Ativo' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {forma.status}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
              <span>Taxa: {forma.taxa}</span>
              <span>Prazo: {forma.prazo}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleStatus(forma.id)}
                className={`flex-1 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 border ${
                  forma.status === 'Ativo'
                    ? 'text-orange-600 border-orange-300 hover:bg-orange-50'
                    : 'text-green-600 border-green-300 hover:bg-green-50'
                }`}
              >
                {forma.status === 'Ativo' ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                {forma.status === 'Ativo' ? 'Desativar' : 'Ativar'}
              </button>
              <button
                onClick={() => onEdit(forma.id)}
                className="flex-1 px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </button>
              <button
                onClick={() => onDelete(forma.id)}
                className="flex-1 px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mensagem quando não há formas de pagamento */}
      {formasPagamento.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">💳</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma forma de pagamento encontrada</h3>
          <p className="text-gray-500">Adicione uma nova forma de pagamento para começar</p>
        </div>
      )}
    </div>
  );
};

export default ListagemFormasPagamento;
