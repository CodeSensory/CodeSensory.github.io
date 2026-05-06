# -*- coding: utf-8 -*-
"""
간호학과 78명( A1–A37, B1–B41 )의 세 과목-병원-기간 배치를
모든 제약조건(학생별 3과목 1회, 기간 중복 금지, 병원 중복 금지,
셀 최소 2명, 2학기 셀 의무 사용, Max/Min 용량) 을 만족하도록
정수계획으로 최적화한 뒤 CSV 출력
"""
import csv
from collections import defaultdict, Counter          # ← 0508 오류 원인 보완
from itertools import product
from pathlib import Path

from pulp import (
    LpProblem, LpVariable, LpBinary, lpSum,
    LpStatusOptimal, PULP_CBC_CMD
)

# -------------------- 1. 기본 데이터 --------------------
periods = ["T1", "T2", "T3", "T4", "T5", "T6", "T7"]
second_semester = {"T4", "T5", "T6", "T7"}             # 2학기

students_A = [f"A{i}" for i in range(1, 38)]
students_B = [f"B{i}" for i in range(1, 42)]
students = students_A + students_B

# (A·B 출석 가능 여부)
period_ok = {
    "T1": lambda s: s.startswith("B"),
    "T2": lambda s: s.startswith("A"),
    "T3": lambda s: True,
    "T4": lambda s: s.startswith("A"),
    "T5": lambda s: s.startswith("A"),
    "T6": lambda s: s.startswith("B"),
    "T7": lambda s: s.startswith("B"),
}

# -------- 1-A. 최대·최소 용량 테이블(문자열 그대로 → 파싱) -------------
RAW_MAX = """
과목1,병원1,4,4,4,0,0,0,0
과목1,병원1,4,4,4,0,0,0,0
과목1,병원1,4,4,4,0,0,0,0
과목1,병원1,4,4,4,0,0,0,0
과목1,병원2,0,0,0,2,2,2,2
과목1,병원2,0,0,0,2,2,2,2
과목1,병원2,0,0,0,2,2,2,2
과목1,병원3,4,4,0,0,0,0,0
과목1,병원3,4,4,0,0,0,0,0
과목1,병원3,4,4,0,0,0,0,0
과목1,병원3,4,4,0,0,0,0,0
과목2,병원4,4,4,4,0,0,0,0
과목2,병원3,0,4,0,4,0,0,0
과목2,병원6,5,0,0,5,5,5,0
과목2,병원7,0,0,0,4,4,4,4
과목2,병원3,0,4,0,0,0,0,0
과목2,병원8,0,0,0,4,4,4,4
과목2,병원5,8,8,0,6,0,4,0
과목3,병원9,4,4,4,0,0,0,0
과목3,병원3,4,4,4,2,2,2,0
과목3,병원10,4,4,0,4,4,4,4
과목3,병원11,2,2,2,2,2,2,2
과목3,병원11,4,4,4,4,4,4,4
과목3,병원1,4,4,4,0,0,0,0
""".strip()

RAW_MIN = """
과목1,병원1,0,0,0,0,0,0,0
과목1,병원1,0,0,0,0,0,0,0
과목1,병원1,0,0,0,0,0,0,0
과목1,병원1,0,0,0,0,0,0,0
과목1,병원2,0,0,0,2,2,2,2
과목1,병원2,0,0,0,2,2,2,2
과목1,병원2,0,0,0,2,2,2,2
과목1,병원3,0,0,0,0,0,0,0
과목1,병원3,0,0,0,0,0,0,0
과목1,병원3,0,0,0,0,0,0,0
과목1,병원3,0,0,0,0,0,0,0
과목2,병원4,0,0,0,0,0,0,0
과목2,병원3,0,0,0,4,0,0,0
과목2,병원6,0,0,0,4,4,4,0
과목2,병원7,0,0,0,3,3,3,3
과목2,병원3,0,0,0,0,0,0,0
과목2,병원8,0,0,0,3,3,3,3
과목2,병원5,0,0,0,3,0,3,0
과목3,병원9,0,0,0,0,0,0,0
과목3,병원3,0,0,0,2,2,2,0
과목3,병원10,0,0,0,4,4,4,4
과목3,병원11,0,0,0,2,2,2,2
과목3,병원11,0,0,0,3,3,3,2
과목3,병원1,0,0,0,0,0,0,0
""".strip()

