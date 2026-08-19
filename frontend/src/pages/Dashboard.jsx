import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { ErrorBanner, Loading } from '../components/Bits';

export default function Dashboard() {
  const [data, setData] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getCustomerSpending(),
      api.getRatings(),
      api.getLowStock(50),
      api.getInactiveCustomers(),
      api.getBestSellers(5),
      api.getSupplierProducts(),
      api.getPaymentSummary()
    ])
      .then(([spending, ratings, lowStock, inactive, bestSellers, suppliers, payments]) => {
        setData({ spending, ratings, lowStock, inactive, bestSellers, suppliers, payments });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page container"><Loading label="Running reports…" /></div>;

  return (
    <div className="page container">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Store-wide reports, straight off the query manifest</p>
      <ErrorBanner message={error} />

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Top spenders</h3>
          {data.spending?.length === 0 ? <Empty /> : (
            <List>
              {data.spending?.map((r) => (
                <Line key={r.customer_id} label={`${r.first_name} ${r.last_name}`} value={`$${Number(r.total_spent).toFixed(2)}`} />
              ))}
            </List>
          )}
        </div>

        <div className="analytics-card">
          <h3>Best sellers</h3>
          {data.bestSellers?.length === 0 ? <Empty /> : (
            <List>
              {data.bestSellers?.map((r) => (
                <Line key={r.product_id} label={r.product_name} value={`${r.total_sold} sold`} />
              ))}
            </List>
          )}
        </div>

        <div className="analytics-card">
          <h3>Product ratings</h3>
          {data.ratings?.length === 0 ? <Empty /> : (
            <List>
              {data.ratings?.map((r) => (
                <Line key={r.product_id} label={r.product_name} value={r.avg_rating ? `★ ${r.avg_rating} (${r.review_count})` : 'No reviews'} />
              ))}
            </List>
          )}
        </div>

        <div className="analytics-card">
          <h3>Low stock (&lt; 50 units)</h3>
          {data.lowStock?.length === 0 ? <Empty label="Everything's well stocked." /> : (
            <List>
              {data.lowStock?.map((r) => (
                <Line key={r.product_id} label={r.product_name} value={`${r.stock_quantity} left`} warn />
              ))}
            </List>
          )}
        </div>

        <div className="analytics-card">
          <h3>Inactive customers</h3>
          {data.inactive?.length === 0 ? <Empty label="Everyone's ordered at least once." /> : (
            <List>
              {data.inactive?.map((r) => (
                <Line key={r.customer_id} label={`${r.first_name} ${r.last_name}`} value={r.email} />
              ))}
            </List>
          )}
        </div>

        <div className="analytics-card">
          <h3>Payment status summary</h3>
          {data.payments?.length === 0 ? <Empty /> : (
            <List>
              {data.payments?.map((r) => (
                <Line key={r.status} label={r.status} value={`${r.num_payments} · $${Number(r.total_amount).toFixed(2)}`} />
              ))}
            </List>
          )}
        </div>

        <div className="analytics-card" style={{ gridColumn: '1 / -1' }}>
          <h3>Suppliers</h3>
          <table className="data-table">
            <thead>
              <tr><th>Supplier</th><th>Product</th><th>Cost price</th></tr>
            </thead>
            <tbody>
              {data.suppliers?.map((r, idx) => (
                <tr key={idx}>
                  <td>{r.supplier_name}</td>
                  <td>{r.product_name}</td>
                  <td className="mono">${Number(r.cost_price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function List({ children }) {
  return <div>{children}</div>;
}

function Line({ label, value, warn }) {
  return (
    <div className="row-leader" style={{ padding: '6px 0', fontSize: 13.5 }}>
      <span>{label}</span>
      <span className="leader" />
      <span className="mono" style={{ color: warn ? 'var(--stamp-red)' : 'var(--ink)' }}>{value}</span>
    </div>
  );
}

function Empty({ label = 'Nothing to report.' }) {
  return <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>{label}</p>;
}
