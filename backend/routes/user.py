from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from db import get_db
import bcrypt

user_bp = Blueprint("user", __name__)

@user_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id, name, email, mobile, aadhar, role, created_at FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    cursor.close()
    db.close()
    if not user:
        return jsonify({"error": "User not found"}), 404
    if user.get("created_at"):
        user["created_at"] = user["created_at"].isoformat()
    return jsonify(user), 200

@user_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    data = request.json
    name = data.get("name", "").strip()
    mobile = data.get("mobile", "").strip()

    if not name:
        return jsonify({"error": "Name is required"}), 400

    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("UPDATE users SET name=%s, mobile=%s WHERE id=%s", (name, mobile, user_id))
        db.commit()
        cursor.close()
        db.close()
        return jsonify({"message": "Profile updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": "Failed to update profile"}), 500