import React, { useEffect, useState } from 'react';
import { User, DollarSign, Calendar, Heart, Award, ArrowLeft, BrainCircuit } from 'lucide-react';

export default function EmployeeDetail({ employeeId, onBack, onOpenChat }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!employeeId) return;
    setLoading(true);
    fetch(`/api/employees/${employeeId}`)
      .then(res => {
        if (!res.ok) throw new Error('직원 정보를 가져오지 못했습니다.');
        return res.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [employeeId]);

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

  if (error) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#ff4d4d', marginBottom: '20px' }}>에러: {error}</p>
        <button onClick={onBack} className="btn btn-secondary">뒤로 가기</button>
      </div>
    );
  }

  const { employee_data, risk_analysis } = data;
  const { risk_score, risk_level, factors } = risk_analysis;

  // Helper to render stars/scores
  const renderScoreBar = (val, max = 4) => {
    const percentage = (val / max) * 100;
    let color = 'var(--color-primary)';
    if (val <= 2) color = '#ffb830';
    if (val === 1) color = '#ff4d4d';
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
        <div style={{ flexGrow: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: color, borderRadius: '3px' }}></div>
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, minWidth: '35px', textAlign: 'right' }}>{val} / {max}</span>
      </div>
    );
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Back button and actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onBack} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={16} />
          디렉토리로 돌아가기
        </button>
        
        <button 
          onClick={() => onOpenChat(employeeId)}
          className="btn btn-primary animate-pulse"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '12px 24px', fontSize: '0.95rem' }}
        >
          <BrainCircuit size={20} />
          AX AI 컨설팅 시작하기
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Column: Attrition Score Card & Employee profile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Risk Score summary */}
          <div className="glass-card" style={{ 
            textAlign: 'center', 
            position: 'relative', 
            overflow: 'hidden',
            border: `1px solid ${risk_level === 'High' ? 'rgba(255, 75, 43, 0.2)' : risk_level === 'Medium' ? 'rgba(247, 151, 30, 0.2)' : 'rgba(56, 239, 125, 0.2)'}`
          }}>
            {/* Background glow shadow */}
            <div style={{
              position: 'absolute',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: risk_level === 'High' ? 'var(--risk-high-glow)' : risk_level === 'Medium' ? 'var(--risk-med-glow)' : 'var(--risk-low-glow)',
              filter: 'blur(40px)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 0
            }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <span className="metric-label" style={{ fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>퇴사 예측 위험도</span>
              
              <div style={{ 
                fontFamily: 'var(--font-display)', 
                fontSize: '3.75rem', 
                fontWeight: 800,
                background: risk_level === 'High' ? 'linear-gradient(135deg, var(--risk-high-start), var(--risk-high-end))' : risk_level === 'Medium' ? 'linear-gradient(135deg, var(--risk-med-start), var(--risk-med-end))' : 'linear-gradient(135deg, var(--risk-low-start), var(--risk-low-end))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '10px'
              }}>
                {(risk_score * 100).toFixed(1)}%
              </div>

              <span className={`badge badge-${risk_level.toLowerCase()}`} style={{ fontSize: '0.9rem', padding: '6px 16px', borderRadius: '20px' }}>
                {risk_level === 'High' ? '고위험군 대상자' : risk_level === 'Medium' ? '중위험군 관리대상' : '안정군 (저위험)'}
              </span>
              
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '20px', lineHeight: 1.5 }}>
                머신러닝 모델이 분석한 이탈 가능성 수치입니다. 인사 부서의 즉각적인 개별 면담 및 케어가 권장됩니다.
              </p>
            </div>
          </div>

          {/* Profile Overview */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
                <User size={22} style={{ color: 'var(--color-primary)' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>사원 ID: {employee_data.EmployeeID}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{employee_data.Gender} / {employee_data.Age}세 / {employee_data.MaritalStatus}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>소속 부서</span>
                <span style={{ fontWeight: 500 }}>{employee_data.Department}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>수행 직무</span>
                <span style={{ fontWeight: 500 }}>{employee_data.JobRole}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>직무 레벨</span>
                <span style={{ fontWeight: 500 }}>Level {employee_data.JobLevel} / 5</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>월 급여 소득</span>
                <span style={{ fontWeight: 600, color: '#38ef7d' }}>${employee_data.MonthlyIncome.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>급여 인상률</span>
                <span style={{ fontWeight: 500 }}>{employee_data.PercentSalaryHike}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>야근 여부</span>
                <span style={{ fontWeight: 600, color: employee_data.OverTime === 'Yes' ? '#ff4d4d' : 'var(--text-muted)' }}>
                  {employee_data.OverTime === 'Yes' ? '야근 많음 (Yes)' : '야근 적음 (No)'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>출장 빈도</span>
                <span style={{ fontWeight: 500 }}>{employee_data.BusinessTravel === 'Travel_Frequently' ? '잦음' : employee_data.BusinessTravel === 'Travel_Rarely' ? '가끔' : '없음'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Risk Factors and Detailed Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* ML Contribution Factors */}
          <div className="glass-card">
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
              💡 머신러닝 탐지: 이탈 유발 주요 원인
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {factors.map((f, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  gap: '16px', 
                  padding: '16px', 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '12px' 
                }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '8px', 
                    background: f.impact === 'high' ? 'rgba(255,75,43,0.1)' : f.impact === 'medium' ? 'rgba(247,151,30,0.1)' : 'rgba(99,102,241,0.1)',
                    color: f.impact === 'high' ? '#ff4d4d' : f.impact === 'medium' ? '#ffb830' : 'var(--color-primary)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    flexShrink: 0
                  }}>
                    !
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '4px' }}>{f.label}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.4 }}>{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HR Satisfaction and Career metrics */}
          <div className="glass-card">
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '24px', fontWeight: 600 }}>📊 직원 만족도 및 인사 평가지표</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
              
              {/* Left section: Satisfactions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', color: 'var(--color-primary)' }}>만족도 서베이 (4점 만점)</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>직무 만족도</span>
                    {renderScoreBar(employee_data.JobSatisfaction)}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>근무 환경 만족도</span>
                    {renderScoreBar(employee_data.EnvironmentSatisfaction)}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>워라밸 만족도</span>
                    {renderScoreBar(employee_data.WorkLifeBalance)}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>동료 관계 만족도</span>
                    {renderScoreBar(employee_data.RelationshipSatisfaction)}
                  </div>
                </div>
              </div>

              {/* Right section: Tenure and Promotion */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', color: 'var(--color-primary)' }}>경력 및 승진 주기 정보</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>총 직장 경력</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{employee_data.TotalWorkingYears}년</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>사내 근속 년수</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{employee_data.YearsAtCompany}년</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>마지막 승진 경과</span>
                    <span style={{ 
                      fontSize: '0.85rem', 
                      fontWeight: 600,
                      color: employee_data.YearsSinceLastPromotion >= 4 ? '#ff4d4d' : 'var(--text-main)'
                    }}>
                      {employee_data.YearsSinceLastPromotion}년 전
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>현 매니저와 근무 기간</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{employee_data.YearsWithCurrManager}년</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>과거 거쳐온 회사 수</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{employee_data.NumCompaniesWorked}개사</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>인사 업무 몰입도</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{employee_data.JobInvolvement} / 4점</span>
                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
