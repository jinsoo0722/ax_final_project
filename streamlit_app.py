"""
Employee Attrition Predictor & AX Advisor - Streamlit Dashboard
직원 이직 예측 및 AX 인사 어드바이저 시스템
"""

import streamlit as st
import pandas as pd
import numpy as np
import requests
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app.data.generate_dataset import generate_data
from app.model import AttritionModel

# Page config
st.set_page_config(
    page_title="직원 이직 예측 시스템",
    page_icon="👥",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize session state
if 'data_loaded' not in st.session_state:
    st.session_state.data_loaded = False
if 'model_loaded' not in st.session_state:
    st.session_state.model_loaded = False

# Sidebar
st.sidebar.title("⚙️ 시스템 설정")

# Ensure data exists
DATA_DIR = os.path.join(os.path.dirname(__file__), 'backend', 'app', 'data')
CSV_PATH = os.path.join(DATA_DIR, 'employee_attrition.csv')

os.makedirs(DATA_DIR, exist_ok=True)

if not os.path.exists(CSV_PATH):
    st.sidebar.info("📊 데이터 초기화 중...")
    df = generate_data()
    df.to_csv(CSV_PATH, index=False)
    st.sidebar.success("✅ 데이터 생성 완료")
    st.session_state.data_loaded = True
else:
    st.session_state.data_loaded = True

# Load model
model_helper = AttritionModel(model_dir=DATA_DIR)
df = pd.read_csv(CSV_PATH)
df['EmployeeID'] = df['EmployeeID'].astype(str)

if not model_helper.load_model():
    st.sidebar.info("🔧 모델 학습 중...")
    model_helper.train(df)
    st.sidebar.success("✅ 모델 학습 완료")

# Main content
st.title("👥 직원 이직 예측 및 AX 어드바이저 시스템")
st.markdown("---")

# Get predictions
processed_df = model_helper.preprocess_df(df)
probs = model_helper.model.predict_proba(processed_df)
df['RiskScore'] = probs
df['RiskLevel'] = df['RiskScore'].apply(
    lambda x: '🔴 고위험' if x >= 0.6 else ('🟡 중위험' if x >= 0.3 else '🟢 저위험')
)

# Navigation tabs
tab1, tab2, tab3, tab4 = st.tabs(["📊 대시보드", "👨‍💼 직원 디렉토리", "👤 직원 상세정보", "⚙️ 모델 관리"])

with tab1:
    st.header("📊 대시보드")
    
    # KPI Cards
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("전체 직원 수", len(df))
    
    with col2:
        high_risk = (df['RiskLevel'] == '🔴 고위험').sum()
        st.metric("고위험군 직원", high_risk)
    
    with col3:
        medium_risk = (df['RiskLevel'] == '🟡 중위험').sum()
        st.metric("중위험군 직원", medium_risk)
    
    with col4:
        avg_risk = df['RiskScore'].mean()
        st.metric("평균 퇴사 위험도", f"{avg_risk:.2%}")
    
    st.markdown("---")
    
    # Risk by Department
    st.subheader("부서별 위험도")
    dept_risk = df.groupby('Department').agg({
        'RiskScore': 'mean',
        'RiskLevel': lambda x: (x == '🔴 고위험').sum() / len(x)
    }).round(3)
    dept_risk.columns = ['평균 위험도', '고위험 비율']
    st.dataframe(dept_risk)
    
    # Top 5 at-risk employees
    st.subheader("🔴 고위험 상위 5명")
    top_risk = df.nlargest(5, 'RiskScore')[['EmployeeID', 'Department', 'JobRole', 'RiskScore', 'RiskLevel']]
    st.dataframe(top_risk, use_container_width=True)

with tab2:
    st.header("👨‍💼 직원 디렉토리")
    
    # Filters
    col1, col2, col3 = st.columns(3)
    
    with col1:
        dept_filter = st.selectbox("부서", ["전체"] + df['Department'].unique().tolist())
    
    with col2:
        role_filter = st.selectbox("직책", ["전체"] + df['JobRole'].unique().tolist())
    
    with col3:
        risk_filter = st.selectbox("위험도", ["전체", "🔴 고위험", "🟡 중위험", "🟢 저위험"])
    
    # Apply filters
    filtered_df = df.copy()
    
    if dept_filter != "전체":
        filtered_df = filtered_df[filtered_df['Department'] == dept_filter]
    
    if role_filter != "전체":
        filtered_df = filtered_df[filtered_df['JobRole'] == role_filter]
    
    if risk_filter != "전체":
        filtered_df = filtered_df[filtered_df['RiskLevel'] == risk_filter]
    
    st.dataframe(
        filtered_df[['EmployeeID', 'Age', 'Gender', 'Department', 'JobRole', 'RiskScore', 'RiskLevel']].sort_values('RiskScore', ascending=False),
        use_container_width=True,
        hide_index=True
    )

with tab3:
    st.header("👤 직원 상세정보")
    
    emp_id = st.selectbox("직원 선택", sorted(df['EmployeeID'].tolist()))
    
    if emp_id:
        emp_data = df[df['EmployeeID'] == emp_id].iloc[0]
        
        # Risk Score Card
        col1, col2 = st.columns([1, 2])
        
        with col1:
            risk_score = emp_data['RiskScore']
            risk_level = emp_data['RiskLevel']
            
            # Color by risk level
            if risk_score >= 0.6:
                color = "🔴"
            elif risk_score >= 0.3:
                color = "🟡"
            else:
                color = "🟢"
            
            st.markdown(f"### {color} 퇴사 위험도")
            st.metric("위험 점수", f"{risk_score:.1%}", f"{risk_level}")
        
        with col2:
            # Employee profile
            st.markdown("### 📋 직원 정보")
            st.write(f"**직원 ID:** {emp_data['EmployeeID']}")
            st.write(f"**부서:** {emp_data['Department']}")
            st.write(f"**직책:** {emp_data['JobRole']}")
            st.write(f"**성별:** {emp_data['Gender']}")
            st.write(f"**나이:** {emp_data['Age']}")
            st.write(f"**월급:** ${emp_data['MonthlyIncome']:,}")
        
        st.markdown("---")
        
        # Satisfaction metrics
        st.subheader("😊 만족도 지표")
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("직무 만족도", f"{emp_data['JobSatisfaction']}/4", "⭐" * int(emp_data['JobSatisfaction']))
        
        with col2:
            st.metric("환경 만족도", f"{emp_data['EnvironmentSatisfaction']}/4", "⭐" * int(emp_data['EnvironmentSatisfaction']))
        
        with col3:
            st.metric("워라밸 만족도", f"{emp_data['WorkLifeBalance']}/4", "⭐" * int(emp_data['WorkLifeBalance']))
        
        with col4:
            st.metric("업무 몰입도", f"{emp_data['JobInvolvement']}/4", "⭐" * int(emp_data['JobInvolvement']))
        
        st.markdown("---")
        
        # Career info
        st.subheader("📈 경력 정보")
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.write(f"**근무 연수:** {emp_data['YearsAtCompany']}년")
            st.write(f"**총 경력:** {emp_data['TotalWorkingYears']}년")
        
        with col2:
            st.write(f"**현직 경력:** {emp_data['YearsInCurrentRole']}년")
            st.write(f"**마지막 승진:** {emp_data['YearsSinceLastPromotion']}년 전")
        
        with col3:
            st.write(f"**현 관리자:** {emp_data['YearsWithCurrManager']}년")
            st.write(f"**직급:** Level {emp_data['JobLevel']}")
        
        st.markdown("---")
        
        # Risk factors
        st.subheader("⚠️ 위험 요인")
        
        # Get risk factors from model
        risk_analysis = model_helper.predict_risk(emp_data.to_dict())
        
        if risk_analysis['factors']:
            for factor in risk_analysis['factors']:
                impact_color = "🔴" if factor['impact'] == 'high' else "🟡"
                st.write(f"{impact_color} **{factor['label']}**: {factor['description']}")
        else:
            st.success("✅ 주목할 위험 요인이 없습니다.")

with tab4:
    st.header("⚙️ 모델 관리")
    
    st.subheader("📈 모델 성능 지표")
    
    if model_helper.metrics:
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("정확도 (Accuracy)", f"{model_helper.metrics.get('accuracy', 0):.2%}")
        
        with col2:
            st.metric("F1-Score", f"{model_helper.metrics.get('f1_score', 0):.3f}")
        
        with col3:
            st.metric("재현율 (Recall)", f"{model_helper.metrics.get('recall', 0):.2%}")
        
        with col4:
            st.metric("ROC AUC", f"{model_helper.metrics.get('roc_auc', 0):.3f}")
    
    st.markdown("---")
    
    st.subheader("🔧 모델 재학습")
    
    uploaded_file = st.file_uploader("CSV 파일 업로드", type=['csv'], help="EmployeeID, Attrition 포함 필수")
    
    if uploaded_file:
        try:
            new_df = pd.read_csv(uploaded_file)
            new_df['EmployeeID'] = new_df['EmployeeID'].astype(str)
            
            # Save and retrain
            new_df.to_csv(CSV_PATH, index=False)
            model_helper.train(new_df)
            
            st.success("✅ 모델이 성공적으로 재학습되었습니다!")
            st.rerun()
        
        except Exception as e:
            st.error(f"❌ 오류 발생: {str(e)}")

st.markdown("---")
st.caption("© 2024 Employee Attrition Predictor & AX Advisor | Powered by Streamlit")
