import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useNavigate } from 'react-router-dom';
import QRCodeStyling from 'qr-code-styling';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { FaWhatsapp, FaYoutube, FaInstagram, FaFacebook, FaTelegramPlane } from 'react-icons/fa';
import { QrForms } from '../components/builder/QrForms';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { QrDesign, type QrDesignState } from '../components/builder/QrDesign';
import { 
  Globe, 
  FileText, 
  Image as ImageIcon, 
  Smartphone, 
  AlignLeft, 
  MessageCircle, 
  Video, 
  Camera, 
  Users, 
  MapPin, 
  Wifi, 
  Music, 
  ThumbsUp, 
  Send, 
  Mail, 
  CalendarCheck, 
  Phone, 
  Presentation,
  Link2,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Download,
  X,
  type LucideIcon
} from 'lucide-react';
import './Builder.css';

interface QrType {
  id: string;
  name: string;
  desc: string;
  icon: React.ElementType;
  badge?: string;
}

const qrTypes: QrType[] = [
  { id: 'url', name: 'URL / Link', desc: 'Open a URL', icon: Globe },
  { id: 'apps', name: 'Play Market / App Store', desc: 'Redirect to an app store', icon: Smartphone },
  { id: 'text', name: 'Text', desc: 'Display plain text', icon: AlignLeft },
  { id: 'whatsapp', name: 'WhatsApp', desc: 'Send a WhatsApp message', icon: FaWhatsapp },
  { id: 'youtube', name: 'YouTube', desc: 'Open a YouTube video', icon: FaYoutube },
  { id: 'instagram', name: 'Instagram', desc: 'Open an Instagram profile', icon: FaInstagram },
  { id: 'vcard', name: 'vCard', desc: 'Share contact details', icon: Users },
  { id: 'map', name: 'Map', desc: 'Show a location on a map', icon: MapPin },
  { id: 'wifi', name: 'Wi-Fi', desc: 'Connect to a Wi-Fi network', icon: Wifi },
  { id: 'facebook', name: 'Facebook', desc: 'Open a Facebook page', icon: FaFacebook },
  { id: 'telegram', name: 'Telegram', desc: 'Open a Telegram channel', icon: FaTelegramPlane },
  { id: 'email', name: 'E-mail', desc: 'Send an email', icon: Mail },
  { id: 'booking', name: 'Booking', desc: 'Link to a booking page', icon: CalendarCheck },
  { id: 'phone', name: 'Phone Call', desc: 'Initiate a phone call', icon: Phone },
  { id: 'custom-url', name: 'Custom URL', desc: 'Create a custom URL', icon: Link2 },
  { id: 'sms', name: 'SMS', desc: 'Send a text message', icon: MessageSquare },
];

