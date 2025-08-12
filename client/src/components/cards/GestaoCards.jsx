import React from "react";
import { useNavigate } from "react-router-dom";

const cards = [
  { title: "Usuários", icon: "👥", path: "/gestao/usuarios" },
  { title: "Formas de Pagamento", icon: "💳", path: "/gestao/formas-pagamento" },
  { title: "Clientes", icon: "📇", path: "/gestao/clientes" },
  { title: "Categorias", icon: "📂", path: "/gestao/categorias" },
  { title: "Produtos", icon: "📦", path: "/gestao/produtos" },
];

const GestaoCards = () => {
  const navigate = useNavigate();

  const handleCardClick = (card) => {
    navigate(card.path);
  };

  return (
    <>
      <div className="bg-white border border-gray-300 rounded-xl p-6 w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cards.map((card, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleCardClick(card)}
              className="border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-[#1A99BA] transition"
            >
              <span className="text-3xl">{card.icon}</span>
              <p className="mt-2 font-semibold">{card.title}</p>
            </button>
          ))}
        </div>
      </div>

    </>
  );
};

export default GestaoCards;
