import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useCustomer } from '../context/CustomerContext';
import { ErrorBanner, Loading, Stars } from '../components/Bits';

export default function ProductDetail() {
  const { id } = useParams();
  const { customerId } = useCustomer();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function reload() {
    api.getProduct(id).then(setProduct).catch((e) => setError(e.message));
  }

  useEffect(reload, [id]);

  async function handleAddToCart() {
    try {
      await api.addToCart(customerId, product.product_id, 1);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.addReview({ product_id: product.product_id, customer_id: customerId, rating, comment });
      setComment('');
      reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (error) return <div className="page container"><ErrorBanner message={error} /></div>;
  if (!product) return <div className="page container"><Loading /></div>;

  return (
    <div className="page container">
      <div className="product-detail">
        <div>
          <span className="product-sku mono">{product.sku}</span>
          <h1 className="page-title" style={{ marginTop: 6 }}>{product.product_name}</h1>
          <p style={{ color: 'var(--ink-soft)' }}>{product.category_name}</p>
          <p>{product.description}</p>

          <div className="row-leader" style={{ marginTop: 20 }}>
            <span className="product-price">${Number(product.price).toFixed(2)}</span>
            <span className="leader" />
            <span className="mono" style={{ fontSize: 13 }}>{product.stock_quantity} in stock</span>
          </div>

          <button className="btn" style={{ marginTop: 16 }} disabled={product.stock_quantity === 0} onClick={handleAddToCart}>
            {product.stock_quantity === 0 ? 'Out of stock' : 'Add to cart'}
          </button>

          {product.suppliers?.length > 0 && (
            <div className="manifest-block section-gap">
              <p className="manifest-title">Sourced from</p>
              {product.suppliers.map((s) => (
                <div key={s.supplier_id} className="row-leader mono" style={{ fontSize: 13, marginBottom: 4 }}>
                  <span>{s.supplier_name}</span>
                  <span className="leader" />
                  <span>${Number(s.cost_price).toFixed(2)} cost</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="manifest-block">
            <p className="manifest-title">Reviews ({product.review_count})</p>
            <Stars rating={product.avg_rating} />

            <div className="section-gap" style={{ marginTop: 20 }}>
              {product.reviews.length === 0 ? (
                <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>No reviews yet — be the first.</p>
              ) : (
                product.reviews.map((r) => (
                  <div key={r.review_id} style={{ borderBottom: '1px solid var(--rule)', padding: '12px 0' }}>
                    <Stars rating={r.rating} />
                    <p style={{ margin: '6px 0 2px', fontSize: 14 }}>{r.comment}</p>
                    <p className="mono" style={{ fontSize: 11, color: 'var(--ink-soft)' }}>
                      {r.first_name} {r.last_name} · {new Date(r.review_date).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleReviewSubmit} className="section-gap">
              <p className="manifest-title">Leave a review</p>
              <select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ marginBottom: 10, padding: 8, border: '1px solid var(--rule)', borderRadius: 3 }}>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
              </select>
              <br />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you think?"
                rows={3}
                style={{ width: '100%', padding: 10, border: '1px solid var(--rule)', borderRadius: 3, fontFamily: 'inherit', marginBottom: 10 }}
              />
              <button className="btn btn-sm" type="submit" disabled={submitting}>
                {submitting ? 'Posting…' : 'Post review'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
