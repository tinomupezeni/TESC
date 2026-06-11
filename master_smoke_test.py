import subprocess
import sys

def run_script(script_name):
    print(f"\n{'='*50}")
    print(f"RUNNING: {script_name}")
    print(f"{'='*50}\n")
    
    result = subprocess.run([sys.executable, script_name], capture_output=False)
    if result.returncode != 0:
        print(f"\n❌ {script_name} FAILED!")
        return False
    
    print(f"\n✅ {script_name} PASSED!")
    return True

def main():
    scripts = [
        "smoke_test_admin.py",
        "smoke_test_inst.py",
        "smoke_test_modules.py"
    ]
    
    overall_success = True
    for script in scripts:
        if not run_script(script):
            overall_success = False
            # break # Optionally stop on first failure
            
    if overall_success:
        print("\n" + "*"*50)
        print("🌟 ALL SMOKE TESTS PASSED! 🌟")
        print("*"*50)
    else:
        print("\n" + "!"*50)
        print("🚨 SOME SMOKE TESTS FAILED! 🚨")
        print("!"*50)
        sys.exit(1)

if __name__ == "__main__":
    main()
