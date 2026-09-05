'use client';

import React, { useEffect, useState } from 'react';
import { getSettings, updateSettings, changePassword } from '@/app/actions/settings';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getSettings();
      if (data) {
        setSettings(data);
        if (data.logo_url) setLogoPreview(data.logo_url);
      }
    }
    load();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    
    const formData = new FormData(e.currentTarget);
    const res = await updateSettings(formData);
    
    setIsSaving(false);
    
    if (res.success) {
      alert('Settings updated successfully!');
    } else {
      alert(res.error || 'Failed to update settings');
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsChangingPwd(true);
    
    const formData = new FormData(e.currentTarget);
    const res = await changePassword(formData);
    
    setIsChangingPwd(false);
    
    if (res.success) {
      alert('Password updated successfully! Next time you log in, use the new password.');
      (e.target as HTMLFormElement).reset();
    } else {
      alert(res.error || 'Failed to update password');
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h4>Settings</h4>
          <h6>Manage your application settings</h6>
        </div>
      </div>

      <div className="row">
        {/* General Settings */}
        <div className="col-lg-6 col-sm-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4" style={{ fontWeight: '600' }}>General Settings</h5>
              <form onSubmit={handleSaveSettings}>
                {settings && <input type="hidden" name="current_logo" value={settings.logo_url || ''} />}
                
                <div className="form-group mb-3">
                  <label style={{ fontWeight: '500', display: 'block', marginBottom: '8px' }}>Project Name / Software House</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="project_name" 
                    defaultValue={settings?.project_name || 'Dreams POS'}
                    placeholder="e.g. Dreams POS" 
                    required 
                  />
                </div>
                
                <div className="form-group mb-3">
                  <label style={{ fontWeight: '500', display: 'block', marginBottom: '8px' }}>Printer Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="printer_name" 
                    defaultValue={settings?.printer_name || 'Standard'}
                    placeholder="e.g. Standard" 
                  />
                </div>
                
                <div className="form-group mb-4">
                  <label style={{ fontWeight: '500', display: 'block', marginBottom: '8px' }}>Printer Size</label>
                  <select className="form-control" name="printer_size" defaultValue={settings?.printer_size || '80mm'}>
                    <option value="58mm">58mm Receipt</option>
                    <option value="80mm">80mm Receipt</option>
                    <option value="A4">Standard A4</option>
                  </select>
                </div>

                <div className="form-group mb-4">
                  <label style={{ fontWeight: '500', display: 'block', marginBottom: '8px' }}>Company Logo</label>
                  {logoPreview && (
                    <div style={{ marginBottom: '10px' }}>
                      <img src={logoPreview} alt="Logo Preview" style={{ maxWidth: '150px', maxHeight: '100px', borderRadius: '8px', border: '1px solid #ddd', padding: '5px' }} />
                    </div>
                  )}
                  <input 
                    type="file" 
                    className="form-control" 
                    name="logo" 
                    accept="image/*"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      if (e.target.files && e.target.files[0]) {
                        setLogoPreview(URL.createObjectURL(e.target.files[0]));
                      }
                    }}
                  />
                  <small className="text-muted">Recommended size: 250x100px. Max size: 5MB.</small>
                </div>

                <button type="submit" className="btn btn-submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="col-lg-6 col-sm-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4" style={{ fontWeight: '600' }}>Change Password</h5>
              <form onSubmit={handleChangePassword}>
                <div className="form-group mb-3">
                  <label style={{ fontWeight: '500', display: 'block', marginBottom: '8px' }}>New Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    name="password" 
                    placeholder="Enter new password" 
                    minLength={6}
                    required 
                  />
                  <small className="text-muted">Must be at least 6 characters long.</small>
                </div>
                
                <div className="form-group mb-4">
                  <label style={{ fontWeight: '500', display: 'block', marginBottom: '8px' }}>Confirm New Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    name="confirm_password" 
                    placeholder="Confirm new password" 
                    minLength={6}
                    required 
                  />
                </div>

                <button type="submit" className="btn btn-submit" style={{ backgroundColor: '#ff9f43', borderColor: '#ff9f43' }} disabled={isChangingPwd}>
                  {isChangingPwd ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
