import React, { useEffect, useState } from 'react';
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from '../store/api/baseApi';
import Modal from '../components/Modal';
import { Plus, Edit2, Trash2, Tag, DollarSign, TextQuote, Loader2, AlertCircle } from 'lucide-react';

const Products = () => {
  const { data: products = [], isLoading, error: fetchError } = useGetProductsQuery();

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  const isSaving = isCreating || isUpdating;

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setPrice('');
    setDescription('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(product.price);
    setDescription(product.description);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) return setFormError('Product name is required');
    if (!price || isNaN(price) || Number(price) < 0) return setFormError('Price must be a valid positive number');
    if (!description.trim()) return setFormError('Description is required');

    const productData = {
      name: name.trim(),
      price: Number(price),
      description: description.trim(),
    };

    try {
      if (editingProduct) {
        await updateProduct({ id: editingProduct.id || editingProduct._id, productData }).unwrap();
      } else {
        await createProduct(productData).unwrap();
      }
      handleCloseModal();
    } catch (err) {
      setFormError(err?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      try {
        await deleteProduct(id).unwrap();
      } catch {
        // error handled silently
      }
    }
  };

  const error = fetchError?.data?.message || (fetchError ? 'Failed to fetch products' : null);

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
            console / products
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            MongoDB catalog collection
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreateModal} style={{ padding: '8px 14px' }}>
          <Plus size={16} />
          Add Product
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

      {isLoading && products.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--text-secondary)', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : products.length === 0 ? (
        <div className="card" style={{
          padding: '48px',
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          <Tag size={36} style={{ color: 'var(--muted-foreground)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '4px' }}>No products found</h3>
          <p style={{ fontSize: '0.85rem' }}>Create a product to populate catalog.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {products.map((product) => (
            <div
              key={product.id || product._id}
              className="card card-interactive"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px'
                }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {product.name}
                  </h3>
                  <span style={{
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    color: 'var(--text-primary)'
                  }}>
                    ${Number(product.price).toFixed(2)}
                  </span>
                </div>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  lineHeight: '1.5',
                  marginBottom: '20px',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  minHeight: '4.5em'
                }}>
                  {product.description}
                </p>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--border)',
                paddingTop: '12px',
                marginTop: '8px'
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>
                  ID: {String(product.id || product._id || '').substring(0, 8)}
                </span>
                
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                    onClick={() => handleOpenEditModal(product)}
                  >
                    <Edit2 size={12} />
                    Edit
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '0.75rem', color: '#fca5a5' }}
                    onClick={() => handleDelete(product.id || product._id)}
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? 'Edit Product' : 'Create Product'}
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
          <div className="input-group">
            <label className="input-label" htmlFor="pname" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Tag size={14} style={{ color: 'var(--text-secondary)' }} />
              Product Name
            </label>
            <input
              id="pname"
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="pprice" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <DollarSign size={14} style={{ color: 'var(--text-secondary)' }} />
              Price ($)
            </label>
            <input
              id="pprice"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="input-group" style={{ marginBottom: '20px' }}>
            <label className="input-label" htmlFor="pdesc" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TextQuote size={14} style={{ color: 'var(--text-secondary)' }} />
              Description
            </label>
            <textarea
              id="pdesc"
              placeholder="Details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              style={{ minHeight: '80px', resize: 'vertical' }}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={handleCloseModal} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Products;
