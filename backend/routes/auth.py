

# ---------------- IMPORTS ---------------- #
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token
from flask_mail import Message
from db import get_db
import bcrypt
import re
import random
import time

# 🔥 MUST BE AFTER IMPORTS
auth_bp = Blueprint("auth", __name__)

# 🔐 Temporary OTP store
otp_store = {}

# ---------------- VALIDATIONS ---------------- #

def validate_email(email):
    return re.match(r"^[\w.-]+@[\w.-]+\.\w+$", email)

def validate_mobile(mobile):
    return re.match(r"^[6-9]\d{9}$", mobile)

def validate_aadhar(aadhar):
    return re.match(r"^\d{12}$", aadhar)


# ---------------- SIGNUP ---------------- #

@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.json

    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    mobile = data.get("mobile", "").strip()
    aadhar = data.get("aadhar", "").strip()
    password = data.get("password", "")

    if not all([name, email, mobile, aadhar, password]):
        return jsonify({"error": "All fields are required"}), 400

    if not validate_email(email):
        return jsonify({"error": "Invalid email format"}), 400

    if not validate_mobile(mobile):
        return jsonify({"error": "Invalid mobile number"}), 400

    if not validate_aadhar(aadhar):
        return jsonify({"error": "Invalid Aadhar number"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    try:
        db = get_db()
        cursor = db.cursor()

        cursor.execute("""
            INSERT INTO users (name, email, mobile, aadhar, password, role)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (name, email, mobile, aadhar, hashed_password, "user"))

        db.commit()
        cursor.close()
        db.close()

        return jsonify({"message": "User registered successfully"}), 201

    except Exception as e:
        return jsonify({"error": "Registration failed"}), 500


# ---------------- LOGIN ---------------- #

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    email = data.get("email", "").strip()
    password = data.get("password", "")
    role = data.get("role", "user")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)

        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        cursor.close()
        db.close()

        if not user:
            return jsonify({"error": "Invalid credentials"}), 401

        if not bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
            return jsonify({"error": "Invalid credentials"}), 401

        if user["role"].lower() != role.lower():
            return jsonify({"error": "Unauthorized role"}), 403

        token = create_access_token(
            identity=str(user["id"]),
            additional_claims={
                "role": user["role"],
                "name": user["name"],
                "email": user["email"]
            }
        )

        return jsonify({
            "token": token,
            "user": user
        }), 200

    except Exception as e:
        return jsonify({"error": "Login failed"}), 500


# ---------------- FORGOT PASSWORD ---------------- #

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.json
    email = data.get("email", "").strip()

    if not email:
        return jsonify({"error": "Email is required"}), 400

    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()
        db.close()

        if not user:
            return jsonify({"error": "Email not found"}), 404

        otp = str(random.randint(100000, 999999))

        otp_store[email] = {
            "otp": otp,
            "expires": time.time() + 300
        }

        print("Generated OTP:", otp)

        mail = current_app.mail

        msg = Message(
            subject="Password Reset OTP",
            sender=current_app.config.get("MAIL_USERNAME"),
            recipients=[email],
            body=f"Your OTP is: {otp}"
        )

        mail.send(msg)

        return jsonify({"message": "OTP sent successfully"}), 200

    except Exception as e:
        print("OTP ERROR:", str(e))
        return jsonify({"error": "Error sending OTP"}), 500


# ---------------- RESET PASSWORD ---------------- #

@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.json

    email = data.get("email", "").strip()
    otp = data.get("otp", "").strip()
    new_password = data.get("new_password", "")

    if not all([email, otp, new_password]):
        return jsonify({"error": "All fields are required"}), 400

    if email not in otp_store:
        return jsonify({"error": "OTP not requested"}), 400

    stored = otp_store[email]

    if time.time() > stored["expires"]:
        del otp_store[email]
        return jsonify({"error": "OTP expired"}), 400

    if stored["otp"] != otp:
        return jsonify({"error": "Invalid OTP"}), 400

    hashed_password = bcrypt.hashpw(
        new_password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    try:
        db = get_db()
        cursor = db.cursor()

        cursor.execute(
            "UPDATE users SET password = %s WHERE email = %s",
            (hashed_password, email)
        )

        db.commit()
        cursor.close()
        db.close()

        del otp_store[email]

        return jsonify({"message": "Password reset successful"}), 200

    except Exception as e:
        return jsonify({"error": "Reset failed"}), 500