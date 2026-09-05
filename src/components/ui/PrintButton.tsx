'use client';
import React from 'react';

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      style={{ padding: '10px 25px', backgroundColor: '#f1f1f1', color: '#444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
    >
      <i className="fa fa-print" style={{ marginRight: '8px' }}></i> Print Receipt
    </button>
  );
}
