import os
import pandas as pd
import numpy as np

def generate_data(num_records=800, seed=42):
    """
    IBM HR Analytics와 유사한 합성 HR 직원 데이터를 생성합니다.
    """
    print(f"📊 로컬 합성 HR 데이터 {num_records}개 생성 중...")
    np.random.seed(seed)
    
    # Define categorical choices
    departments = ['Research & Development', 'Sales', 'Human Resources']
    job_roles = {
        'Research & Development': ['Research Scientist', 'Laboratory Technician', 'Manufacturing Director', 'Healthcare Representative', 'Research Director', 'Manager'],
        'Sales': ['Sales Executive', 'Sales Representative', 'Manager'],
        'Human Resources': ['Human Resources', 'Manager']
    }
    travel_choices = ['Non-Travel', 'Travel_Rarely', 'Travel_Frequently']
    marital_choices = ['Single', 'Married', 'Divorced']
    gender_choices = ['Male', 'Female']
    
    data = []
    
    for i in range(num_records):
        emp_id = i + 1  # 숫자형 사원 번호 (Kaggle 스타일)
        age = int(np.random.randint(18, 65))
        gender = np.random.choice(gender_choices)
        marital_status = np.random.choice(marital_choices)
        
        dept = np.random.choice(departments, p=[0.65, 0.28, 0.07])
        role = np.random.choice(job_roles[dept])
        
        # Experience and Tenure (correlated with age)
        max_work_years = max(1, age - 18)
        total_working_years = int(np.random.randint(0, min(max_work_years, 40)))
        years_at_company = int(np.random.randint(0, min(total_working_years + 1, 20)))
        years_in_current_role = int(np.random.randint(0, years_at_company + 1))
        years_since_last_promotion = int(np.random.randint(0, years_at_company + 1))
        years_with_curr_manager = int(np.random.randint(0, years_at_company + 1))
        
        num_companies_worked = int(np.random.randint(0, 9))
        
        # Job details
        job_level = min(5, max(1, int(years_at_company // 4) + 1))
        monthly_income = int(job_level * 3000 + np.random.randint(-1000, 2000))
        monthly_income = max(1500, min(25000, monthly_income))
        
        business_travel = np.random.choice(travel_choices, p=[0.15, 0.70, 0.15])
        overtime = np.random.choice(['Yes', 'No'], p=[0.28, 0.72])
        
        # Ratings and Satisfactions (1 to 4)
        job_satisfaction = int(np.random.choice([1, 2, 3, 4], p=[0.1, 0.2, 0.4, 0.3]))
        environment_satisfaction = int(np.random.choice([1, 2, 3, 4], p=[0.12, 0.22, 0.36, 0.30]))
        relationship_satisfaction = int(np.random.choice([1, 2, 3, 4], p=[0.1, 0.2, 0.4, 0.3]))
        work_life_balance = int(np.random.choice([1, 2, 3, 4], p=[0.08, 0.25, 0.47, 0.20]))
        job_involvement = int(np.random.choice([1, 2, 3, 4], p=[0.08, 0.22, 0.50, 0.20]))
        
        performance_rating = int(np.random.choice([3, 4], p=[0.85, 0.15]))
        percent_salary_hike = int(10 + performance_rating * 2 + np.random.randint(-2, 4))
        
        # Calculate Attrition Probability based on factors
        prob = 0.05
        
        # Factor adjustments
        if overtime == 'Yes': prob += 0.25
        if job_satisfaction == 1: prob += 0.20
        elif job_satisfaction == 2: prob += 0.08
        if environment_satisfaction == 1: prob += 0.15
        if work_life_balance == 1: prob += 0.20
        elif work_life_balance == 2: prob += 0.08
        if business_travel == 'Travel_Frequently': prob += 0.15
        if marital_status == 'Single': prob += 0.10
        if years_at_company < 2: prob += 0.12
        if monthly_income < 3500: prob += 0.15
        if years_since_last_promotion > 4: prob += 0.10
        if job_involvement == 1: prob += 0.15
        
        # Age penalty (younger employees more likely to leave)
        if age < 25: prob += 0.15
        elif age > 45: prob -= 0.05
        
        # Cap probability between 0.01 and 0.95
        prob = max(0.01, min(0.95, prob))
        
        # Assign attrition
        attrition = 'Yes' if np.random.rand() < prob else 'No'
        
        data.append({
            'EmployeeID': str(emp_id),  # 문자열로 변환
            'Age': age,
            'Gender': gender,
            'MaritalStatus': marital_status,
            'Department': dept,
            'JobRole': role,
            'BusinessTravel': business_travel,
            'OverTime': overtime,
            'MonthlyIncome': monthly_income,
            'JobLevel': job_level,
            'PercentSalaryHike': percent_salary_hike,
            'NumCompaniesWorked': num_companies_worked,
            'TotalWorkingYears': total_working_years,
            'YearsAtCompany': years_at_company,
            'YearsInCurrentRole': years_in_current_role,
            'YearsSinceLastPromotion': years_since_last_promotion,
            'YearsWithCurrManager': years_with_curr_manager,
            'JobSatisfaction': job_satisfaction,
            'EnvironmentSatisfaction': environment_satisfaction,
            'RelationshipSatisfaction': relationship_satisfaction,
            'WorkLifeBalance': work_life_balance,
            'JobInvolvement': job_involvement,
            'PerformanceRating': performance_rating,
            'Attrition': attrition
        })
        
    df = pd.DataFrame(data)
    return df

if __name__ == '__main__':
    # 상대 경로 사용 (GitHub/Streamlit 배포 호환)
    data_dir = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(data_dir, exist_ok=True)
    csv_path = os.path.join(data_dir, 'employee_attrition.csv')
    
    df = generate_data()
    df.to_csv(csv_path, index=False)
    print(f"✅ {len(df)}개의 직원 데이터가 저장되었습니다: {csv_path}")
    attrition_rate = (df['Attrition'] == 'Yes').sum() / len(df) * 100
    print(f"📊 이직률: {attrition_rate:.1f}%")
    print(f"📋 컬럼: {list(df.columns)}")
