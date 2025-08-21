import React from 'react';
import { User, Mail, Phone, MapPin, ToggleLeft, ToggleRight, Edit, Trash2 } from 'lucide-react';
import AcaoButton from '../buttons/AcaoButton.jsx';

const ListagemClientes = ({ clientes, onEdit, onDelete, onToggleStatus }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Cliente</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Contato</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Endereço</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Status</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Total Compras</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600">
                        {cliente.nome.charAt(0)}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">{cliente.nome}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-3 w-3" />
                      {cliente.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-3 w-3" />
                      {cliente.telefone}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600 max-w-xs">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{cliente.endereco}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    cliente.status === 'Ativo' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {cliente.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-600 font-medium">{cliente.totalCompras}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <AcaoButton
                      onClick={() => onToggleStatus(cliente.id)}
                      icon={cliente.status === 'Ativo' ? ToggleLeft : ToggleRight}
                      color={cliente.status === 'Ativo' ? 'orange' : 'green'}
                      title={cliente.status === 'Ativo' ? 'Desativar' : 'Ativar'}
                    />
                    <AcaoButton
                      onClick={() => onEdit(cliente.id)}
                      icon={Edit}
                      color="blue"
                    />
                    <AcaoButton
                      onClick={() => onDelete(cliente.id)}
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
        {clientes.map((cliente) => (
          <div key={cliente.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-purple-600">
                    {cliente.nome.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{cliente.nome}</h3>
                  <p className="text-sm text-gray-600">{cliente.email}</p>
                </div>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                cliente.status === 'Ativo' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {cliente.status}
              </span>
            </div>
            
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{cliente.telefone}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span className="line-clamp-2">{cliente.endereco}</span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Total Compras:</span> {cliente.totalCompras}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleStatus(cliente.id)}
                className={`flex-1 px-3 py-2 border rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  cliente.status === 'Ativo'
                    ? 'text-orange-600 border-orange-300 hover:bg-orange-50'
                    : 'text-green-600 border-green-300 hover:bg-green-50'
                }`}
              >
                {cliente.status === 'Ativo' ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                {cliente.status === 'Ativo' ? 'Desativar' : 'Ativar'}
              </button>
              <button
                onClick={() => onEdit(cliente.id)}
                className="flex-1 px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </button>
              <button
                onClick={() => onDelete(cliente.id)}
                className="flex-1 px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mensagem quando não há clientes */}
      {clientes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cliente encontrado</h3>
          <p className="text-gray-500">Cadastre um novo cliente para começar</p>
        </div>
      )}
    </div>
  );
};

export default ListagemClientes;
