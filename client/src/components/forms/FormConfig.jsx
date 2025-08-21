import React, { useState } from 'react';
import ModalBase from '../modals/Base.jsx';
import { ToggleLeft, ToggleRight, Settings, Table, Receipt } from 'lucide-react';

const FormConfig = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState({
    mesas: {
      ativo: true,
      quantidade: 10
    },
    comandas: {
      ativo: true,
      quantidade: 20,
      prefixo: 'Comanda'
    }
  });

  const handleToggle = (tipo) => {
    setConfig(prev => ({
      ...prev,
      [tipo]: {
        ...prev[tipo],
        ativo: !prev[tipo].ativo
      }
    }));
  };

  const handleChange = (tipo, campo, valor) => {
    setConfig(prev => ({
      ...prev,
      [tipo]: {
        ...prev[tipo],
        [campo]: valor
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Configurações salvas:', config);
    // Implementar lógica para salvar configurações
    onClose();
  };

  const ToggleSwitch = ({ ativo, onChange, label }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
          ativo ? 'bg-orange-500' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            ativo ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <ModalBase isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-orange-500" />
          <h2 className="text-xl font-bold text-gray-900">Configurações</h2>
        </div>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          {/* Seção de Mesas */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Table className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Configuração de Mesas</h3>
            </div>
            
            <div className="space-y-4">
              <ToggleSwitch
                ativo={config.mesas.ativo}
                onChange={() => handleToggle('mesas')}
                label="Mesas ativas"
              />
              
              {config.mesas.ativo && (
                <div className="ml-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantidade de mesas
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={config.mesas.quantidade}
                      onChange={(e) => handleChange('mesas', 'quantidade', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Seção de Comandas */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Configuração de Comandas</h3>
            </div>
            
            <div className="space-y-4">
              <ToggleSwitch
                ativo={config.comandas.ativo}
                onChange={() => handleToggle('comandas')}
                label="Comandas ativas"
              />
              
              {config.comandas.ativo && (
                <div className="ml-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantidade de comandas
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={config.comandas.quantidade}
                      onChange={(e) => handleChange('comandas', 'quantidade', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prefixo das comandas
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Comanda, Pedido, Mesa"
                      value={config.comandas.prefixo}
                      onChange={(e) => handleChange('comandas', 'prefixo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
            >
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>
    </ModalBase>
  );
};

export default FormConfig;
