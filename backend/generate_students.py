import pandas as pd
import random
from faker import Faker

fake = Faker()

# Configuration
NUM_STUDENTS = 250
FILENAME = "bulk_students_autocreate6.xlsx" # Updated filename

# --- FIX: Mapping structure to include Categories ---
# Realistic Structure Mapping
ACADEMIC_STRUCTURE = {
    'Faculty of Science': {
        'Computer Science': {
            'programs': ['BSCS', 'BIT', 'BSc Software Eng'],
            'category': 'STEM'
        },
        'Physics': {
            'programs': ['BSc Physics', 'BSc Applied Physics'],
            'category': 'STEM'
        }
    },
    'Faculty of Engineering': {
        'Civil Engineering': {
            'programs': ['BEng Civil', 'Diploma Civil'],
            'category': 'STEM'
        },
        'Electrical': {
            'programs': ['BEng Electrical', 'HND Electrical'],
            'category': 'STEM'
        }
    },
    'Faculty of Arts': {
        'Languages': {
            'programs': ['BA English', 'BA Literature'],
            'category': 'HUMANITIES'
        }
    }
}

ZIM_FIRST_NAMES = ['Tinashe', 'Tatenda', 'Farai', 'Rudo', 'Nyasha', 'Tendai', 'Blessing', 'Precious', 'Brian']
ZIM_SURNAMES = ['Moyo', 'Ncube', 'Sibanda', 'Ndlovu', 'Dube', 'Phiri', 'Banda', 'Mutasa']

def generate_data(num):
    data = []
    generated_ids = set()

    print(f"Generating {num} records...")

    for _ in range(num):
        first_name = random.choice(ZIM_FIRST_NAMES)
        last_name = random.choice(ZIM_SURNAMES)
        
        # Pick random structure
        fac_name = random.choice(list(ACADEMIC_STRUCTURE.keys()))
        dept_name = random.choice(list(ACADEMIC_STRUCTURE[fac_name].keys()))
        
        # --- Get program and its category ---
        prog_info = ACADEMIC_STRUCTURE[fac_name][dept_name]
        prog_name = random.choice(prog_info['programs'])
        category = prog_info['category']
        
        # 1. Pick the year first (2020 - 2025)
        enrol_year = random.randint(2020, 2025)

        # 2. Use that year for the ID so they match (e.g., KW2021...)
        student_id = f"MT{enrol_year}{random.randint(1000,9999)}"
        
        # Ensure ID uniqueness
        while student_id in generated_ids:
            student_id = f"MT{enrol_year}{random.randint(1000,9999)}"
        generated_ids.add(student_id)

        record = {
            "student_id": student_id,
            "first_name": first_name,
            "last_name": last_name,
            "national_id": f"{random.randint(10,99)}-{random.randint(100000,999999)}X{random.randint(10,99)}",
            "gender": random.choice(['Male', 'Female']),
            "faculty": fac_name,       
            "department": dept_name,   
            "program": prog_name,
            "category": category, # <--- New Column Added
            "enrollment_year": enrol_year 
        }
        data.append(record)

    return data

if __name__ == "__main__":
    df = pd.DataFrame(generate_data(NUM_STUDENTS))
    df.to_excel(FILENAME, index=False)
    print(f"Created {FILENAME} with {NUM_STUDENTS} students.")