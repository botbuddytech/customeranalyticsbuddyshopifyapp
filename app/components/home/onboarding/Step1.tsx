import React, { useState } from 'react';
import { LinkIcon, CheckIcon, CircleCheckIcon, ShopifyIcon, ShieldIcon, LockIcon, ServerIcon } from './icons';

const Step1: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleConnect = () => {
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      setTimeout(onComplete, 1200);
    }, 2500);
  };

  return (
    <div style={{ textAlign: 'center', maxWidth: '576px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '24px', paddingBottom: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: '#F0FDF4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)', color: status === 'success' ? '#16A34A' : '#9CA3AF' }}>
          {status === 'success' ? (
            <CheckIcon />
          ) : (
            <LinkIcon />
          )}
        </div>
        <h2 style={{ fontSize: '30px', fontWeight: '800', color: '#202223', marginBottom: '16px' }}>Connect Your Store</h2>
        <p style={{ color: '#6B7280', fontSize: '18px', lineHeight: '1.75' }}>
          Unlock your store's true potential. We'll securely pull your sales, customer, and product data to build your dashboard.
        </p>
      </div>

      <div style={{ width: '100%', backgroundColor: '#F9FAFB', border: '2px dashed #E5E7EB', borderRadius: '16px', padding: '48px', transition: 'all 0.3s' }}>
        {status === 'idle' && (
          <button 
            onClick={handleConnect}
            style={{
              padding: '20px 40px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '20px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              margin: '0 auto',
              cursor: 'pointer',
              backgroundColor: '#008060',
              color: 'white',
              border: 'none',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <ShopifyIcon />
            Authorize Shopify App
          </button>
        )}

        {status === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', border: '4px solid #16A34A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '16px' }}></div>
            <p style={{ fontWeight: '700', color: '#374151' }}>Connecting to Shopify secure gateway...</p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#008060', animation: 'bounce 1s' }}>
            <div style={{ color: '#008060' }}>
              <CircleCheckIcon />
            </div>
            <p style={{ fontWeight: '700', fontSize: '20px', marginTop: '8px' }}>Connection Successful!</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '40px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '32px', opacity: 0.6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#16A34A' }}>
          <ShieldIcon />
          <span>SSL SECURED</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#16A34A' }}>
          <LockIcon />
          <span>GDPR COMPLIANT</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#16A34A' }}>
          <ServerIcon />
          <span>CLOUD SYNC</span>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default Step1;
