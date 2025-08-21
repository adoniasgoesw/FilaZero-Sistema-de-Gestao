import React from 'react';
import { Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

const ListagemCaixa = ({ caixas }) => {
  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarValor = (valor) => {
    return `R$ ${valor.toFixed(2)}`;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Caixas</h3>
      
      {/* Tabela de Caixas - Desktop */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Data
                </div>
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Valor de Abertura
                </div>
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Valor de Fechamento
                </div>
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Acréscimos
                </div>
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  Retiradas
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {caixas.map((caixa) => (
              <tr key={caixa.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <span className="text-sm font-medium text-gray-900">
                    {formatarData(caixa.data)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-gray-600">
                    {formatarValor(caixa.valorAbertura)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-gray-600">
                    {formatarValor(caixa.valorFechamento)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm font-medium text-green-600">
                    {formatarValor(caixa.acrescimos)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm font-medium text-red-600">
                    {formatarValor(caixa.retiradas)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards de Caixas - Mobile */}
      <div className="lg:hidden space-y-3">
        {caixas.map((caixa) => (
          <div key={caixa.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">
                  {formatarData(caixa.data)}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Abertura</div>
                <div className="text-sm font-medium text-gray-900">
                  {formatarValor(caixa.valorAbertura)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Fechamento</div>
                <div className="text-sm font-medium text-gray-900">
                  {formatarValor(caixa.valorFechamento)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Saldo</div>
                <div className={`text-sm font-medium ${
                  (caixa.acrescimos - caixa.retiradas) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatarValor(caixa.acrescimos - caixa.retiradas)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mensagem quando não há caixas */}
      {caixas.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma caixa encontrada</h3>
          <p className="text-gray-500">Abra uma nova caixa para começar o histórico</p>
        </div>
      )}
    </div>
  );
};

export default ListagemCaixa;
