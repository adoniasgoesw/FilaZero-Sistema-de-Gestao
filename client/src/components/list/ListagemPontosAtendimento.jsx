import React from "react";
import ListagemPadrao from "./ListagemPadrao";

const StatusBadge = ({ status = "Disponível" }) => {
  const styles = {
    Aberta: "bg-green-100 text-green-700",
    Disponível: "bg-gray-100 text-gray-700",
    Fechada: "bg-red-100 text-red-700",
  };
  const cls = styles[status] || styles.Disponível;
  return (
    <span className={`inline-block px-2 py-0.5 text-xs rounded ${cls}`}>{status}</span>
  );
};

const formatCurrency = (v) => {
  if (v === undefined || v === null || Number.isNaN(Number(v))) return "R$ 0,00";
  return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const formatTime = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  } catch (_) {
    return "--:--";
  }
};

const diffHuman = (iso) => {
  try {
    const start = new Date(iso).getTime();
    const now = Date.now();
    const ms = Math.max(0, now - start);
    const mins = Math.floor(ms / 60000);
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hours > 0) return `${hours}h ${remMins}min`;
    return `${mins}min`;
  } catch (_) {
    return "-";
  }
};

const ListagemPontosAtendimento = ({
  pontos = [],
  loading = false,
  onOpen,
  className = "",
}) => {
  const renderCard = (ponto) => (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer p-4"
      onClick={() => onOpen?.(ponto)}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-800">{ponto.nome}</h3>
        <StatusBadge status={ponto.status} />
      </div>
      <div className="text-sm text-gray-600">Valor atual</div>
      <div className="text-2xl font-bold text-gray-900">{formatCurrency(ponto.valor)}</div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600">
        <div>
          <div className="text-gray-500">Abertura</div>
          <div className="font-medium text-gray-800">{formatTime(ponto.abertura)}</div>
        </div>
        <div>
          <div className="text-gray-500">Atividade</div>
          <div className="font-medium text-gray-800">{diffHuman(ponto.abertura)}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Pontos de Atendimento</h3>
      </div>
      <ListagemPadrao
        items={pontos}
        loading={loading}
        emptyMessage="Nenhum ponto de atendimento encontrado"
        className=""
        layout="grid"
        renderItem={(item) => renderCard(item)}
      />
    </div>
  );
};

export default ListagemPontosAtendimento;



