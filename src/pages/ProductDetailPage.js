import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { productService } from '../api/productService';
import { useCart } from '../context/CartContext';
// import { CartContext } from '../context/CartContext';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addItem } = useCart();
  // const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (err) {
        setError('Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div className="text-center mt-8">Cargando...</div>;
  if (error) return <div className="text-red-500 text-center mt-8">{error}</div>;
  if (!product) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img
            src={product.imagen || '/api/placeholder/400/400'}
            alt={product.nombre}
            className="w-full h-auto rounded-lg shadow-md"
          />
        </div>
        
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.nombre}</h1>
          <p className="text-2xl font-semibold mb-4">${product.precio}</p>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Categoría:</span> {product.categoria_nombre}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Marca:</span> {product.marca_nombre}
            </p>
            {product.color && (
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Color:</span> {product.color}
              </p>
            )}
            {product.capacidad && (
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Capacidad:</span> {product.capacidad}
              </p>
            )}
          </div>
          
          <p className="text-gray-700 mb-6">{product.descripcion}</p>
          
          <button
            onClick={() => addItem (product)}
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
          >
            Agregar al Carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;