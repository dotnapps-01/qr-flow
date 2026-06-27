import React, { useState, useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
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
  { id: 'pdf', name: 'PDF', desc: 'Show a PDF', icon: FileText },
  { id: 'image', name: 'Image', desc: 'Show an image gallery', icon: ImageIcon },
  { id: 'apps', name: 'Play Market / App Store', desc: 'Redirect to an app store', icon: Smartphone },
  { id: 'text', name: 'Text', desc: 'Display plain text', icon: AlignLeft },
  { id: 'whatsapp', name: 'WhatsApp', desc: 'Send a WhatsApp message', icon: FaWhatsapp },
  { id: 'youtube', name: 'YouTube', desc: 'Open a YouTube video', icon: FaYoutube },
  { id: 'instagram', name: 'Instagram', desc: 'Open an Instagram profile', icon: FaInstagram },
  { id: 'vcard', name: 'vCard', desc: 'Share contact details', icon: Users },
  { id: 'map', name: 'Map', desc: 'Show a location on a map', icon: MapPin },
  { id: 'wifi', name: 'Wi-Fi', desc: 'Connect to a Wi-Fi network', icon: Wifi },
  { id: 'audio', name: 'Audio', desc: 'Play an audio file', icon: Music },
  { id: 'facebook', name: 'Facebook', desc: 'Open a Facebook page', icon: FaFacebook },
  { id: 'telegram', name: 'Telegram', desc: 'Open a Telegram channel', icon: FaTelegramPlane },
  { id: 'email', name: 'E-mail', desc: 'Send an email', icon: Mail },
  { id: 'booking', name: 'Booking', desc: 'Link to a booking page', icon: CalendarCheck },
  { id: 'phone', name: 'Phone Call', desc: 'Initiate a phone call', icon: Phone },
  { id: 'pptx', name: 'PPTX', desc: 'Share a PowerPoint presentation', icon: Presentation },
  { id: 'custom-url', name: 'Custom URL', desc: 'Create a custom URL', icon: Link2 },
  { id: 'sms', name: 'SMS', desc: 'Send a text message', icon: MessageSquare },
];

export const Builder: React.FC = () => {
  const [showAllTypes, setShowAllTypes] = useState(false);
  const [qrCategory, setQrCategory] = useState<'dynamic' | 'static' | null>(null);
  
  const [activeStep, setActiveStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [qrData, setQrData] = useState<any>({});
  const qrRef = useRef<HTMLDivElement>(null);
  
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
    
    switch (selectedType) {
      case 'url':
      case 'custom-url':
      case 'booking':
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
      image: qrDesign.logo || ''
    });
  }, [qrCode, qrString, qrDesign]);

  return (
    <div className="builder-layout animate-fade-in">
      {/* Left Configuration Panel */}
      <div className="builder-config">
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

        <div className="builder-content">
          {activeStep === 1 && (
            <>
              <h1 className="builder-title">Select a QR type</h1>
              
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
                <div>
                  <h1 className="builder-title" style={{ margin: 0 }}>Configure Content</h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Fill out the details for your {qrTypes.find(t => t.id === selectedType)?.name} QR code</p>
                </div>
                <Button variant="outline" onClick={() => setActiveStep(1)}>Change Type</Button>
              </div>
              
              <div className="form-container" style={{ backgroundColor: 'var(--bg-card)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                <QrForms typeId={selectedType} data={qrData} onChange={setQrData} />
              </div>

              <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={() => setActiveStep(3)}>Customize Design &rarr;</Button>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
                <div>
                  <h1 className="builder-title" style={{ margin: 0 }}>QR Design</h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Customize the style, colors, and logo of your QR code</p>
                </div>
                <Button variant="outline" onClick={() => setActiveStep(2)}>Back to Content</Button>
              </div>
              
              <div className="form-container">
                 <QrDesign design={qrDesign} onChange={setQrDesign} />
              </div>
              
              <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end' }}>
                <Button>Finish & Download</Button>
              </div>
            </div>
          )}
        </div>
        

      </div>

      {/* Right Preview Panel - Only show after a type is selected */}
      {activeStep > 1 && (
        <div className="builder-preview">
          <div className="preview-container">
            <div className="preview-header">
              <span>Example</span>
            </div>
            <div className="phone-mockup">
              <div className="phone-screen">
                <div className="phone-notch"></div>
                {activeStep >= 2 && Object.keys(qrData).length > 0 ? (
                  <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <div ref={qrRef} />
                  </div>
                ) : (
                  <div className="qr-placeholder">
                    <div className="qr-placeholder-icon"></div>
                  </div>
                )}
                {activeStep >= 2 && Object.keys(qrData).length > 0 && (
                   <div style={{ marginTop: '20px', padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', fontSize: '12px', wordBreak: 'break-all', width: '100%', border: '1px solid var(--border-color)' }}>
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
          </div>
        </div>
      )}
    </div>
  );
};
