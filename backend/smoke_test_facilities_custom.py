import os
import sys
import django
import pandas as pd

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from academic.models import Facility, Institution
from academic.services.ingestion_service import IngestionService

def run_smoke_test():
    print("--- Starting Facilities Bulk Upload & Category Customization Smoke Test ---")
    
    institution = Institution.objects.first()
    if not institution:
        print("Error: No institution found in the database. Cannot run test.")
        sys.exit(1)
        
    print(f"Using institution: {institution.name} (ID: {institution.id})")
    
    # 1. Test custom category creation directly
    print("\n1. Testing Custom Category Creation...")
    facility = Facility.objects.create(
        institution=institution,
        name="Test Drone Lab",
        facility_type="Robotics Lab", # Custom category
        building="Innovation Wing",
        capacity=20,
        status="Active"
    )
    print(f"✅ Created facility with custom category: {facility.name} (Type: {facility.facility_type})")
    
    # 2. Test Bulk Upload Validation
    print("\n2. Testing Bulk Upload Validation...")
    # Create a temporary Excel file
    data = {
        'Facility Name': ['Cybersecurity Range', 'Advanced Computing Hub'],
        'Category': ['Security Facility', 'HPC Center'],
        'Building': ['Tech Block A', 'Tech Block B'],
        'Capacity': [30, 50],
        'Current Usage': [10, 25],
        'Status (Active/Maintenance/Closed)': ['Active', 'Maintenance'],
        'Description': ['Network training lab', 'Supercomputer cluster'],
        'Equipment': ['15 Servers', '2 Clusters'],
        'Manager': ['Alice', 'Bob'],
        'Contact Number': ['12345', '67890']
    }
    df = pd.DataFrame(data)
    test_file_path = "test_facilities_upload.xlsx"
    df.to_excel(test_file_path, index=False)
    
    try:
        # Validate
        validation_result = IngestionService.validate_upload('facilities', test_file_path, institution.id)
        if validation_result['status'] == 'success':
            print(f"✅ Validation successful: processed {len(validation_result['processed_data'])} rows.")
            has_error = any(row['status'] == 'Error' for row in validation_result['processed_data'])
            if has_error:
                print("❌ Validation found errors where it shouldn't have:")
                for r in validation_result['processed_data']:
                    if r['status'] == 'Error':
                        print(r['messages'])
                sys.exit(1)
        else:
            print("❌ Validation failed entirely!")
            sys.exit(1)
            
        # Commit
        print("\n3. Testing Bulk Upload Commit...")
        IngestionService.commit_upload('facilities', validation_result['processed_data'], institution.id)
        
        # Verify
        fac1 = Facility.objects.filter(name='Cybersecurity Range').first()
        fac2 = Facility.objects.filter(name='Advanced Computing Hub').first()
        
        if fac1 and fac2 and fac1.facility_type == 'Security Facility' and fac2.facility_type == 'HPC Center':
            print(f"✅ Successfully committed bulk upload! Found: {fac1.name} and {fac2.name} with custom categories.")
        else:
            print("❌ Commit verification failed. Facilities not found or categories incorrect.")
            sys.exit(1)
            
    finally:
        # Cleanup
        if os.path.exists(test_file_path):
            os.remove(test_file_path)
        facility.delete()
        if 'fac1' in locals() and fac1: fac1.delete()
        if 'fac2' in locals() and fac2: fac2.delete()
        
    print("\n🎉 Facilities Bulk Upload & Category Customization Smoke Test Passed Successfully!")

if __name__ == "__main__":
    run_smoke_test()
