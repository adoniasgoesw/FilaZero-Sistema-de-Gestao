import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, History, Truck, Settings, ChevronLeft, ChevronRight, Package, Tags, Users } from "lucide-react";
import ModalBase from "../modals/Base";

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const raw = localStorage.getItem('sidebarOpen');
      if (raw != null) return JSON.parse(raw);
    } catch {}
    return true;
  });
  const [isEditAtalhosOpen, setIsEditAtalhosOpen] = useState(false);
  const allShortcuts = [
    { key: 'produtos', path: "/gestao/produtos", label: "Produtos", icon: Package },
    { key: 'categorias', path: "/gestao/categorias", label: "Categorias", icon: Tags },
    { key: 'usuarios', path: "/gestao/usuarios", label: "Usuários", icon: Users },
    { key: 'formas', path: "/gestao/formas-pagamento", label: "Formas Pagamento", icon: Settings },
    { key: 'clientes', path: "/gestao/clientes", label: "Clientes", icon: Users },
    { key: 'ajustes', path: "/config", label: "Painel Administrativo", icon: Settings },
  ];
  const [shortcutKeys, setShortcutKeys] = useState(() => {
    try {
      const raw = localStorage.getItem('sidebarShortcuts');
      if (raw) return JSON.parse(raw);
    } catch {}
    return ['produtos','categorias','usuarios'];
  });

  useEffect(() => {
    // Atualiza largura dinâmica para as páginas usarem via CSS var
    const width = isOpen ? '16rem' : '4rem';
    document.documentElement.style.setProperty('--sidebar-w', width);
    try { localStorage.setItem('sidebarOpen', JSON.stringify(isOpen)); } catch {}
  }, [isOpen]);

  useEffect(() => {
    const onClose = () => setIsOpen(false);
    const onOpen = () => setIsOpen(true);
    const onStorage = (e) => {
      if (e.key === 'sidebarOpen') {
        try { setIsOpen(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener('sidebar:close', onClose);
    window.addEventListener('sidebar:open', onOpen);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('sidebar:close', onClose);
      window.removeEventListener('sidebar:open', onOpen);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const links = [
    { path: "/home", label: "Início", icon: Home },
    { path: "/historic", label: "Histórico", icon: History },
    { path: "/delivery", label: "Delivery", icon: Truck },
    { path: "/config", label: "Ajuste", icon: Settings }
  ];

  const atalhos = allShortcuts.filter(s => shortcutKeys.includes(s.key));

  return (
    <aside
      className={`hidden lg:flex flex-col bg-[#1A99BA] text-white h-screen fixed left-0 top-0 z-40 shadow-lg transition-all duration-300 ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      {/* Cabeçalho + botão de colapsar */}
      <div className="flex items-center justify-between p-4 border-b border-[#0f5f73] relative">
        {isOpen && (
          <h1 className="text-xl font-bold tracking-wider text-white">
            FILA ZERO
          </h1>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white hover:bg-[#0f5f73] p-1 rounded transition"
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
        {/* Bolinha externa para abrir/fechar */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hidden lg:block absolute top-3 right-0 translate-x-1/2 w-5 h-5 rounded-full bg-white shadow-md"
          title={isOpen ? 'Recolher' : 'Expandir'}
        />
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {/* Principais */}
        <ul className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const active = location.pathname === link.path;
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 ${
                    active
                      ? "bg-white text-[#1A99BA] font-semibold"
                      : "hover:bg-[#0f5f73] text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {isOpen && <span className="ml-3">{link.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Separador */}
        <div className="my-4 h-px bg-[#0f5f73]" />

        {/* Atalhos */}
        {isOpen && (
          <div className="px-1 pb-2 flex items-center justify-between">
            <div className="text-xs uppercase tracking-wide text-white/80">Atalhos</div>
            <button
              onClick={()=>setIsEditAtalhosOpen(true)}
              className="text-white/80 hover:text-white text-xs underline"
              title="Editar atalhos"
            >Editar</button>
          </div>
        )}
        <ul className="space-y-2">
          {atalhos.map((link) => {
            const Icon = link.icon;
            const active = location.pathname === link.path;
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 ${
                    active
                      ? "bg-white text-[#1A99BA] font-semibold"
                      : "hover:bg-[#0f5f73] text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {isOpen && <span className="ml-3">{link.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Modal editar atalhos */}
      <ModalBase isOpen={isEditAtalhosOpen} onClose={()=>setIsEditAtalhosOpen(false)}>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-[#1A99BA]">Editar atalhos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allShortcuts.map((opt) => {
              const checked = shortcutKeys.includes(opt.key);
              return (
                <label key={opt.key} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e)=>{
                      setShortcutKeys((prev)=>{
                        const set = new Set(prev);
                        if (e.target.checked) set.add(opt.key); else set.delete(opt.key);
                        const arr = Array.from(set);
                        localStorage.setItem('sidebarShortcuts', JSON.stringify(arr));
                        return arr;
                      });
                    }}
                  />
                  <span className="text-sm text-gray-800">{opt.label}</span>
                </label>
              );
            })}
          </div>
          <div className="flex justify-end">
            <button className="px-4 py-2 rounded-lg bg-[#1A99BA] text-white hover:bg-[#0f5f73]" onClick={()=>setIsEditAtalhosOpen(false)}>Fechar</button>
          </div>
        </div>
      </ModalBase>
    </aside>
  );
};

export default Sidebar;
