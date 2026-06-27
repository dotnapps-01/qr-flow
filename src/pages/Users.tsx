import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { Mail, UserPlus, Shield, ShieldAlert, Trash2 } from 'lucide-react';
import './Users.css';

export const UsersPage: React.FC = () => {
  const { users, inviteUser, removeUser, loadingWorkspace } = useWorkspace();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Member'>('Member');
  const [isInviting, setIsInviting] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    setIsInviting(true);
    await inviteUser(inviteEmail, inviteRole);
    setInviteEmail('');
    setIsInviting(false);
  };

  const handleRemove = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this user from the workspace?")) {
      await removeUser(id);
    }
  };

  if (loadingWorkspace) {
    return <div style={{ padding: 'var(--space-8)', color: 'var(--text-muted)' }}>Loading workspace...</div>;
  }

  return (
    <div className="users-container animate-fade-in">
      <div className="users-header">
        <h1 className="text-display">Users</h1>
        <p className="users-subtitle">Manage who has access to this workspace.</p>
      </div>

      <div className="users-grid">
        <div className="users-list-column">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>People with access to your QR codes and settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="team-list">
                {users.map(u => (
                  <div key={u.id} className="team-member-card">
                    <div className="member-info-group">
                      <div className="member-avatar">
                        {u.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="member-details">
                        <p className="member-email">{u.email}</p>
                        <p className="member-joined">Joined {new Date(u.joinedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="member-actions">
                      <Badge variant={u.role === 'Owner' ? 'success' : 'outline'}>
                        {u.role === 'Owner' && <ShieldAlert size={12} className="mr-1 inline" />}
                        {u.role === 'Admin' && <Shield size={12} className="mr-1 inline" />}
                        {u.role}
                      </Badge>
                      {u.role !== 'Owner' && (
                        <Button variant="ghost" size="icon" style={{ color: 'var(--danger)' }} onClick={() => handleRemove(u.id)}>
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="users-invite-column">
          <Card>
            <CardHeader>
              <CardTitle>Invite User</CardTitle>
              <CardDescription>Add someone to your workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvite} className="invite-form">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-with-icon-wrapper">
                    <Mail size={16} className="input-icon-left" />
                    <Input 
                      type="email" 
                      placeholder="colleague@company.com" 
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select 
                    className="custom-select"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'Admin' | 'Member')}
                  >
                    <option value="Member">Member (Can create QR codes)</option>
                    <option value="Admin">Admin (Can manage settings & users)</option>
                  </select>
                </div>

                <Button 
                  type="submit" 
                  leftIcon={<UserPlus size={16} />} 
                  style={{ width: '100%', marginTop: 'var(--space-2)' }}
                  disabled={isInviting}
                >
                  {isInviting ? 'Inviting...' : 'Send Invite'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
