// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import productService from '../api/productService';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        
        // Cargar productos, categorías y marcas en paralelo
        const [productsResponse, categoriesResponse, brandsResponse] = await Promise.all([
          productService.getProducts(),
          productService.getCategories(),
          productService.getBrands()
        ]);
        
        setProducts(productsResponse.results);
        setCategories(categoriesResponse.results);
        setBrands(brandsResponse.results);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Hubo un error al cargar los datos. Por favor, intenta de nuevo más tarde.');
        setLoading(false);
      }
    };
    
    fetchHomeData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Cargando...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Banner principal */}
      <div className="bg-blue-600 text-white rounded-lg p-8 mb-8">
        <h1 className="text-4xl font-bold mb-4">Bienvenido a nuestra tienda</h1>
        <p className="text-xl mb-6">Descubre los mejores productos de tecnología al mejor precio</p>
        <Link to="/productos" className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100">
          Ver todos los productos
        </Link>
      </div>
      
      {/* Categorías destacadas */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Categorías</h2>
          <Link to="/productos" className="text-blue-600 hover:underline">Ver todas</Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.slice(0, 4).map(category => (
            <Link
              key={category.id}
              to={`/productos?category=${category.id}`}
              className="bg-gray-100 rounded-lg p-4 text-center hover:bg-gray-200"
            >
              <div className="text-lg font-medium">{category.nombre}</div>
            </Link>
          ))}
        </div>
      </section>
      
      {/* Productos destacados */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Productos destacados</h2>
          <Link to="/productos" className="text-blue-600 hover:underline">Ver todos</Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
      
      {/* Marcas */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Nuestras marcas</h2>
          <Link to="/productos" className="text-blue-600 hover:underline">Ver todas</Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {brands.map(brand => (
            <Link 
              key={brand.id} 
              to={`/productos?brand=${brand.id}`}
              className="bg-white border rounded-lg p-4 text-center hover:shadow-md"
            >
              <div className="text-lg">{brand.nombre}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;