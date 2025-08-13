import React, { useState } from "react";

const FormCliente = ({ onSubmit, onCancel, initialValues }) => {
  const [nome, setNome] = useState(initialValues?.nome || "");
  const [cpfCnpj, setCpfCnpj] = useState(initialValues?.cpf_cnpj || "");
  const [endereco, setEndereco] = useState(initialValues?.endereco || "");
  const [telefone, setTelefone] = useState(initialValues?.telefone || "");
  const [email, setEmail] = useState(initialValues?.email || "");
  const [taxaEntrega, setTaxaEntrega] = useState(
    initialValues?.taxa_entrega ?? ""
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({
      nome,
      cpf_cnpj: cpfCnpj,
      endereco,
      telefone,
      email,
      taxa_entrega: taxaEntrega,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-[#1A99BA]">
        {initialValues ? "Editar Cliente" : "Novo Cliente"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome
          </label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A99BA]"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CPF ou CNPJ
          </label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A99BA]"
            value={cpfCnpj}
            onChange={(e) => setCpfCnpj(e.target.value)}
            placeholder="Apenas números"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Endereço
          </label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A99BA]"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefone / WhatsApp
          </label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A99BA]"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-mail
          </label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A99BA]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Taxa de entrega (R$)
          </label>
          <input
            type="number"
            step="0.01"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A99BA]"
            value={taxaEntrega}
            onChange={(e) => setTaxaEntrega(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
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
          {initialValues ? "Atualizar" : "Salvar"}
        </button>
      </div>
    </form>
  );
};

export default FormCliente;



