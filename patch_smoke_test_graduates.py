import re

file_path = "smoke_test_graduates.py"
with open(file_path, "r") as f:
    content = f.read()

pattern1 = r'requests\.post\(f"\{BASE_URL\}/academic/students/", json=\{(.*?)"student_id": f"E1-\{suffix\}"(.*?)\}, headers=super_headers, verify=False\)'
repl1 = r'e1_resp = requests.post(f"{BASE_URL}/academic/students/", json={\1"student_id": f"E1-{suffix}"\2}, headers=super_headers, verify=False)\n    e1_id = e1_resp.json().get("id", None)'
content = re.sub(pattern1, repl1, content, flags=re.DOTALL)

pattern2 = r'requests\.post\(f"\{BASE_URL\}/academic/students/", json=\{(.*?)"student_id": f"E2-\{suffix\}"(.*?)\}, headers=super_headers, verify=False\)'
repl2 = r'e2_resp = requests.post(f"{BASE_URL}/academic/students/", json={\1"student_id": f"E2-{suffix}"\2}, headers=super_headers, verify=False)\n    e2_id = e2_resp.json().get("id", None)'
content = re.sub(pattern2, repl2, content, flags=re.DOTALL)

pattern3 = r'    all_s_res = requests\.get\(f"\{BASE_URL\}/academic/students/\?page_size=1000".*?e1_id = next\(s\[\'id\'\] for s in all_s if s\[\'student_id\'\] == f"E1-\{suffix\}"\)'
content = re.sub(pattern3, '', content, flags=re.DOTALL)

with open(file_path, "w") as f:
    f.write(content)
