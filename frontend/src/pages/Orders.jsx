import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useCustomer } from '../context/CustomerContext';
import { ErrorBanner, Loading, StatusStamp } from '../components/Bits';

export default function Orders() {
  const { customerId } = useCustomer();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!customerId) return;
    api.getOrders(customerId).then(setOrders).catch((e) => setError(e.message));
  }, [customerId]);

  return (
    <div className="page container">
      <h1 className="page-title">Order history</h1>
      <ErrorBanner message={error} />

      {!orders ? (
        <Loading />
      ) : orders.length === 0 ? (
        <div className="empty-state">No orders placed yet.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.order_id}>
                <td className="mono">#{o.order_id}</td>
                <td>{new Date(o.order_date).toLocaleDateString()}</td>
                <td><StatusStamp status={o.status} /></td>
                <td className="mono">${Number(o.total_amount).toFixed(2)}</td>
                <td><Link to={`/orders/${o.order_id}`} style={{ fontSize: 13, fontWeight: 600 }}>View →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
