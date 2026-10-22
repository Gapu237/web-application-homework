import { useMemo, useState } from 'react';
import './App.css';

type Customer = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  orders: number;
};

const initialCustomers: Customer[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active', orders: 18 },
  { id: 2, name: 'Brian Smith', email: 'brian@example.com', role: 'Editor', status: 'Active', orders: 12 },
  { id: 3, name: 'Catherine Lee', email: 'catherine@example.com', role: 'Viewer', status: 'Inactive', orders: 5 },
  { id: 4, name: 'Daniel Brown', email: 'daniel@example.com', role: 'Editor', status: 'Active', orders: 24 },
  { id: 5, name: 'Emma Wilson', email: 'emma@example.com', role: 'Viewer', status: 'Inactive', orders: 7 },
  { id: 6, name: 'Frank Miller', email: 'frank@example.com', role: 'Admin', status: 'Active', orders: 31 },
  { id: 7, name: 'Grace Davis', email: 'grace@example.com', role: 'Editor', status: 'Active', orders: 9 },
  { id: 8, name: 'Henry Garcia', email: 'henry@example.com', role: 'Viewer', status: 'Inactive', orders: 3 },
  { id: 9, name: 'Isabella Martinez', email: 'isabella@example.com', role: 'Admin', status: 'Active', orders: 21 },
  { id: 10, name: 'Jack Anderson', email: 'jack@example.com', role: 'Editor', status: 'Inactive', orders: 6 },
  { id: 11, name: 'Lily Thomas', email: 'lily@example.com', role: 'Viewer', status: 'Active', orders: 15 },
  { id: 12, name: 'Noah Taylor', email: 'noah@example.com', role: 'Admin', status: 'Active', orders: 27 },
];

type SortKey = 'name' | 'email' | 'role' | 'orders';

function App() {
  const [customers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredCustomers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return customers
      .filter((customer) => {
        const matchesSearch =
          customer.name.toLowerCase().includes(keyword) ||
          customer.email.toLowerCase().includes(keyword) ||
          customer.role.toLowerCase().includes(keyword);

        const matchesStatus =
          statusFilter === 'All' || customer.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const first = a[sortKey];
        const second = b[sortKey];

        const comparison =
          typeof first === 'number' && typeof second === 'number'
            ? first - second
            : String(first).localeCompare(String(second));

        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [customers, search, statusFilter, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const visibleCustomers = filteredCustomers.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value);
    setPage(1);
  }

  function handlePageSizeChange(value: number) {
    setPageSize(value);
    setPage(1);
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setPage(1);
  }

  function resetFilters() {
    setSearch('');
    setStatusFilter('All');
    setSortKey('name');
    setSortDirection('asc');
    setPage(1);
    setPageSize(5);
  }

  function sortLabel(key: SortKey, label: string) {
    if (sortKey !== key) return label;
    return `${label} ${sortDirection === 'asc' ? '↑' : '↓'}`;
  }

  return (
    <main className="page">
      <a className="skip-link" href="#customer-table">
        Skip to customer table
      </a>

      <header className="page-header">
        <p className="eyebrow">CUSTOMER MANAGEMENT</p>
        <h1>Production Enterprise Data-Grid</h1>
        <p className="subtitle">
          Search, filter, sort, and browse customer records.
        </p>
      </header>

      <section className="panel" aria-labelledby="customers-heading">
        <div className="panel-heading">
          <div>
            <h2 id="customers-heading">Customers</h2>
            <p className="muted">Manage your customer directory.</p>
          </div>
          <span className="total-badge">
            {filteredCustomers.length} records
          </span>
        </div>

        <div className="toolbar">
          <div className="field search-field">
            <label htmlFor="customer-search">Search customers</label>
            <input
              id="customer-search"
              type="search"
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Search name, email, or role..."
            />
          </div>

          <div className="field">
            <label htmlFor="status-filter">Filter by status</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) => handleStatusChange(event.target.value)}
            >
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <button className="secondary-button reset-button" onClick={resetFilters}>
            Reset filters
          </button>
        </div>

        <p className="result-count" aria-live="polite" aria-atomic="true">
          Showing {filteredCustomers.length === 0 ? 0 : (safePage - 1) * pageSize + 1}
          {'–'}
          {Math.min(safePage * pageSize, filteredCustomers.length)} of{' '}
          {filteredCustomers.length} matching customers
        </p>

        <div className="table-wrapper">
          <table id="customer-table">
            <caption className="visually-hidden">
              Customer records. Use the column buttons to change sort order.
            </caption>
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col" aria-sort={sortKey === 'name' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button className="sort-button" onClick={() => handleSort('name')}>
                    {sortLabel('name', 'Name')}
                  </button>
                </th>
                <th scope="col" aria-sort={sortKey === 'email' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button className="sort-button" onClick={() => handleSort('email')}>
                    {sortLabel('email', 'Email')}
                  </button>
                </th>
                <th scope="col" aria-sort={sortKey === 'role' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button className="sort-button" onClick={() => handleSort('role')}>
                    {sortLabel('role', 'Role')}
                  </button>
                </th>
                <th scope="col">Status</th>
                <th scope="col" aria-sort={sortKey === 'orders' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button className="sort-button" onClick={() => handleSort('orders')}>
                    {sortLabel('orders', 'Orders')}
                  </button>
                </th>
              </tr>
            </thead>

            <tbody>
              {visibleCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.id}</td>
                  <th scope="row">{customer.name}</th>
                  <td>{customer.email}</td>
                  <td>{customer.role}</td>
                  <td>
                    <span className={`status status-${customer.status.toLowerCase()}`}>
                      <span className="status-dot" aria-hidden="true" />
                      {customer.status}
                    </span>
                  </td>
                  <td>{customer.orders}</td>
                </tr>
              ))}

              {visibleCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No customers match your search. Try changing your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <nav className="pagination" aria-label="Customer table pagination">
          <div className="page-size-control">
            <label htmlFor="page-size">Rows per page</label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(event) => handlePageSizeChange(Number(event.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          <div className="pagination-actions">
            <button
              className="secondary-button"
              onClick={() => setPage(1)}
              disabled={safePage === 1}
              aria-label="Go to first page"
            >
              First
            </button>
            <button
              className="secondary-button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={safePage === 1}
              aria-label="Go to previous page"
            >
              Previous
            </button>

            <span className="page-indicator" aria-live="polite">
              Page {safePage} of {totalPages}
            </span>

            <button
              className="secondary-button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={safePage === totalPages}
              aria-label="Go to next page"
            >
              Next
            </button>
            <button
              className="secondary-button"
              onClick={() => setPage(totalPages)}
              disabled={safePage === totalPages}
              aria-label="Go to last page"
            >
              Last
            </button>
          </div>
        </nav>
      </section>

      <footer className="page-footer">
        <p>Customer Data-Grid · React + TypeScript</p>
      </footer>
    </main>
  );
}

export default App;