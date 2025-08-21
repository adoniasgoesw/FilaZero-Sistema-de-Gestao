import React, { useState } from 'react';
import { Upload, Tag, X } from 'lucide-react';
import ColorPicker from '../ui/ColorPicker.jsx';
import IconPicker from '../ui/IconPicker.jsx';
import api from '../../services/api.js';

const FormCategoria = ({ onClose, onSubmit, categoriaEditando = null, modo = 'criar' }) => {
  const [activeTab, setActiveTab] = useState('detalhes');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nome: categoriaEditando?.nome || '',
    descricao: categoriaEditando?.descricao || '',
    imagem: null,
    cor: categoriaEditando?.cor || '#FF6B6B',
    icone: categoriaEditando?.icone || '🏷️',
    useImage: false
  });

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [previewImage, setPreviewImage] = useState(categoriaEditando?.imagem_url || null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Valida o tipo de arquivo
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione apenas arquivos de imagem.');
        return;
      }

      // Valida o tamanho (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 5MB.');
        return;
      }

      setFormData(prev => ({
        ...prev,
        imagem: file,
        useImage: true
      }));

      // Cria preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);

      setError('');
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      imagem: null,
      useImage: false
    }));
    setPreviewImage(null);
  };

  const handleColorSelect = (cor) => {
    setFormData(prev => ({
      ...prev,
      cor: cor.valor,
      useImage: false
    }));
    // Remove imagem se selecionar cor
    if (prev.imagem) {
      setFormData(prev => ({
        ...prev,
        imagem: null
      }));
      setPreviewImage(null);
    }
  };

  const handleIconSelect = (icone) => {
    setFormData(prev => ({
      ...prev,
      icone: icone,
      useImage: false
    }));
    // Remove imagem se selecionar ícone
    if (prev.imagem) {
      setFormData(prev => ({
        ...prev,
        imagem: null
      }));
      setPreviewImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      setError('Preencha o nome da categoria.');
      return;
    }

    // Validação: deve ter imagem OU cor+ícone
    if (!formData.useImage && (!formData.cor || !formData.icone)) {
      setError('Selecione uma imagem OU escolha cor e ícone.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (modo === 'editar') {
        // Modo edição
        const dadosEditados = {
          nome: formData.nome.trim(),
          descricao: formData.descricao.trim() || null,
          cor: formData.useImage ? null : formData.cor,
          icone: formData.useImage ? null : formData.icone
        };

        // Se tem nova imagem, adiciona ao FormData
        if (formData.imagem) {
          const formDataToSend = new FormData();
          formDataToSend.append('nome', dadosEditados.nome);
          formDataToSend.append('descricao', dadosEditados.descricao || '');
          
          // Chama a função onSubmit com os dados editados
          onSubmit(dadosEditados, formData.imagem);
        } else {
          // Chama a função onSubmit com os dados editados
          onSubmit(dadosEditados);
        }
      } else {
        // Modo criação
        const estabelecimentoId = localStorage.getItem('estabelecimentoId');
        
        if (!estabelecimentoId) {
          setError('Usuário não está logado ou estabelecimento não encontrado.');
          return;
        }

        if (formData.useImage && formData.imagem) {
          // Cria FormData para envio com imagem
          const formDataToSend = new FormData();
          formDataToSend.append('estabelecimento_id', estabelecimentoId);
          formDataToSend.append('nome', formData.nome.trim());
          formDataToSend.append('descricao', formData.descricao.trim() || '');
          formDataToSend.append('imagem', formData.imagem);

          // Usa a API centralizada
          const response = await api.post('/categorias', formDataToSend);
          const data = response.data;

          // Sucesso - chama a função onSubmit com os dados
          onSubmit(data.categoria);
        } else {
          // Cria categoria com cor e ícone
          const categoriaData = {
            estabelecimento_id: parseInt(estabelecimentoId),
            nome: formData.nome.trim(),
            descricao: formData.descricao.trim() || null,
            cor: formData.cor,
            icone: formData.icone
          };

          // Usa a API centralizada
          const response = await api.post('/categorias', categoriaData);
          const data = response.data;

          // Sucesso - chama a função onSubmit com os dados
          onSubmit(data.categoria);
        }
        
        // Limpa o formulário
        setFormData({
          nome: '',
          descricao: '',
          imagem: null,
          cor: '#FF6B6B',
          icone: '🏷️',
          useImage: false
        });
        setPreviewImage(null);
      }

      // Fecha o modal
      onClose();

    } catch (error) {
      console.error(`Erro ao ${modo === 'editar' ? 'editar' : 'criar'} categoria:`, error);
      setError(error.message || `Erro interno ao ${modo === 'editar' ? 'editar' : 'criar'} categoria`);
    } finally {
      setLoading(false);
    }
  };

  const renderDetalhes = () => (
    <div className="space-y-6">
      {/* Nome */}
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
          Nome da Categoria *
        </label>
        <input
          type="text"
          id="nome"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="Ex: Hambúrgueres"
        />
      </div>

      {/* Descrição */}
      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-2">
          Descrição
        </label>
        <textarea
          id="descricao"
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="Descreva a categoria..."
        />
      </div>

      {/* Opções de Personalização */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Personalização</h3>
        
        {/* Imagem */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagem da Categoria
          </label>
          <div className="space-y-3">
            {!previewImage ? (
              <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <Upload className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Escolher Imagem</span>
                <input
                  type="file"
                  id="imagem"
                  name="imagem"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative inline-block">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <p className="text-xs text-gray-500">
              Tamanho máximo: 5MB. Formatos: JPG, PNG, GIF
            </p>
          </div>
        </div>

        {/* Cor e Ícone (só aparecem se não tiver imagem) */}
        {!formData.useImage && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cor */}
            <div className="flex flex-col items-center">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                Escolher Cor *
              </label>
              <button
                type="button"
                onClick={() => setShowColorPicker(true)}
                className="w-12 h-12 rounded-full border-2 border-gray-300 shadow-sm hover:shadow-md transition-shadow"
                style={{ backgroundColor: formData.cor }}
              />
            </div>

            {/* Ícone */}
            <div className="flex flex-col items-center">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                Escolher Ícone *
              </label>
              <button
                type="button"
                onClick={() => setShowIconPicker(true)}
                className="w-12 h-12 flex items-center justify-center text-2xl hover:bg-gray-50 rounded-full border-2 border-gray-300 shadow-sm transition-all"
              >
                {formData.icone}
              </button>
            </div>
          </div>
        )}
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
            : 'bg-orange-100'
        }`}>
          <Tag className={`h-6 w-6 ${
            modo === 'editar' 
              ? 'text-green-600' 
              : 'text-orange-600'
          }`} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          {modo === 'editar' ? 'Editar Categoria' : 'Cadastrar Categoria'}
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
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Detalhes da Categoria
          </button>
        </nav>
      </div>

      {/* Conteúdo das Tabs */}
      <div className="mb-6">
        {activeTab === 'detalhes' && renderDetalhes()}
      </div>

      {/* Botões */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
            modo === 'editar' 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-orange-600 hover:bg-orange-700'
          }`}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {modo === 'editar' ? 'Salvando...' : 'Criando...'}
            </>
          ) : (
            modo === 'editar' ? 'Salvar Alterações' : 'Cadastrar Categoria'
          )}
        </button>
      </div>

      {/* Componentes de Seleção */}
      <ColorPicker
        isOpen={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        onSelectColor={handleColorSelect}
        selectedColor={formData.cor}
      />
      
      <IconPicker
        isOpen={showIconPicker}
        onClose={() => setShowIconPicker(false)}
        onSelectIcon={handleIconSelect}
        selectedIcon={formData.icone}
      />
    </div>
  );
};

export default FormCategoria;

