import { useState } from 'react'
import { BarChart3, Users, Settings, LogOut } from 'lucide-react'
import Dashboard from './components/Dashboard'
import EmployeeList from './components/EmployeeList'
import EmployeeDetail from './components/EmployeeDetail'
import Chatbot from './components/Chatbot'
import ModelManagement from './components/ModelManagement'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null)
  const [isChatOpen, setIsChatOpen] = useState(false)

  const handleViewEmployee = (empId) => {
    setSelectedEmployeeId(empId)
    setCurrentView('detail')
  }

  const handleOpenChat = (empId) => {
    setSelectedEmployeeId(empId)
    setIsChatOpen(true)
  }

  const handleBack = () => {
    setCurrentView('list')
    setSelectedEmployeeId(null)
  }

  const renderView = () => {
    switch(currentView) {
      case 'dashboard':
        return <Dashboard onViewEmployee={handleViewEmployee} />
      case 'list':
        return <EmployeeList onViewEmployee={handleViewEmployee} />
      case 'detail':
        return selectedEmployeeId ? <EmployeeDetail employeeId={selectedEmployeeId} onBack={handleBack} onOpenChat={handleOpenChat} /> : null
      case 'model':
        return <ModelManagement />
      default:
        return <Dashboard onViewEmployee={handleViewEmployee} />
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-main)' }}>
      {/* Sidebar */}
      <div style={{
        width: '240px',
        background: 'linear-gradient(180deg, rgba(14,20,36,0.8), rgba(14,20,36,0.6))',
        borderRight: '1px solid var(--border-color)',
        padding: '32px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        overflowY: 'auto'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <h1 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)' }}>🤖 AX 어드바이저</h1>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>이직 위험 분석 시스템</p>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => { setCurrentView('dashboard'); setSelectedEmployeeId(null); }}
            className={currentView === 'dashboard' ? 'nav-btn active' : 'nav-btn'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '10px',
              background: currentView === 'dashboard' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: currentView === 'dashboard' ? 'var(--color-primary)' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
              transition: 'all 0.3s ease'
            }}
          >
            <BarChart3 size={18} />
            대시보드
          </button>
          <button
            onClick={() => { setCurrentView('list'); setSelectedEmployeeId(null); }}
            className={currentView === 'list' ? 'nav-btn active' : 'nav-btn'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '10px',
              background: currentView === 'list' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: currentView === 'list' ? 'var(--color-primary)' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
              transition: 'all 0.3s ease'
            }}
          >
            <Users size={18} />
            직원 디렉토리
          </button>
          <button
            onClick={() => setCurrentView('model')}
            className={currentView === 'model' ? 'nav-btn active' : 'nav-btn'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '10px',
              background: currentView === 'model' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: currentView === 'model' ? 'var(--color-primary)' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
              transition: 'all 0.3s ease'
            }}
          >
            <Settings size={18} />
            모델 관리
          </button>
        </nav>

        {/* Footer */}
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <button
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'transparent',
              color: 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#ff4d4d'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
          >
            <LogOut size={18} />
            로그아웃
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{
          borderBottom: '1px solid var(--border-color)',
          padding: '20px 32px',
          background: 'rgba(0,0,0,0.2)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>
              {currentView === 'dashboard' && '📊 대시보드'}
              {currentView === 'list' && '👥 직원 인사 정보'}
              {currentView === 'detail' && `🔍 직원 상세 분석`}
              {currentView === 'model' && '⚙️ ML 모델 관리'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              {currentView === 'dashboard' && '회사 전체 이직 위험도 현황 및 주요 지표'}
              {currentView === 'list' && '검색 및 필터링을 통한 직원 목록 조회'}
              {currentView === 'detail' && '선택 직원의 상세 이직 위험 분석'}
              {currentView === 'model' && '머신러닝 모델 성능 지표 및 재학습'}
            </p>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
            <p>GitHub Copilot AI Assisted</p>
            <p style={{ marginTop: '4px' }}>© 2026 HR Analytics</p>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
          {renderView()}
        </main>
      </div>

      {/* Chat Overlay */}
      {isChatOpen && (
        <div style={{
          position: 'fixed',
          right: 0,
          top: 0,
          width: '420px',
          height: '100vh',
          background: 'var(--bg-main)',
          borderLeft: '1px solid var(--border-color)',
          boxShadow: '-4px 0 16px rgba(0,0,0,0.3)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Chatbot 
            employeeId={selectedEmployeeId} 
            onClose={() => setIsChatOpen(false)}
          />
        </div>
      )}
    </div>
  )
}

export default App
