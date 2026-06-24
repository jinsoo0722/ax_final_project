import os
import shutil
import pandas as pd
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

# Import custom modules
from app.data.generate_dataset import generate_data
from app.model import AttritionModel, FEATURE_COLS
from app.llm import generate_local_advisor_reply

app = FastAPI(title="Employee Attrition Predictor & AX Advisor API")

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 상대 경로 설정 (GitHub/Streamlit 배포 호환)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "app", "data")
CSV_PATH = os.path.join(DATA_DIR, "employee_attrition.csv")

model_helper = AttritionModel(model_dir=DATA_DIR)

# Ensure data and model exist at startup
@app.on_event("startup")
def startup_event():
    os.makedirs(DATA_DIR, exist_ok=True)
    
    # 1. Generate dataset if not present
    if not os.path.exists(CSV_PATH):
        print("Dataset not found. Generating default synthetic dataset...")
        df = generate_data()
        df.to_csv(CSV_PATH, index=False)
        print(f"Generated {len(df)} records in {CSV_PATH}")
    else:
        print("Dataset found.")
        
    # 2. Load or train model
    df = pd.read_csv(CSV_PATH)
    if not model_helper.load_model():
        print("Trained model not found. Training new model...")
        model_helper.train(df)
        print("Model training completed and saved.")
    else:
        print("Model loaded successfully.")

# Helper to get prediction for all employees
def get_all_predictions_df():
    if not os.path.exists(CSV_PATH):
        raise HTTPException(status_code=404, detail="데이터셋을 찾을 수 없습니다")
    
    try:
        df = pd.read_csv(CSV_PATH)
        # EmployeeID를 문자열로 변환 (API와 프론트엔드 호환성)
        df['EmployeeID'] = df['EmployeeID'].astype(str)
        print(f"CSV 파일 로드: {len(df)} 행, 컬럼: {list(df.columns)}")
        print(f"EmployeeID 타입: {df['EmployeeID'].dtype}, 샘플: {df['EmployeeID'].head(3).tolist()}")
        
        # Check required columns
        required_cols = ['EmployeeID', 'Attrition', 'Department', 'JobRole']
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            print(f"누락된 컬럼: {missing_cols}")
        
        # Run predictions in bulk
        processed_df = model_helper.preprocess_df(df)
        print(f"전처리 완료: {len(processed_df)} 행")
        
        if model_helper.model is None:
            raise ValueError("모델이 로드되지 않았습니다")
        
        X = processed_df[FEATURE_COLS]
        print(f"예측 피처 행렬 형태: {X.shape}")
        probs = model_helper.model.predict_proba(X)
        print(f"예측 완료: {len(probs)} 개")
        
        df['RiskScore'] = probs
        df['RiskLevel'] = df['RiskScore'].apply(
            lambda x: 'High' if x >= 0.6 else ('Medium' if x >= 0.3 else 'Low')
        )
        
        print(f"리스크 분석 완료")
        return df
        
    except Exception as e:
        print(f"❌ get_all_predictions_df 에러: {str(e)}")
        import traceback
        traceback.print_exc()
        raise

class ChatRequest(BaseModel):
    employee_id: str
    message: str
    chat_history: Optional[List[dict]] = []

