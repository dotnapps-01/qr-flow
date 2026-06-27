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

export const Overview: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentQrs, setRecentQrs] = useState<QrCode[]>([]);
  const [stats, setStats] = useState({ total: 0, scans: 0, active: 0 });
  
  const [chartData, setChartData] = useState([
    { name: 'Mon', scans: 0 },
    { name: 'Tue', scans: 0 },
    { name: 'Wed', scans: 0 },
    { name: 'Thu', scans: 0 },
    { name: 'Fri', scans: 0 },
    { name: 'Sat', scans: 0 },
    { name: 'Sun', scans: 0 },
  ]);

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

          // Fetch Scan Events for the chart
          const scansQuery = query(collection(db, 'scan_events'), where('userId', '==', user.id));
          const scansSnapshot = await getDocs(scansQuery);
          
          // Generate last 7 days chart data
          const last7Days = Array.from({length: 7}).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return {
              dateString: d.toISOString().split('T')[0],
              name: d.toLocaleDateString('en-US', { weekday: 'short' }),
              scans: 0
            };
          });

          scansSnapshot.forEach((doc) => {
             const scanData = doc.data();
             if (scanData.timestamp) {
               const scanDate = new Date(scanData.timestamp).toISOString().split('T')[0];
               const dayData = last7Days.find(d => d.dateString === scanDate);
               if (dayData) {
                  dayData.scans += 1;
               }
             }
          });

          setChartData(last7Days);
          
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
        <div className="overview-title-wrapper">
          <h1 className="text-display">Welcome back, {user?.displayName?.split(' ')[0] || 'there'} 👋</h1>
          <p className="overview-subtitle">Here's what's happening with your QR codes today.</p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={() => navigate('/builder')} className="btn-create-pulse">
          Create New QR
        </Button>
      </header>

      <div className="bento-grid">
        {/* Chart (Top Left Large) */}
        <div className="bento-item bento-chart">
          <div className="chart-header">
            <h3>Scan Performance</h3>
            <select className="chart-select">
              <option>Last 7 days</option>
              <option>This Month</option>
              <option>All Time</option>
            </select>
          </div>
          <div className="chart-wrapper" style={{ flex: 1, minHeight: 250, width: '100%', position: 'relative', left: '-10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-btn-bg)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--primary-btn-bg)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 500 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)', backgroundColor: 'var(--bg-card)' }}
                  itemStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                  cursor={{ stroke: 'var(--border-color)', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area type="monotone" dataKey="scans" stroke="var(--primary-btn-bg)" strokeWidth={4} fillOpacity={1} fill="url(#colorScans)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KPI 1: Total QR Codes */}
        <div className="bento-item bento-kpi-total">
          <div className="bento-kpi-header">
            <div className="bento-icon-box bg-glass-primary">
              <QrCodeIcon size={20} />
            </div>
            <span className="bento-kpi-label">Total Codes</span>
          </div>
          <span className="bento-kpi-value">{stats.total}</span>
        </div>

        {/* KPI 2: Total Scans (Tall) */}
        <div className="bento-item bento-kpi-scans">
          <div>
            <div className="bento-kpi-header">
              <div className="bento-icon-box bg-glass-success">
                <BarChart3 size={20} />
              </div>
              <span className="bento-kpi-label">Total Scans</span>
            </div>
            <span className="bento-kpi-value">{stats.scans.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontSize: '14px', fontWeight: 600, marginTop: 'var(--space-4)' }}>
            <TrendingUp size={16} />
            <span>+12% this week</span>
          </div>
        </div>

        {/* KPI 3: Active QRs */}
        <div className="bento-item bento-kpi-active">
          <div className="bento-kpi-header" style={{ justifyContent: 'center' }}>
            <div className="bento-icon-box bg-glass-warning">
              <Zap size={20} />
            </div>
          </div>
          <span className="bento-kpi-value">{stats.active}</span>
          <span className="bento-kpi-label" style={{ marginTop: '8px' }}>Active Codes</span>
        </div>

        {/* Recent QRs */}
        <div className="bento-item bento-recent">
          <div className="bento-recent-header">
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Recent Activity</h3>
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />} onClick={() => navigate('/projects')}>View All</Button>
          </div>
          
          <div className="recent-qrs-list">
            {recentQrs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-4) 0', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '13px', marginBottom: '8px' }}>No activity yet.</p>
              </div>
            ) : (
              recentQrs.map(qr => (
                <div key={qr.id} className="recent-qr-card" onClick={() => navigate(`/projects`)}>
                  <div className="recent-qr-icon">
                    <QrCodeIcon size={16} />
                  </div>
                  <div className="recent-qr-info">
                    <span className="recent-qr-name">{qr.name}</span>
                    <span className="recent-qr-date">{new Date(qr.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="recent-qr-scans">
                    <span style={{ fontWeight: 700, fontSize: '14px' }}>{qr.scans}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>scans</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
