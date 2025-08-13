import React, { useState } from "react";

const FormFormaPagamento = ({ onSubmit, onCancel, initialValues, tiposPermitidos = ["Dinheiro","Débito","Crédito","PIX"] }) => {
  const [nome, setNome] = useState(initialValues?.nome || "");
  const [tipo, setTipo] = useState(initialValues?.tipo || "");
  const [taxa, setTaxa] = useState(initialValues?.taxa ?? "");
  const [conta, setConta] = useState(initialValues?.conta_bancaria || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({ nome, tipo, taxa, conta_bancaria: conta });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-[#1A99BA]">{initialValues ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A99BA]" value={nome} onChange={(e)=>setNome(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A99BA]"
            value={tipo}
            onChange={(e)=>setTipo(e.target.value)}
            required
          >
            <option value="">Selecione</option>
            {tiposPermitidos.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Taxa (%)</label>
          <input type="number" step="0.01" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A99BA]" value={taxa} onChange={(e)=>setTaxa(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Conta bancária</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A99BA]" value={conta} onChange={(e)=>setConta(e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancelar</button>
        <button type="submit" className="px-4 py-2 rounded-lg bg-[#1A99BA] text-white hover:bg-[#0f5f73]">{initialValues ? 'Atualizar' : 'Salvar'}</button>
      </div>
    </form>
  );
};

export default FormFormaPagamento;


