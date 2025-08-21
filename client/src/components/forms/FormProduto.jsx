import React, { useState, useEffect } from 'react';
import { Upload, Package2, ChefHat, Package, X } from 'lucide-react';
import ColorPicker from '../ui/ColorPicker.jsx';
import IconPicker from '../ui/IconPicker.jsx';
import api from '../../services/api.js';

const FormProduto = ({ onClose, onSubmit, produtoEditando = null, modo = 'criar' }) => {
  const [activeTab, setActiveTab] = useState('detalhes');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [formData, setFormData] = useState({
    nome: produtoEditando?.nome || '',
    categoria_id: produtoEditando?.categoria_id || '',
    valorVenda: produtoEditando?.valor_venda || '',
    valorCusto: produtoEditando?.valor_custo || '',
    habilitarEstoque: produtoEditando?.habilitar_estoque || false,
    quantidadeEstoque: produtoEditando?.quantidade_estoque || '',
    habilitarTempoPreparo: produtoEditando?.habilitar_tempo_preparo || false,
    tempoPreparo: produtoEditando?.tempo_preparo || '',
    descricao: produtoEditando?.descricao || '',
    imagem: null,
    cor: produtoEditando?.cor || '#FF6B6B',
    icone: produtoEditando?.icone || '🍕',
    useImage: false
  });

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [previewImage, setPreviewImage] = useState(produtoEditando?.imagem_url || null);

  // Carregar categorias ao montar o componente
  useEffect(() => {
    carregarCategorias();
  }, []);

  const carregarCategorias = async () => {
    try {
      const estabelecimentoId = localStorage.getItem('estabelecimentoId');
      if (estabelecimentoId) {
        const response = await api.get(`/categorias/estabelecimento/${estabelecimentoId}`);
        const data = response.data;
        setCategorias(data.categorias || []);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
    
    if (!formData.nome.trim() || !formData.categoria_id || !formData.valorVenda) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    // Validação: deve ter imagem OU cor+ícone
    if (!formData.useImage && (!formData.cor || !formData.icone)) {
      setError('Selecione uma imagem OU escolha cor e ícone.');
      return;
    }

    // Validações adicionais
    if (formData.habilitarEstoque && !formData.quantidadeEstoque) {
      setError('Quantidade de estoque é obrigatória quando o controle de estoque está habilitado.');
      return;
    }

    if (formData.habilitarTempoPreparo && !formData.tempoPreparo) {
      setError('Tempo de preparo é obrigatório quando o controle de tempo está habilitado.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (modo === 'editar') {
        // Modo edição
        const dadosEditados = {
          nome: formData.nome.trim(),
          categoria_id: parseInt(formData.categoria_id),
          descricao: formData.descricao.trim() || null,
          valor_venda: parseFloat(formData.valorVenda),
          valor_custo: formData.valorCusto ? parseFloat(formData.valorCusto) : null,
          habilitar_estoque: formData.habilitarEstoque,
          quantidade_estoque: formData.habilitarEstoque ? parseInt(formData.quantidadeEstoque) : 0,
          habilitar_tempo_preparo: formData.habilitarTempoPreparo,
          tempo_preparo: formData.habilitarTempoPreparo ? parseInt(formData.tempoPreparo) : 0,
          cor: formData.useImage ? null : formData.cor,
          icone: formData.useImage ? null : formData.icone
        };

        // Se tem nova imagem, adiciona ao FormData
        if (formData.imagem) {
          const formDataToSend = new FormData();
          formDataToSend.append('nome', dadosEditados.nome);
          formDataToSend.append('categoria_id', dadosEditados.categoria_id);
          formDataToSend.append('descricao', dadosEditados.descricao || '');
          formDataToSend.append('valor_venda', dadosEditados.valor_venda);
          formDataToSend.append('valor_custo', dadosEditados.valor_custo || '');
          formDataToSend.append('habilitar_estoque', dadosEditados.habilitar_estoque);
          formDataToSend.append('quantidade_estoque', dadosEditados.quantidade_estoque);
          formDataToSend.append('habilitar_tempo_preparo', dadosEditados.habilitar_tempo_preparo);
          formDataToSend.append('tempo_preparo', dadosEditados.tempo_preparo);
          formDataToSend.append('imagem', formData.imagem);
          
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
          formDataToSend.append('categoria_id', formData.categoria_id);
          formDataToSend.append('nome', formData.nome.trim());
          formDataToSend.append('descricao', formData.descricao.trim() || '');
          formDataToSend.append('valor_venda', formData.valorVenda);
          formDataToSend.append('valor_custo', formData.valorCusto || '');
          formDataToSend.append('habilitar_estoque', formData.habilitarEstoque);
          formDataToSend.append('quantidade_estoque', formData.habilitarEstoque ? formData.quantidadeEstoque : 0);
          formDataToSend.append('habilitar_tempo_preparo', formData.habilitarTempoPreparo);
          formDataToSend.append('tempo_preparo', formData.habilitarTempoPreparo ? formData.tempoPreparo : 0);
          formDataToSend.append('imagem', formData.imagem);

          // Usa a API centralizada
                      const response = await api.post('/produtos', formDataToSend);
            const data = response.data;

          // Sucesso - chama a função onSubmit com os dados
          onSubmit(data.produto);
        } else {
          // Cria produto com cor e ícone
          const produtoData = {
            estabelecimento_id: parseInt(estabelecimentoId),
            categoria_id: parseInt(formData.categoria_id),
            nome: formData.nome.trim(),
            descricao: formData.descricao.trim() || null,
            valor_venda: parseFloat(formData.valorVenda),
            valor_custo: formData.valorCusto ? parseFloat(formData.valorCusto) : null,
            habilitar_estoque: formData.habilitarEstoque,
            quantidade_estoque: formData.habilitarEstoque ? parseInt(formData.quantidadeEstoque) : 0,
            habilitar_tempo_preparo: formData.habilitarTempoPreparo,
            tempo_preparo: formData.habilitarTempoPreparo ? parseInt(formData.tempoPreparo) : 0,
            cor: formData.cor,
            icone: formData.icone
          };

          // Usa a API centralizada
                      const response = await api.post('/produtos', produtoData);
            const data = response.data;

          // Sucesso - chama a função onSubmit com os dados
          onSubmit(data.produto);
        }
        
        // Limpa o formulário
        setFormData({
          nome: '',
          categoria_id: '',
          valorVenda: '',
          valorCusto: '',
          habilitarEstoque: false,
          quantidadeEstoque: '',
          habilitarTempoPreparo: false,
          tempoPreparo: '',
          descricao: '',
          imagem: null,
          cor: '#FF6B6B',
          icone: '🍕',
          useImage: false
        });
        setPreviewImage(null);
      }

      // Fecha o modal
      onClose();

    } catch (error) {
      console.error(`Erro ao ${modo === 'editar' ? 'editar' : 'criar'} produto:`, error);
      setError(error.message || `Erro interno ao ${modo === 'editar' ? 'editar' : 'criar'} produto`);
    } finally {
      setLoading(false);
    }
  };

  const renderDetalhes = () => (
    <div className="space-y-6">
      {/* Nome */}
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
          Nome do Produto *
        </label>
        <input
          type="text"
          id="nome"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Ex: X-Burger"
        />
      </div>

      {/* Categoria */}
      <div>
        <label htmlFor="categoria_id" className="block text-sm font-medium text-gray-700 mb-2">
          Categoria *
        </label>
        <select
          id="categoria_id"
          name="categoria_id"
          value={formData.categoria_id}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Selecione uma categoria</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nome}</option>
          ))}
        </select>
      </div>

      {/* Valores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="valorVenda" className="block text-sm font-medium text-gray-700 mb-2">
            Valor de Venda *
          </label>
          <input
            type="number"
            id="valorVenda"
            name="valorVenda"
            value={formData.valorVenda}
            onChange={handleChange}
            required
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="0.00"
          />
        </div>
        <div>
          <label htmlFor="valorCusto" className="block text-sm font-medium text-gray-700 mb-2">
            Valor de Custo
          </label>
          <input
            type="number"
            id="valorCusto"
            name="valorCusto"
            value={formData.valorCusto}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Opções de Personalização */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Personalização</h3>
        
        {/* Imagem */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagem do Produto
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

      {/* Estoque */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="habilitarEstoque"
            name="habilitarEstoque"
            checked={formData.habilitarEstoque}
            onChange={handleChange}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="habilitarEstoque" className="text-sm font-medium text-gray-700">
            Habilitar Controle de Estoque
          </label>
        </div>
        {formData.habilitarEstoque && (
          <div>
            <label htmlFor="quantidadeEstoque" className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade em Estoque *
            </label>
            <input
              type="number"
              id="quantidadeEstoque"
              name="quantidadeEstoque"
              value={formData.quantidadeEstoque}
              onChange={handleChange}
              min="0"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="0"
            />
          </div>
        )}
      </div>

      {/* Tempo de Preparo */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="habilitarTempoPreparo"
            name="habilitarTempoPreparo"
            checked={formData.habilitarTempoPreparo}
            onChange={handleChange}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="habilitarTempoPreparo" className="text-sm font-medium text-gray-700">
            Habilitar Tempo de Preparo
          </label>
        </div>
        {formData.habilitarTempoPreparo && (
          <div>
            <label htmlFor="tempoPreparo" className="block text-sm font-medium text-gray-700 mb-2">
              Tempo de Preparo (minutos) *
            </label>
            <input
              type="number"
              id="tempoPreparo"
              name="tempoPreparo"
              value={formData.tempoPreparo}
              onChange={handleChange}
              min="1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="15"
            />
          </div>
        )}
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Descreva o produto..."
        />
      </div>
    </div>
  );

  const renderComplementos = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <Package2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Complementos</h3>
        <p className="text-gray-500">Funcionalidade de complementos será implementada em breve</p>
      </div>
    </div>
  );

  const renderReceita = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Receita</h3>
        <p className="text-gray-500">Funcionalidade de receita será implementada em breve</p>
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
            : 'bg-indigo-100'
        }`}>
          <Package className={`h-6 w-6 ${
            modo === 'editar' 
              ? 'text-green-600' 
              : 'text-indigo-600'
          }`} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          {modo === 'editar' ? 'Editar Produto' : 'Cadastrar Produto'}
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
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Detalhes do Produto
          </button>
          <button
            onClick={() => setActiveTab('complementos')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'complementos'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Complementos
          </button>
          <button
            onClick={() => setActiveTab('receita')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'receita'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Receita
          </button>
        </nav>
      </div>

      {/* Conteúdo das Tabs */}
      <div className="mb-6">
        {activeTab === 'detalhes' && renderDetalhes()}
        {activeTab === 'complementos' && renderComplementos()}
        {activeTab === 'receita' && renderReceita()}
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
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {modo === 'editar' ? 'Salvando...' : 'Criando...'}
            </>
          ) : (
            modo === 'editar' ? 'Salvar Alterações' : 'Cadastrar Produto'
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

export default FormProduto;