@app.get("/api/dashboard")
def get_dashboard():
    try:
        df = get_all_predictions_df()
        total_employees = len(df)
        avg_risk = float(df['RiskScore'].mean())
        
        high_risk_count = int(df[df['RiskLevel'] == 'High'].shape[0])
        medium_risk_count = int(df[df['RiskLevel'] == 'Medium'].shape[0])
        low_risk_count = int(df[df['RiskLevel'] == 'Low'].shape[0])
        
        # Risk by department
        dept_risk = {}
        for dept in df['Department'].unique():
            dept_df = df[df['Department'] == dept]
            dept_risk[dept] = {
                'avg_risk': float(dept_df['RiskScore'].mean()),
                'high_risk_pct': float((dept_df['RiskLevel'] == 'High').sum() / len(dept_df) * 100) if len(dept_df) > 0 else 0
            }
            
        # Top 5 employees at highest risk
        top_risk_employees = df.sort_values(by='RiskScore', ascending=False).head(5)[
            ['EmployeeID', 'Age', 'Gender', 'Department', 'JobRole', 'RiskScore', 'RiskLevel', 'JobSatisfaction', 'WorkLifeBalance']
        ].to_dict(orient='records')
        
        return {
            'total_employees': total_employees,
            'avg_risk': avg_risk,
            'high_risk_count': high_risk_count,
            'medium_risk_count': medium_risk_count,
            'low_risk_count': low_risk_count,
            'dept_risk': dept_risk,
            'top_risk_employees': top_risk_employees,
            'feature_importances': model_helper.metrics.get('feature_importances', [])[:8] # Send top 8 features
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/employees")
def get_employees(
    dept: Optional[str] = None,
    role: Optional[str] = None,
    level: Optional[str] = None,
    search: Optional[str] = None
):
    try:
        df = get_all_predictions_df()
        
        # Filters
        if dept:
            df = df[df['Department'] == dept]
        if role:
            df = df[df['JobRole'] == role]
        if level:
            df = df[df['RiskLevel'] == level]
        if search:
            df = df[
                df['EmployeeID'].str.contains(search, case=False) |
                df['JobRole'].str.contains(search, case=False)
            ]
            
        employees_list = df[
            ['EmployeeID', 'Age', 'Gender', 'Department', 'JobRole', 'RiskScore', 'RiskLevel', 'MonthlyIncome', 'YearsAtCompany']
        ].sort_values(by='RiskScore', ascending=False).to_dict(orient='records')
        
        # Get list of departments and roles for filter options in UI
        all_df = pd.read_csv(CSV_PATH)
        departments = all_df['Department'].unique().tolist()
        roles = all_df['JobRole'].unique().tolist()
        
        return {
            'employees': employees_list,
            'departments': departments,
            'roles': roles
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/employees/{emp_id}")
def get_employee_detail(emp_id: str):
    try:
        print(f"직원 상세 조회 요청: {emp_id}")
        
        if not os.path.exists(CSV_PATH):
            raise HTTPException(status_code=404, detail="Dataset not found")
        df = pd.read_csv(CSV_PATH)
        # EmployeeID를 문자열로 변환
        df['EmployeeID'] = df['EmployeeID'].astype(str)
        print(f"CSV 로드 완료: {len(df)} 행, 컬럼: {list(df.columns)}")
        print(f"검색 조건: EmployeeID == '{emp_id}'")
        print(f"CSV의 EmployeeID 샘플: {df['EmployeeID'].head(3).tolist()}")
        
        emp_rows = df[df['EmployeeID'] == emp_id]
        if emp_rows.empty:
            print(f"❌ 직원 {emp_id}을(를) 찾을 수 없습니다")
            raise HTTPException(status_code=404, detail=f"Employee {emp_id} not found")
            
        emp_row = emp_rows.iloc[0].to_dict()
        print(f"✅ 직원 데이터 추출: {emp_row.get('EmployeeID')}")
        
        # Risk analysis using the model
        emp_row['EmployeeID'] = str(emp_row.get('EmployeeID'))
        analysis = model_helper.predict_risk(emp_row)
        print(f"리스크 분석 완료")
        
        return {
            'employee_data': emp_row,
            'risk_analysis': analysis
        }
    except Exception as e:
        print(f"❌ get_employee_detail 에러: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
def chat_consultant(req: ChatRequest):
    try:
        # Load employee data
        df = pd.read_csv(CSV_PATH)
        emp_rows = df[df['EmployeeID'] == req.employee_id]
        if emp_rows.empty:
            raise HTTPException(status_code=404, detail="Employee not found")
            
        emp_row = emp_rows.iloc[0].to_dict()
        analysis = model_helper.predict_risk(emp_row)
        
        # Generate context-aware mock reply
        reply = generate_local_advisor_reply(
            employee_name=req.employee_id,
            employee_data=emp_row,
            risk_analysis=analysis,
            user_message=req.message,
            chat_history=req.chat_history
        )
        
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/model")
def get_model_status():
    if not model_helper.metrics:
        return {"status": "not_trained"}
    return {
        "status": "active",
        "metrics": model_helper.metrics
    }

@app.post("/api/model/retrain")
async def retrain_model(file: UploadFile = File(...)):
    try:
        # Save uploaded file over existing dataset
        temp_file = CSV_PATH + ".tmp"
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Verify file is a valid CSV
        try:
            df = pd.read_csv(temp_file)
            required_cols = ['EmployeeID', 'Attrition', 'JobSatisfaction', 'OverTime', 'MonthlyIncome']
            missing = [c for c in required_cols if c not in df.columns]
            if missing:
                raise ValueError(f"Missing required columns in CSV: {missing}")
        except Exception as csv_err:
            if os.path.exists(temp_file):
                os.remove(temp_file)
            raise HTTPException(status_code=400, detail=f"Invalid CSV structure: {str(csv_err)}")
            
        # Overwrite main CSV
        shutil.move(temp_file, CSV_PATH)
        
        # Retrain
        metrics = model_helper.train(df)
        return {
            "status": "success",
            "message": "Model retrained successfully",
            "metrics": metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
