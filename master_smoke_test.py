import subprocess
import os
import sys

# List of all smoke tests to run
smoke_tests = [
    "smoke_test.py",
    "smoke_test_admin.py",
    "smoke_test_inst.py",
    "smoke_test_departments.py",
    "smoke_test_modules.py",
    "smoke_test_students.py",
    "smoke_test_auth_block.py",
    "smoke_test_faculty_delete.py",
    "smoke_test_program_options.py",
    "smoke_test_inst_crud.py"
]

def run_test(script_path):
    print(f"\n{'='*30}")
    print(f"🚀 RUNNING: {script_path}")
    print(f"{'='*30}")
    
    # We use runpy to execute the script in the same process but isolated, 
    # and we monkeypatch requests to disable SSL warnings globally for this run.
    cmd = [
        sys.executable, "-c", 
        f"import urllib3; urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning); "
        f"import runpy; runpy.run_path('{script_path}')"
    ]
    
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
    print(f"Target: https://localhost/api")
    print(f"Tests: {len(smoke_tests)}")
    
    results = []
    for test in smoke_tests:
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
