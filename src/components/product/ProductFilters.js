import React from 'react';

const ProductFilters = ({ categories, brands, selectedCategory, selectedBrand, onCategoryChange, onBrandChange }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      <h2 className="text-lg font-semibold mb-4">Filtros</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categoría
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.nombre}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Marca
        </label>
        <select
          value={selectedBrand}
          onChange={(e) => onBrandChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">Todas las marcas</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.nombre}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ProductFilters;