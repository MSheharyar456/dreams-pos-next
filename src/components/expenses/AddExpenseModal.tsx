'use client';

import React, { useState } from 'react';
import { addExpense } from '@/app/actions/expenses';

export default function AddExpenseModal({ categories }: { categories: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const res = await addExpense(formData);
    
    setIsSubmitting(false);
    
    if (res.success) {
      setIsOpen(false);
    } else {
      alert(res.error || 'Failed to add expense');
    }
  };

  return (
    <>
      <button className="btn btn-added" onClick={() => setIsOpen(true)}>
        <img src="/assets/img/icons/plus.svg" alt="img" className="me-1" />
        Add Expense
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, 
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: '#fff', padding: '30px', borderRadius: '12px', 
            width: '100%', maxWidth: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#333' }}>
                Add New Expense
              </h3>
              <button type="button" onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#999', lineHeight: '1' }}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#555' }}>
                  Expense Category
                </label>
                <select 
                  name="category_id"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#555' }}>
                  Reference / Name
                </label>
                <input 
                  type="text" 
                  name="reference"
                  placeholder="e.g. Electricity Bill, Water Bill"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#555' }}>
                  Amount
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  name="amount"
                  placeholder="Enter amount"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#555' }}>
                  Expense Date
                </label>
                <input 
                  type="date" 
                  name="expense_date"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#555' }}>
                  Description / Note
                </label>
                <textarea 
                  name="description"
                  placeholder="Additional details..."
                  rows={3}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', resize: 'vertical' }}
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ 
                  width: '100%', padding: '12px', backgroundColor: '#ff9f43', color: '#fff', 
                  border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? 'Saving...' : 'Save Expense'}
              </button>
            </form>

          </div>
        </div>
      )}
    </>
  );
}
