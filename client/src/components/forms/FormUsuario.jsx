import React, { useState } from 'react';
import { User } from 'lucide-react';
import api from '../../services/api.js';

const FormUsuario = ({ onClose, onSubmit, usuarioEditando = null, modo = 'criar' }) => {
  const [activeTab, setActiveTab] = useState('detalhes');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nome: usuarioEditando?.nome_completo || '',
    cpf: usuarioEditando?.cpf || '',
    email: usuarioEditando?.email || '',
    senha: '',
    cargo: usuarioEditando?.cargo || '',
    whatsapp: usuarioEditando?.whatsapp || '',
    permissoes: {
      produtos: false,
      categorias: false,
      clientes: false,
      usuarios: false,
      formasPagamento: false,
      caixas: false,
      relatorios: false
    }
  });

  const cargos = [
    'Administrador',
    'Gerente',
    'Atendente',
    'Garçom',
    'Caixa',
    'Entregador',
    'Cozinha'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissaoChange = (permissao) => {
    setFormData(prev => ({
      ...prev,
      permissoes: {
        ...prev.permissoes,
        [permissao]: !prev.permissoes[permissao]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome.trim() || !formData.cpf.trim() || !formData.cargo) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    // Se for edição, não precisa de senha. Se for criação, senha é obrigatória
    if (modo === 'criar' && !formData.senha.trim()) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (modo === 'editar') {
        // Modo edição - envia apenas os campos editáveis
        const dadosEditados = {
          nome_completo: formData.nome.trim(),
          email: formData.email.trim() || null,
          whatsapp: formData.whatsapp.trim() || null,
          cargo: formData.cargo
        };

        // Chama a função onSubmit com os dados editados
        onSubmit(dadosEditados);
      } else {
        // Modo criação - envia todos os dados incluindo senha
        const estabelecimentoId = localStorage.getItem('estabelecimentoId');
        
        if (!estabelecimentoId) {
          setError('Usuário não está logado ou estabelecimento não encontrado.');
          return;
        }

        const usuarioData = {
          estabelecimento_id: parseInt(estabelecimentoId),
          nome_completo: formData.nome.trim(),
          cpf: formData.cpf.trim(),
          email: formData.email.trim() || null,
          senha: formData.senha,
          whatsapp: formData.whatsapp.trim() || null,
          cargo: formData.cargo,
          permissoes: formData.permissoes
        };

        // Usa a API centralizada
        const response = await api.post('/usuarios', usuarioData);
        const data = response.data;

        // Sucesso - chama a função onSubmit com os dados
        onSubmit(data.usuario);
        
        // Limpa o formulário
        setFormData({
          nome: '',
          cpf: '',
          email: '',
          senha: '',
          cargo: '',
          whatsapp: '',
          permissoes: {
            produtos: false,
            categorias: false,
            clientes: false,
            usuarios: false,
            formasPagamento: false,
            caixas: false,
            relatorios: false
          }
        });
      }

      // Fecha o modal
      onClose();

    } catch (error) {
      console.error(`Erro ao ${modo === 'editar' ? 'editar' : 'criar'} usuário:`, error);
      setError(error.message || `Erro interno ao ${modo === 'editar' ? 'editar' : 'criar'} usuário`);
    } finally {
      setLoading(false);
    }
  };

  const renderDetalhes = () => (
    <div className="space-y-6">
      {/* Nome */}
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
          Nome Completo *
        </label>
        <input
          type="text"
          id="nome"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Nome completo do usuário"
        />
      </div>

      {/* CPF */}
      <div>
        <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-2">
          CPF *
        </label>
        <input
          type="text"
          id="cpf"
          name="cpf"
          value={formData.cpf}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="000.000.000-00"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          E-mail
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="usuario@email.com"
        />
      </div>

      {/* WhatsApp */}
      <div>
        <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
          WhatsApp
        </label>
        <input
          type="text"
          id="whatsapp"
          name="whatsapp"
          value={formData.whatsapp}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="(11) 99999-9999"
        />
      </div>

      {/* Senha */}
      <div>
        <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-2">
          Senha *
        </label>
        <input
          type="password"
          id="senha"
          name="senha"
          value={formData.senha}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      {/* Cargo */}
      <div>
        <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-2">
          Cargo *
        </label>
        <select
          id="cargo"
          name="cargo"
          value={formData.cargo}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Selecione o cargo</option>
          {cargos.map(cargo => (
            <option key={cargo} value={cargo}>{cargo}</option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderPermissoes = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Permissões do Sistema</h3>
        <p className="text-sm text-blue-700">
          Selecione as funcionalidades que este usuário poderá acessar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gestão de Produtos */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="produtos"
            checked={formData.permissoes.produtos}
            onChange={() => handlePermissaoChange('produtos')}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="produtos" className="text-sm font-medium text-gray-700">
            Gestão de Produtos
          </label>
        </div>

        {/* Gestão de Categorias */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="categorias"
            checked={formData.permissoes.categorias}
            onChange={() => handlePermissaoChange('categorias')}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="categorias" className="text-sm font-medium text-gray-700">
            Gestão de Categorias
          </label>
        </div>

        {/* Gestão de Clientes */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="clientes"
            checked={formData.permissoes.clientes}
            onChange={() => handlePermissaoChange('clientes')}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="clientes" className="text-sm font-medium text-gray-700">
            Gestão de Clientes
          </label>
        </div>

        {/* Gestão de Usuários */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="usuarios"
            checked={formData.permissoes.usuarios}
            onChange={() => handlePermissaoChange('usuarios')}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="usuarios" className="text-sm font-medium text-gray-700">
            Gestão de Usuários
          </label>
        </div>

        {/* Formas de Pagamento */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="formasPagamento"
            checked={formData.permissoes.formasPagamento}
            onChange={() => handlePermissaoChange('formasPagamento')}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="formasPagamento" className="text-sm font-medium text-gray-700">
            Formas de Pagamento
          </label>
        </div>

        {/* Controle de Caixas */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="caixas"
            checked={formData.permissoes.caixas}
            onChange={() => handlePermissaoChange('caixas')}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="caixas" className="text-sm font-medium text-gray-700">
            Controle de Caixas
          </label>
        </div>

        {/* Relatórios */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="relatorios"
            checked={formData.permissoes.relatorios}
            onChange={() => handlePermissaoChange('relatorios')}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="relatorios" className="text-sm font-medium text-gray-700">
            Relatórios
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header com Título e Ícone */}
      <div className="flex items-center gap-3 mb-8">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          modo === 'editar' 
            ? 'bg-green-100' 
            : 'bg-blue-100'
        }`}>
          <User className={`h-6 w-6 ${
            modo === 'editar' 
              ? 'text-green-600' 
              : 'text-blue-600'
          }`} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          {modo === 'editar' ? 'Editar Usuário' : 'Cadastrar Usuário'}
        </h2>
      </div>

      {/* Mensagem de Erro */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('detalhes')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'detalhes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Detalhes do Usuário
          </button>
          <button
            onClick={() => setActiveTab('permissoes')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'permissoes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Permissões
          </button>
        </nav>
      </div>

      {/* Conteúdo das Tabs */}
      <div className="mb-6">
        {activeTab === 'detalhes' && renderDetalhes()}
        {activeTab === 'permissoes' && renderPermissoes()}
      </div>

      {/* Botões */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {modo === 'editar' ? 'Cancelar' : 'Cancelar'}
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
            modo === 'editar' 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {modo === 'editar' ? 'Salvando...' : 'Criando...'}
            </>
          ) : (
            modo === 'editar' ? 'Salvar Alterações' : 'Cadastrar Usuário'
          )}
        </button>
      </div>
    </div>
  );
};

export default FormUsuario;