export const Builder: React.FC = () => {
  const [showAllTypes, setShowAllTypes] = useState(false);
  const [qrCategory, setQrCategory] = useState<'dynamic' | 'static' | null>(null);
  
  const [activeStep, setActiveStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [qrName, setQrName] = useState<string>('');
  const [qrData, setQrData] = useState<any>({});
  const [dynamicId, setDynamicId] = useState<string>('');
  const qrRef = useRef<HTMLDivElement>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { user, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  
  const [qrCode] = useState(() => new QRCodeStyling({
    width: 200,
    height: 200,
    type: 'svg',
    margin: 10,
    imageOptions: {
      crossOrigin: 'anonymous',
      margin: 5,
    }
  }));
  
  const [qrDesign, setQrDesign] = useState<QrDesignState>({
    patternStyle: 'squares',
    fgColor: '#000000',
    bgColor: '#ffffff',
    cornerBorderStyle: 'square',
    cornerCenterStyle: 'square',
    cornerFgColor: '#000000',
    correctionLevel: 'H',
    logo: null
  });

  const staticTypeIds = ['text', 'vcard', 'url', 'whatsapp', 'wifi', 'email', 'sms'];

  const categoryTypes = qrCategory === 'static' 
    ? qrTypes.filter(t => staticTypeIds.includes(t.id))
    : qrTypes;

  const displayedTypes = showAllTypes ? categoryTypes : categoryTypes.slice(0, 10);

  const generateQrString = () => {
    if (!qrData || Object.keys(qrData).length === 0) return 'https://dotnapps.com';
    
    if (qrCategory === 'dynamic' && dynamicId) {
      return `${window.location.origin}/q/${dynamicId}`;
    }
    
    switch (selectedType) {
      case 'url':
      case 'custom-url':
      case 'booking':
      case 'youtube':
      case 'instagram':
      case 'facebook':
      case 'telegram':
        return qrData.url || 'https://dotnapps.com';
      case 'text':
        return qrData.text || 'Hello World';
      case 'phone':
        return `tel:${qrData.countryCode || '+91'}${qrData.phone || ''}`;
      case 'whatsapp':
        return `https://wa.me/${(qrData.countryCode || '+91').replace('+', '')}${(qrData.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(qrData.message || '')}`;
      case 'sms':
        return `smsto:${qrData.countryCode || '+91'}${qrData.phone || ''}:${qrData.message || ''}`;
      case 'email':
        return `mailto:${qrData.email || ''}?subject=${encodeURIComponent(qrData.subject || '')}&body=${encodeURIComponent(qrData.body || '')}`;
      case 'wifi':
        return `WIFI:S:${qrData.ssid || ''};T:${qrData.encryption || 'WPA'};P:${qrData.password || ''};H:${qrData.hidden ? 'true' : 'false'};;`;
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nN:${qrData.lastName || ''};${qrData.firstName || ''}\nFN:${qrData.firstName || ''} ${qrData.lastName || ''}\nORG:${qrData.company || ''}\nTEL:${qrData.countryCode || '+91'}${qrData.phone || ''}\nEMAIL:${qrData.email || ''}\nEND:VCARD`;
      case 'map':
        return `geo:${qrData.lat || '0'},${qrData.lng || '0'}?q=${encodeURIComponent(qrData.address || '')}`;
      case 'apps':
        return qrData.ios || qrData.android || 'https://dotnapps.com';
      default:
        return JSON.stringify(qrData);
    }
  };

  const qrString = generateQrString();

  useEffect(() => {
    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      qrCode.append(qrRef.current);
    }
  }, [qrCode, activeStep]);

  useEffect(() => {
    if (editId) {
      const loadEditData = async () => {
        if (db) {
          try {
             const docRef = doc(db, 'qr_codes', editId);
             const docSnap = await getDoc(docRef);
             if (docSnap.exists()) {
                const data = docSnap.data();
                setQrName(data.name || '');
                setSelectedType(data.type);
                setQrData(data.data || {});
                setDynamicId(editId);
                setQrCategory('dynamic');
                const targetStep = searchParams.get('step') ? parseInt(searchParams.get('step')!, 10) : 2;
                setActiveStep(targetStep >= 1 && targetStep <= 3 ? targetStep : 2);
             }
          } catch(err) {
             console.error('Failed to fetch QR for edit', err);
          }
        } else {
           const saved = JSON.parse(localStorage.getItem('demo_qrs') || '{}');
           if (saved[editId]) {
              const data = saved[editId];
              setQrName(data.name || '');
              setSelectedType(data.type);
              setQrData(data.data || {});
              setDynamicId(editId);
              setQrCategory('dynamic');
              const targetStep = searchParams.get('step') ? parseInt(searchParams.get('step')!, 10) : 2;
              setActiveStep(targetStep >= 1 && targetStep <= 3 ? targetStep : 2);
           }
        }
      };
      loadEditData();
    }
  }, [editId]);

  useEffect(() => {
    qrCode.update({
      data: qrString,
      qrOptions: {
        errorCorrectionLevel: qrDesign.correctionLevel as any
      },
      dotsOptions: {
        color: qrDesign.fgColor,
        type: qrDesign.patternStyle as any
      },
      backgroundOptions: {
        color: qrDesign.bgColor,
      },
      cornersSquareOptions: {
        color: qrDesign.fgColor,
        type: qrDesign.cornerBorderStyle as any
      },
      cornersDotOptions: {
        color: qrDesign.fgColor,
        type: qrDesign.cornerCenterStyle as any
      },
      image: qrDesign.logo || '',
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 5,
        imageSize: 0.4
      }
    });
  }, [qrCode, qrString, qrDesign]);

  const handleSave = async (redirect: boolean = false) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return false;
    }
    if (qrCategory === 'dynamic') {
      try {
        if (db) {
          await setDoc(doc(db, 'qr_codes', dynamicId), {
            userId: user.id,
            name: qrName.trim() || 'Untitled QR Code',
            type: selectedType,
            data: qrData,
            createdAt: new Date().toISOString()
          });
        } else {
          // Mock saving to localStorage for demo
          const saved = JSON.parse(localStorage.getItem('demo_qrs') || '{}');
          saved[dynamicId] = { 
            name: qrName.trim() || 'Untitled QR Code',
            type: selectedType, 
            data: qrData, 
            userId: user.id, 
            createdAt: new Date().toISOString(),
            scans: 0 
          };
          localStorage.setItem('demo_qrs', JSON.stringify(saved));
        }
        if (redirect) {
           setShowSuccessModal(true);
        }
        return true;
      } catch (err) {
        console.error("Failed to save QR code data", err);
        alert("Failed to save dynamic QR code. Please try again.");
        return false;
      }
    }
    return true; // Static codes don't need saving to DB
  };

  const handleDiscard = () => {
    if (window.confirm("Are you sure you want to discard this QR code? All progress will be lost.")) {
      setQrCategory(null);
      setActiveStep(1);
      setSelectedType(null);
      setQrName('');
      setQrData({});
      setDynamicId('');
    }
  };

  const handleDownload = async (extension: 'png' | 'jpeg' | 'svg') => {
    const saved = await handleSave(false);
    if (saved) {
      qrCode.download({ name: 'qr-flow', extension });
    }
  };

  return (
    <div className="builder-layout animate-fade-in">
      {/* Left Configuration Panel */}
      <div className="builder-config">
        <div className="builder-header-section">
          <div className="builder-header-row">
          <div className="builder-steps" style={{ paddingBottom: 0, borderBottom: 'none' }}>
            <div className={`step ${activeStep >= 1 ? 'step-active' : ''}`} onClick={() => setActiveStep(1)} style={{ cursor: 'pointer' }}>
              <div className="step-number">1</div>
              <span className="step-label">Type of QR code</span>
            </div>
            <div className={`step ${activeStep >= 2 ? 'step-active' : ''}`} onClick={() => { if (selectedType) setActiveStep(2); }} style={{ cursor: selectedType ? 'pointer' : 'default', opacity: selectedType ? 1 : 0.5 }}>
              <div className="step-number">2</div>
              <span className="step-label">Content</span>
            </div>
            <div className={`step ${activeStep >= 3 ? 'step-active' : ''}`} onClick={() => { if (selectedType) setActiveStep(3); }} style={{ cursor: selectedType ? 'pointer' : 'default', opacity: selectedType ? 1 : 0.5 }}>
              <div className="step-number">3</div>
              <span className="step-label">QR design</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button 
              variant="outline" 
              onClick={() => setActiveStep(prev => Math.max(1, prev - 1))} 
              disabled={activeStep === 1}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              &larr; Back
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setActiveStep(prev => Math.min(3, prev + 1))} 
              disabled={activeStep === 3 || !selectedType}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              Next &rarr;
            </Button>
          </div>
        </div>

        {/* Step Headers */}
        {activeStep === 1 && (
          <h1 className="builder-title">Select a QR type</h1>
        )}
        
        {activeStep === 2 && selectedType && (
          <div className="step-header-container animate-fade-in">
            <div>
              <h1 className="builder-title" style={{ margin: 0 }}>Configure Content</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Fill out the details for your {qrTypes.find(t => t.id === selectedType)?.name} QR code</p>
            </div>
            <Button variant="outline" onClick={() => setActiveStep(1)}>Change Type</Button>
          </div>
        )}

        {activeStep === 3 && (
          <div className="step-header-container animate-fade-in">
            <div>
              <h1 className="builder-title" style={{ margin: 0 }}>QR Design</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Customize the style, colors, and logo of your QR code</p>
            </div>
            <Button variant="outline" onClick={() => setActiveStep(2)}>Back to Content</Button>
          </div>
        )}
      </div>

      <div className="builder-content">
          {activeStep === 1 && (
            <>
              
              {!qrCategory ? (
                <div className="qr-category-selection" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <Card interactive className="category-card" onClick={() => setQrCategory('dynamic')} style={{ padding: 'var(--space-5)', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                     <div className="dynamic-icon-wrapper" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '50%', color: 'var(--text-muted)' }}>
                        <ChevronRight size={16} />
                     </div>
                     <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: '4px' }}>
                           <span style={{ fontWeight: 600, fontSize: '16px' }}>Dynamic QR</span>
                           <Badge variant="success">with tracking</Badge>
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Update content in real time, without changing your code</span>
                     </div>
                  </Card>

                  <Card interactive className="category-card" onClick={() => setQrCategory('static')} style={{ padding: 'var(--space-5)', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                     <div className="dynamic-icon-wrapper" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '50%', color: 'var(--text-muted)' }}>
                        <ChevronRight size={16} />
                     </div>
                     <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: '4px' }}>
                           <span style={{ fontWeight: 600, fontSize: '16px' }}>Static QR</span>
                           <Badge variant="outline" style={{ backgroundColor: '#fed7aa', color: '#c2410c', borderColor: 'transparent' }}>no tracking</Badge>
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Reprint required when updating content</span>
                     </div>
                  </Card>
                </div>
              ) : (
                <>
                  <div 
                    className="dynamic-qr-header" 
                    onClick={() => setQrCategory(null)} 
                    style={{ cursor: 'pointer', transition: 'background-color 0.2s', padding: 'var(--space-3)', margin: '-var(--space-3)', marginBottom: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'} 
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div className="dynamic-qr-top">
                      <div className="dynamic-icon-wrapper">
                        <ChevronDown size={16} />
                      </div>
                      <span className="dynamic-title">{qrCategory === 'dynamic' ? 'Dynamic QR' : 'Static QR'}</span>
                      {qrCategory === 'dynamic' ? (
                        <Badge variant="success">with tracking</Badge>
                      ) : (
                        <Badge variant="outline" style={{ backgroundColor: '#fed7aa', color: '#c2410c', borderColor: 'transparent' }}>no tracking</Badge>
                      )}
                    </div>
                    <p className="dynamic-subtitle">
                      {qrCategory === 'dynamic' ? 'Update content in real time, without changing your code' : 'Reprint required when updating content'}
                    </p>
                  </div>

                  <div className="qr-type-grid">
                    {displayedTypes.map(type => (
                      <Card 
                        key={type.id} 
                        interactive 
                        className={`qr-type-card ${selectedType === type.id ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedType(type.id);
                          if (qrCategory === 'dynamic' && !dynamicId) {
                            setDynamicId(Math.random().toString(36).substring(2, 8));
                          }
                          setActiveStep(2);
                        }}
                      >
                        <div className="qr-card-content">
                          <div className="qr-icon-wrapper">
                            <type.icon size={24} className="qr-icon-inner" />
                          </div>
                          <div className="qr-card-text">
                            <div className="qr-card-title-row">
                              <span className="qr-card-title">{type.name}</span>
                              {type.badge && <Badge variant="outline" className="qr-card-badge">{type.badge}</Badge>}
                            </div>
                            <span className="qr-card-desc">{type.desc}</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {!showAllTypes && qrTypes.length > 10 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-6)' }}>
                      <Button variant="outline" onClick={() => setShowAllTypes(true)} rightIcon={<ChevronDown size={16} />}>
                        View More Types
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {activeStep === 2 && selectedType && (
            <div className="animate-fade-in">
              
              <div className="form-container" style={{ backgroundColor: 'var(--bg-card)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                <div style={{ marginBottom: 'var(--space-6)' }}>
                  <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, display: 'block', marginBottom: '8px' }}>QR Code Name (Optional)</label>
                  <input 
                    type="text" 
                    value={qrName} 
                    onChange={e => setQrName(e.target.value)} 
                    placeholder="e.g. Summer Campaign"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', fontSize: '15px', outline: 'none' }}
                  />
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>This name will only appear in your dashboard to help you organize.</p>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0 -var(--space-6) var(--space-6)' }} />
                
                <QrForms typeId={selectedType} data={qrData} onChange={setQrData} />
              </div>

              <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={() => setActiveStep(3)}>Customize Design &rarr;</Button>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="animate-fade-in">
              
              <div className="form-container">
                 <QrDesign design={qrDesign} onChange={setQrDesign} />
              </div>
              
              <div className="builder-actions-footer" style={{ marginTop: 'var(--space-8)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Button variant="ghost" style={{ color: 'var(--danger)' }} onClick={handleDiscard}>
                    Discard
                  </Button>
                  
                  <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                    <Button 
                      variant="outline" 
                      onClick={() => handleSave(true)}
                    >
                      Save to Dashboard
                    </Button>
                    <div className="dropdown-wrapper">
                      <Button leftIcon={<Download size={16} />} rightIcon={<ChevronDown size={16} />}>
                        Download
                      </Button>
                      <div className="dropdown-menu">
                        <button className="dropdown-item" onClick={() => handleDownload('png')}>PNG Format</button>
                        <button className="dropdown-item" onClick={() => handleDownload('jpeg')}>JPEG Format</button>
                        <button className="dropdown-item" onClick={() => handleDownload('svg')}>SVG Format (Vector)</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        

      </div>

      {/* Right Preview Panel - Only show after a type is selected */}
      {activeStep > 1 && (
        <div className={`builder-preview ${activeStep === 3 ? 'is-step-3' : ''}`}>
          <div className="preview-container">
            <div className="preview-header">
              <span>Preview</span>
            </div>
            
            {(() => {
              const mobileTypes = ['apps', 'whatsapp', 'instagram', 'facebook', 'telegram', 'sms', 'phone', 'vcard', 'youtube'];
              const browserTypes = ['url', 'custom-url', 'booking', 'map'];
              
              let mockupType = 'card';
              if (selectedType && mobileTypes.includes(selectedType)) mockupType = 'mobile';
              if (selectedType && browserTypes.includes(selectedType)) mockupType = 'browser';

              return (
                <div className={`mockup-wrapper mockup-${mockupType}`}>
                  {mockupType === 'mobile' && <div className="phone-notch"></div>}
                  
                  {mockupType === 'browser' && (
                    <div className="browser-header">
                      <div className="browser-dots">
                        <span className="browser-dot close"></span>
                        <span className="browser-dot minimize"></span>
                        <span className="browser-dot maximize"></span>
                      </div>
                      <div className="browser-url-bar">{qrData.url || 'example.com'}</div>
                    </div>
                  )}

                  <div className="mockup-screen">
                    {activeStep >= 2 && Object.keys(qrData).length > 0 ? (
                      <div className="qr-render-container">
                         <div ref={qrRef} />
                      </div>
                    ) : (
                      <div className="qr-placeholder">
                        <div className="qr-placeholder-icon"></div>
                      </div>
                    )}
                    {activeStep >= 2 && Object.keys(qrData).length > 0 && (
                       <div className="raw-data-preview" style={{ marginTop: '20px', padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', fontSize: '12px', wordBreak: 'break-all', width: '100%', border: '1px solid var(--border-color)' }}>
                          <h3 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-primary)' }}>Raw Data Preview</h3>
                          {Object.entries(qrData).map(([k, v]) => (
                             <div key={k} style={{ marginBottom: '4px', display: 'flex', flexDirection: 'column' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>{k}</span> 
                                <span style={{ fontWeight: 500 }}>{String(v) || '-'}</span>
                             </div>
                          ))}
                       </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Inline Auth Modal */}
      {isLoginModalOpen && createPortal(
        <div className="modal-backdrop" style={{ zIndex: 9999 }}>
          <Card className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Account Required</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsLoginModalOpen(false)}>
                <X size={20} />
              </Button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                You need a free account to download and save your QR codes so you can track them later.
              </p>
              
              <Button 
                variant="outline" 
                onClick={async () => {
                  await loginWithGoogle();
                  setIsLoginModalOpen(false);
                }} 
                style={{ width: '100%', marginBottom: '16px' }}
                leftIcon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.81 15.71 17.6V20.35H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                    <path d="M12 23C14.97 23 17.46 22.02 19.28 20.35L15.71 17.6C14.73 18.26 13.47 18.65 12 18.65C9.16 18.65 6.75 16.73 5.88 14.17H2.21V17.02C4.01 20.59 7.7 23 12 23Z" fill="#34A853"/>
                    <path d="M5.88 14.17C5.66 13.51 5.53 12.78 5.53 12C5.53 11.22 5.66 10.49 5.88 9.83V6.98H2.21C1.47 8.46 1.04 10.17 1.04 12C1.04 13.83 1.47 15.54 2.21 17.02L5.88 14.17Z" fill="#FBBC05"/>
                    <path d="M12 5.38C13.61 5.38 15.06 5.94 16.2 7.02L19.35 3.87C17.45 2.11 14.97 1 12 1C7.7 1 4.01 3.41 2.21 6.98L5.88 9.83C6.75 7.27 9.16 5.38 12 5.38Z" fill="#EA4335"/>
                  </svg>
                }
              >
                Continue with Google
              </Button>

              <div style={{ textAlign: 'center', fontSize: '14px' }}>
                or <a href="#" onClick={(e) => { e.preventDefault(); navigate('/signup'); }} style={{ color: 'var(--primary-btn-bg)', fontWeight: 600, textDecoration: 'none' }}>sign up with email</a>
              </div>
            </div>
          </Card>
        </div>,
        document.body
      )}

      {/* Success Modal */}
      {showSuccessModal && createPortal(
        <div className="modal-backdrop" style={{ zIndex: 9999 }}>
          <Card className="modal-content" style={{ maxWidth: '340px', padding: 0, overflow: 'hidden' }}>
            <div style={{ height: '4px', width: '100%', background: 'linear-gradient(to right, #22c55e, #10b981)' }}></div>
            
            <div style={{ padding: '32px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ 
                width: '56px', height: '56px', 
                backgroundColor: 'rgba(34, 197, 94, 0.1)', 
                color: 'var(--success)', 
                borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                marginBottom: '20px',
                boxShadow: '0 0 0 8px rgba(34, 197, 94, 0.05)'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
                Saved Successfully!
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '28px', lineHeight: '1.5' }}>
                Your QR code is securely saved. You can track scans and manage it from your dashboard.
              </p>
              
              <div style={{ display: 'flex', width: '100%', gap: '12px' }}>
                <Button 
                  variant="outline" 
                  onClick={() => setShowSuccessModal(false)} 
                  style={{ flex: 1, borderRadius: 'var(--radius-md)' }}
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/');
                  }} 
                  style={{ flex: 1, backgroundColor: 'var(--success)', borderColor: 'var(--success)', borderRadius: 'var(--radius-md)' }}
                >
                  Dashboard
                </Button>
              </div>
            </div>
          </Card>
        </div>,
        document.body
      )}
    </div>
  );
};
