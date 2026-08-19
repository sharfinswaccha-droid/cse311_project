import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useCustomer } from '../context/CustomerContext';
import { ErrorBanner, Loading } from '../components/Bits';

export default function Cart() {
  const { customerId } = useCustomer();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [addressId, setAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  function reload() {
    if (!customerId) return;
    api.getCart(customerId).then(setCart).catch((e) => setError(e.message));
    api.getCustomer(customerId).then((c) => {
      setCustomer(c);
      if (c.addresses?.length > 0) setAddressId(c.addresses[0].address_id);
    }).catch((e) => setError(e.message));
  }

  useEffect(reload, [customerId]);

  async function updateQty(cartItemId, quantity) {
    if (quantity < 1) return;
    try {
      await api.updateCartItem(cartItemId, quantity);
      reload();
    } catch (e) { setError(e.message); }
  }

  async function removeItem(cartItemId) {
    try {
      await api.removeCartItem(cartItemId);
      reload();
    } catch (e) { setError(e.message); }
  }

  async function checkout() {
    if (!addressId) { setError('Add a shipping address to this customer first.'); return; }
    setPlacing(true);
    try {
      const result = await api.placeOrder({ customer_id: customerId, address_id: addressId, payment_method: paymentMethod });
      navigate(`/orders/${result.order_id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setPlacing(false);
    }
  }

  if (!cart || !customer) return <div className="page container"><Loading /></div>;

  return (
    <div className="page container">
      <h1 className="page-title">Your cart</h1>
      <p className="page-subtitle">Shopping as {customer.first_name} {customer.last_name}</p>
      <ErrorBanner message={error} />

      {cart.items.length === 0 ? (
        <div className="empty-state">Cart's empty. Go find something on the catalog page.</div>
      ) : (
        <div className="product-detail">
          <div>
            {cart.items.map((item) => (
              <div key={item.cart_item_id} className="row-leader" style={{ padding: '14px 0', borderBottom: '1px solid var(--rule)' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{item.product_name}</p>
                  <p className="mono" style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--ink-soft)' }}>${Number(item.price).toFixed(2)} each</p>
                </div>
                <span className="leader" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => updateQty(item.cart_item_id, item.quantity - 1)}>−</button>
                  <span className="mono">{item.quantity}</span>
                  <button className="btn btn-outline btn-sm" onClick={() => updateQty(item.cart_item_id, item.quantity + 1)}>+</button>
                  <button className="btn btn-danger btn-sm" onClick={() => removeItem(item.cart_item_id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="receipt">
            <p className="manifest-title" style={{ color: 'var(--ink)' }}>Order summary</p>
            {cart.items.map((i) => (
              <div className="receipt-line" key={i.cart_item_id}>
                <span>{i.product_name} ×{i.quantity}</span>
                <span>${Number(i.subtotal).toFixed(2)}</span>
              </div>
            ))}
            <div className="receipt-total">
              <span>Total</span>
              <span>${Number(cart.total).toFixed(2)}</span>
            </div>

            <div style={{ marginTop: 24 }}>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>Ship to</label>
              <select value={addressId} onChange={(e) => setAddressId(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 14, border: '1px solid var(--rule)' }}>
                {customer.addresses.length === 0 && <option value="">No addresses on file</option>}
                {customer.addresses.map((a) => (
                  <option key={a.address_id} value={a.address_id}>{a.address_line}, {a.city}</option>
                ))}
              </select>

              <label style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>Payment method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 16, border: '1px solid var(--rule)' }}>
                <option value="CARD">Card</option>
                <option value="MOBILE_BANKING">Mobile banking</option>
                <option value="COD">Cash on delivery</option>
                <option value="WALLET">Wallet</option>
              </select>

              <button className="btn" style={{ width: '100%' }} onClick={checkout} disabled={placing}>
                {placing ? 'Placing order…' : 'Place order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
