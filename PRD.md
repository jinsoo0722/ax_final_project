# Product Requirement Document (PRD)
## 프로젝트명: 직원 퇴사 가능성 예측 및 AI 솔루션 플랫폼 (Employee Attrition Predictor & AX Advisor)

---

## 1. 개요 및 배경 (Overview & Background)
최근 기업들은 핵심 인재의 유출(퇴사)로 인해 직간접적으로 큰 손실을 입고 있습니다. 본 프로젝트는 머신러닝(Machine Learning) 기술을 통해 직원들의 퇴사 가능성을 과학적으로 예측하고, ChatGPT(LLM) 기반의 AI 전환(AX, AI Transformation) 기술을 접목하여 각 직원별 맞춤형 유지(Retention) 솔루션을 제공하는 웹 애플리케이션 개발을 목표로 합니다.

단순한 데이터 분석에 그치지 않고, HR 담당자가 AI와 대화하며 실시간으로 퇴사 방지 전략을 수립할 수 있는 **"AX 컨설턴트"** 경험을 제공합니다.

---

## 2. 주요 대상 (Target Audience)
- **HR 담당자 및 인사 부서**: 부서별 퇴사율을 관리하고, 핵심 직원의 이탈을 방지하기 위한 선제적 대응책 마련.
- **부서장 및 관리자**: 자신의 팀원들의 업무 만족도를 모니터링하고, AI 피드백을 통해 팀 관리 개선.
- **경영진**: 기업 전반의 고용 안정성과 만족도 트렌드 확인.

---

## 3. 핵심 기능 요구사항 (Core Features)

### 3.1. 대시보드 (Dashboard)
- **전사 퇴사 위험도 요약**: 고위험(High Risk) 직원 수, 평균 퇴사 위험도, 부서별 위험도 통계.
- **주요 퇴사 요인 분석**: 머신러닝 모델이 분석한 전사 퇴사 영향도(Feature Importance) 차트 제공.
- **위험도 분포**: 전체 직원의 퇴사 위험 등급 분포 (High, Medium, Low).

### 3.2. 직원 리스트 및 상세 분석 (Employee Directory & Detail Analysis)
- **직원 목록**: 검색, 부서 필터링, 직무 필터링, 퇴사 위험도 정렬 기능.
- **상세 예측 프로필**:
  - 특정 직원 선택 시 개인 예측 결과 및 위험 점수(0% ~ 100%) 표시.
  - 해당 직원의 주요 위험 기여 요인(예: 야근 빈도 높음, 직무 만족도 낮음, 급여 상승률 낮음 등) 시각화.
  - 직원의 기본 인적/근무 데이터 요약.

### 3.3. AX AI 컨설턴트 (ChatGPT 연동 Chatbot)
- **컨텍스트 자동 연동**: 상세 프로필 보기에서 "AI 컨설팅 시작"을 누르면, 해당 직원의 예측 데이터(인적 사항, 위험 요인 등)가 자동으로 ChatGPT 프롬프트의 컨텍스트로 주입됩니다.
- **인사 상담 채팅**: HR 담당자가 AI에게 직원을 유지하기 위한 전략을 질의할 수 있습니다.
  - *질문 예시*: "이 직원이 퇴사하지 않도록 하기 위해 당장 취할 수 있는 조치는 무엇인가요?"
  - *질문 예시*: "이 직원의 연봉 인상이나 직무 재배치가 퇴사 위험을 줄이는 데 도움이 될까요?"
- **이메일 및 제안서 초안 작성**: 면담 제안 이메일이나 인사 부서 보고용 제안서 초안을 AI가 자동으로 작성해 줍니다.
- **OpenAI API Key 설정**: 사용자가 직접 API 키를 입력할 수 있게 하고, 키가 없을 경우 시스템이 자체 제공하는 시뮬레이션(Mock AI) 시나리오로 동작하도록 예외 처리합니다.

### 3.4. 머신러닝 모델 관리 및 데이터 재학습 (ML Model & Training)
- **기본 데이터셋**: IBM HR Analytics Employee Attrition 데이터를 가공하여 내장.
- **모델 정보 제공**: 학습된 Random Forest 모델의 정확도(Accuracy), F1-Score, ROC-AUC 곡선 정보 시각화.
- **데이터 업로드 및 재학습**: HR 담당자가 새로운 CSV 템플릿에 맞추어 직원 데이터를 업로드하고 학습(Retrain) 버튼을 누르면 실시간으로 모델을 업데이트하고 예측치를 갱신.

---

## 4. 기술 스택 (Technology Stack)

### 4.1. 백엔드 (Backend)
- **Language**: Python 3.14.x
- **Framework**: FastAPI (가볍고 고성능이며 비동기 처리에 특화)
- **ML/Data Science**:
  - `scikit-learn`: Random Forest Classifier 기반 퇴사 예측 모델.
  - `pandas`, `numpy`: 데이터 전처리 및 가공.
  - `joblib`: 학습 완료된 모델 및 스케일러 저장/로드.
- **LLM Integration**: `openai` SDK (ChatGPT API 연동)

### 4.2. 프론트엔드 (Frontend)
- **Framework**: React.js (Vite 기반 개발 환경)
- **Styling**: Vanilla CSS + CSS Modules (프리미엄 다크 모드 및 애니메이션 구현)
- **Charts/Visualization**: Recharts 또는 Chart.js (반응형 차트)
- **Icons**: Lucide React

---

## 5. UI/UX 디자인 방향성 (Design Aesthetics)
- **Premium Dark Mode**: 모던하고 세련된 다크 블루 및 슬레이트 톤 패널 배치.
- **Glassmorphism**: 살짝 투명한 배경과 테두리 효과(`backdrop-filter: blur()`)를 적극 활용하여 미래지향적인 느낌 연출.
- **Micro-interactions & Animations**: 마우스 호버 시 카드 들림 현상, 차트 로딩 시 부드러운 스케일 업, 챗봇 메시지 스트리밍/페이드인 애니메이션.
- **Layout**: 좌측 사이드바(메인 내비게이션), 중앙 데이터/분석 패널, 우측 실시간 AX 챗봇 패널(상세 뷰 진입 시 슬라이드인)로 구성되는 3단 레이아웃.

---

## 6. 마일스톤 및 개발 계획 (Development Plan)
1. **1단계: 데이터셋 준비 및 머신러닝 모델링** (Python 스크립트 작성, 모델 학습 및 평가)
2. **2단계: FastAPI 백엔드 구축** (예측 API, Chatbot 프롬프트 API, 모델 재학습 API 설계)
3. **3단계: React 프론트엔드 기초 설계** (CSS 디자인 시스템, 대시보드 레이아웃 구축)
4. **4단계: 컴포넌트 개발 & UI/UX 구현** (직원 목록, 개별 분석 뷰, AI Chatbot 인터페이스)
5. **5단계: 통합 테스트 및 검증** (모델 성능 평가 및 AI 상담 퀄리티 향상)
