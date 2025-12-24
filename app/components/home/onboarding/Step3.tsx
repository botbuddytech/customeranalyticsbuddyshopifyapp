import React, { useState } from 'react';
import { MagicWandIcon, InfoIcon, RobotIcon, CommentDotsIcon } from './icons';

const Step3: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  const questions = [
    "analyse my store data and give me a analysis report"
  ];

  const generateAIInsight = async (prompt: string) => {
    setLoading(true);
    setSelectedQuestion(prompt);
    try {
      // Mock AI response for now - can be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setInsight("Based on your store profile, we've identified a 12% growth opportunity in your 'Repeat Buyer' segment over the last 90 days. We recommend targeting them with a personalized loyalty offer.");
    } catch (error) {
      console.error("AI Error:", error);
      setInsight("Based on your store profile, we've identified a 12% growth opportunity in your 'Repeat Buyer' segment over the last 90 days. We recommend targeting them with a personalized loyalty offer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', height: '100%' }}>
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#202223', marginBottom: '8px' }}>AI Analytics Assistant</h2>
          <p style={{ color: '#4B5563' }}>Interact with your data through natural language. Our AI buddies transform complex sheets into actionable growth plans.</p>
        </div>
        
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Available Queries</p>
          {questions.map((q, idx) => (
            <button 
              key={idx}
              onClick={() => generateAIInsight(q)}
              disabled={loading}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px 16px',
                border: '1px solid',
                borderRadius: '8px',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                backgroundColor: selectedQuestion === q ? '#F0FDF4' : 'white',
                borderColor: selectedQuestion === q ? '#008060' : '#E5E7EB',
              }}
              onMouseEnter={(e) => {
                if (!loading && selectedQuestion !== q) {
                  e.currentTarget.style.borderColor = '#9CA3AF';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && selectedQuestion !== q) {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                }
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: '500' }}>{q}</span>
              <div style={{ color: selectedQuestion === q ? '#008060' : '#D1D5DB' }}>
                <MagicWandIcon />
              </div>
            </button>
          ))}
        </div>

        <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div style={{ color: '#3B82F6', marginTop: '4px' }}>
            <InfoIcon />
          </div>
          <p style={{ fontSize: '14px', color: '#1E40AF' }}>
            <strong>Pro Tip:</strong> Click the analysis query to generate a real-time report based on your connected store data.
          </p>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ backgroundColor: '#202223', borderRadius: '8px 8px 0 0', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }}></div>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }}></div>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></div>
          </div>
          <span style={{ fontSize: '10px', color: '#9CA3AF', fontFamily: 'monospace', textTransform: 'uppercase' }}>AI_Terminal_v4.2</span>
        </div>
        
        <div style={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderTop: 'none', borderRadius: '0 0 8px 8px', flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: '300px' }}>
          {loading ? (
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <div style={{ width: '64px', height: '64px', border: '4px solid #D1FAE5', borderRadius: '50%' }}></div>
                <div style={{ width: '64px', height: '64px', border: '4px solid #008060', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', position: 'absolute', top: 0, left: 0 }}></div>
              </div>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#374151' }}>Crunching numbers...</p>
              <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>Processing 12,402 data points</p>
            </div>
          ) : insight ? (
            <div style={{ padding: '24px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ backgroundColor: '#D1FAE5', color: '#008060', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '16px', height: '16px' }}>
                    <RobotIcon />
                  </div>
                </div>
                <span style={{ fontSize: '14px', fontWeight: '700' }}>Insight Generated</span>
              </div>
              <div style={{ backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '4px', border: '1px solid #F3F4F6', fontSize: '14px', lineHeight: '1.75', color: '#374151', fontStyle: 'italic' }}>
                "{insight}"
              </div>
              <div style={{ marginTop: '24px' }}>
                <p style={{ fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '12px' }}>Key Metrics Involved</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '4px', padding: '12px', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}>
                    <p style={{ fontSize: '10px', color: '#6B7280' }}>LTV Estimate</p>
                    <p style={{ fontWeight: '700', fontSize: '18px', color: '#16A34A' }}>$412.50</p>
                  </div>
                  <div style={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '4px', padding: '12px', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}>
                    <p style={{ fontSize: '10px', color: '#6B7280' }}>Churn Risk</p>
                    <p style={{ fontWeight: '700', fontSize: '18px', color: '#EF4444' }}>Low</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center', opacity: 0.4 }}>
              <CommentDotsIcon />
              <p style={{ fontSize: '14px', fontWeight: '500', marginTop: '16px' }}>Select the analysis query to generate your report</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Step3;
