import React, { useEffect, useState } from "react";

const Toggle = ({ checked, onChange, label }) => {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium text-gray-800">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-[#1A99BA]' : 'bg-gray-300'}`}
        aria-pressed={checked}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );
};

const FormConfig = ({ initialValues, onSubmit, onCancel }) => {
  const defaults = {
    mesasAtivas: true,
    qtdMesas: 4,
    comandasAtivas: false,
    qtdComandas: 0,
    prefixoComanda: 'CMD',
  };

  const [values, setValues] = useState({ ...defaults, ...(initialValues || {}) });

  useEffect(() => {
    if (initialValues) setValues((v) => ({ ...v, ...initialValues }));
  }, [initialValues]);

  const handleChange = (field, val) => setValues((v) => ({ ...v, [field]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-2xl font-bold text-[#1A99BA]">Configuração do Ponto de Atendimento</h2>

      {/* Tipos de atendimento */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-800">Tipos de atendimento</h3>
        <div className="border border-gray-200 rounded-lg p-3 bg-white">
          <Toggle
            checked={values.mesasAtivas}
            onChange={(v) => {
              // precisa ter pelo menos um tipo ativo
              if (!v && !values.comandasAtivas) return;
              handleChange('mesasAtivas', v);
              if (v && (!values.qtdMesas || values.qtdMesas < 1)) handleChange('qtdMesas', 1);
            }}
            label="Mesas (ativar/desativar)"
          />
          <div className="h-px bg-gray-100 my-2" />
          <Toggle
            checked={values.comandasAtivas}
            onChange={(v) => {
              if (!v && !values.mesasAtivas) return;
              handleChange('comandasAtivas', v);
              if (v && (!values.qtdComandas || values.qtdComandas < 1)) handleChange('qtdComandas', 1);
            }}
            label="Comandas (ativar/desativar)"
          />
        </div>
      </div>

      {/* Configuração de mesas */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-800">Configuração de Mesas</h3>
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${values.mesasAtivas ? '' : 'opacity-50'}`}>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Quantidade de mesas</label>
            <input
              type="number"
              min="0"
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${values.mesasAtivas ? 'border-gray-300 focus:ring-[#1A99BA]' : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              value={values.qtdMesas}
              onChange={(e) => {
                const raw = e.target.value;
                // permite limpar para digitar outro número; validação mínima fica no backend
                const num = raw === '' ? '' : Number(raw);
                handleChange('qtdMesas', raw === '' ? '' : num);
              }}
              disabled={!values.mesasAtivas}
            />
          </div>
        </div>
      </div>

      {/* Configuração de comandas */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-800">Configuração de Comandas</h3>
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${values.comandasAtivas ? '' : 'opacity-50'}`}>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Quantidade de comandas</label>
            <input
              type="number"
              min="0"
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${values.comandasAtivas ? 'border-gray-300 focus:ring-[#1A99BA]' : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              value={values.qtdComandas}
              onChange={(e) => {
                const raw = e.target.value;
                const num = raw === '' ? '' : Number(raw);
                handleChange('qtdComandas', raw === '' ? '' : num);
              }}
              disabled={!values.comandasAtivas}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Prefixo de comanda</label>
            <input
              type="text"
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${values.comandasAtivas ? 'border-gray-300 focus:ring-[#1A99BA]' : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              value={values.prefixoComanda}
              onChange={(e) => handleChange('prefixoComanda', e.target.value)}
              placeholder="Ex.: CMD, COMANDA, SIGLA..."
              disabled={!values.comandasAtivas}
            />
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancelar</button>
        <button type="submit" className="px-4 py-2 rounded-lg bg-[#1A99BA] text-white hover:bg-[#0f5f73]">Salvar</button>
      </div>
    </form>
  );
};

export default FormConfig;


