import { NavLink } from "react-router-dom";
import { useCustomer } from "../context/CustomerContext";

export default function NavBar() {
  const { customers, customerId, setCustomerId } = useCustomer();

  return (
    <header className="nav">
      <div className="container nav-inner">
        <NavLink to="/" className="brand">
          <span className="brand-mark" />
          CSE311 project
        </NavLink>

        <nav className="nav-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Catalog
          </NavLink>
          <NavLink
            to="/cart"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Cart
          </NavLink>
          <NavLink
            to="/orders"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Orders
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Dashboard
          </NavLink>

          <div className="customer-select">
            <select
              value={customerId ?? ""}
              onChange={(e) => setCustomerId(Number(e.target.value))}
            >
              {customers.map((c) => (
                <option key={c.customer_id} value={c.customer_id}>
                  {c.first_name} {c.last_name}
                </option>
              ))}
            </select>
          </div>
        </nav>
      </div>
    </header>
  );
}
