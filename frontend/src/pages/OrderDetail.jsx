import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import { ErrorBanner, Loading, StatusStamp } from '../components/Bits';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getOrder(id).then(setOrder).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="page container"><ErrorBanner message={error} /></div>;
  if (!order) return <div className="page container"><Loading /></div>;

  return (
    <div className="page container">
      <h1 className="page-title">Order #{order.order_id}</h1>
      <p className="page-subtitle">
        Placed {new Date(order.order_date).toLocaleString()} · <StatusStamp status={order.status} />
      </p>

      <div className="product-detail">
        <div className="receipt">
          <p className="manifest-title" style={{ color: 'var(--ink)' }}>Line items</p>
          {order.items.map((i) => (
            <div className="receipt-line" key={i.order_item_id}>
              <span>{i.product_name} ×{i.quantity}</span>
              <span>${Number(i.line_total).toFixed(2)}</span>
            </div>
          ))}
          <div className="receipt-total">
            <span>Total</span>
            <span>${Number(order.total_amount).toFixed(2)}</span>
          </div>
        </div>

        <div>
          <div className="manifest-block">
            <p className="manifest-title">Ship to</p>
            <p style={{ margin: 0 }}>{order.first_name} {order.last_name}</p>
            <p style={{ margin: '4px 0 0', color: 'var(--ink-soft)', fontSize: 14 }}>
              {order.address_line}, {order.city}{order.state ? `, ${order.state}` : ''} {order.zip_code}<br />
              {order.country}
            </p>
          </div>

          {order.payments?.length > 0 && (
            <div className="manifest-block section-gap">
              <p className="manifest-title">Payments</p>
              {order.payments.map((p) => (
                <div key={p.payment_id} className="row-leader" style={{ fontSize: 13, marginBottom: 6 }}>
                  <span>{p.payment_method}</span>
                  <span className="leader" />
                  <span className="mono">${Number(p.amount).toFixed(2)}</span>
                  <span style={{ marginLeft: 10 }}><StatusStamp status={p.status} /></span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
