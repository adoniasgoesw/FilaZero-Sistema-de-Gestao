import React from "react";
import { ShieldCheck } from "lucide-react"; // Ícone

const AdminCard = () => {
  return (
    <div className="flex items-center gap-4 bg-white rounded-xl shadow-md p-6 w-full hover:shadow-lg transition-shadow">
      {/* Ícone */}
      <div className="bg-[#1A99BA] text-white p-3 rounded-full">
        <ShieldCheck size={28} />
      </div>

      {/* Conteúdo */}
      <div>
        <h2 className="text-xl font-bold text-[#1A99BA]">
          Painel Administrativo
        </h2>
        <p className="text-gray-600">
          Gerencie configurações avançadas do sistema e permissões de acesso.
        </p>
      </div>
    </div>
  );
};

export default AdminCard;
