import React, { useState } from 'react';
import { ChevronDown, Palette, Maximize, Eye, Image as ImageIcon, Info } from 'lucide-react';
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

  const dummyStyles = Array.from({ length: 14 }).map((_, i) => `style-${i}`);
  const dummyCorners = Array.from({ length: 14 }).map((_, i) => `corner-${i}`);
  const dummyCenters = Array.from({ length: 11 }).map((_, i) => `center-${i}`);

  const predefinedLogos = [
    { id: 'whatsapp', icon: <FaWhatsapp color="#25D366" />, bg: '#fff' },
    { id: 'instagram', icon: <FaInstagram color="#E1306C" />, bg: '#fff' },
    { id: 'facebook', icon: <FaFacebook color="#1877F2" />, bg: '#fff' },
    { id: 'youtube', icon: <FaYoutube color="#FF0000" />, bg: '#fff' },
    { id: 'location', icon: <FaMapMarkerAlt color="#EA4335" />, bg: '#fff' },
    { id: 'wifi', icon: <FaWifi color="#111" />, bg: '#fff' },
    { id: 'mail', icon: <FaEnvelope color="#FBBC05" />, bg: '#fff' },
    { id: 'paypal', icon: <FaPaypal color="#00457C" />, bg: '#fff' },
    { id: 'bitcoin', icon: <FaBitcoin color="#F7931A" />, bg: '#fff' },
  ];

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
          {dummyStyles.map((style, idx) => (
            <div 
              key={idx} 
              className={`design-grid-item ${design.patternStyle === style || (idx===0 && design.patternStyle==='squares') ? 'active' : ''}`}
              onClick={() => updateDesign('patternStyle', style)}
            >
              <div className="pattern-visual" style={{ 
                borderRadius: idx === 1 ? '50%' : (idx % 3 === 0 ? '4px' : '0') 
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
          {dummyCorners.map((corner, idx) => (
            <div 
              key={idx} 
              className={`design-grid-item ${design.cornerBorderStyle === corner || (idx===0 && design.cornerBorderStyle==='square') ? 'active' : ''}`}
              onClick={() => updateDesign('cornerBorderStyle', corner)}
            >
              <div className={`corner-visual ${idx % 2 !== 0 ? 'corner-rounded' : 'corner-square'}`}></div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Center style</div>
        <div className="design-grid">
          {dummyCenters.map((center, idx) => (
            <div 
              key={idx} 
              className={`design-grid-item ${design.cornerCenterStyle === center || (idx===0 && design.cornerCenterStyle==='square') ? 'active' : ''}`}
              onClick={() => updateDesign('cornerCenterStyle', center)}
            >
               <div className={`center-visual ${idx % 2 !== 0 ? 'center-circle' : 'center-square'}`}></div>
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
              className={`logo-item ${design.logo === logo.id ? 'active' : ''}`}
              style={{ backgroundColor: logo.bg }}
              onClick={() => updateDesign('logo', logo.id)}
            >
              {logo.icon}
            </div>
          ))}
        </div>
        
        <div style={{ 
          marginTop: '16px', 
          border: '1px dashed var(--border-color)', 
          padding: '16px', 
          borderRadius: '8px', 
          textAlign: 'center',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          fontWeight: 500,
          backgroundColor: 'var(--bg-secondary)'
        }}>
          Upload your logo <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '12px' }}>(JPG, JPEG, or PNG / 2MB max)</span>
        </div>
      </Accordion>

    </div>
  );
};
