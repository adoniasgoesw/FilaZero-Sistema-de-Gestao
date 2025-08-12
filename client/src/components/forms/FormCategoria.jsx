import React, { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";

const FormCategoria = ({ onSubmit, onCancel, initialValues }) => {
  const [categoryName, setCategoryName] = useState(initialValues?.nome || "");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialValues?.imagem_url || null);
  const fileInputRef = useRef(null);

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({ name: categoryName, imageFile });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-[#1A99BA]">
        {initialValues ? "Editar Categoria" : "Nova Categoria"}
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome da categoria
        </label>
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Ex.: Bebidas"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A99BA]"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imagem da categoria (opcional)
        </label>
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
          {imageFile && (
            <span className="text-sm text-gray-600 truncate">
              {imageFile.name}
            </span>
          )}
        </div>
        {imagePreview && (
          <div className="mt-3">
            <img
              src={imagePreview}
              alt="Pré-visualização"
              className="w-32 h-32 object-cover rounded-lg border"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-[#1A99BA] text-white hover:bg-[#0f5f73]"
        >
          {initialValues ? "Atualizar" : "Salvar"}
        </button>
      </div>
    </form>
  );
};

export default FormCategoria;
