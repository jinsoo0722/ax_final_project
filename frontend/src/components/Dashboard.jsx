import React, { useEffect, useState } from 'react';
import { Users, AlertTriangle, TrendingUp, ShieldAlert, ArrowRight } from 'lucide-react';

export default function Dashboard({ onViewEmployee }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => {
        if (!res.ok) throw new Error('데이터를 불러오지 못했습니다.');
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
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <div className="thinking-dots">
          <div className="thinking-dot"></div>
          <div className="thinking-dot"></div>
          <div className="thinking-dot"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="glass-card" style={{ color: '#ff4d4d' }}>에러 발생: {error}</div>;
  }

  const { total_employees, avg_risk, high_risk_count, medium_risk_count, low_risk_count, dept_risk, top_risk_employees, feature_importances } = data;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="glass-card metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
            <Users size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">전체 직원 수</span>
            <span className="metric-value">{total_employees}명</span>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(255, 75, 43, 0.15)', color: '#ff4d4d' }}>
            <ShieldAlert size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">고위험군 직원</span>
            <span className="metric-value" style={{ color: '#ff4d4d' }}>{high_risk_count}명</span>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(247, 151, 30, 0.15)', color: '#ffb830' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">중위험군 직원</span>
            <span className="metric-value" style={{ color: '#ffb830' }}>{medium_risk_count}명</span>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(56, 239, 125, 0.15)', color: '#38ef7d' }}>
            <TrendingUp size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">평균 퇴사 위험도</span>
            <span className="metric-value">{(avg_risk * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Two Column Analytics section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        
        {/* Feature Importance Chart */}
        <div className="glass-card">
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '20px', fontWeight: 600 }}>🤖 머신러닝 분석: 핵심 퇴사 영향 요인</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {feature_importances.map((item, idx) => (
              <div key={item.feature} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 500 }}>{idx + 1}. {item.label}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{(item.importance * 100).toFixed(1)}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${item.importance * 350}%`, // scaled up for visual weight
                    maxWidth: '100%',
                    height: '100%', 
                    background: 'linear-gradient(to right, #6366f1, #a855f7)',
                    borderRadius: '4px' 
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Risk Chart */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '20px', fontWeight: 600 }}>🏢 부서별 평균 퇴사 위험도 및 고위험 비율</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {Object.entries(dept_risk).map(([dept, stats]) => (
                <div key={dept} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{dept}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ flexGrow: 1, height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '7px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ 
                        width: `${stats.avg_risk * 100}%`, 
                        height: '100%', 
                        background: 'linear-gradient(to right, #11998e, #38ef7d)',
                        borderRadius: '7px' 
                      }}></div>
                    </div>
                    <span style={{ fontSize: '0.85rem', width: '45px', textAlign: 'right', fontWeight: 500 }}>
                      {(stats.avg_risk * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    고위험군 직원 비율: <strong style={{ color: '#ff4d4d' }}>{stats.high_risk_pct.toFixed(1)}%</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top At-Risk Employees list */}
      <div className="glass-card">
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '20px', fontWeight: 600 }}>🚨 최우선 인사 조치 필요 직원 (Top 5 위험군)</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>사원 ID</th>
                <th>부서</th>
                <th>직무</th>
                <th>직무 만족도</th>
                <th>워라밸</th>
                <th>퇴사 위험 점수</th>
                <th>위험 등급</th>
                <th>상세 보기</th>
              </tr>
            </thead>
            <tbody>
              {top_risk_employees.map(emp => (
                <tr key={emp.EmployeeID}>
                  <td style={{ fontWeight: 600 }}>{emp.EmployeeID}</td>
                  <td>{emp.Department}</td>
                  <td>{emp.JobRole}</td>
                  <td>{emp.JobSatisfaction} / 4</td>
                  <td>{emp.WorkLifeBalance} / 4</td>
                  <td style={{ fontWeight: 700, color: emp.RiskLevel === 'High' ? '#ff4d4d' : '#ffb830' }}>
                    {(emp.RiskScore * 100).toFixed(1)}%
                  </td>
                  <td>
                    <span className={`badge badge-${emp.RiskLevel.toLowerCase()}`}>
                      {emp.RiskLevel === 'High' ? '고위험' : emp.RiskLevel === 'Medium' ? '중위험' : '저위험'}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => onViewEmployee(emp.EmployeeID)}
                      className="btn btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
