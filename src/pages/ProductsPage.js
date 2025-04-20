import React, { useState, useEffect } from 'react';
import { productService } from '../api/productService';
import ProductCard from '../components/product/ProductCard';

// Importa useLocation desde react-router-dom al principio del archivo
import { useLocation } from 'react-router-dom';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [categoryNames, setCategoryNames] = useState({});
  const [brandNames, setBrandNames] = useState({});
// Añade esta constante dentro del componente para obtener la ubicación actual
  const location = useLocation(); // Añade esta línea

  // Modificar el primer useEffect para leer los parámetros de URL
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // Leer parámetros de la URL
        const queryParams = new URLSearchParams(location.search);
        const categoryParam = queryParams.get('category');
        const brandParam = queryParams.get('brand');
        
        const [categoriesData, brandsData] = await Promise.all([
          productService.getCategories(),
          productService.getBrands()
        ]);
        
        setCategories(categoriesData.results || []);
        setBrands(brandsData.results || []);
        
        // Crear mapeo de ID a nombre para mejor rendimiento
        const catMap = {};
        const brandMap = {};
        
        categoriesData.results?.forEach(cat => {
          catMap[cat.id] = cat.nombre;
        });
        
        brandsData.results?.forEach(brand => {
          brandMap[brand.id] = brand.nombre;
        });
        
        setCategoryNames(catMap);
        setBrandNames(brandMap);
        
        // Si hay un parámetro de categoría en la URL, establecerlo
        if (categoryParam) {
          setSelectedCategory(categoryParam);
        }
        
        // Si hay un parámetro de marca en la URL, establecerlo
        if (brandParam) {
          setSelectedBrand(brandParam);
        }
      } catch (err) {
        console.error("Error al cargar filtros:", err);
        setError('Error al cargar los filtros');
      }
    };

    fetchFilters();
  }, [location.search]); // Añade location.search como dependencia
  
  // // Cargar categorías y marcas al inicio
  // useEffect(() => {
  //   const fetchFilters = async () => {
  //     try {
  //       const [categoriesData, brandsData] = await Promise.all([
  //         productService.getCategories(),
  //         productService.getBrands()
  //       ]);
        
  //       setCategories(categoriesData.results || []);
  //       setBrands(brandsData.results || []);
        
  //       // Crear mapeo de ID a nombre para mejor rendimiento
  //       const catMap = {};
  //       const brandMap = {};
        
  //       categoriesData.results?.forEach(cat => {
  //         catMap[cat.id] = cat.nombre;
  //       });
        
  //       brandsData.results?.forEach(brand => {
  //         brandMap[brand.id] = brand.nombre;
  //       });
        
  //       setCategoryNames(catMap);
  //       setBrandNames(brandMap);
  //     } catch (err) {
  //       console.error("Error al cargar filtros:", err);
  //       setError('Error al cargar los filtros');
  //     }
  //   };

  //   fetchFilters();
  // }, []);

  // Cargar productos cuando cambian los filtros o la página
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Construir parámetros
        const params = {
          page: currentPage
        };
        
        if (searchTerm) {
          params.search = searchTerm;
        }
        
        if (selectedCategory) {
          params.categoria = selectedCategory;
        }
        
        if (selectedBrand) {
          params.marca = selectedBrand;
        }
        
        console.log("Enviando parámetros:", params);
        const response = await productService.getProducts(params);
        console.log("Respuesta recibida:", response);
        
        setProducts(response.results || []);
        setTotalProducts(response.count || 0);
        
        // Calcular el total de páginas
        const resultsPerPage = response.results?.length || 1;
        const total = Math.max(1, Math.ceil((response.count || 0) / resultsPerPage));
        setTotalPages(total);
        
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar productos:", err);
        setError('Error al cargar los productos');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, searchTerm, selectedCategory, selectedBrand]);

  // Manejo de búsqueda
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset a la primera página
  };

  // Manejo de cambio de página
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Manejo de cambio de categoría
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    setCurrentPage(1); // Reset a la primera página
  };

  // Manejo de cambio de marca
  const handleBrandChange = (e) => {
    const value = e.target.value;
    setSelectedBrand(value);
    setCurrentPage(1); // Reset a la primera página
  };

  // Interfaz de usuario
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Productos</h1>
      
      {/* Filtros y Búsqueda */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Búsqueda */}
          <form onSubmit={handleSearchSubmit} className="md:col-span-2 flex">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full p-2 border rounded-l-lg"
            />
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700"
            >
              Buscar
            </button>
          </form>
          
          {/* Categorías */}
          <select 
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="p-2 border rounded-lg"
          >
            <option value="">Todas las categorías</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.nombre}
              </option>
            ))}
          </select>
          
          {/* Marcas */}
          <select 
            value={selectedBrand}
            onChange={handleBrandChange}
            className="p-2 border rounded-lg"
          >
            <option value="">Todas las marcas</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>
                {brand.nombre}
              </option>
            ))}
          </select>
        </div>
        
        {/* Resumen de resultados */}
        <div className="text-gray-600 mb-4">
          {searchTerm && <span>Resultados para "{searchTerm}". </span>}
          {selectedCategory && <span>Categoría: {categoryNames[selectedCategory]}. </span>}
          {selectedBrand && <span>Marca: {brandNames[selectedBrand]}. </span>}
          Mostrando {products.length} de {totalProducts} productos
          {totalPages > 1 && <span> (Página {currentPage} de {totalPages})</span>}
        </div>
      </div>
      
      {/* Error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
          <p>{error}</p>
        </div>
      )}
      
      {/* Productos */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Cargando productos...</p>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600">No se encontraron productos con los filtros seleccionados.</p>
        </div>
      )}
      
      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center flex-wrap gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 border rounded ${
              currentPage === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'hover:bg-gray-100'
            }`}
          >
            Anterior
          </button>
          
          {(() => {
            const pages = [];
            const maxVisiblePages = 5;
            let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
            
            // Ajustar el rango si estamos cerca del final
            if (endPage - startPage + 1 < maxVisiblePages) {
              startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }
            
            // Primera página
            if (startPage > 1) {
              pages.push(
                <button
                  key={1}
                  onClick={() => handlePageChange(1)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  1
                </button>
              );
              
              if (startPage > 2) {
                pages.push(<span key="dots1" className="px-2 py-2">...</span>);
              }
            }
            
            // Páginas intermedias
            for (let i = startPage; i <= endPage; i++) {
              pages.push(
                <button
                  key={i}
                  onClick={() => handlePageChange(i)}
                  className={`px-4 py-2 border rounded ${
                    currentPage === i 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {i}
                </button>
              );
            }
            
            // Última página
            if (endPage < totalPages) {
              if (endPage < totalPages - 1) {
                pages.push(<span key="dots2" className="px-2 py-2">...</span>);
              }
              
              pages.push(
                <button
                  key={totalPages}
                  onClick={() => handlePageChange(totalPages)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  {totalPages}
                </button>
              );
            }
            
            return pages;
          })()}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 border rounded ${
              currentPage === totalPages 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'hover:bg-gray-100'
            }`}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;