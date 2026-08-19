import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

// This project has no login/auth flow (not part of the brief) — instead
// the nav bar lets you pick which seeded customer you're "shopping as",
// which is enough to exercise cart/order/review endpoints end to end.
const CustomerContext = createContext(null);

export function CustomerProvider({ children }) {
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCustomers()
      .then((list) => {
        setCustomers(list);
        if (list.length > 0) setCustomerId(list[0].customer_id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <CustomerContext.Provider value={{ customers, customerId, setCustomerId, loading }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  return useContext(CustomerContext);
}
