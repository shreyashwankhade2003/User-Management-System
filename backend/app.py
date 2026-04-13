from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from dotenv import load_dotenv
import os
import bcrypt

load_dotenv()

app = Flask(__name__)

# ✅ CORS
CORS(app)

# ✅ JWT Config
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "fallback-secret")

# ✅ MAIL CONFIG (for OTP)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME")  # from .env
app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD")  # app password

# Initialize extensions
jwt = JWTManager(app)
mail = Mail(app)

# 🔥 Make mail accessible in routes
app.mail = mail

# ---------------- HEALTH CHECK ---------------- #

@app.route("/", methods=["GET"])
def health_check():
    return "User Management API is running", 200


# ---------------- DEFAULT ADMIN ---------------- #

def ensure_default_admin():
    from db import get_db

    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "SELECT id, password FROM users WHERE email = %s AND role = 'admin'",
        ("admin@example.com",)
    )
    admin = cursor.fetchone()

    hashed_password = bcrypt.hashpw(
        "admin123".encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    if admin:
        admin_id, stored_password = admin

        # ✅ Fix: ensure password is hashed correctly
        if not bcrypt.checkpw("admin123".encode("utf-8"), stored_password.encode("utf-8")):
            cursor.execute(
                "UPDATE users SET password = %s WHERE id = %s",
                (hashed_password, admin_id)
            )
            db.commit()
    else:
        cursor.execute(
            """
            INSERT INTO users (name, email, mobile, aadhar, password, role)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            ("Admin", "admin@example.com", "9999999999", "999999999999", hashed_password, "admin")
        )
        db.commit()

    cursor.close()
    db.close()


# ---------------- REGISTER ROUTES ---------------- #

from routes.auth import auth_bp
from routes.admin import admin_bp
from routes.user import user_bp

# Ensure admin exists before app starts
ensure_default_admin()

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(admin_bp, url_prefix="/api/admin")
app.register_blueprint(user_bp, url_prefix="/api/user")


# ---------------- RUN SERVER ---------------- #

if __name__ == "__main__":
    app.run(debug=True, port=5000)