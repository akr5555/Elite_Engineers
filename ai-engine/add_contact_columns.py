"""Add email and phone columns to engineers table"""

import psycopg2

# Database connection parameters
conn_params = {
    'dbname': 'elite_db',
    'user': 'postgres',
    'password': '@Nitish@6250',
    'host': 'localhost',
    'port': 5432
}

try:
    # Connect to database
    conn = psycopg2.connect(**conn_params)
    cursor = conn.cursor()
    
    # Add email column
    cursor.execute("""
        ALTER TABLE engineers 
        ADD COLUMN IF NOT EXISTS email VARCHAR(255);
    """)
    
    # Add phone column
    cursor.execute("""
        ALTER TABLE engineers 
        ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
    """)
    
    # Commit changes
    conn.commit()
    
    print("✅ Successfully added email and phone columns to engineers table")
    
    # Verify columns were added
    cursor.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'engineers' 
        AND column_name IN ('email', 'phone');
    """)
    
    columns = cursor.fetchall()
    print("\nVerification:")
    for col in columns:
        print(f"  - {col[0]}: {col[1]}")
    
except Exception as e:
    print(f"❌ Error: {e}")
finally:
    if cursor:
        cursor.close()
    if conn:
        conn.close()
