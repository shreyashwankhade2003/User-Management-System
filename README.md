# User Management System

Full-stack application with React frontend, Python/Flask backend, and MySQL database.

## Tech Stack
- **Frontend:** React 18, React Router, Axios
- **Backend:** Python 3, Flask, Flask-JWT-Extended, bcrypt
- **Database:** MySQL

## Features
- Role-based access (Admin & User)
- JWT authentication with bcrypt password hashing
- Admin CRUD operations on users
- User profile view & edit
- Unique constraints on Email, Mobile, Aadhar
- Input validations
- Responsive UI

## Setup Instructions

### 1. Database Setup
```bash
# Login to MySQL
mysql -u root -p

# Run the schema
source database/schema.sql;
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Edit .env with your MySQL credentials
# Then run:
python app.py
```
Backend runs on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start the app
npm start
```
Frontend runs on `http://localhost:3000`

## Default Admin Credentials
- **Email:** admin@example.com
- **Password:** admin123

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/signup | Register new user | No |
| POST | /api/auth/login | Login | No |
| GET | /api/admin/users | Get all users | Admin |
| POST | /api/admin/users | Add user | Admin |
| PUT | /api/admin/users/:id | Update user | Admin |
| DELETE | /api/admin/users/:id | Delete user | Admin |
| GET | /api/user/profile | Get own profile | User |
| PUT | /api/user/profile | Update own profile | User |

## Folder Structure
```
user-management-system/
├── README.md
├── database/
│   └── schema.sql
├── backend/
│   ├── .env
│   ├── app.py
│   ├── db.py
│   ├── requirements.txt
│   └── routes/
│       ├── __init__.py
│       ├── auth.py
│       ├── admin.py
│       └── user.py
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        ├── index.css
        ├── App.js
        ├── api.js
        └── pages/
            ├── Welcome.js
            ├── Login.js
            ├── Signup.js
            ├── AdminDashboard.js
            └── UserDashboard.js
```

