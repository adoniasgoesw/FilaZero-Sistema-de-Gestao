import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import ListagemItens from "../list/ListagemItens";

const moeda = (v) => {
  const n = Number(v);
  if (Number.isNaN(n)) return "R$ 0,00";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const LinhaValor = ({ label, value, strong = false }) => (
  <div className="flex items-center justify-between">
    <div className="text-sm text-gray-600">{label}</div>
    <div className={`text-sm ${strong ? 'font-semibold text-gray-900' : 'text-gray-800'}`}>{moeda(value)}</div>
  </div>
);

const PainelDetalhes = ({ ponto, onVoltar }) => {
  const [nomePedido, setNomePedido] = useState("");
  const [itens] = useState([
    { id: 1, quantidade: 2, nome: "Hambúrguer", valor: 29.9 },
    { id: 2, quantidade: 1, nome: "Refrigerante", valor: 6.5 },
    { id: 3, quantidade: 1, nome: "Batata Frita", valor: 12.0 },
  ]);

  const subtotal = itens.reduce((sum, i) => sum + Number(i.valor) * Number(i.quantidade), 0);
  const desconto = 5.0;
  const acrescimos = 0;
  const pagos = 0;
  const total = subtotal - desconto + acrescimos;
  const restante = total - pagos;

  return (
    <div className="h-full flex flex-col">
      {/* Header do painel */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onVoltar} className="flex items-center space-x-2 text-[#1A99BA] hover:text-[#0f5f73] transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>
      </div>

      {/* Nome mesa e pedido */}
      <div className="mb-4">
        <div className="text-sm text-gray-500">Ponto de atendimento</div>
        <div className="text-xl font-semibold text-gray-900">{ponto?.nome || '—'}</div>
        <label className="block text-sm font-medium text-gray-700 mt-3 mb-1">Nome do pedido</label>
        <input
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A99BA]"
          value={nomePedido}
          onChange={(e)=>setNomePedido(e.target.value)}
          placeholder="Ex.: Mesa 01 - Almoço João"
        />
      </div>

      {/* Listagem de itens */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Itens</h3>
        <ListagemItens itens={itens} />
      </div>

      {/* Listagem de valores */}
      <div className="mb-4 space-y-2">
        <h3 className="text-sm font-semibold text-gray-800">Valores</h3>
        <div className="border border-gray-200 rounded-lg p-3 space-y-2 bg-white">
          <LinhaValor label="Subtotal" value={subtotal} />
          <LinhaValor label="Desconto" value={-desconto} />
          <LinhaValor label="Acréscimos" value={acrescimos} />
          <LinhaValor label="Pago" value={pagos} />
          <div className="border-t border-gray-100 pt-2">
            <LinhaValor label="Total" value={total} strong />
            <LinhaValor label="Restante" value={restante} strong />
          </div>
        </div>
      </div>

      {/* Footer com ações */}
      <div className="mt-auto pt-3 border-t border-gray-200 flex justify-end gap-3">
        <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancelar</button>
        <button className="px-4 py-2 rounded-lg bg-[#1A99BA] text-white hover:bg-[#0f5f73]">Salvar</button>
      </div>
    </div>
  );
};

export default PainelDetalhes;



