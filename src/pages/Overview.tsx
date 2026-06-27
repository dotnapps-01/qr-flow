import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { BarChart3, QrCode as QrCodeIcon, ArrowRight, Zap, TrendingUp, Plus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { QrCode } from './Dashboard';
import './Overview.css';

// Dummy data for the chart since we don't have historical scan tracking yet
const data = [
  { name: 'Mon', scans: 400 },
  { name: 'Tue', scans: 300 },
  { name: 'Wed', scans: 550 },
  { name: 'Thu', scans: 480 },
  { name: 'Fri', scans: 700 },
  { name: 'Sat', scans: 850 },
  { name: 'Sun', scans: 950 },
];

export const Overview: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentQrs, setRecentQrs] = useState<QrCode[]>([]);
  const [stats, setStats] = useState({ total: 0, scans: 0, active: 0 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        if (db) {
          const q = query(collection(db, 'qr_codes'), where('userId', '==', user.id));
          const querySnapshot = await getDocs(q);
          
          let total = 0;
          let scans = 0;
          let active = 0;
          const qrs: QrCode[] = [];
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            total++;
            scans += (data.scans || 0);
            if (data.state !== 'Paused') active++;
            
            qrs.push({
              id: doc.id,
              name: data.name || `${data.type} QR Code`,
              url: `${window.location.origin}/q/${doc.id}`,
              type: 'Dynamic',
              scans: data.scans || 0,
              state: data.state || 'Active',
              createdAt: data.createdAt,
              editedAt: data.editedAt || data.createdAt,
              isFavorite: data.isFavorite || false,
            });
          });
          
          setStats({ total, scans, active });
          
          // Sort by newest and take top 3
          qrs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setRecentQrs(qrs.slice(0, 3));
          
        } else {
          // Demo fallback
          const saved = JSON.parse(localStorage.getItem('demo_qrs') || '{}');
          let total = 0;
          let scans = 0;
          const qrs: QrCode[] = [];
          
          Object.keys(saved).forEach(id => {
            const data = saved[id];
            if (data.userId === user.id) {
              total++;
              scans += (data.scans || 0);
              qrs.push({
                id: id,
                name: data.name || `${data.type} QR Code`,
                url: `${window.location.origin}/q/${id}`,
                type: 'Dynamic',
                scans: data.scans || 0,
                state: 'Active',
                createdAt: data.createdAt || new Date().toISOString(),
                editedAt: data.createdAt || new Date().toISOString(),
              });
            }
          });
          
          setStats({ total, scans, active: total });
          qrs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setRecentQrs(qrs.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to fetch overview data", err);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  return (
    <div className="overview-container animate-fade-in">
      <header className="overview-header">
        <div>
          <h1 className="text-display">Welcome back, {user?.displayName?.split(' ')[0] || 'there'} 👋</h1>
          <p className="overview-subtitle">Here's what's happening with your QR codes today.</p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={() => navigate('/builder')} className="btn-create-pulse">
          Create New QR
        </Button>
      </header>

      {/* KPIs */}
      <div className="kpi-grid">
        <Card className="kpi-card shadow-sm border-light">
          <div className="kpi-icon-box bg-primary-light">
            <QrCodeIcon size={24} className="text-primary" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total QR Codes</span>
            <span className="kpi-value">{stats.total}</span>
          </div>
        </Card>
        
        <Card className="kpi-card shadow-sm border-light">
          <div className="kpi-icon-box bg-success-light">
            <BarChart3 size={24} className="text-success" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Scans</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span className="kpi-value">{stats.scans.toLocaleString()}</span>
              <span className="kpi-trend positive"><TrendingUp size={14} /> +12%</span>
            </div>
          </div>
        </Card>
        
        <Card className="kpi-card shadow-sm border-light">
          <div className="kpi-icon-box bg-warning-light">
            <Zap size={24} className="text-warning" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Active Dynamic QRs</span>
            <span className="kpi-value">{stats.active}</span>
          </div>
        </Card>
      </div>

      <div className="overview-main-grid">
        {/* Chart Section */}
        <Card className="chart-card shadow-sm border-light">
          <div className="chart-header">
            <h3>Scan Performance</h3>
            <select className="chart-select">
              <option>Last 7 days</option>
              <option>This Month</option>
              <option>All Time</option>
            </select>
          </div>
          <div className="chart-wrapper" style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-btn-bg)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary-btn-bg)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)', backgroundColor: 'var(--bg-card)' }}
                  itemStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="scans" stroke="var(--primary-btn-bg)" strokeWidth={3} fillOpacity={1} fill="url(#colorScans)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent QR Codes Section */}
        <div className="recent-qrs-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Recent QR Codes</h3>
            <Button variant="ghost" rightIcon={<ArrowRight size={16} />} onClick={() => navigate('/projects')}>View All</Button>
          </div>
          
          <div className="recent-qrs-list">
            {recentQrs.length === 0 ? (
              <Card className="empty-recent-card shadow-none border-dashed">
                <QrCodeIcon size={32} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '12px' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>No QR codes created yet.</p>
                <Button size="sm" onClick={() => navigate('/builder')}>Create your first QR</Button>
              </Card>
            ) : (
              recentQrs.map(qr => (
                <Card key={qr.id} className="recent-qr-card shadow-sm border-light" onClick={() => navigate(`/projects`)} interactive>
                  <div className="recent-qr-icon">
                    <QrCodeIcon size={20} />
                  </div>
                  <div className="recent-qr-info">
                    <span className="recent-qr-name">{qr.name}</span>
                    <span className="recent-qr-date">Created {new Date(qr.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="recent-qr-scans">
                    <span style={{ fontWeight: 600 }}>{qr.scans}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>scans</span>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
