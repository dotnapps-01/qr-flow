import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const RedirectHandler: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        if (!id) return;
        
        let destinationUrl = '';

        if (db) {
          // Real Firebase Fetch
          const docRef = doc(db, 'qr_codes', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            destinationUrl = getUrlFromData(data.type, data.data);
          }
        } else {
          // Mock Fetch for Demo
          const saved = JSON.parse(localStorage.getItem('demo_qrs') || '{}');
          if (saved[id]) {
            destinationUrl = getUrlFromData(saved[id].type, saved[id].data);
          }
        }

        if (destinationUrl) {
          window.location.href = destinationUrl;
        } else {
          setError('QR Code destination not found or has been disabled.');
        }

      } catch (err) {
        console.error("Redirect Error:", err);
        setError('Something went wrong while redirecting.');
      }
    };

    handleRedirect();
  }, [id]);

  const getUrlFromData = (type: string, data: any) => {
    switch (type) {
      case 'url':
      case 'custom-url':
      case 'booking':
        return data.url;
      case 'phone':
        return `tel:${data.countryCode || '+91'}${data.phone || ''}`;
      case 'whatsapp':
        return `https://wa.me/${(data.countryCode || '+91').replace('+', '')}${(data.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(data.message || '')}`;
      case 'sms':
        return `smsto:${data.countryCode || '+91'}${data.phone || ''}:${data.message || ''}`;
      case 'email':
        return `mailto:${data.email || ''}?subject=${encodeURIComponent(data.subject || '')}&body=${encodeURIComponent(data.body || '')}`;
      case 'map':
        return `geo:${data.lat || '0'},${data.lng || '0'}?q=${encodeURIComponent(data.address || '')}`;
      default:
        // For text, vcard, wifi, audio, image etc, we might need a hosted page to display them if it's dynamic.
        // For now, redirecting to the builder page or a generic viewer is a good fallback.
        return '/'; 
    }
  };

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px' }}>Oops!</h1>
          <p style={{ color: 'var(--text-muted)' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary-btn-bg)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
