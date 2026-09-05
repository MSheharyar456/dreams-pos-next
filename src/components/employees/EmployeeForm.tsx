'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function EmployeeForm({ serverAction, initialData }: { serverAction: (formData: FormData) => Promise<any>, initialData?: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 0 && val[0] !== '0') val = '0' + val;
    if (val.length > 1 && val[1] !== '3') val = '03' + val.substring(2);
    if (val.length > 11) val = val.substring(0, 11);
    e.target.value = val;
  };

  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 13) val = val.substring(0, 13);
    
    let formatted = val;
    if (val.length > 5 && val.length <= 12) {
      formatted = `${val.substring(0, 5)}-${val.substring(5)}`;
    } else if (val.length > 12) {
      formatted = `${val.substring(0, 5)}-${val.substring(5, 12)}-${val.substring(12)}`;
    }
    e.target.value = formatted;
  };

  const uploadImage = async (file: File) => {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error } = await supabase.storage.from('cnic_images').upload(fileName, file);
    if (error) throw error;
    
    const { data } = supabase.storage.from('cnic_images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      if (initialData?.id) {
        formData.append('id', initialData.id);
      }
      
      // Upload images if present
      if (frontImage) {
        const url = await uploadImage(frontImage);
        formData.append('cnic_front_image', url);
      }
      if (backImage) {
        const url = await uploadImage(backImage);
        formData.append('cnic_back_image', url);
      }

      const result = await serverAction(formData);
      
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Employee added successfully',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          router.push('/employees');
        });
      } else {
        Swal.fire('Error', result.error, 'error');
      }
    } catch (err: any) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-lg-6 col-sm-6 col-12">
          <div className="form-group">
            <label>Employee Name *</label>
            <input type="text" name="name" className="form-control" defaultValue={initialData?.name} required />
          </div>
        </div>
        <div className="col-lg-6 col-sm-6 col-12">
          <div className="form-group">
            <label>Father's Name</label>
            <input type="text" name="father_name" className="form-control" defaultValue={initialData?.father_name} />
          </div>
        </div>
        <div className="col-lg-6 col-sm-6 col-12">
          <div className="form-group">
            <label>Phone Number 1 *</label>
            <input type="text" name="phone_1" className="form-control" onChange={handlePhoneChange} defaultValue={initialData?.phone_1} required />
          </div>
        </div>
        <div className="col-lg-6 col-sm-6 col-12">
          <div className="form-group">
            <label>Phone Number 2 (Optional)</label>
            <input type="text" name="phone_2" className="form-control" onChange={handlePhoneChange} defaultValue={initialData?.phone_2} />
          </div>
        </div>
        <div className="col-lg-12 col-sm-12 col-12">
          <div className="form-group">
            <label>CNIC Number *</label>
            <input type="text" name="cnic_number" className="form-control" placeholder="00000-0000000-0" onChange={handleCnicChange} defaultValue={initialData?.cnic_number} required />
          </div>
        </div>

        {/* CNIC Images */}
        <div className="col-lg-6 col-sm-6 col-12">
          <div className="form-group">
            <label>CNIC Front Image {initialData?.cnic_front_image && <a href={initialData.cnic_front_image} target="_blank" rel="noreferrer" style={{fontSize: '12px', color: '#ff9f43', marginLeft: '10px'}}>(View Current)</a>}</label>
            <input 
              type="file" 
              className="form-control" 
              accept="image/*"
              onChange={(e) => setFrontImage(e.target.files?.[0] || null)}
            />
          </div>
        </div>
        <div className="col-lg-6 col-sm-6 col-12">
          <div className="form-group">
            <label>CNIC Back Image {initialData?.cnic_back_image && <a href={initialData.cnic_back_image} target="_blank" rel="noreferrer" style={{fontSize: '12px', color: '#ff9f43', marginLeft: '10px'}}>(View Current)</a>}</label>
            <input 
              type="file" 
              className="form-control" 
              accept="image/*"
              onChange={(e) => setBackImage(e.target.files?.[0] || null)}
            />
          </div>
        </div>

        <div className="col-lg-12">
          <button type="submit" className="btn btn-submit me-2" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Submit'}
          </button>
          <Link href="/employees" className="btn btn-cancel">Cancel</Link>
        </div>
      </div>
    </form>
  );
}
