'use client';

import React, { useState } from 'react';
import { updateSaleField } from '@/app/actions/sales_update';

interface Props {
  saleId: string;
  field: string;
  initialValue: string | null;
  placeholder: string;
}

export default function ReceiptField({ saleId, field, initialValue, placeholder }: Props) {
  const [value, setValue] = useState(initialValue || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleBlur = async () => {
    if (value === initialValue) return;
    setIsSaving(true);
    await updateSaleField(saleId, field, value);
    setIsSaving(false);
  };

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <input 
        type="text" 
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        style={{
          border: 'none',
          borderBottom: '1px solid #333',
          outline: 'none',
          fontSize: 'inherit',
          fontFamily: 'inherit',
          color: 'inherit',
          fontWeight: 'bold',
          background: 'transparent',
          width: '120px',
          padding: '2px 5px'
        }}
      />
      {isSaving && <span style={{ position: 'absolute', right: '-20px', top: '5px', fontSize: '10px', color: '#888' }}>...</span>}
    </span>
  );
}
