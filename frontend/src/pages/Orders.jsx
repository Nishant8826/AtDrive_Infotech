import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  useGetOrdersQuery,
  useGetProductsQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} from '../store/api/baseApi';
import Modal from '../components/Modal';
import { Plus, Trash2, Edit, ShoppingCart, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Orders = () => {
  const navigate = useNavigate();
  
  const { isAuthenticated } = useSelector((state) => state.auth);

  const { data: orders = [], isLoading, error: fetchError } = useGetOrdersQuery(undefined, { skip: !isAuthenticated });
  const { data: products = [] } = useGetProductsQuery();

  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();
  const [deleteOrder] = useDeleteOrderMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [formError, setFormError] = useState('');

  const isSaving = isCreating || isUpdating;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleOpenCreateModal = () => {
    setEditingOrder(null);
    setSelectedProductIds([]);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (order) => {
    setEditingOrder(order);
    setSelectedProductIds(order.productIds || []);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOrder(null);
  };

  const handleProductToggle = (productId) => {
    if (selectedProductIds.includes(productId)) {
      setSelectedProductIds(selectedProductIds.filter(id => id !== productId));
    } else {
      setSelectedProductIds([...selectedProductIds, productId]);
    }
  };

  const calculateLiveTotal = () => {
    return selectedProductIds.reduce((total, id) => {
      const product = products.find(p => (p.id || p._id) === id);
      return total + (product ? product.price : 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (selectedProductIds.length === 0) {
      setFormError('Select at least one product');
      return;
    }

    try {
      if (editingOrder) {
        await updateOrder({
          orderId: editingOrder.orderId,
          productIds: selectedProductIds
        }).unwrap();
      } else {
        await createOrder(selectedProductIds).unwrap();
      }
      handleCloseModal();
    } catch (err) {
      setFormError(err?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (orderId) => {
    if (window.confirm('Delete this order?')) {
      try {
        await deleteOrder(orderId).unwrap();
      } catch {
        // error handled silently
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const error = fetchError?.data?.message || (fetchError ? 'Failed to fetch orders' : null);

  return (
    <>
      <div className="container animate-fade-in">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '4px', letterSpacing: '-0.02em' }}>
            console / orders
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            MySQL order transactions
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreateModal} disabled={products.length === 0} style={{ padding: '8px 14px' }}>
          <Plus size={16} />
          New Order
        </button>
      </div>

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          borderRadius: 'var(--radius)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          backgroundColor: 'rgba(239, 68, 68, 0.05)',
          color: '#fca5a5',
          fontSize: '0.85rem',
          marginBottom: '24px'
        }}>
          <AlertCircle size={18} style={{ color: 'var(--danger)', flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {products.length === 0 && (
        <div className="card" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          borderLeft: '3px solid var(--warning)',
          backgroundColor: 'rgba(245, 158, 11, 0.02)',
          marginBottom: '24px',
          fontSize: '0.85rem'
        }}>
          <AlertCircle size={16} style={{ color: 'var(--warning)' }} />
          <span>Create products in Catalog before placing orders.</span>
        </div>
      )}

      {isLoading && orders.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--text-secondary)', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : orders.length === 0 ? (
        <div className="card" style={{
          padding: '48px',
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '4px' }}>No orders found</h3>
          <p style={{ fontSize: '0.85rem' }}>Open a new order transaction to start.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Transaction Date</th>
                <th>Products List</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.orderId}>
                  <td style={{ fontWeight: '600' }}>#ORD-{order.orderId}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{formatDate(order.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {order.products && order.products.length > 0 ? (
                        order.products.map((p) => (
                          <span
                            key={p.id || Math.random()}
                            style={{
                              fontSize: '0.75rem',
                              backgroundColor: 'var(--secondary)',
                              color: 'var(--text-primary)',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              border: '1px solid var(--border)'
                            }}
                          >
                            {p.name}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem' }}>Uncached product info</span>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '700' }}>
                    ${Number(order.totalAmount).toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        onClick={() => handleOpenEditModal(order)}
                      >
                        <Edit size={12} />
                        Edit
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#fca5a5' }}
                        onClick={() => handleDelete(order.orderId)}
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingOrder ? 'Edit Order' : 'New Order'}
      >
        {formError && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px',
            borderRadius: 'var(--radius)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            color: '#fca5a5',
            fontSize: '0.8rem',
            marginBottom: '16px'
          }}>
            <AlertCircle size={14} style={{ color: 'var(--danger)' }} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <span className="input-label" style={{ display: 'block', marginBottom: '8px' }}>
              Select Products:
            </span>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              maxHeight: '220px',
              overflowY: 'auto',
              padding: '6px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              backgroundColor: 'rgba(0, 0, 0, 0.1)'
            }}>
              {products.map((product) => {
                const prodId = product.id || product._id;
                const isChecked = selectedProductIds.includes(prodId);
                return (
                  <div
                    key={prodId}
                    onClick={() => handleProductToggle(prodId)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius)',
                      backgroundColor: isChecked ? 'var(--secondary)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background-color var(--transition-fast)',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      style={{
                        marginRight: '10px',
                        cursor: 'pointer',
                        accentColor: 'var(--primary)'
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ fontSize: '0.85rem' }}>{product.name}</span>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        ${Number(product.price).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card" style={{
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.01)'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <ShoppingCart size={16} />
              Total Amount
            </span>
            <strong style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>
              ${calculateLiveTotal().toFixed(2)}
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={handleCloseModal} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Place Order'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Orders;
