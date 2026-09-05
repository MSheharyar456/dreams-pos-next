'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { updateSaleItemImage } from '@/app/actions/uploads';

interface Props {
  saleItemId: string;
  saleId: string;
  initialImageUrl: string | null;
}

export default function ScaleImageUpload({ saleItemId, saleId, initialImageUrl }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data, error } = await supabase.storage.from('scale_images').upload(fileName, file);
      
      if (error) {
        alert('Failed to upload image: ' + error.message);
        return;
      }
      
      const { data: publicUrlData } = supabase.storage.from('scale_images').getPublicUrl(fileName);
      const newUrl = publicUrlData.publicUrl;
      
      // Update database using Server Action
      const result = await updateSaleItemImage(saleItemId, newUrl, saleId);
      
      if (result.success) {
        setImageUrl(newUrl);
      } else {
        alert('Failed to update database: ' + result.error);
      }
    } catch (err: any) {
      alert('Error uploading image: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    setIsUploading(true);
    const result = await updateSaleItemImage(saleItemId, '', saleId);
    if (result.success) {
      setImageUrl(null);
    } else {
      alert('Failed to remove image: ' + result.error);
    }
    setIsUploading(false);
  };

  if (isUploading) {
    return <span style={{ fontSize: '12px', color: '#888' }}>Uploading...</span>;
  }

  if (imageUrl) {
    return (
      <div style={{ position: 'relative', width: '60px', height: '60px', margin: '0 auto' }}>
        <img 
          src={imageUrl} 
          alt="Scale Weight" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} 
        />
        <button 
          onClick={handleRemove}
          style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          x
        </button>
      </div>
    );
  }

  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        id={`file-${saleItemId}`} 
        style={{ display: 'none' }} 
        onChange={handleUpload} 
      />
      <label htmlFor={`file-${saleItemId}`} style={{ cursor: 'pointer', color: '#ff9f43', fontSize: '18px' }}>
        <i className="fa fa-camera"></i>
      </label>
    </div>
  );
}
