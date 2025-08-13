
import Footer from "../components/layout/Footer";
import Sidebar from "../components/layout/Sidebar";
import SearchBar from "../components/layout/SearchBar";
import ModalBase from "../components/modals/Base";
import FormConfig from "../components/forms/FormConfig";
import ListagemPontosAtendimento from "../components/list/ListagemPontosAtendimento";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const Home = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [estabelecimentoId, setEstabelecimentoId] = useState(() => Number(localStorage.getItem('estabelecimentoId')) || null);
  const [pontos, setPontos] = useState([]);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const id = estabelecimentoId || Number(localStorage.getItem('estabelecimentoId'));
    if (!id) return;
    setEstabelecimentoId(id);
    (async () => {
      try {
        // GET também semeia defaults se não existir
        const res = await api.get(`/pontos-atendimento/${id}`);
        setPontos(res.data.pontos || []);
        setConfig(res.data.config || null);
      } catch (e) {
        console.error('Erro ao carregar pontos de atendimento:', e);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!searchTerm) return pontos;
    const q = searchTerm.toLowerCase();
    return pontos.filter(p => p.nome.toLowerCase().includes(q));
  }, [searchTerm, pontos]);
  const openPonto = (ponto) => navigate("/ponto-atendimento", { state: { ponto } });
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar para telas grandes */}
      <Sidebar />
      
      {/* Conteúdo principal */}
      <div className="flex-1" style={{ marginLeft: 'var(--sidebar-w, 16rem)' }}>
        {/* Conteúdo da página */}
        <main className="py-6 px-4 lg:px-6">
          {/* SearchBar */}
          <div className="mb-6">
            <SearchBar
              value={searchTerm}
              onChange={(e)=>setSearchTerm(e.target.value)}
              rightButtonType="config"
              onRightButtonClick={()=>setIsConfigOpen(true)}
            />
          </div>
          
          {/* Conteúdo principal: Listagem de Pontos de Atendimento */}
          <ListagemPontosAtendimento pontos={filtered} onOpen={openPonto} />
        </main>
        
        {/* Modal de Configuração dos Pontos de Atendimento */}
        <ModalBase isOpen={isConfigOpen} onClose={()=>setIsConfigOpen(false)}>
          <FormConfig
            initialValues={config ? {
              mesasAtivas: !!config.atendimento_mesas,
              qtdMesas: config.quantidade_mesas ?? 0,
              comandasAtivas: !!config.atendimento_comandas,
              qtdComandas: config.quantidade_comandas ?? 0,
              prefixoComanda: config.prefixo_comanda || 'CMD',
            } : undefined}
            onCancel={()=>setIsConfigOpen(false)}
            onSubmit={async (vals)=>{
              try {
                if (!estabelecimentoId) return;
                const payload = {
                  atendimento_mesas: !!vals.mesasAtivas,
                  atendimento_comandas: !!vals.comandasAtivas,
                  quantidade_mesas: Number(vals.qtdMesas)||0,
                  quantidade_comandas: Number(vals.qtdComandas)||0,
                  prefixo_comanda: vals.prefixoComanda||null,
                };
                const putRes = await api.put(`/pontos-atendimento/${estabelecimentoId}`, payload);
                setConfig(putRes.data.config || null);
                setPontos(putRes.data.pontos || []);
                setIsConfigOpen(false);
              } catch(e) {
                console.error('Erro ao salvar config:', e);
                const msg = e?.response?.data?.message || 'Erro ao salvar configuração.';
                alert(msg);
              }
            }}
          />
        </ModalBase>

        {/* Footer apenas para telas pequenas */}
        <Footer />
      </div>
    </div>
  );
};

export default Home;