def parse_rows(raw: str):
    rows = []
    for idx, line in enumerate(raw.splitlines()):
        course, hosp, *nums = line.strip().split(",")
        rows.append({
            "id": f"R{idx:02d}",          # 고유 ID
            "course": course,
            "hospital": hosp,
            "capacity": {p: int(x) for p, x in zip(periods, nums)}
        })
    return rows

rows_max = parse_rows(RAW_MAX)
rows_min = parse_rows(RAW_MIN)          # 같은 순서 전제

# ----- 1-B. 셀별 최저 인원 계산(규칙 4·5 반영) -----
for r_max, r_min in zip(rows_max, rows_min):
    for p in periods:
        rule5 = 2 if (p in second_semester and r_max["capacity"][p] > 0) else 0
        r_min["capacity"][p] = max(r_min["capacity"][p], rule5)

# ---------------- 2. MILP 모델 ----------------------
model = LpProblem("Nursing-Student-Scheduling")

# 변수: assign[s, row_id, period]  ∈ {0,1}
assign = {}
for s, r in product(students, rows_max):
    for p in periods:
        if r["capacity"][p] == 0:                # 배치 불가
            continue
        if not period_ok[p](s):                  # 학생 반·기간 호환 안 됨
            continue
        key = (s, r["id"], p)
        assign[key] = LpVariable(f"x_{s}_{r['id']}_{p}", 0, 1, LpBinary)

# 변수: y_(row,period) – 셀 사용 여부 (0: 미사용, 1: 사용)
y = {}
for r in rows_max:
    for p in periods:
        if r["capacity"][p] == 0:
            continue
        y[(r['id'], p)] = LpVariable(f"y_{r['id']}_{p}", 0, 1, LpBinary)

# 2-A. 학생·과목별 1회 수강
for s in students:
    for course in ["과목1", "과목2", "과목3"]:
        model += (
            lpSum(assign[k] for k in assign
                  if k[0] == s and rows_max[[r['id'] for r in rows_max].index(k[1])]['course'] == course) == 1
        )

# 2-B. 학생·기간 중복 금지
for s in students:
    for p in periods:
        model += lpSum(assign[k] for k in assign if k[0] == s and k[2] == p) <= 1

# 2-C. 학생·병원 중복 금지
for s in students:
    for hosp in {r['hospital'] for r in rows_max}:
        model += lpSum(assign[k] for k in assign
                       if k[0] == s and rows_max[[r['id'] for r in rows_max].index(k[1])]['hospital'] == hosp) <= 1

# 2-D. 셀 용량(최대·최소 및 '0 또는 ≥2')
for r_max, r_min in zip(rows_max, rows_min):
    rid = r_max['id']
    for p in periods:
        cap_max = r_max["capacity"][p]
        if cap_max == 0:
            continue
        cap_min = r_min["capacity"][p]
        # assign 합산
        cell_vars = [assign[k] for k in assign if k[1] == rid and k[2] == p]
        model += lpSum(cell_vars) <= cap_max
        model += lpSum(cell_vars) >= cap_min
        # 0 또는 ≥2
        model += lpSum(cell_vars) >= 2 * y[(rid, p)]
        model += lpSum(cell_vars) <= cap_max * y[(rid, p)]

# ---------------- 3. 풀기 ---------------------------
solver = PULP_CBC_CMD(msg=1, timeLimit=120)
status = model.solve(solver)

if status != LpStatusOptimal:
    raise RuntimeError("배치를 찾지 못했습니다. 제약을 완화하거나 용량을 재검토하세요.")

# ---------------- 4. 결과 CSV 작성 -------------------
# 행 순서 유지
header = ["과목명", "병원명"] + periods
csv_rows = []

# 행별-기간별 학생 이름 모으기
who_in = defaultdict(lambda: defaultdict(list))  # who_in[row_id][period] = [학생…]

for (s, rid, p), var in assign.items():
    if var.value() == 1:
        who_in[rid][p].append(s)

for r in rows_max:
    rid = r['id']
    line = [r['course'], r['hospital']]
    for p in periods:
        if r['capacity'][p] == 0:
            line.append("")           # 배치 불가 칸
        else:
            stu_list = " ".join(sorted(who_in[rid][p]))
            line.append(stu_list)
    csv_rows.append(line)

out_path = Path("배치결과.csv")
with out_path.open("w", newline="", encoding="utf-8-sig") as f:
    writer = csv.writer(f)
    writer.writerow(header)
    writer.writerows(csv_rows)
