import React from 'react';
import { PlayIcon, BoltIcon, XMarkIcon, CheckIcon } from './icons';

interface Step2Props {
  onComplete: () => void;
}

const Step2: React.FC<Step2Props> = ({ onComplete }) => {
  return (
    <div style={{ paddingTop: '8px', paddingBottom: '8px' }}>
      {/* Dummy Video Section */}
      <div style={{ marginBottom: '32px', width: '100%', maxWidth: '672px', marginLeft: 'auto', marginRight: 'auto' }}>
        <div style={{ position: 'relative', aspectRatio: '16/9', backgroundColor: '#202223', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', cursor: 'pointer', border: '4px solid white' }}>
          <video 
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
            autoPlay 
            loop 
            muted 
            playsInline
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-animation-of-a-futuristic-city-with-neon-lights-40143-large.mp4" type="video/mp4" />
          </video>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '24px' }}>
            <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(12px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', transition: 'transform 0.3s' }}>
              <PlayIcon />
            </div>
            <p style={{ fontWeight: '700', fontSize: '18px', textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}>See Customer Analytics Pro in Action</p>
            <p style={{ fontSize: '14px', opacity: 0.8, textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}>1:24 • Product Walkthrough</p>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '6px', backgroundColor: 'rgba(107, 114, 128, 0.5)' }}>
            <div style={{ height: '100%', backgroundColor: '#008060', width: '33.33%' }}></div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Upgrade for Lifetime Analytics</h2>
        <p style={{ color: '#4B5563' }}>Get access to your complete store history and unlock predictive insights.</p>
      </div>

      <div style={{ overflow: 'hidden', border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: 'white', marginBottom: '32px', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#F9FAFB' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontWeight: '700', color: '#374151' }}>Features</th>
              <th style={{ padding: '16px 24px', fontWeight: '700', color: '#6B7280' }}>Free</th>
              <th style={{ padding: '16px 24px', fontWeight: '700', color: '#008060', backgroundColor: '#F0FDF4' }}>Pro ✨</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: '14px' }}>
            <tr style={{ borderTop: '1px solid #F3F4F6' }}>
              <td style={{ padding: '16px 24px', color: '#374151', fontWeight: '500' }}>Data History</td>
              <td style={{ padding: '16px 24px', color: '#6B7280' }}>Last 60 days</td>
              <td style={{ padding: '16px 24px', color: '#374151', backgroundColor: 'rgba(240, 253, 244, 0.3)', fontWeight: '600' }}>Lifetime data</td>
            </tr>
            <tr style={{ borderTop: '1px solid #F3F4F6' }}>
              <td style={{ padding: '16px 24px', color: '#374151', fontWeight: '500' }}>AI Reports</td>
              <td style={{ padding: '16px 24px', color: '#6B7280' }}>1 per month</td>
              <td style={{ padding: '16px 24px', color: '#374151', backgroundColor: 'rgba(240, 253, 244, 0.3)', fontWeight: '600' }}>Unlimited</td>
            </tr>
            <tr style={{ borderTop: '1px solid #F3F4F6' }}>
              <td style={{ padding: '16px 24px', color: '#374151', fontWeight: '500' }}>Custom Segments</td>
              <td style={{ padding: '16px 24px', color: '#6B7280' }}>Basic</td>
              <td style={{ padding: '16px 24px', color: '#374151', backgroundColor: 'rgba(240, 253, 244, 0.3)', fontWeight: '600' }}>Advanced AI Sync</td>
            </tr>
            <tr style={{ borderTop: '1px solid #F3F4F6' }}>
              <td style={{ padding: '16px 24px', color: '#374151', fontWeight: '500' }}>Retention Tools</td>
              <td style={{ padding: '16px 24px', color: '#D1D5DB' }}>
                <XMarkIcon />
              </td>
              <td style={{ padding: '16px 24px', color: '#374151', backgroundColor: 'rgba(240, 253, 244, 0.3)' }}>
                <div style={{ color: '#16A34A', fontWeight: '700' }}>
                  <CheckIcon />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', justifyContent: 'center' }}>
        <button 
          onClick={() => {
            console.log('Action: Upgrade to Pro');
            onComplete();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 32px',
            backgroundColor: '#202223',
            color: 'white',
            borderRadius: '6px',
            fontWeight: '700',
            cursor: 'pointer',
            border: 'none',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#000000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#202223';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.95)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <BoltIcon />
          Upgrade to Pro - $19/mo
        </button>
        
        <button 
          onClick={onComplete}
          style={{
            padding: '12px 24px',
            color: '#6B7280',
            fontWeight: '600',
            cursor: 'pointer',
            border: 'none',
            backgroundColor: 'transparent',
            borderRadius: '6px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#1F2937';
            e.currentTarget.style.backgroundColor = '#F3F4F6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#6B7280';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
};

export default Step2;
