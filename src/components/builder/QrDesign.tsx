import React, { useState } from 'react';
import { ChevronDown, Palette, Maximize, Eye, Image as ImageIcon, Info, Upload } from 'lucide-react';
import { FaWhatsapp, FaYoutube, FaInstagram, FaFacebook, FaTelegramPlane, FaMapMarkerAlt, FaEnvelope, FaWifi, FaPaypal, FaBitcoin } from 'react-icons/fa';
import './QrDesign.css';

export interface QrDesignState {
  patternStyle: string;
  fgColor: string;
  bgColor: string;
  cornerBorderStyle: string;
  cornerCenterStyle: string;
  cornerFgColor: string;
  correctionLevel: 'L' | 'M' | 'Q' | 'H';
  logo: string | null;
}

interface QrDesignProps {
  design: QrDesignState;
  onChange: (design: QrDesignState) => void;
}

export const QrDesign: React.FC<QrDesignProps> = ({ design, onChange }) => {
  const [openAccordions, setOpenAccordions] = useState<string[]>(['style', 'corners', 'level', 'logo']);

  const toggleAccordion = (id: string) => {
    setOpenAccordions(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const updateDesign = (key: keyof QrDesignState, value: any) => {
    onChange({ ...design, [key]: value });
  };

  const Accordion = ({ id, icon: Icon, title, desc, children }: any) => {
    const isOpen = openAccordions.includes(id);
    return (
      <div className="design-accordion">
        <div className="design-accordion-header" onClick={() => toggleAccordion(id)}>
          <div className="accordion-title-group">
            <div className="accordion-icon-box">
              <Icon size={18} />
            </div>
            <div>
              <div className="accordion-title">{title}</div>
              <div className="accordion-desc">{desc}</div>
            </div>
          </div>
          <ChevronDown size={20} className={`accordion-chevron ${isOpen ? 'open' : ''}`} />
        </div>
        {isOpen && (
          <div className="design-accordion-body animate-fade-in">
            {children}
          </div>
        )}
      </div>
    );
  };

  const dotsStyles = ['square', 'dots', 'rounded', 'extra-rounded', 'classy', 'classy-rounded'];
  const cornerStyles = ['square', 'dot', 'extra-rounded'];
  const centerStyles = ['square', 'dot'];

  const predefinedLogos = [
    { id: 'whatsapp', icon: <FaWhatsapp color="#25D366" />, bg: '#fff', url: 'https://img.icons8.com/color/128/whatsapp--v1.png' },
    { id: 'instagram', icon: <FaInstagram color="#E1306C" />, bg: '#fff', url: 'https://img.icons8.com/color/128/instagram-new--v1.png' },
    { id: 'facebook', icon: <FaFacebook color="#1877F2" />, bg: '#fff', url: 'https://img.icons8.com/color/128/facebook-new.png' },
    { id: 'youtube', icon: <FaYoutube color="#FF0000" />, bg: '#fff', url: 'https://img.icons8.com/color/128/youtube-play.png' },
    { id: 'location', icon: <FaMapMarkerAlt color="#EA4335" />, bg: '#fff', url: 'https://img.icons8.com/color/128/marker--v1.png' },
    { id: 'wifi', icon: <FaWifi color="#111" />, bg: '#fff', url: 'https://img.icons8.com/ios-filled/128/wifi.png' },
    { id: 'mail', icon: <FaEnvelope color="#FBBC05" />, bg: '#fff', url: 'https://img.icons8.com/color/128/new-post.png' },
    { id: 'paypal', icon: <FaPaypal color="#00457C" />, bg: '#fff', url: 'https://img.icons8.com/color/128/paypal.png' },
    { id: 'bitcoin', icon: <FaBitcoin color="#F7931A" />, bg: '#fff', url: 'https://img.icons8.com/color/128/bitcoin--v1.png' },
  ];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateDesign('logo', url);
    }
  };

  return (
    <div className="qr-design-container">
      
      {/* QR Code Style */}
      <Accordion 
        id="style" 
        icon={Palette} 
        title="QR code style" 
        desc="Customize the central area of the QR code by combining shapes and colors."
      >
        <div className="design-grid">
          {dotsStyles.map((style) => (
            <div 
              key={style} 
              className={`design-grid-item ${design.patternStyle === style ? 'active' : ''}`}
              onClick={() => updateDesign('patternStyle', style)}
            >
              <div className="pattern-visual" style={{ 
                borderRadius: style === 'dots' || style === 'rounded' ? '50%' : (style === 'classy' || style === 'classy-rounded' ? '12px' : '0') 
              }}></div>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <Info size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--primary-btn-bg)' }} />
          <span><strong style={{ color: 'var(--primary-btn-bg)' }}>Remember!</strong> For the optimal reading of the QR code, you need to use high contrast colours. We recommend selecting a light and a dark colour for your QR code.</span>
        </div>

        <div className="color-picker-group">
          <div style={{ fontWeight: 600, fontSize: '14px' }}>Border and background</div>
          <div className="color-picker-row">
            <span className="color-picker-label">Foreground colour</span>
            <div className="color-input-wrapper">
              <span className="color-hex">{design.fgColor}</span>
              <input 
                type="color" 
                value={design.fgColor} 
                onChange={(e) => updateDesign('fgColor', e.target.value)} 
              />
            </div>
          </div>
          <div className="color-picker-row">
            <span className="color-picker-label">Background colour</span>
            <div className="color-input-wrapper">
              <span className="color-hex">{design.bgColor}</span>
              <input 
                type="color" 
                value={design.bgColor} 
                onChange={(e) => updateDesign('bgColor', e.target.value)} 
              />
            </div>
          </div>
        </div>
      </Accordion>

      {/* Corners */}
      <Accordion 
        id="corners" 
        icon={Maximize} 
        title="Corners" 
        desc="Modify the shape and color of the corners for a unique finish."
      >
        <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Border style</div>
        <div className="design-grid" style={{ marginBottom: '16px' }}>
          {cornerStyles.map((corner) => (
            <div 
              key={corner} 
              className={`design-grid-item ${design.cornerBorderStyle === corner ? 'active' : ''}`}
              onClick={() => updateDesign('cornerBorderStyle', corner)}
            >
              <div className={`corner-visual ${corner === 'dot' ? 'corner-circle' : (corner === 'extra-rounded' ? 'corner-rounded' : 'corner-square')}`}></div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Center style</div>
        <div className="design-grid">
          {centerStyles.map((center) => (
            <div 
              key={center} 
              className={`design-grid-item ${design.cornerCenterStyle === center ? 'active' : ''}`}
              onClick={() => updateDesign('cornerCenterStyle', center)}
            >
               <div className={`center-visual ${center === 'dot' ? 'center-circle' : 'center-square'}`}></div>
            </div>
          ))}
        </div>
      </Accordion>

      {/* Correction Level */}
      <Accordion 
        id="level" 
        icon={Eye} 
        title="Correction Level" 
        desc="Ensures a reliable reading by compensating for damage or distortion."
      >
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          <Info size={16} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
          <span>Choosing a higher level improves readability, although it may increase the size of the QR code.</span>
        </div>

        <div className="level-grid">
          {[
            { id: 'L', name: 'Level L', desc: '7%' },
            { id: 'M', name: 'Level M', desc: '15%' },
            { id: 'Q', name: 'Level Q', desc: '25%' },
            { id: 'H', name: 'Level H', desc: '30%' }
          ].map(level => (
            <div 
              key={level.id} 
              className={`level-card ${design.correctionLevel === level.id ? 'active' : ''}`}
              onClick={() => updateDesign('correctionLevel', level.id)}
            >
              <div className={`level-title ${design.correctionLevel === level.id ? 'active' : ''}`}>{level.name}</div>
              <div className="level-desc">{level.desc}</div>
            </div>
          ))}
        </div>
      </Accordion>

      {/* Add Logo */}
      <Accordion 
        id="logo" 
        icon={ImageIcon} 
        title="Add logo" 
        desc="Add a central logo by uploading your image or choosing one of our designs."
      >
        <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px' }}>Select a logo</div>
        
        <div className="logo-grid">
          <div 
            className={`logo-item logo-item-none ${!design.logo ? 'active' : ''}`}
            onClick={() => updateDesign('logo', null)}
          >
             Ø
          </div>
          {predefinedLogos.map(logo => (
            <div 
              key={logo.id} 
              className={`logo-item ${design.logo === logo.url ? 'active' : ''}`}
              style={{ backgroundColor: logo.bg }}
              onClick={() => updateDesign('logo', logo.url)}
            >
              {logo.icon}
            </div>
          ))}
        </div>
        
        <label style={{ 
          marginTop: '16px', 
          border: '1px dashed var(--border-color)', 
          padding: '16px', 
          borderRadius: '8px', 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          fontWeight: 500,
          backgroundColor: 'var(--bg-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={16} /> Upload your logo
          </div>
          <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '12px' }}>(JPG, JPEG, or PNG / 2MB max)</span>
          <input type="file" accept="image/png, image/jpeg" style={{ display: 'none' }} onChange={handleLogoUpload} />
        </label>
      </Accordion>

    </div>
  );
};
