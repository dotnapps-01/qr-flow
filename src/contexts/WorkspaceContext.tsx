import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface WorkspaceUser {
  id: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Member';
  joinedAt: string;
}

interface WorkspaceContextType {
  workspaceName: string;
  updateWorkspaceName: (newName: string) => Promise<void>;
  users: WorkspaceUser[];
  inviteUser: (email: string, role: 'Admin' | 'Member') => Promise<void>;
  loadingWorkspace: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType>({} as WorkspaceContextType);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [workspaceName, setWorkspaceName] = useState('My Workspace');
  const [users, setUsers] = useState<WorkspaceUser[]>([]);
  const [loadingWorkspace, setLoadingWorkspace] = useState(true);

  useEffect(() => {
    const fetchWorkspace = async () => {
      if (!user) {
        setWorkspaceName('My Workspace');
        setUsers([]);
        setLoadingWorkspace(false);
        return;
      }

      try {
        if (db) {
          const workspaceRef = doc(db, 'workspaces', user.id);
          const workspaceSnap = await getDoc(workspaceRef);
          
          if (workspaceSnap.exists()) {
            const data = workspaceSnap.data();
            setWorkspaceName(data.name || 'My Workspace');
            setUsers(data.users || [{ id: user.id, email: user.email || '', role: 'Owner', joinedAt: new Date().toISOString() }]);
          } else {
            // Create default workspace for new user
            const defaultData = {
              name: 'My Workspace',
              users: [{ id: user.id, email: user.email || '', role: 'Owner', joinedAt: new Date().toISOString() }]
            };
            await setDoc(workspaceRef, defaultData);
            setWorkspaceName(defaultData.name);
            setUsers(defaultData.users as WorkspaceUser[]);
          }
        } else {
          // Demo Mode Fallback
          const savedStr = localStorage.getItem(`demo_workspace_${user.id}`);
          if (savedStr) {
            const saved = JSON.parse(savedStr);
            setWorkspaceName(saved.name);
            setUsers(saved.users);
          } else {
            const defaultData = {
              name: 'My Workspace',
              users: [{ id: user.id, email: user.email || '', role: 'Owner', joinedAt: new Date().toISOString() }]
            };
            localStorage.setItem(`demo_workspace_${user.id}`, JSON.stringify(defaultData));
            setWorkspaceName(defaultData.name);
            setUsers(defaultData.users as WorkspaceUser[]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch workspace:", err);
      } finally {
        setLoadingWorkspace(false);
      }
    };

    fetchWorkspace();
  }, [user]);

  const updateWorkspaceName = async (newName: string) => {
    setWorkspaceName(newName);
    if (!user) return;
    
    try {
      if (db) {
        const workspaceRef = doc(db, 'workspaces', user.id);
        await updateDoc(workspaceRef, { name: newName });
      } else {
        const savedStr = localStorage.getItem(`demo_workspace_${user.id}`);
        if (savedStr) {
          const saved = JSON.parse(savedStr);
          saved.name = newName;
          localStorage.setItem(`demo_workspace_${user.id}`, JSON.stringify(saved));
        }
      }
    } catch (err) {
      console.error("Failed to update workspace name:", err);
    }
  };

  const inviteUser = async (email: string, role: 'Admin' | 'Member') => {
    if (!user) return;
    const newUser: WorkspaceUser = {
      id: `invited-${Date.now()}`,
      email,
      role,
      joinedAt: new Date().toISOString()
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    
    try {
      if (db) {
        const workspaceRef = doc(db, 'workspaces', user.id);
        await updateDoc(workspaceRef, { users: updatedUsers });
      } else {
        const savedStr = localStorage.getItem(`demo_workspace_${user.id}`);
        if (savedStr) {
          const saved = JSON.parse(savedStr);
          saved.users = updatedUsers;
          localStorage.setItem(`demo_workspace_${user.id}`, JSON.stringify(saved));
        }
      }
    } catch (err) {
      console.error("Failed to invite user:", err);
    }
  };

  return (
    <WorkspaceContext.Provider value={{ workspaceName, updateWorkspaceName, users, inviteUser, loadingWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);
