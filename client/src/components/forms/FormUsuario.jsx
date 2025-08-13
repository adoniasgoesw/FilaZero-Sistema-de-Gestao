import React, { useState } from "react";

const cargos = [
  'ADM', 'Garçom', 'Caixa', 'Delivery', 'Cozinha', 'Entregador', 'Atendente'
];

const FormUsuario = ({ onSubmit, onCancel, initialValues }) => {
  const [tab, setTab] = useState('detalhes');

  const [nome, setNome] = useState(initialValues?.nome || "");
  const [cpf, setCpf] = useState(initialValues?.cpf || "");
  const [email, setEmail] = useState(initialValues?.email || "");
  const [whatsapp, setWhatsapp] = useState(initialValues?.whatsapp || "");
  const [senha, setSenha] = useState("");
  const [cargo, setCargo] = useState(initialValues?.cargo || cargos[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({ nome, cpf, email, whatsapp, senha: senha || undefined, cargo });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-[#1A99BA]">
        {initialValues ? 'Editar Usuário' : 'Novo Usuário'}
      </h2>

      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: 'detalhes', label: 'Detalhes do Usuário' },
          { key: 'permissoes', label: 'Permissões' },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-sm rounded-t-md ${tab === t.key ? 'bg-white border border-b-0 border-gray-200 text-[#1A99BA]' : 'text-gray-600 hover:text-[#1A99BA]'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'detalhes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A99BA]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
            <input
              type="text"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="000.000.000-00"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A99BA]"
              required
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail (opcional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A99BA]"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp (opcional)</label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A99BA]"
              autoComplete="tel"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha {initialValues ? '(deixe em branco para manter)' : ''}</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A99BA]"
              required={!initialValues}
              autoComplete={initialValues ? 'current-password' : 'new-password'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
            <select
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A99BA]"
              required
            >
              {cargos.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {tab === 'permissoes' && (
        <div className="text-gray-500 text-sm">Permissões: em breve.</div>
      )}

      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-[#1A99BA] text-white hover:bg-[#0f5f73]"
        >
          {initialValues ? 'Atualizar' : 'Salvar'}
        </button>
      </div>
    </form>
  );
};

export default FormUsuario;


