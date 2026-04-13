import mysql.connector

# Database configuration
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "Shreyash@12345$",
    "database": "user_management"
}

try:
    # Connect to MySQL
    conn = mysql.connector.connect(**db_config)

    if conn.is_connected():
        print("✅ Connected to MySQL database")

        cursor = conn.cursor()

        # Show all tables
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()

        print("\n📂 Tables in database:")
        for table in tables:
            print(table[0])

except mysql.connector.Error as err:
    print("❌ Error:", err)

finally:
    if 'conn' in locals() and conn.is_connected():
        cursor.close()
        conn.close()
        print("\n🔌 Connection closed")