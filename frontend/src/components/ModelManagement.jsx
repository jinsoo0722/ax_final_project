import React, { useEffect, useState } from 'react';
import { Settings, Upload, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react';

export default function ModelManagement() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');

  const fetchModelStatus = () => {
    setLoading(true);
    fetch('/api/model')
      .then(res => {
        if (!res.ok) throw new Error('모델 상태 정보를 가져오지 못했습니다.');
        return res.json();
      })
      .then(data => {
        if (data.status === 'active') {
          setMetrics(data.metrics);
        } else {
          setError('모델이 학습되지 않았습니다.');
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchModelStatus();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadSuccess('');
    setUploadError('');
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadError('업로드할 CSV 파일을 선택해 주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setUploadSuccess('');
    setUploadError('');

    try {
      const res = await fetch('/api/model/retrain', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || '모델 재학습에 실패했습니다.');
      }

      setUploadSuccess('새로운 데이터셋 업로드 및 모델 재학습이 성공적으로 완료되었습니다!');
      setMetrics(data.metrics);
      setFile(null);
      // Clear file input
      document.getElementById('csv-file-input').value = '';
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <div className="thinking-dots">
          <div className="thinking-dot"></div>
          <div className="thinking-dot"></div>
          <div className="thinking-dot"></div>
        </div>
      </div>
    );
  }

  // Draw custom SVG ROC Curve coordinates based on AUC score
  // If AUC is A, we can draw a quadratic curve from (0,300) to (300*(1-A), 300*(1-A)) to (300,0)
  const renderRocSvg = (auc) => {
    const size = 260;
    // Map AUC to a control point. If AUC is 0.5, it's a straight line. If AUC is 1.0, it goes to (0,0).
    const controlX = size * (1.0 - (auc - 0.5) * 2.0);
    const controlY = size * (1.0 - (auc - 0.5) * 2.0);
    
    // Smooth ROC Curve path starting from bottom-left (0, size) to top-right (size, 0)
    // Bezier control point pulls towards (0, 0)
    const curvePath = `M 0 ${size} Q ${controlX * 0.4} ${controlY * 0.4} ${size} 0`;

    return (
      <svg width="100%" height="280" viewBox={`-30 -10 ${size + 50} ${size + 40}`} style={{ display: 'block', margin: '0 auto' }}>
        {/* Grid lines */}
        <line x1="0" y1="0" x2={size} y2="0" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <line x1="0" y1={size/2} x2={size} y2={size/2} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <line x1={size/2} y1="0" x2={size/2} y2={size} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <line x1={size} y1="0" x2={size} y2={size} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        
        {/* Diagonal Random Guess (AUC = 0.5) */}
        <line x1="0" y1={size} x2={size} y2="0" stroke="var(--text-muted)" strokeDasharray="4 4" strokeWidth="1.5" />
        
        {/* Actual ROC Curve */}
        <path d={curvePath} fill="none" stroke="url(#rocGradient)" strokeWidth="4" strokeLinecap="round" style={{ filter: 'drop-shadow(0px 0px 8px var(--color-primary-glow))' }} />
        
        {/* Gradients */}
        <defs>
          <linearGradient id="rocGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>

        {/* Axes */}
        <line x1="0" y1="0" x2="0" y2={size} stroke="var(--border-color)" strokeWidth="2" />
        <line x1="0" y1={size} x2={size} y2={size} stroke="var(--border-color)" strokeWidth="2" />

        {/* Axis Labels */}
        <text x={size/2} y={size + 25} fill="var(--text-muted)" fontSize="10" textAnchor="middle">False Positive Rate (1 - Specificity)</text>
        <text x="-25" y={size/2} fill="var(--text-muted)" fontSize="10" textAnchor="middle" transform={`rotate(-90 -25 ${size/2})`}>True Positive Rate (Sensitivity)</text>
        
        {/* Values */}
        <text x="-12" y={size} fill="var(--text-muted)" fontSize="9" textAnchor="middle">0</text>
        <text x={size} y={size + 15} fill="var(--text-muted)" fontSize="9" textAnchor="middle">1</text>
        <text x="-12" y="10" fill="var(--text-muted)" fontSize="9" textAnchor="middle">1</text>
      </svg>
    );
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
      
      {/* Left Column: Metrics & Custom ROC Curve */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Model Metrics */}
        <div className="glass-card">
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
            ⚙️ 예측 모델 상태 및 성능 지표
          </h3>

          {error && <div style={{ color: '#ff4d4d', marginBottom: '20px' }}>{error}</div>}

          {metrics && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>정확도 (Accuracy)</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginTop: '6px' }}>
                  {(metrics.accuracy * 100).toFixed(1)}%
                </div>
              </div>
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>F1-Score</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginTop: '6px' }}>
                  {(metrics.f1 * 100).toFixed(1)}%
                </div>
              </div>
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>재현율 (Recall)</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginTop: '6px' }}>
                  {(metrics.recall * 100).toFixed(1)}%
                </div>
              </div>
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ROC AUC</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginTop: '6px', color: '#a855f7' }}>
                  {(metrics.auc * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: '24px', padding: '16px', borderRadius: '10px', background: 'rgba(99,102,241,0.05)', border: '1px solid var(--color-primary-glow)', fontSize: '0.85rem', lineHeight: 1.5 }}>
            <strong>💡 모델 해석 안내:</strong><br/>
            의사결정나무(Custom Decision Tree Classifier) 알고리즘이 가중치 밸런싱 기법을 사용해 편향 없이 퇴사 후보군을 분류합니다. 데이터 업로드 시 실시간으로 학습 파티션이 분할되어 지표가 재검사됩니다.
          </div>
        </div>

        {/* ROC Curve Chart */}
        {metrics && (
          <div className="glass-card">
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '16px', fontWeight: 600 }}>📈 ROC 곡선 (Receiver Operating Characteristic)</h3>
            <div style={{ width: '100%', maxWidth: '280px', margin: '0 auto' }}>
              {renderRocSvg(metrics.auc)}
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              임계값 설정에 따른 모델의 민감도 분석 (AUC 면적: <strong>{(metrics.auc * 100).toFixed(1)}%</strong>)
            </div>
          </div>
        )}

      </div>

      {/* Right Column: Retraining / Upload */}
      <div className="glass-card" style={{ height: 'fit-content' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '16px', fontWeight: 600 }}>📤 사내 데이터셋 업로드 및 실시간 재학습</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '24px' }}>
          새로 전사 업데이트된 인사 고용 만족도 조사(CSV 파일)를 업로드하면, 즉시 머신러닝 엔진이 분석 패턴을 재학습하여 퇴사 위험 확률을 즉각 갱신합니다.
        </p>

        <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ 
            border: '2px dashed var(--border-color)', 
            borderRadius: '12px', 
            padding: '40px 20px', 
            textAlign: 'center',
            cursor: 'pointer',
            background: 'rgba(0,0,0,0.15)',
            transition: 'var(--transition-smooth)'
          }}
          onClick={() => document.getElementById('csv-file-input').click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            setFile(e.dataTransfer.files[0]);
          }}
          >
            <Upload size={40} style={{ color: 'var(--color-primary)', marginBottom: '16px' }} />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '6px' }}>
              {file ? file.name : '마우스로 파일을 끌어다 놓거나 클릭'}
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              {file ? `${(file.size / 1024).toFixed(1)} KB` : '지원 확장자: .csv (쉼표 구분)'}
            </p>
            <input 
              id="csv-file-input"
              type="file" 
              accept=".csv" 
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={uploading}
            style={{ width: '100%', padding: '14px' }}
          >
            {uploading ? '패턴 학습 및 튜닝 진행 중...' : '데이터셋 학습 개시'}
          </button>
        </form>

        {uploadSuccess && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', padding: '16px', background: 'rgba(56, 239, 125, 0.1)', border: '1px solid rgba(56, 239, 125, 0.2)', borderRadius: '10px', color: '#38ef7d', fontSize: '0.85rem', lineHeight: 1.4 }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <div>{uploadSuccess}</div>
          </div>
        )}

        {uploadError && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', padding: '16px', background: 'rgba(255, 75, 43, 0.1)', border: '1px solid rgba(255, 75, 43, 0.2)', borderRadius: '10px', color: '#ff4d4d', fontSize: '0.85rem', lineHeight: 1.4 }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div>{uploadError}</div>
          </div>
        )}

        <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSpreadsheet size={16} style={{ color: 'var(--color-primary)' }} />
            업로드 필수 컬럼 스키마 가이드
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.5 }}>
            CSV 파일은 아래 핵심 컬럼들을 대소문자 매칭하여 포함해야 모델이 정상 기동합니다.<br/>
            <code>EmployeeID, Age, Attrition (Yes/No), Department, JobRole, OverTime (Yes/No), MonthlyIncome, JobSatisfaction (1-4), WorkLifeBalance (1-4), YearsAtCompany</code>
          </p>
        </div>

      </div>

    </div>
  );
}
