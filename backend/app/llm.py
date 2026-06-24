import time
import re

def generate_local_advisor_reply(employee_name, employee_data, risk_analysis, user_message, chat_history):
    """
    Generates a highly context-aware, structured markdown reply that simulates
    a ChatGPT response for HR consultation, customized for the specific employee.
    """
    risk_score = risk_analysis.get('risk_score', 0)
    risk_level = risk_analysis.get('risk_level', 'Low')
    factors = risk_analysis.get('factors', [])
    
    # Extract employee details
    department = employee_data.get('Department', '미지')
    role = employee_data.get('JobRole', '미지')
    monthly_income = employee_data.get('MonthlyIncome', 5000)
    job_level = employee_data.get('JobLevel', 1)
    satisfaction = employee_data.get('JobSatisfaction', 3)
    work_life = employee_data.get('WorkLifeBalance', 3)
    overtime = employee_data.get('OverTime', 'No')
    years_since_promo = employee_data.get('YearsSinceLastPromotion', 0)
    
    msg = user_message.strip()
    
    # Determine the context of the user query based on keywords
    is_email_request = any(k in msg for k in ['이메일', '메일', '초안', '편지', '작성', 'draft', 'email', 'mail'])
    is_salary_request = any(k in msg for k in ['연봉', '인상', '급여', '돈', '보상', 'salary', 'income', 'pay'])
    is_overtime_request = any(k in msg for k in ['야근', '초과근무', '업무량', '워라밸', 'overtime', 'work-life', 'wlb'])
    is_promo_request = any(k in msg for k in ['승진', '적체', '경력', '커리어', 'promotion', 'career'])
    
    # Response segments
    title = f"### 🤖 AX HR Advisor: {employee_name}님을 위한 유지(Retention) 솔루션"
    
    if is_email_request:
        # Generate a personalized email template for the manager/employee
        response = f"""{title}

인사담당자님, **{employee_name}**님({department} / {role})의 퇴사 위험요인을 경감하고 진솔한 대화를 나누기 위한 **1:1 면담 제안 이메일 초안**을 작성했습니다. 

{employee_name}님은 현재 **야근 과다**와 **상대적 저임금** 등의 이유로 퇴사 위험도가 **{risk_score*100:.1f}% ({risk_level})**로 분석되었습니다. 사내 메신저나 이메일을 통해 아래 템플릿을 수정하여 발송해보세요.

---

```markdown
제목: [인사팀] {employee_name}님, 최근 업무 관련하여 가벼운 티타임을 제안드립니다.

안녕하세요, {employee_name}님. 인사팀(또는 부서장)입니다.

올 한 해도 {department} 부서에서 {role}(으)로 묵묵히 기여해주시고 고생해주셔서 진심으로 감사드립니다.

다름이 아니라, 최근 프로젝트 진행으로 야근이 많으셨던 점과 관련해 {employee_name}님이 현재 겪고 계신 업무상 애로사항이나 업무량에 대해 편하게 이야기를 나누고 지원해드릴 수 있는 부분을 함께 찾아보고자 합니다. 

또한, 앞으로의 커리어 성장 로드맵 및 처우 개선 사항 등 {employee_name}님이 회사 생활을 하시면서 생각하셨던 제안이나 희망사항을 듣는 소중한 기회로 삼고자 합니다.

바쁘시겠지만 아래 시간대 중 편하신 일정이 있으시면 회신 부탁드립니다.
- 후보 시간 1: 6월 25일(목) 오전 10:30
- 후보 시간 2: 6월 26일(금) 오후 14:00
* 위 시간 외에 더 편하신 일정이 있다면 말씀해주시기 바랍니다.

따뜻한 차 한 잔 나누며 편안한 분위기에서 진행될 예정이니 전혀 부담 갖지 마시고 편히 참석해주시면 감사하겠습니다.

인사팀(또는 부서장) 드림.
```

---

**💡 면담 시 HR 팁 (HR Action Plan):**
1. **야근 피로 공감**: 최근 야근이 빈번했던 점을 먼저 인지하고 있음을 보여주어 회사 차원의 케어를 체감하게 하십시오.
2. **보상안 검토**: 현재 직무 레벨 {job_level} 대비 급여수준(${monthly_income})에 대해 직원의 만족 수준을 우회적으로 확인하고 조정안을 제시할 준비를 하십시오.
"""
        return response

    elif is_salary_request:
        # Salary/compensation specific strategy
        adjusted_income_target = int(monthly_income * 1.12)
        response = f"""{title}

**{employee_name}**님의 현재 월 급여는 **${monthly_income:,}**로, 동일 직무 레벨 **(Job Level {job_level})**의 권장 소득 수준 대비 낮은 편에 속합니다. 

인사 분석 모델에 따르면 보상 체계는 {employee_name}님의 퇴사 결정에 매우 높은 영향력을 미칩니다. 다음과 같은 보상 설계안을 제안합니다.

#### 📊 현재 처우 분석 및 제안
| 항목 | 현재 상태 | 개선안 (제안) | 예상 효과 |
| :--- | :--- | :--- | :--- |
| **기본급** | ${monthly_income:,} / 월 | **${adjusted_income_target:,} / 월** (약 12% 인상) | 동기부여 고취 및 경쟁사 이직 방어 |
| **추가 수당** | 포괄임금제 | **시간외 수당 별도 지급** (또는 야근 일수에 따른 보상휴가 부여) | 야근에 대한 불만 즉각 해소 |
| **성과급 비율** | 일괄 지급 | **개인 KPI 달성도에 따른 인센티브** (연동 비율 상향) | 직무 몰입도({employee_data.get('JobInvolvement', 3)}/4점) 향상 |

#### 💡 실행 로드맵
1. **단기 조치**: 성과 및 기여도 재평가를 통해 연봉 조정 시기 이전 **특별 인상(Special Adjustment)** 적용 검토.
2. **장기 조치**: 직무 성과와 긴밀하게 연동된 인센티브 제도를 리빌딩하여 보상 현실화.
3. **대안책**: 단기 재정 여건상 임금 인상이 어렵다면 **특별 복지(선택적 복지 포인트 상향, 리프레시 휴가 3일 부여)**를 긴급 지원할 것을 강력 권장합니다.
"""
        return response

    elif is_overtime_request:
        # Overtime / WLB specific advice
        response = f"""{title}

**{employee_name}**님은 현재 야근(Overtime) 여부가 **'Yes'**로 설정되어 있으며, 워라밸 만족도가 **{work_life}점 / 4점**으로 위험 수치에 해당합니다. 

지속적인 초과근무는 직무 피로(Burnout)로 직결되며, 이는 3개월 내 이탈 가능성을 비약적으로 높이는 핵심 트리거입니다. 아래의 **3단계 업무량 관리 가이드**를 즉시 적용해보세요.

#### 🛠️ 워라밸 개선 솔루션
1. **업무 분산 및 R&R 재조정**
   - 현재 담당 업무 중 타 팀원으로 이관 가능한 단순 업무를 식별하여 분할 배정합니다.
   - 임시 지원 리소스(인턴 또는 타 팀 서포트)를 {department} 부서에 우선 투입하십시오.
2. **"PC OFF" 또는 "지정 퇴근 요일" 도입**
   - 수요일/금요일은 '정시 퇴근의 날'로 지정하고 부서장이 우선 솔선수범하도록 권고합니다.
   - 초과 근무 시 사유를 사전에 제출하도록 하여 불필요한 관행성 야근을 축소합니다.
3. **유연근무제(Flexible Work) 부여**
   - 잦은 야근이 불가피할 경우, 익일 오전 10시 출근 또는 금요일 오후 조기 퇴근 등 시차출퇴근제를 제안하여 물리적인 휴식 시간을 보장하십시오.
"""
        return response

    elif is_promo_request:
        response = f"""{title}

**{employee_name}**님은 마지막 승진 이후 **{years_since_promo}년**이 경과하여 현재 직무 레벨 **{job_level}단계**에 머물러 있습니다. 

총 경력 년수({employee_data.get('TotalWorkingYears', 0)}년) 및 현 부서 근속 대비 승진 주기가 다소 길어지면서 발생하는 **'커리어 정체감'**이 퇴사 충동의 숨겨진 원인일 수 있습니다.

#### 📈 커리어 경로 재설계 전략
* **예비 승진 대상자 등록 및 목표 조율**:
  - 다음 분기 승진 대상자 명단에 공식 추천 및 면담을 진행하여 비전을 보여주십시오.
  - 다음 단계 레벨로 오르기 위해 필요한 성과 지표(KPI)를 구체적이고 투명하게 얼라인하세요.
* **직무 순환(Job Rotation) 기회 제공**:
  - 만약 현 부서인 {department} 내에서 승진 T/O가 부족하다면, 직원이 흥미를 보였던 유관 부서나 직무로의 사내 공모(Internal Mobility)를 제안하십시오.
* **전문성 강화 교육 지원**:
  - 회사 비용으로 외부 직무 교육 또는 컨퍼런스 참가비를 전액 지원하여 회사가 임직원의 성장을 전폭 지원하고 있음을 각인시키십시오.
"""
        return response

    else:
        # Default fallback response summarizing everything
        response = f"""{title}

안녕하세요. AI HR 어드바이저입니다. **{employee_name}**님({department} / {role})의 예측 분석 데이터를 기반으로 분석한 결과입니다.

{employee_name}님의 퇴사 위험 점수는 **{risk_score*100:.1f}%**로 현재 **{risk_level}** 등급에 속해 있습니다.

#### 🔍 주요 위험 요인 분석
{chr(10).join([f"- **{f['label']}**: {f['description']}" for f in factors])}

#### 💡 즉각적인 유지(Retention) 권장 전략
1. **처우 현실화 검토**: 현재 직무 레벨({job_level}단계) 및 기여도 대비 월급여(${monthly_income:,}) 적절성 검토.
2. **업무 다이어트**: {overtime == 'Yes' and '야근 빈도 차단을 위해 담당 태스크를 20% 축소 조율하십시오.' or '현재 초과근무는 없으나, 근무만족도가 오르도록 조율 필요.'}
3. **관계 촉진**: 워라밸 만족도 및 직무만족도 개선을 위한 인사팀 차원의 비공식 1:1 티타임 개설.

더 상세한 보상 솔루션을 보려면 **"연봉 인상 효과 검토해줘"**, 이메일 초안이 필요하면 **"면담 이메일 작성해줘"**, 워라밸 관련 대책은 **"야근 줄여주면 퇴사를 막을 수 있을까?"**라고 질문해보세요!
"""
        return response
