import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Save, User, Bell, CreditCard, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import clsx from 'clsx';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  const [activeTab, setActiveTab] = useState('profile');
  const [localName, setLocalName] = useState(displayName);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 800);
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Bell },
    { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-in max-w-[1000px]">
      <div>
        <h1 className="text-display">Settings</h1>
        <p className="text-body text-muted mt-1">Manage your account preferences and personal profile.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 'var(--space-8)' }}>
        {/* Settings Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: activeTab === tab.id ? 'var(--bg-secondary)' : 'transparent',
                color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: 'var(--text-sm)',
                fontWeight: activeTab === tab.id ? 600 : 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) e.currentTarget.style.background = 'var(--bg-secondary)';
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) e.currentTarget.style.background = 'transparent';
              }}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex flex-col gap-6">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Public Profile</CardTitle>
                <CardDescription>Update your personal information and avatar.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div className="flex items-center gap-6 mb-2">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt={displayName} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-light)' }} />
                  ) : (
                    <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'var(--primary-btn-bg)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 600, textTransform: 'uppercase' }}>
                      {initial}
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <Button variant="outline">Change Avatar</Button>
                    <p className="text-xs text-muted">JPG, GIF or PNG. Max size of 800K</p>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Full Name</label>
                    <Input 
                      value={localName} 
                      onChange={(e) => setLocalName(e.target.value)}
                      placeholder="e.g. Jane Doe" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email Address</label>
                    <Input 
                      value={user?.email || ''} 
                      disabled
                      readOnly
                    />
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Email cannot be changed if linked to Google</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Bio</label>
                  <textarea 
                    placeholder="A short bio about yourself" 
                    style={{ width: '100%', minHeight: '100px', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical' }}
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
              <CardContent className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Product Updates</p>
                    <p className="text-sm text-muted">Receive news about new features and product updates.</p>
                  </div>
                  <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', accentColor: 'var(--primary-btn-bg)' }} />
                </div>
                <div style={{ height: '1px', backgroundColor: 'var(--border-light)' }}></div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Weekly Report</p>
                    <p className="text-sm text-muted">Get a weekly summary of your QR code scan statistics.</p>
                  </div>
                  <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', accentColor: 'var(--primary-btn-bg)' }} />
                </div>
                <div style={{ height: '1px', backgroundColor: 'var(--border-light)' }}></div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Billing Alerts</p>
                    <p className="text-sm text-muted">Receive notifications about your subscription and invoices.</p>
                  </div>
                  <input type="checkbox" defaultChecked disabled style={{ width: '20px', height: '20px', accentColor: 'var(--primary-btn-bg)' }} />
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Preferences'}</Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === 'billing' && (
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>You are currently on the Free tier.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>Free Plan</h3>
                      <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>3 Dynamic QR Codes limit</p>
                    </div>
                    <h2 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>$0 <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>/mo</span></h2>
                  </div>
                  
                  <div style={{ marginTop: 'var(--space-6)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
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
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Current Password</label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">New Password</label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Confirm New Password</label>
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
                  <div className="flex items-center justify-between p-4 border border-border-light rounded-lg" style={{ borderColor: 'rgba(239, 68, 68, 0.2)', backgroundColor: 'rgba(239, 68, 68, 0.02)' }}>
                    <div>
                      <p className="font-medium text-sm" style={{ color: 'var(--danger)' }}>Delete Account</p>
                      <p className="text-sm text-muted">Once you delete your account, there is no going back. Please be certain.</p>
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
