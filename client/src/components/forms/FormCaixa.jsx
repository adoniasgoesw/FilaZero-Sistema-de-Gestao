import React, { useState } from 'react';
import { DollarSign, Calculator } from 'lucide-react';

const FormCaixa = ({ onClose, onSubmit }) => {
  const [valorAbertura, setValorAbertura] = useState('');
  const [cedulas, setCedulas] = useState({
    '200': 0,
    '100': 0,
    '50': 0,
    '20': 0,
    '10': 0,
    '5': 0,
    '2': 0,
    '1': 0,
    '0.50': 0,
    '0.25': 0,
    '0.10': 0,
    '0.05': 0
  });

  const calcularTotal = () => {
    return Object.entries(cedulas).reduce((total, [valor, quantidade]) => {
      return total + (parseFloat(valor) * quantidade);
    }, 0);
  };

  const handleCedulaChange = (valor, quantidade) => {
    setCedulas(prev => ({
      ...prev,
      [valor]: parseInt(quantidade) || 0
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalCalculado = calcularTotal();
    onSubmit({
      valorAbertura: parseFloat(valorAbertura),
      cedulas,
      totalCalculado
    });
  };

  const totalCalculado = calcularTotal();

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="h-6 w-6 text-orange-500" />
        <h2 className="text-xl font-semibold text-gray-900">Abrir Caixa</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Valor de Abertura */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valor de Abertura
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="number"
              step="0.01"
              value={valorAbertura}
              onChange={(e) => setValorAbertura(e.target.value)}
              placeholder="0.00"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
        </div>

        {/* Cédulas e Moedas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Cédulas e Moedas
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(cedulas).map(([valor, quantidade]) => (
              <div key={valor} className="flex flex-col">
                <label className="text-xs text-gray-600 mb-1 font-medium">
                  R$ {valor}
                </label>
                <input
                  type="number"
                  min="0"
                  value={quantidade}
                  onChange={(e) => handleCedulaChange(valor, e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Total Calculado */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Total Calculado:</span>
            <span className="text-lg font-semibold text-green-600">
              R$ {totalCalculado.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Abrir Caixa
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormCaixa;
