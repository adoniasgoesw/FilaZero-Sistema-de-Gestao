import React from "react";

const moeda = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return "R$ 0,00";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const Linha = ({ label, value, strong = false }) => (
  <div className="flex items-center justify-between">
    <div className="text-sm text-gray-600">{label}</div>
    <div className={`text-sm ${strong ? 'font-semibold text-gray-900' : 'text-gray-800'}`}>{moeda(value)}</div>
  </div>
);

// Exibe sempre Subtotal e Total. Exibe Desconto/Acréscimos/Pago/Restante apenas se fornecidos (e não zero)
const ListagemValores = ({
  subtotal = 0,
  total = 0,
  desconto,
  acrescimos,
  pagos,
  restante,
  className = "",
}) => {
  const showDesconto = Number(desconto) !== 0 && desconto !== undefined && desconto !== null;
  const showAcrescimos = Number(acrescimos) !== 0 && acrescimos !== undefined && acrescimos !== null;
  const showPagos = Number(pagos) !== 0 && pagos !== undefined && pagos !== null;
  const showRestante = Number(restante) !== 0 && restante !== undefined && restante !== null;

  return (
    <div className={`border border-gray-200 rounded-lg p-3 space-y-2 bg-white ${className}`}>
      <Linha label="Subtotal" value={subtotal} />
      
      
      
      <div className="border-t border-gray-100 pt-2">
        <Linha label="Total" value={total} strong />
       
      </div>
    </div>
  );
};

export default ListagemValores;


