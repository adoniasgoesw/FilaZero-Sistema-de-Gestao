import React from 'react';
import { Trash2 } from 'lucide-react';

const ListagemItens = ({ itens, onDeleteItem }) => {

  return (
    <div className="space-y-2">
      <h3 className="text-base font-semibold text-gray-900 mb-2">Itens do Pedido</h3>
      
      {/* Tabela de Itens */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-1.5 px-2 text-xs font-medium text-gray-600">QTD</th>
              <th className="text-left py-1.5 px-2 text-xs font-medium text-gray-600">Nome</th>
              <th className="text-left py-1.5 px-2 text-xs font-medium text-gray-600">Total</th>
              <th className="text-left py-1.5 px-2 text-xs font-medium text-gray-600"></th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-1.5 px-2">
                  <span className="text-xs font-medium text-gray-900">{item.quantidade}</span>
                </td>
                <td className="py-1.5 px-2">
                  <span className="text-xs text-gray-900">{item.nome}</span>
                </td>
                <td className="py-1.5 px-2">
                  <span className="text-xs font-semibold text-green-600">
                    R$ {(item.preco * item.quantidade).toFixed(2)}
                  </span>
                </td>
                <td className="py-1.5 px-2">
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Excluir item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListagemItens;
