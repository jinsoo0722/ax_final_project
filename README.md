# 직원 이직 예측 및 AX 인사 어드바이저 시스템

**Employee Attrition Predictor & AX Advisor**

직원 이직 위험도를 머신러닝으로 예측하고, AI 기반 HR 상담을 제공하는 통합 시스템입니다.

## 🎯 주요 기능

- **📊 대시보드**: 전사 직원 이직 위험도 현황 및 부서별 분석
- **👨‍💼 직원 디렉토리**: 검색 필터 기능을 통한 직원 관리
- **👤 직원 상세정보**: 개인 위험도 분석 및 맞춤형 위험 요인 분석
- **💬 HR 어드바이저**: AI 기반 상담 및 개선 방안 제시
- **⚙️ 모델 관리**: 성능 지표 조회 및 모델 재학습

## 🛠 기술 스택

### 백엔드
- **FastAPI 0.111.0**: Python 기반 고성능 웹 API
- **Pandas 2.2.2 / NumPy 1.26.4**: 데이터 처리 및 분석
- **Custom Decision Tree**: 순수 Python 구현 머신러닝 모델

### 프론트엔드
- **React + Vite**: 최신 웹 애플리케이션 프레임워크
- **Streamlit**: 데이터 대시보드 (선택 배포)

### 데이터
- **IBM HR Analytics Employee Attrition Dataset**
- 800명의 직원 데이터, 22개 피처

## 📦 설치 및 실행

### 요구사항
- Python 3.8+
- Node.js 16+

### 로컬 개발 환경

```bash
# 1. 프로젝트 클론
git clone <repository_url>
cd FinalProject

# 2. 백엔드 설정
cd backend
pip install -r requirements.txt

# 3. 데이터 생성
python -m app.data.generate_dataset

# 4. FastAPI 서버 실행
uvicorn app.main:app --reload
# 서버: http://localhost:8000

# 5. 프론트엔드 설정 (새 터미널)
cd ../frontend
npm install
npm run dev
# 앱: http://localhost:5173

# 6. (선택) Streamlit 앱 실행
cd ..
streamlit run streamlit_app.py
# 대시보드: http://localhost:8501
```

## 🚀 배포

### Streamlit Cloud 배포

```bash
# 1. GitHub에 푸시
git add .
git commit -m "Initial commit"
git push origin main

# 2. Streamlit Cloud 접속
# https://streamlit.io/cloud

# 3. "New app" → GitHub 저장소 선택
# - Repository: <your-repo>
# - Branch: main
# - Main file path: streamlit_app.py
```

### 환경변수 설정 (필요시)

`~/.streamlit/secrets.toml`:
```toml
[api]
backend_url = "https://your-backend-url"
```

## 📊 데이터 구조

### CSV 컬럼 (22개 피처)
```
EmployeeID, Age, Gender, MaritalStatus, Department, JobRole,
BusinessTravel, OverTime, MonthlyIncome, JobLevel, PercentSalaryHike,
NumCompaniesWorked, TotalWorkingYears, YearsAtCompany, YearsInCurrentRole,
YearsSinceLastPromotion, YearsWithCurrManager, JobSatisfaction,
EnvironmentSatisfaction, RelationshipSatisfaction, WorkLifeBalance,
JobInvolvement, PerformanceRating, Attrition
```

## 🧠 머신러닝 모델

### Decision Tree Classifier
- **구현**: 순수 Python 기반 (NumPy)
- **알고리즘**: CART (Classification And Regression Trees)
- **성능**: 
  - Accuracy: ~95%
  - ROC AUC: ~90%
  - F1-Score: ~0.89

## 🔒 보안

- CORS 활성화 (개발용)
- 프로덕션 배포 시 환경변수 사용
- CSV 파일은 `.gitignore`에 포함

## 📝 API 엔드포인트

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/dashboard` | 대시보드 데이터 |
| GET | `/api/employees` | 직원 목록 (필터 가능) |
| GET | `/api/employees/{id}` | 직원 상세정보 |
| POST | `/api/chat` | HR 어드바이저 상담 |
| GET | `/api/model` | 모델 성능 지표 |
| POST | `/api/model/retrain` | 모델 재학습 |

## 🤝 기여

이슈 및 PR은 언제든 환영합니다!

## 📄 라이선스

MIT License

## 👥 작성자

Employee Attrition Predictor & AX Advisor Team

---

**더 자세한 정보**: [설명서](./implementation_plan.md)
