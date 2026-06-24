# Streamlit Cloud Deployment Configuration

## 배포 단계

### 1. GitHub 저장소에 푸시

```bash
git add .
git commit -m "Add Streamlit deployment"
git push origin main
```

### 2. Streamlit Cloud에서 앱 배포

1. https://streamlit.io/cloud 접속
2. "New app" 클릭
3. GitHub 저장소 선택
4. 설정:
   - Repository: `your-username/FinalProject`
   - Branch: `main`
   - Main file path: `streamlit_app.py`

### 3. 고급 설정 (선택)

```toml
# .streamlit/secrets.toml
[api]
backend_url = "your-backend-api-url"

[server]
maxUploadSize = 200
```

### 4. 백엔드 API 배포 (선택)

FastAPI를 별도로 호스팅하려면:

- **Heroku**: `Procfile` 추가
  ```
  web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```

- **PythonAnywhere / AWS / GCP**: FastAPI 인스턴스 실행

- **Docker**:
  ```dockerfile
  FROM python:3.10
  WORKDIR /app
  COPY backend/ .
  RUN pip install -r requirements.txt
  CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0"]
  ```

## 환경 요구사항

- Python 3.8+
- GitHub 계정
- Streamlit Cloud 계정 (무료)
- 선택: 백엔드 호스팅 (선택사항 - 로컬 실행 가능)

## 배포 후 URL

```
https://your-username-finalproject.streamlit.app
```

## 주의사항

- 데이터는 Streamlit Cloud 세션에서만 유지됨
- 파일 업로드를 위해선 persistent storage 필요 (유료)
- 민감한 정보는 `.streamlit/secrets.toml`에 저장
