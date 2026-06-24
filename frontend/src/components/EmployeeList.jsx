import React, { useEffect, useState } from 'react';
import { Search, Filter, ArrowRight } from 'lucide-react';

export default function EmployeeList({ onViewEmployee }) {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmployees = () => {
    setLoading(true);
    let url = `/api/employees?`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (selectedDept) url += `dept=${encodeURIComponent(selectedDept)}&`;
    if (selectedRole) url += `role=${encodeURIComponent(selectedRole)}&`;
    if (selectedLevel) url += `level=${encodeURIComponent(selectedLevel)}&`;

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('직원 목록을 가져오지 못했습니다.');
        return res.json();
      })
      .then(data => {
        setEmployees(data.employees);
        setDepartments(data.departments);
        setRoles(data.roles);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEmployees();
  }, [selectedDept, selectedRole, selectedLevel]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEmployees();
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedDept('');
    setSelectedRole('');
    setSelectedLevel('');
    // Trigger fetch by reset
    setTimeout(() => {
      fetch('/api/employees')
        .then(res => res.json())
        .then(data => {
          setEmployees(data.employees);
        });
    }, 50);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Search and Filters Glass Card */}
      <div className="glass-card">
        <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) 120px', gap: '16px', alignItems: 'end' }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">검색 (사원 ID / 직무)</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="사원 ID 또는 직무 입력..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '40px', width: '100%' }}
              />
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">부서 필터</label>
            <select 
              className="form-input" 
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              style={{ width: '100%', background: '#0e1424' }}
            >
              <option value="">모든 부서</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">직무 필터</label>
            <select 
              className="form-input" 
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              style={{ width: '100%', background: '#0e1424' }}
            >
              <option value="">모든 직무</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">퇴사 위험도 필터</label>
            <select 
              className="form-input" 
              value={selectedLevel}
              onChange={e => setSelectedLevel(e.target.value)}
              style={{ width: '100%', background: '#0e1424' }}
            >
              <option value="">모든 위험도</option>
              <option value="High">고위험 (60% 이상)</option>
              <option value="Medium">중위험 (30% ~ 60%)</option>
              <option value="Low">저위험 (30% 미만)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn btn-primary" style={{ flexGrow: 1, padding: '12px 16px' }}>
              검색
            </button>
            <button type="button" onClick={clearFilters} className="btn btn-secondary" style={{ padding: '12px' }}>
              초기화
            </button>
          </div>

        </form>
      </div>

      {/* Directory Table Card */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>📋 직원 인사 정보 디렉토리 ({employees.length}명 조회됨)</h3>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
            <div className="thinking-dots">
              <div className="thinking-dot"></div>
              <div className="thinking-dot"></div>
              <div className="thinking-dot"></div>
            </div>
          </div>
        ) : error ? (
          <div style={{ color: '#ff4d4d', padding: '20px', textAlign: 'center' }}>{error}</div>
        ) : employees.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', padding: '50px 0', textAlign: 'center' }}>검색 조건에 맞는 직원이 없습니다.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>사원 ID</th>
                  <th>성별 / 나이</th>
                  <th>부서</th>
                  <th>직무</th>
                  <th>월 소득</th>
                  <th>근속 년수</th>
                  <th>퇴사 위험도</th>
                  <th>위험 등급</th>
                  <th>AX 분석</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.EmployeeID}>
                    <td style={{ fontWeight: 600 }}>{emp.EmployeeID}</td>
                    <td>{emp.Gender} / {emp.Age}세</td>
                    <td>{emp.Department}</td>
                    <td>{emp.JobRole}</td>
                    <td>${emp.MonthlyIncome.toLocaleString()}</td>
                    <td>{emp.YearsAtCompany}년</td>
                    <td style={{ fontWeight: 700, color: emp.RiskLevel === 'High' ? '#ff4d4d' : emp.RiskLevel === 'Medium' ? '#ffb830' : '#38ef7d' }}>
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
                        className="btn btn-primary"
                        style={{ padding: '8px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        분석 개시
                        <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
