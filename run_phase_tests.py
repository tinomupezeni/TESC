import requests
import runpy
import urllib3
import sys

# Disable SSL verification globally for all requests
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
old_merge_environment_settings = requests.Session.merge_environment_settings

def new_merge_environment_settings(self, url, *args, **kwargs):
    settings = old_merge_environment_settings(self, url, *args, **kwargs)
    settings['verify'] = False
    return settings

requests.Session.merge_environment_settings = new_merge_environment_settings

scripts = [
    "smoke_test_phase1_core.py",
    "smoke_test_phase2_placements.py",
    "smoke_test_phase3_scholarships.py",
    "smoke_test_phase4_mobility.py",
    "smoke_test_phase5_ingestion.py"
]

all_passed = True
for script in scripts:
    print(f"\n🚀 Running {script}...")
    try:
        runpy.run_path(script, run_name="__main__")
        print(f"✅ {script} passed.")
    except Exception as e:
        print(f"❌ {script} failed with error: {e}")
        all_passed = False

if all_passed:
    print("\n🎉 All phase tests passed successfully!")
    sys.exit(0)
else:
    print("\n🛑 Some phase tests failed.")
    sys.exit(1)
