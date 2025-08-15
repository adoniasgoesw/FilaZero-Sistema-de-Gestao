import React from "react";
import { ArrowLeft, PlusCircle, MinusCircle, CheckCircle2, Trash2, Clock } from "lucide-react";

const mockHistorico = [
  { id: 1, tipo: 'add', item: 'Bacon', qtd: 1, usuario: 'Ana', horario: '10:05' },
  { id: 2, tipo: 'add', item: 'Hambúrguer', qtd: 2, usuario: 'Carlos', horario: '10:07' },
  { id: 3, tipo: 'remove', item: 'Cebola', qtd: 1, usuario: 'Ana', horario: '10:10' },
  { id: 4, tipo: 'kitchen', item: 'Pedido enviado à cozinha', qtd: null, usuario: 'Carlos', horario: '10:15' },
  { id: 5, tipo: 'payment', item: 'Pagamento iniciado', qtd: null, usuario: 'Ana', horario: '10:30' },
  { id: 6, tipo: 'finalize', item: 'Pedido finalizado', qtd: null, usuario: 'Carlos', horario: '10:35' },
];

const TipoIcone = ({ tipo }) => {
  if (tipo === 'add') return <PlusCircle className="w-5 h-5 text-emerald-600" />;
  if (tipo === 'remove') return <MinusCircle className="w-5 h-5 text-amber-600" />;
  if (tipo === 'finalize') return <CheckCircle2 className="w-5 h-5 text-green-600" />;
  if (tipo === 'payment') return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
  if (tipo === 'kitchen') return <Clock className="w-5 h-5 text-[#1A99BA]" />;
  return <Clock className="w-5 h-5 text-gray-500" />;
};

const TipoBadge = ({ tipo }) => {
  const base = 'text-xs px-2 py-0.5 rounded-full';
  if (tipo === 'add') return <span className={`${base} bg-emerald-100 text-emerald-700`}>Adicionado</span>;
  if (tipo === 'remove') return <span className={`${base} bg-amber-100 text-amber-700`}>Removido</span>;
  if (tipo === 'finalize') return <span className={`${base} bg-green-100 text-green-700`}>Finalizado</span>;
  if (tipo === 'payment') return <span className={`${base} bg-blue-100 text-blue-700`}>Pagamento</span>;
  if (tipo === 'kitchen') return <span className={`${base} bg-cyan-100 text-cyan-700`}>Cozinha</span>;
  return <span className={`${base} bg-gray-100 text-gray-700`}>Histórico</span>;
};

const PainelHistorico = ({ onVoltar }) => {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={onVoltar} className="p-2 rounded-lg hover:bg-gray-100" title="Voltar">
            <ArrowLeft className="w-5 h-5 text-[#1A99BA]" />
          </button>
          <div className="text-lg font-semibold text-gray-900">Histórico da mesa</div>
        </div>
      </div>

      {/* Listagem do histórico */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {mockHistorico.map((h) => (
          <div key={h.id} className="bg-white border border-gray-200 rounded-lg p-3 flex items-start gap-3">
            <div className="mt-0.5"><TipoIcone tipo={h.tipo} /></div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TipoBadge tipo={h.tipo} />
                  {h.qtd != null && (
                    <span className="text-xs text-gray-600">Qtd: {h.qtd}</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">{h.horario}</div>
              </div>
              <div className="text-sm text-gray-800 mt-1">{h.item}</div>
              <div className="text-xs text-gray-500">por {h.usuario}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PainelHistorico;


