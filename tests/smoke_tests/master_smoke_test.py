import subprocess
import os
import sys

# List of all smoke tests to run
TEST_SCRIPTS = [
    "smoke_test.py",
    "smoke_test_admin.py",
    "smoke_test_inst.py",
    "smoke_test_departments.py",
    "smoke_test_modules.py",
    "smoke_test_students.py",
    "smoke_test_auth_block.py",
    "smoke_test_faculty_delete.py",
    "smoke_test_program_options.py",
    "smoke_test_inst_crud.py",
    "smoke_test_report_isolation.py",
    "smoke_test_graduates.py",
    "smoke_test_student_quick_graduate.py",
    "smoke_test_iseop.py",
    "smoke_test_facilities.py",
    "smoke_test_innovation.py",
    "smoke_test_student_bulk_delete.py"
]

def run_test(script_path):
    print(f"\n{'='*30}")
    print(f"🚀 RUNNING: {script_path}")
    print(f"{'='*30}")
    
    # We use runpy to execute the script in the same process but isolated, 
    # and we monkeypatch requests to disable SSL warnings globally for this run.
    script_content = f"""
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
import requests
old_req = requests.Session.request
def new_req(self, method, url, **kwargs):
    url = url.replace('http://localhost:8000/api', 'https://tesc.zchpc.ac.zw/api')
    url = url.replace('https://localhost/api', 'https://tesc.zchpc.ac.zw/api')
    kwargs.setdefault('headers', {{}})
    kwargs['headers']['X-Smoke-Test-Key'] = 'default-insecure-smoke-key'
    return old_req(self, method, url, **kwargs)
requests.Session.request = new_req
import runpy
runpy.run_path('{script_path}', run_name='__main__')
"""
    cmd = [sys.executable, "-c", script_content]
    
    try:
        result = subprocess.run(cmd, capture_output=False, text=True)
        if result.returncode == 0:
            print(f"\n✅ {script_path} PASSED")
            return True
        else:
            print(f"\n❌ {script_path} FAILED (Exit Code: {result.returncode})")
            return False
    except Exception as e:
        print(f"\n💥 {script_path} CRASHED: {str(e)}")
        return False

if __name__ == "__main__":
    print(f"--- TESC MASTER SMOKE TEST RUNNER ---")
    print(f"Target: https://tesc.zchpc.ac.zw/api")
    print(f"Tests: {len(TEST_SCRIPTS)}")
    
    results = []
    for test in TEST_SCRIPTS:
        if os.path.exists(test):
            success = run_test(test)
            results.append((test, success))
        else:
            print(f"⚠️ Warning: {test} not found, skipping.")
    
    print(f"\n\n{'='*40}")
    print(f"📊 FINAL RESULTS SUMMARY")
    print(f"{'='*40}")
    
    passed_count = sum(1 for _, s in results if s)
    for test, success in results:
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"{test:<30} {status}")
    
    print(f"{'='*40}")
    print(f"TOTAL: {passed_count}/{len(results)} PASSED")
    
    if passed_count == len(results):
        print("\n🌟 ALL SYSTEMS OPERATIONAL!")
        sys.exit(0)
    else:
        print("\n🛑 SYSTEM HAS FAILURES!")
        sys.exit(1)
