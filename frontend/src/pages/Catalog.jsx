import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useCustomer } from '../context/CustomerContext';
import { ErrorBanner, Loading } from '../components/Bits';

export default function Catalog() {
  const { customerId } = useCustomer();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingId, setAddingId] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (categoryId) params.category_id = categoryId;
    if (search) params.q = search;

    const timer = setTimeout(() => {
      api.getProducts(params)
        .then(setProducts)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 250); // debounce search typing

    return () => clearTimeout(timer);
  }, [categoryId, search]);

  async function handleAddToCart(productId) {
    if (!customerId) return;
    setAddingId(productId);
    try {
      await api.addToCart(customerId, productId, 1);
      setToast('Added to cart');
      setTimeout(() => setToast(''), 1800);
    } catch (e) {
      setError(e.message);
    } finally {
      setAddingId(null);
    }
  }

  return (
    <div className="page container">
      <h1 className="page-title">Catalog</h1>
      <p className="page-subtitle">{products.length} item{products.length === 1 ? '' : 's'} on the shelf</p>

      <ErrorBanner message={error} />
      {toast && <div className="error-banner" style={{ background: 'var(--stamp-green-bg)', border: '1px solid var(--stamp-green)', color: 'var(--stamp-green)' }}>✓ {toast}</div>}

      <div className="toolbar">
        <input
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loading label="Fetching inventory…" />
      ) : products.length === 0 ? (
        <div className="empty-state">No products match that search. Try a different term or category.</div>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <div className="product-card" key={p.product_id}>
              <span className="product-sku mono">{p.sku}</span>
              <Link to={`/products/${p.product_id}`}>
                <h3 className="product-name">{p.product_name}</h3>
              </Link>
              <span className="product-cat">{p.category_name}</span>
              <div className="product-price-row">
                <span className="product-price">${Number(p.price).toFixed(2)}</span>
                <button
                  className="btn btn-sm"
                  disabled={addingId === p.product_id || p.stock_quantity === 0}
                  onClick={() => handleAddToCart(p.product_id)}
                >
                  {p.stock_quantity === 0 ? 'Out of stock' : addingId === p.product_id ? 'Adding…' : 'Add to cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
