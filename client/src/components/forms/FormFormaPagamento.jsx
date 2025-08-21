import React, { useState } from 'react';
import { Building, CreditCard } from 'lucide-react';

const FormFormaPagamento = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    taxa: '',
    contaBancaria: ''
  });

  const tiposPagamento = [
    'Dinheiro',
    'Cartão de Crédito',
    'Cartão de Débito',
    'PIX',
    'Transferência Bancária',
    'Boleto'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.nome.trim() && formData.tipo) {
      onSubmit(formData);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Header com Título e Ícone */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
          <CreditCard className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Cadastrar Forma de Pagamento</h2>
      </div>
      
      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nome */}
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
            Nome da Forma de Pagamento *
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Ex: Cartão de Crédito"
          />
        </div>

        {/* Tipo */}
        <div>
          <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-2">
            Tipo *
          </label>
          <select
            id="tipo"
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Selecione o tipo</option>
            {tiposPagamento.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>

        {/* Taxa */}
        <div>
          <label htmlFor="taxa" className="block text-sm font-medium text-gray-700 mb-2">
            Taxa
          </label>
          <input
            type="text"
            id="taxa"
            name="taxa"
            value={formData.taxa}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Ex: 2.99%"
          />
        </div>

        {/* Conta Bancária */}
        <div>
          <label htmlFor="contaBancaria" className="block text-sm font-medium text-gray-700 mb-2">
            Conta Bancária
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              id="contaBancaria"
              name="contaBancaria"
              value={formData.contaBancaria}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Banco, agência e conta"
            />
          </div>
        </div>

        {/* Botões */}
        <div className="flex items-center gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Cadastrar Forma de Pagamento
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormFormaPagamento;
