import React, { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";

const FormProduto = ({ onSubmit, onCancel, initialValues, categorias = [] }) => {
  const [tab, setTab] = useState('detalhes'); // 'detalhes' | 'complementos' | 'receita'
  const [nome, setNome] = useState(initialValues?.nome || "");
  const [precoVenda, setPrecoVenda] = useState(initialValues?.precoVenda || "");
  const [precoCompra, setPrecoCompra] = useState(initialValues?.precoCompra || "");
  const [categoriaId, setCategoriaId] = useState(initialValues?.id_categoria || "");
  const [habilitaEstoque, setHabilitaEstoque] = useState(!!initialValues?.habilita_estoque);
  const [estoque, setEstoque] = useState(initialValues?.estoque || "");
  const [habilitaTempo, setHabilitaTempo] = useState(!!initialValues?.habilita_tempo_preparo);
  const [tempoPreparo, setTempoPreparo] = useState(initialValues?.tempo_preparo_min || "");
  const [imagemFile, setImagemFile] = useState(null);
  const [imagemPreview, setImagemPreview] = useState(initialValues?.imagem || null);
  const fileInputRef = useRef(null);

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagemFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagemPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({
      nome,
      precoVenda,
      precoCompra,
      id_categoria: categoriaId,
      habilita_estoque: habilitaEstoque,
      estoque_qtd: estoque,
      habilita_tempo_preparo: habilitaTempo,
      tempo_preparo_min: tempoPreparo,
      imagemFile,
    });
  };

  const calcularLucro = () => {
    const venda = parseFloat(precoVenda || '0');
    const compra = parseFloat(precoCompra || '0');
    const v = venda - compra;
    if (Number.isNaN(v)) return 0;
    return v;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-[#1A99BA]">
        {initialValues ? "Editar Produto" : "Novo Produto"}
      </h2>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: 'detalhes', label: 'Detalhes do Produto' },
          { key: 'complementos', label: 'Complementos' },
          { key: 'receita', label: 'Receita' },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-sm rounded-t-md ${tab === t.key ? 'bg-white border border-b-0 border-gray-200 text-[#1A99BA]' : 'text-gray-600 hover:text-[#1A99BA]'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'detalhes' && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome do produto</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A99BA]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preço de venda</label>
          <input
            type="number"
            step="0.01"
            value={precoVenda}
            onChange={(e) => setPrecoVenda(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A99BA]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preço de compra</label>
          <input
            type="number"
            step="0.01"
            value={precoCompra}
            onChange={(e) => setPrecoCompra(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A99BA]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lucro (auto)</label>
          <input
            type="text"
            value={calcularLucro().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            readOnly
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700"
            aria-readonly
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A99BA]"
            required
          >
            <option value="">Selecione</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <input type="checkbox" checked={habilitaEstoque} onChange={(e) => setHabilitaEstoque(e.target.checked)} />
            Habilitar estoque
          </label>
          {habilitaEstoque && (
            <input
              type="number"
              value={estoque}
              onChange={(e) => setEstoque(e.target.value)}
              placeholder="Quantidade em estoque"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A99BA]"
              required
            />
          )}
        </div>

        <div>
          <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <input type="checkbox" checked={habilitaTempo} onChange={(e) => setHabilitaTempo(e.target.checked)} />
            Habilitar tempo de preparo
          </label>
          {habilitaTempo && (
            <input
              type="number"
              value={tempoPreparo}
              onChange={(e) => setTempoPreparo(e.target.value)}
              placeholder="Tempo de preparo (min)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A99BA]"
              required
            />
          )}
        </div>
      </div>
      )}

      {tab === 'detalhes' && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Imagem do produto (pequena)</label>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={handlePickFile}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <ImagePlus className="w-5 h-5 text-[#1A99BA]" />
            Selecionar imagem
          </button>
          {imagemPreview && (
            <img src={imagemPreview} alt="Pré-visualização" className="w-10 h-10 object-cover rounded-md border" />
          )}
        </div>
      </div>
      )}

      {tab === 'complementos' && (
        <div className="text-gray-500 text-sm">Complementos: em breve.</div>
      )}

      {tab === 'receita' && (
        <div className="text-gray-500 text-sm">Receita: em breve.</div>
      )}

      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        {tab === 'detalhes' && (
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[#1A99BA] text-white hover:bg-[#0f5f73]"
          >
            {initialValues ? "Atualizar" : "Salvar"}
          </button>
        )}
      </div>
    </form>
  );
};

export default FormProduto;


