import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { Mail, UserPlus, Shield, ShieldAlert, X } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { users, inviteUser, loadingWorkspace } = useWorkspace();
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

  if (loadingWorkspace) {
    return <div className="p-8 text-muted">Loading workspace...</div>;
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in max-w-[1000px]">
      <div>
        <h1 className="text-display">Users</h1>
        <p className="text-body text-muted mt-1">Manage who has access to this workspace.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>People with access to your QR codes and settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {users.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-4 border border-border-color rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-secondary text-text-primary flex items-center justify-center font-bold">
                        {u.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{u.email}</p>
                        <p className="text-sm text-muted">Joined {new Date(u.joinedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={u.role === 'Owner' ? 'success' : 'outline'}>
                        {u.role === 'Owner' && <ShieldAlert size={12} className="mr-1 inline" />}
                        {u.role === 'Admin' && <Shield size={12} className="mr-1 inline" />}
                        {u.role}
                      </Badge>
                      {u.role !== 'Owner' && (
                        <Button variant="ghost" size="icon" style={{ color: 'var(--danger)' }}>
                          <X size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Invite User</CardTitle>
              <CardDescription>Add someone to your workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvite} className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <Input 
                      type="email" 
                      placeholder="colleague@company.com" 
                      style={{ paddingLeft: '36px' }}
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Role</label>
                  <select 
                    className="w-full bg-bg-primary border border-border-color rounded-md px-3 py-2 text-sm text-text-primary"
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
                  style={{ width: '100%', marginTop: '8px' }}
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
