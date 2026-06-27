import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Save, User, Bell, CreditCard, Shield, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Settings.css';

export const Settings: React.FC = () => {
  const { user, updateProfileData } = useAuth();
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  const [activeTab, setActiveTab] = useState('profile');
  const [localName, setLocalName] = useState(displayName);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfileData({ displayName: localName });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Failed to update profile', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (max 800kb as per UI)
    if (file.size > 800 * 1024) {
      alert("Image is too large. Max size is 800KB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setIsSaving(true);
      try {
        await updateProfileData({ photoURL: base64 });
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (error) {
        console.error('Failed to update avatar', error);
      } finally {
        setIsSaving(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Bell },
    { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="settings-container animate-fade-in">
      <div className="settings-header">
        <h1 className="text-display">Settings</h1>
        <p className="settings-subtitle">Manage your account preferences and personal profile.</p>
      </div>

      <div className="settings-layout">
        {/* Settings Sidebar */}
        <div className="settings-sidebar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="settings-content">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Public Profile</CardTitle>
                <CardDescription>Update your personal information and avatar.</CardDescription>
              </CardHeader>
              <CardContent className="settings-content">
                <div className="avatar-section">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt={displayName} className="avatar-preview" />
                  ) : (
                    <div className="avatar-placeholder">
                      {initial}
                    </div>
                  )}
                  <div className="avatar-actions">
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg, image/gif" 
                      ref={fileInputRef} 
                      style={{ display: 'none' }} 
                      onChange={handleAvatarChange}
                    />
                    <Button variant="outline" onClick={triggerFileInput} disabled={isSaving}>
                      Change Avatar
                    </Button>
                    <p className="text-xs text-muted">JPG, GIF or PNG. Max size of 800K</p>
                  </div>
                </div>
                
                <div className="settings-form-grid">
                  <div className="settings-form-group">
                    <label className="settings-form-label">Full Name</label>
                    <Input 
                      value={localName} 
                      onChange={(e) => setLocalName(e.target.value)}
                      placeholder="e.g. Jane Doe" 
                    />
                  </div>
                  <div className="settings-form-group">
                    <label className="settings-form-label">Email Address</label>
                    <Input 
                      value={user?.email || ''} 
                      disabled
                      readOnly
                    />
                    <p className="text-xs text-muted" style={{ marginTop: '4px' }}>Email cannot be changed if linked to Google</p>
                  </div>
                </div>
                
                <div className="settings-form-group">
                  <label className="settings-form-label">Bio</label>
                  <textarea 
                    placeholder="A short bio about yourself" 
                    className="settings-textarea"
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-end flex gap-4 items-center">
                {showToast && (
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--success)' }}>
                    <CheckCircle2 size={16} />
                    <span>Saved successfully</span>
                  </div>
                )}
                <Button 
                  leftIcon={<Save size={16} />} 
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === 'preferences' && (
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Manage when and how often you hear from us.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="preferences-list">
                  <div className="preference-item">
                    <div className="preference-info">
                      <p>Product Updates</p>
                      <span>Receive news about new features and product updates.</span>
                    </div>
                    <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', accentColor: 'var(--primary-btn-bg)' }} />
                  </div>
                  <div className="preference-divider"></div>
                  <div className="preference-item">
                    <div className="preference-info">
                      <p>Weekly Report</p>
                      <span>Get a weekly summary of your QR code scan statistics.</span>
                    </div>
                    <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', accentColor: 'var(--primary-btn-bg)' }} />
                  </div>
                  <div className="preference-divider"></div>
                  <div className="preference-item">
                    <div className="preference-info">
                      <p>Billing Alerts</p>
                      <span>Receive notifications about your subscription and invoices.</span>
                    </div>
                    <input type="checkbox" defaultChecked disabled style={{ width: '20px', height: '20px', accentColor: 'var(--primary-btn-bg)' }} />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Preferences'}</Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === 'billing' && (
            <div className="settings-content">
              <Card>
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>You are currently on the Free tier.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="plan-info-box">
                    <div>
                      <h3>Free Plan</h3>
                      <p>3 Dynamic QR Codes limit</p>
                    </div>
                    <h2 className="plan-price">$0 <span>/mo</span></h2>
                  </div>
                  
                  <div style={{ marginTop: 'var(--space-6)' }}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Usage: 1 / 3 Dynamic Codes</span>
                      <span className="text-sm text-muted">33%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '33%', height: '100%', backgroundColor: 'var(--primary-btn-bg)' }}></div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button style={{ width: '100%' }}>Upgrade to Pro - $12/mo</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage your billing information and credit cards.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-muted)' }}>
                    <CreditCard size={32} style={{ margin: '0 auto var(--space-4)', opacity: 0.5 }} />
                    <p>No payment methods saved.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-content">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
                </CardHeader>
                <CardContent className="settings-content">
                  <div className="settings-form-group">
                    <label className="settings-form-label">Current Password</label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="settings-form-group">
                    <label className="settings-form-label">New Password</label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="settings-form-group">
                    <label className="settings-form-label">Confirm New Password</label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button variant="outline">Update Password</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle style={{ color: 'var(--danger)' }}>Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions for your account.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="danger-zone-box">
                    <div>
                      <p className="title">Delete Account</p>
                      <p className="desc">Once you delete your account, there is no going back. Please be certain.</p>
                    </div>
                    <Button variant="outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
