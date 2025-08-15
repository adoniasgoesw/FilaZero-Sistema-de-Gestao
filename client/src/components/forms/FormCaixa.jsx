import React, { useMemo, useState } from "react";

const FormCaixa = ({ onSubmit, onCancel }) => {
  const denominations = [100, 50, 20, 10, 5, 2];

  const [baseOpeningValue, setBaseOpeningValue] = useState("");
  const [countsByDenomination, setCountsByDenomination] = useState(() => {
    const initial = {};
    denominations.forEach((v) => { initial[v] = ""; });
    return initial;
  });

  const calculatedTotal = useMemo(() => {
    const base = parseFloat(String(baseOpeningValue).replace(",", ".")) || 0;
    const notesSum = denominations.reduce((acc, v) => {
      const count = parseInt(countsByDenomination[v] || "0", 10) || 0;
      return acc + v * count;
    }, 0);
    return base + notesSum;
  }, [baseOpeningValue, countsByDenomination]);

  const formatCurrency = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleChangeCount = (denom, value) => {
    setCountsByDenomination((prev) => ({ ...prev, [denom]: value.replace(/[^0-9]/g, "") }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(calculatedTotal);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <h3 className="text-2xl font-bold text-[#1A99BA]">Abrir caixa</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Valor de abertura (manual)</label>
          <input
            type="number"
            step="0.01"
            value={baseOpeningValue}
            onChange={(e)=>setBaseOpeningValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A99BA] focus:border-transparent"
            placeholder="0,00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total calculado</label>
          <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-800">
            {formatCurrency(calculatedTotal)}
          </div>
        </div>
      </div>

      <div>
        <div className="text-sm font-semibold text-gray-700 mb-3">Cédulas</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {denominations.map((v) => (
            <div key={v} className="flex items-center gap-2">
              <div className="w-24 text-sm text-gray-700">R$ {v}</div>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={countsByDenomination[v]}
                onChange={(e)=>handleChangeCount(v, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A99BA] focus:border-transparent"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
        >Cancelar</button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-[#1A99BA] text-white hover:bg-[#0f5f73]"
        >Abrir caixa</button>
      </div>
    </form>
  );
};

export default FormCaixa;


