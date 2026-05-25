import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useGetProductsQuery, useGetOrdersQuery } from '../store/api/baseApi';
import WeatherWidget from '../components/WeatherWidget';
import { ShoppingBag, ClipboardList, Database, ShieldAlert, ArrowUpRight } from 'lucide-react';

const Dashboard = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const { data: products = [] } = useGetProductsQuery();
  const { data: orders = [] } = useGetOrdersQuery(undefined, { skip: !isAuthenticated });

  return (
    <div className="container animate-fade-in">
      <div style={{
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '4px', letterSpacing: '-0.02em' }}>
            console / dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Hybrid database management interface
          </p>
        </div>
        {!isAuthenticated && (
          <div className="card" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            borderLeft: '3px solid var(--warning)',
            backgroundColor: 'rgba(245, 158, 11, 0.02)'
          }}>
            <ShieldAlert size={18} style={{ color: 'var(--warning)', flexShrink: 0 }} />
            <div style={{ fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontWeight: '500' }}>RESTRICTED ACCESS</span>
              <span>
                <Link to="/login" style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>Login</Link> to view and manage Orders.
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        <div className="card card-interactive metric-card">
          <div>
            <div className="metric-header">
              <span>Products</span>
              <ShoppingBag size={16} />
            </div>
            <div className="metric-value">{products.length}</div>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px', display: 'block' }}>
            Stored in MongoDB
          </span>
        </div>

        <div className="card card-interactive metric-card">
          <div>
            <div className="metric-header">
              <span>Orders</span>
              <ClipboardList size={16} />
            </div>
            <div className="metric-value">{isAuthenticated ? orders.length : '—'}</div>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px', display: 'block' }}>
            Stored in MySQL
          </span>
        </div>

        <div className="card card-interactive metric-card">
          <div>
            <div className="metric-header">
              <span>Databases</span>
              <Database size={16} />
            </div>
            <div className="metric-value" style={{ color: 'var(--success)', fontSize: '1.25rem', padding: '6px 0' }}>
              CONNECTED
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px', display: 'block' }}>
            Mongoose & Sequelize active
          </span>
        </div>
      </div>

      <div className="dashboard-details-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '16px' }}>System Architecture</h2>
            <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.875rem' }}>
              <p style={{ marginBottom: '12px' }}>
                This console coordinates two backend databases to handle split data domains:
              </p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '16px' }}>
                <li>
                  <strong>MongoDB:</strong> Schema-less storage optimized for high-throughput product catalog documents.
                </li>
                <li>
                  <strong>MySQL:</strong> Relational engine managing user credentials and transactional orders linking back to MongoDB keys.
                </li>
              </ul>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <Link to="/products" className="btn btn-primary">
                View Products
                <ArrowUpRight size={14} />
              </Link>
              {isAuthenticated ? (
                <Link to="/orders" className="btn btn-secondary">
                  View Orders
                </Link>
              ) : (
                <Link to="/login" className="btn btn-secondary">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <WeatherWidget />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
