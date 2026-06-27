import React from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface QrFormsProps {
  typeId: string;
  data: any;
  onChange: (data: any) => void;
}

const countryCodes = [
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+1', flag: '🇺🇸', name: 'USA/Canada' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
];

const PhoneInput = ({ value, countryCode, onChangePhone, onChangeCountry }: { value: string, countryCode: string, onChangePhone: (v: string) => void, onChangeCountry: (v: string) => void }) => (
  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
      <select 
        style={{ appearance: 'none', background: 'transparent', border: 'none', padding: '10px 12px', paddingRight: '32px', fontSize: '14px', outline: 'none', cursor: 'pointer', zIndex: 1, minWidth: '80px' }}
        value={countryCode || '+91'}
        onChange={e => onChangeCountry(e.target.value)}
      >
        {countryCodes.map(c => (
          <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
        ))}
      </select>
      <div style={{ position: 'absolute', right: '12px', pointerEvents: 'none', color: 'var(--text-muted)' }}>
        ▼
      </div>
    </div>
    <Input 
      type="tel" 
      placeholder="8870804037" 
      value={value || ''} 
      onChange={e => onChangePhone(e.target.value)} 
      className="flex-1"
    />
  </div>
);

export const QrForms: React.FC<QrFormsProps> = ({ typeId, data, onChange }) => {
  const handleChange = (key: string, value: string | boolean) => {
    onChange({ ...data, [key]: value });
  };

  switch (typeId) {
    case 'url':
    case 'custom-url':
    case 'youtube':
    case 'instagram':
    case 'facebook':
    case 'telegram':
    case 'booking':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Enter URL</label>
          <Input 
            type="url" 
            placeholder="https://example.com" 
            value={data.url || ''} 
            onChange={e => handleChange('url', e.target.value)} 
          />
        </div>
      );
    case 'text':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Enter Text</label>
          <textarea 
            style={{ width: '100%', minHeight: '120px', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical' }}
            placeholder="Type your message here..." 
            value={data.text || ''} 
            onChange={e => handleChange('text', e.target.value)} 
          />
        </div>
      );
    case 'phone':
    case 'whatsapp':
    case 'sms':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Phone Number</label>
          <PhoneInput 
            value={data.phone} 
            countryCode={data.countryCode} 
            onChangePhone={v => handleChange('phone', v)} 
            onChangeCountry={v => handleChange('countryCode', v)} 
          />
          {(typeId === 'whatsapp' || typeId === 'sms') && (
            <>
              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginTop: 'var(--space-2)' }}>Message (Optional)</label>
              <textarea 
                style={{ width: '100%', minHeight: '80px', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical' }}
                placeholder="Pre-filled message..." 
                value={data.message || ''} 
                onChange={e => handleChange('message', e.target.value)} 
              />
            </>
          )}
        </div>
      );
    case 'email':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Email Address</label>
          <Input type="email" placeholder="hello@example.com" value={data.email || ''} onChange={e => handleChange('email', e.target.value)} />
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Subject</label>
          <Input placeholder="Email Subject" value={data.subject || ''} onChange={e => handleChange('subject', e.target.value)} />
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Message</label>
          <textarea 
            style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical' }}
            value={data.body || ''} 
            onChange={e => handleChange('body', e.target.value)} 
          />
        </div>
      );
    case 'wifi':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Network Name (SSID)</label>
          <Input placeholder="MyWiFiNetwork" value={data.ssid || ''} onChange={e => handleChange('ssid', e.target.value)} />
          
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Password</label>
          <Input type="password" placeholder="••••••••" value={data.password || ''} onChange={e => handleChange('password', e.target.value)} />
          
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Encryption Type</label>
          <select 
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', fontSize: '14px', outline: 'none' }}
            value={data.encryption || 'WPA/WPA2'} 
            onChange={e => handleChange('encryption', e.target.value)}
          >
            <option value="WPA/WPA2">WPA/WPA2</option>
            <option value="WEP">WEP</option>
            <option value="nopass">None</option>
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
            <input type="checkbox" checked={data.hidden || false} onChange={e => handleChange('hidden', e.target.checked)} />
            Hidden Network
          </label>
        </div>
      );
    case 'vcard':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>First Name</label>
            <Input placeholder="John" value={data.firstName || ''} onChange={e => handleChange('firstName', e.target.value)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Last Name</label>
            <Input placeholder="Doe" value={data.lastName || ''} onChange={e => handleChange('lastName', e.target.value)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Company</label>
            <Input placeholder="Acme Inc." value={data.company || ''} onChange={e => handleChange('company', e.target.value)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Phone</label>
            <PhoneInput 
              value={data.phone} 
              countryCode={data.countryCode} 
              onChangePhone={v => handleChange('phone', v)} 
              onChangeCountry={v => handleChange('countryCode', v)} 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Email</label>
            <Input type="email" placeholder="john@example.com" value={data.email || ''} onChange={e => handleChange('email', e.target.value)} />
          </div>
        </div>
      );
    case 'map':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Location Address</label>
          <Input placeholder="1600 Amphitheatre Parkway, Mountain View, CA" value={data.address || ''} onChange={e => handleChange('address', e.target.value)} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: 'var(--space-4)', marginTop: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-muted)' }}>Latitude (Optional)</label>
              <Input placeholder="37.422" value={data.lat || ''} onChange={e => handleChange('lat', e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-muted)' }}>Longitude (Optional)</label>
              <Input placeholder="-122.084" value={data.lng || ''} onChange={e => handleChange('lng', e.target.value)} />
            </div>
          </div>
        </div>
      );
    case 'apps':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>App Store URL (iOS)</label>
          <Input placeholder="https://apps.apple.com/..." value={data.ios || ''} onChange={e => handleChange('ios', e.target.value)} />
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Google Play URL (Android)</label>
          <Input placeholder="https://play.google.com/..." value={data.android || ''} onChange={e => handleChange('android', e.target.value)} />
        </div>
      );
    case 'pdf':
    case 'image':
    case 'audio':
    case 'pptx':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '40px', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
              📁
            </div>
            <div>
              <p style={{ fontWeight: 500, marginBottom: '4px' }}>Click to upload or drag and drop</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Supported formats based on type. Max 20MB.</p>
            </div>
            <Button variant="outline" onClick={() => handleChange('fileUploaded', true)}>Select File</Button>
            {data.fileUploaded && <span style={{ color: 'var(--success-color)', fontSize: '14px', fontWeight: 500 }}>✓ File uploaded successfully</span>}
          </div>
        </div>
      );
    default:
      return (
        <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Configuration for this QR type is not available yet.
        </div>
      );
  }
};
