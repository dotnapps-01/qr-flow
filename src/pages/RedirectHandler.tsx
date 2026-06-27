import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Copy, Download, Wifi, AlignLeft, User } from 'lucide-react';

export const RedirectHandler: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState<{type: string, data: any} | null>(null);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        if (!id) return;
        
        let qrType = '';
        let qrData: any = {};

        if (db) {
          const docRef = doc(db, 'qr_codes', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            qrType = data.type;
            qrData = data.data;
          }
        } else {
          const saved = JSON.parse(localStorage.getItem('demo_qrs') || '{}');
          if (saved[id]) {
            qrType = saved[id].type;
            qrData = saved[id].data;
          }
        }

        if (!qrType) {
          setError('QR Code not found. If you just created this, please make sure to click "Save to Dashboard" on your computer before scanning.');
          setLoading(false);
          return;
        }

        // Direct Redirect Types
        const urlRedirects = ['url', 'custom-url', 'booking', 'youtube', 'instagram', 'facebook', 'telegram'];
        if (urlRedirects.includes(qrType)) {
          window.location.href = qrData.url || 'https://dotnapps.com';
          return;
        }

        if (qrType === 'apps') {
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
          const isAndroid = /android/i.test(navigator.userAgent);
          
          if (isIOS && qrData.ios) window.location.href = qrData.ios;
          else if (isAndroid && qrData.android) window.location.href = qrData.android;
          else window.location.href = qrData.url || qrData.ios || qrData.android || 'https://dotnapps.com';
          return;
        }

        if (qrType === 'phone') {
          window.location.href = `tel:${qrData.countryCode || '+91'}${qrData.phone || ''}`;
          return;
        }
        if (qrType === 'whatsapp') {
          window.location.href = `https://wa.me/${(qrData.countryCode || '+91').replace('+', '')}${(qrData.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(qrData.message || '')}`;
          return;
        }
        if (qrType === 'sms') {
          window.location.href = `smsto:${qrData.countryCode || '+91'}${qrData.phone || ''}:${qrData.message || ''}`;
          return;
        }
        if (qrType === 'email') {
          window.location.href = `mailto:${qrData.email || ''}?subject=${encodeURIComponent(qrData.subject || '')}&body=${encodeURIComponent(qrData.body || '')}`;
          return;
        }
        if (qrType === 'map') {
          window.location.href = `https://maps.google.com/?q=${qrData.lat || '0'},${qrData.lng || '0'}`;
          return;
        }

        // Page Render Types (text, wifi, vcard)
        if (['text', 'wifi', 'vcard'].includes(qrType)) {
          const safeData = qrData || {};
          setPageData({ type: qrType, data: safeData });
          setLoading(false);
          
          // Auto-download vcard
          if (qrType === 'vcard') {
             try {
               const vcf = `BEGIN:VCARD\nVERSION:3.0\nN:${safeData.lastName || ''};${safeData.firstName || ''}\nFN:${safeData.firstName || ''} ${safeData.lastName || ''}\nORG:${safeData.company || ''}\nTEL:${safeData.countryCode || '+91'}${safeData.phone || ''}\nEMAIL:${safeData.email || ''}\nEND:VCARD`;
               const blob = new Blob([vcf], { type: 'text/vcard' });
               const url = URL.createObjectURL(blob);
               const a = document.createElement('a');
               a.href = url;
               a.download = `${safeData.firstName || 'contact'}.vcf`;
               document.body.appendChild(a);
               a.click();
               document.body.removeChild(a);
             } catch (downloadErr) {
               console.warn("Auto-download failed:", downloadErr);
               // Do not set global error, just let the page render so user can click manually.
             }
          }
          return;
        }

        setError('Unsupported QR Code Type');
        setLoading(false);

      } catch (err: any) {
        console.error("Redirect Error:", err);
        setError(err.message || 'Something went wrong while redirecting.');
        setLoading(false);
      }
    };

    handleRedirect();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-secondary)' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary-btn-bg)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px', backgroundColor: 'var(--bg-secondary)' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px' }}>Oops!</h1>
          <div style={{ color: 'var(--danger)', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '8px', wordBreak: 'break-word', fontSize: '14px' }}>
            {error}
          </div>
          <p style={{ marginTop: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>If you created this without logging in, the QR code is only saved on your computer and cannot be scanned from other devices.</p>
        </div>
      </div>
    );
  }

  const { type, data } = pageData || {};

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <Card style={{ width: '100%', maxWidth: '400px', overflow: 'hidden' }}>
        
        {type === 'text' && (
          <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '56px', height: '56px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'var(--text-primary)' }}>
              <AlignLeft size={24} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>Message</h2>
            <div style={{ width: '100%', backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', fontSize: '16px', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '24px' }}>
              {data.text || 'No message provided.'}
            </div>
            <Button style={{ width: '100%' }} onClick={() => navigator.clipboard.writeText(data.text)}>
              <Copy size={18} style={{ marginRight: '8px' }} /> Copy Text
            </Button>
          </div>
        )}

        {type === 'wifi' && (
          <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '56px', height: '56px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'var(--text-primary)' }}>
              <Wifi size={24} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Wi-Fi Network</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Connect to the network below</p>
            
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Network Name (SSID)</span>
                <div style={{ fontSize: '18px', fontWeight: 500, marginTop: '4px' }}>{data.ssid || 'Unknown'}</div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</span>
                <div style={{ fontSize: '18px', fontWeight: 500, marginTop: '4px', fontFamily: 'monospace' }}>{data.password || 'None'}</div>
              </div>
            </div>
            
            <Button style={{ width: '100%' }} onClick={() => navigator.clipboard.writeText(data.password || '')}>
              <Copy size={18} style={{ marginRight: '8px' }} /> Copy Password
            </Button>
          </div>
        )}

        {type === 'vcard' && (
          <div style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--primary-btn-bg)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', fontSize: '32px', fontWeight: 600 }}>
              {(data.firstName?.[0] || 'C').toUpperCase()}
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '4px' }}>{data.firstName} {data.lastName}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '32px' }}>{data.company}</p>
            
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {data.phone && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Phone</span>
                  <span style={{ fontWeight: 500 }}>{data.countryCode} {data.phone}</span>
                </div>
              )}
              {data.email && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Email</span>
                  <span style={{ fontWeight: 500 }}>{data.email}</span>
                </div>
              )}
            </div>
            
            <Button style={{ width: '100%' }} onClick={() => {
              const vcf = `BEGIN:VCARD\nVERSION:3.0\nN:${safeData.lastName || ''};${safeData.firstName || ''}\nFN:${safeData.firstName || ''} ${safeData.lastName || ''}\nORG:${safeData.company || ''}\nTEL:${safeData.countryCode || '+91'}${safeData.phone || ''}\nEMAIL:${safeData.email || ''}\nEND:VCARD`;
              const blob = new Blob([vcf], { type: 'text/vcard' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${safeData.firstName || 'contact'}.vcf`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}>
              <Download size={18} style={{ marginRight: '8px' }} /> Save Contact Again
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

