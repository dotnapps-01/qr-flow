import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { QRCodeSVG } from 'qrcode.react';
import { X, Edit2, Download, BarChart2, Calendar, Link as LinkIcon, ExternalLink, QrCode as QrCodeIcon, Copy } from 'lucide-react';
import type { QrCode } from '../pages/Dashboard';
import './QrDetailsDrawer.css';

interface QrDetailsDrawerProps {
  qr: QrCode | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QrDetailsDrawer: React.FC<QrDetailsDrawerProps> = ({ qr, isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!qr) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qr.url);
    alert('Link copied to clipboard!');
  };

  return createPortal(
    <>
      <div className={`drawer-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`drawer-panel ${isOpen ? 'open' : ''}`}>
        
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-title-row">
             <div className="drawer-icon-box">
               <QrCodeIcon size={24} />
             </div>
             <div>
               <h2 className="drawer-title">{qr.name}</h2>
               <Badge variant={qr.state === 'Active' ? 'success' : 'outline'} style={{ marginTop: '4px' }}>{qr.state}</Badge>
             </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="drawer-close-btn">
            <X size={24} />
          </Button>
        </div>

        <div className="drawer-content">
          {/* QR Preview Section */}
          <div className="drawer-preview-section">
            <div className="qr-preview-box">
              <QRCodeSVG 
                value={qr.url} 
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>
            
            <div className="drawer-quick-actions">
               <Button style={{ flex: 1 }} onClick={() => navigate(`/builder?edit=${qr.id}&step=2`)}>
                 <Edit2 size={16} style={{ marginRight: '8px' }} /> Edit Content
               </Button>
               <Button variant="outline" style={{ flex: 1 }} onClick={() => navigate(`/builder?edit=${qr.id}&step=3`)}>
                 <QrCodeIcon size={16} style={{ marginRight: '8px' }} /> Edit Design
               </Button>
            </div>
          </div>

          {/* Details Section */}
          <div className="drawer-details-section">
            <h3 className="drawer-section-title">Details</h3>
            
            <div className="detail-item">
              <div className="detail-icon"><LinkIcon size={16} /></div>
              <div className="detail-info">
                <span className="detail-label">Destination URL</span>
                <div className="detail-link-row">
                  <a href={qr.url} target="_blank" rel="noreferrer" className="detail-value-link">{qr.url}</a>
                  <button onClick={handleCopyLink} className="copy-btn" title="Copy Link"><Copy size={14}/></button>
                  <a href={qr.url} target="_blank" rel="noreferrer" className="copy-btn" title="Open Link"><ExternalLink size={14}/></a>
                </div>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon"><QrCodeIcon size={16} /></div>
              <div className="detail-info">
                <span className="detail-label">QR Type</span>
                <span className="detail-value">{qr.type}</span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon"><Calendar size={16} /></div>
              <div className="detail-info">
                <span className="detail-label">Created On</span>
                <span className="detail-value">{qr.createdAt}</span>
              </div>
            </div>
            
            <div className="detail-item">
              <div className="detail-icon"><Calendar size={16} /></div>
              <div className="detail-info">
                <span className="detail-label">Last Edited</span>
                <span className="detail-value">{qr.editedAt}</span>
              </div>
            </div>
          </div>

          {/* Analytics Section (Dynamic Only) */}
          {qr.type === 'Dynamic' && (
            <div className="drawer-analytics-section">
              <h3 className="drawer-section-title">Analytics Snapshot</h3>
              
              <div className="analytics-card">
                 <div className="analytics-icon"><BarChart2 size={24} /></div>
                 <div className="analytics-data">
                    <span className="analytics-value">{qr.scans.toLocaleString()}</span>
                    <span className="analytics-label">Total Scans</span>
                 </div>
              </div>
              
              <p className="analytics-hint">Upgrade to Pro to see detailed scan locations, devices, and time series data.</p>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};
