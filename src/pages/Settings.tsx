import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Save } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div className="flex flex-col gap-8 animate-fade-in max-w-[800px]">
      <div>
        <h1 className="text-display">Settings</h1>
        <p className="text-body text-muted mt-1">Manage your workspace preferences and personal profile.</p>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Workspace Profile</CardTitle>
            <CardDescription>Update your workspace name and logo.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-4 mb-2">
              <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--text-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 600 }}>
                W
              </div>
              <Button variant="outline">Upload Logo</Button>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Workspace Name</label>
              <Input defaultValue="My Workspace" placeholder="e.g. Acme Corp" />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Workspace URL</label>
              <div className="flex gap-2">
                <Input defaultValue="my-workspace" />
                <div className="flex items-center px-4 bg-secondary border border-border-color rounded-lg text-muted text-sm">
                  .qrflow.com
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button leftIcon={<Save size={16} />}>Save Changes</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription>Irreversible actions for your workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Delete Workspace</p>
                <p className="text-sm text-muted">Once deleted, all data and QR codes will be permanently removed.</p>
              </div>
              <Button variant="outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                Delete Workspace
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
