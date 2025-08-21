import React from 'react';
import { User, Mail, Briefcase, ToggleLeft, ToggleRight, Edit, Trash2 } from 'lucide-react';
import AcaoButton from '../buttons/AcaoButton.jsx';

const ListagemUsuarios = ({ usuarios, onEdit, onDelete, onToggleStatus, processingUsers = new Set(), isAdmin = false }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Nome</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">E-mail</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">WhatsApp</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Cargo</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Status</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 ease-in-out">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {usuario.nome_completo?.charAt(0) || '?'}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">{usuario.nome_completo || 'Nome não informado'}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-gray-600">{usuario.email || 'Não informado'}</td>
                <td className="py-4 px-6 text-gray-600">{usuario.whatsapp || 'Não informado'}</td>
                <td className="py-4 px-6 text-gray-600">{usuario.cargo || 'Não informado'}</td>
                <td className="py-4 px-6">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full transition-all duration-200 ease-in-out ${
                    usuario.status 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {usuario.status ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <AcaoButton
                      onClick={() => onToggleStatus(usuario.id)}
                      icon={usuario.status ? ToggleRight : ToggleLeft}
                      color={usuario.status ? 'green' : 'orange'}
                      title={usuario.status ? 'Ativar' : 'Desativar'}
                      disabled={processingUsers.has(usuario.id) || !isAdmin}
                    />
                    <AcaoButton
                      onClick={() => onEdit(usuario.id)}
                      icon={Edit}
                      color="blue"
                      disabled={!isAdmin}
                    />
                    <AcaoButton
                      onClick={() => onDelete(usuario.id)}
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
        {usuarios.map((usuario) => (
          <div key={usuario.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {usuario.nome_completo?.charAt(0) || '?'}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{usuario.nome_completo || 'Nome não informado'}</h3>
                  <p className="text-sm text-gray-600">{usuario.email || 'Não informado'}</p>
                </div>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full transition-all duration-200 ease-in-out ${
                usuario.status 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {usuario.status ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
              <span>{usuario.cargo || 'Não informado'}</span>
              <span>{usuario.whatsapp || 'Não informado'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleStatus(usuario.id)}
                disabled={processingUsers.has(usuario.id) || !isAdmin}
                className={`flex-1 px-3 py-2 border rounded-lg transition-all duration-200 ease-in-out flex items-center justify-center gap-2 ${
                  processingUsers.has(usuario.id) || !isAdmin
                    ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300'
                    : usuario.status
                    ? 'text-green-600 border-green-300 hover:bg-green-50'
                    : 'text-orange-600 border-orange-300 hover:bg-orange-50'
                }`}
              >
                {processingUsers.has(usuario.id) ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : usuario.status ? (
                  <ToggleRight className="h-4 w-4" />
                ) : (
                  <ToggleLeft className="h-4 w-4" />
                )}
                {processingUsers.has(usuario.id) ? 'Processando...' : (usuario.status ? 'Ativar' : 'Desativar')}
              </button>
              <button
                onClick={() => onEdit(usuario.id)}
                disabled={!isAdmin}
                className={`flex-1 px-3 py-2 border rounded-lg transition-all duration-200 ease-in-out flex items-center justify-center gap-2 ${
                  !isAdmin
                    ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-400'
                    : 'text-blue-600 border-blue-300 hover:bg-blue-50'
                }`}
              >
                <Edit className="h-4 w-4" />
                Editar
              </button>
              <button
                onClick={() => onDelete(usuario.id)}
                disabled={!isAdmin}
                className={`flex-1 px-3 py-2 border rounded-lg transition-all duration-200 ease-in-out flex items-center justify-center gap-2 ${
                  !isAdmin
                    ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-400'
                    : 'text-red-600 border-red-300 hover:bg-red-50'
                }`}
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mensagem quando não há usuários */}
      {usuarios.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
          <p className="text-gray-500">Crie um novo usuário para começar</p>
        </div>
      )}
    </div>
  );
};

export default ListagemUsuarios;
