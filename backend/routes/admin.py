from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from db import get_db
import bcrypt
import re

admin_bp = Blueprint("admin", __name__)

def admin_required(fn):
    from functools import wraps
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get("role") != "admin":
            return jsonify({"error": "Admin access required"}), 403
        return fn(*args, **kwargs)
    return wrapper

@admin_bp.route("/users", methods=["GET"])
@admin_required
def get_users():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id, name, email, mobile, aadhar, role, created_at FROM users")
    users = cursor.fetchall()
    cursor.close()
    db.close()
    for u in users:
        if u.get("created_at"):
            u["created_at"] = u["created_at"].isoformat()
    return jsonify(users), 200

@admin_bp.route("/users", methods=["POST"])
@admin_required
def add_user():
    data = request.json
    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    mobile = data.get("mobile", "").strip()
    aadhar = data.get("aadhar", "").strip()
    password = data.get("password", "")
    role = data.get("role", "user")

    if not all([name, email, mobile, aadhar, password]):
        return jsonify({"error": "All fields are required"}), 400

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO users (name, email, mobile, aadhar, password, role) VALUES (%s, %s, %s, %s, %s, %s)",
            (name, email, mobile, aadhar, hashed, role)
        )
        db.commit()
        cursor.close()
        db.close()
        return jsonify({"message": "User added successfully"}), 201
    except Exception as e:
        error_msg = str(e)
        if "Duplicate" in error_msg:
            if "email" in error_msg:
                return jsonify({"error": "Email already exists"}), 409
            elif "mobile" in error_msg:
                return jsonify({"error": "Mobile number already exists"}), 409
            elif "aadhar" in error_msg:
                return jsonify({"error": "Aadhar number already exists"}), 409
        return jsonify({"error": "Failed to add user"}), 500

@admin_bp.route("/users/<int:user_id>", methods=["PUT"])
@admin_required
def update_user(user_id):
    data = request.json
    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    mobile = data.get("mobile", "").strip()
    aadhar = data.get("aadhar", "").strip()

    if not all([name, email, mobile, aadhar]):
        return jsonify({"error": "All fields are required"}), 400

    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            "UPDATE users SET name=%s, email=%s, mobile=%s, aadhar=%s WHERE id=%s",
            (name, email, mobile, aadhar, user_id)
        )
        db.commit()
        cursor.close()
        db.close()
        return jsonify({"message": "User updated successfully"}), 200
    except Exception as e:
        error_msg = str(e)
        if "Duplicate" in error_msg:
            return jsonify({"error": "Duplicate value found"}), 409
        return jsonify({"error": "Failed to update user"}), 500

@admin_bp.route("/users/<int:user_id>", methods=["DELETE"])
@admin_required
def delete_user(user_id):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        db.commit()
        cursor.close()
        db.close()
        return jsonify({"message": "User deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": "Failed to delete user"}), 500