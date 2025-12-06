# Todo API Backend

Backend API for Todo application built with FastAPI and JWT authentication.

## Setup

1. Create a virtual environment (recommended):
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
python main.py
```

Server will run on `http://localhost:8000`

## API Documentation

Once the server is running, you can access:
- Interactive API docs: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

## API Endpoints

All endpoints except `/signup` and `/login` require authentication via JWT token in the Authorization header.

### Authentication

All authenticated requests must include:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### 1. Signup

```bash
curl -X POST http://localhost:8000/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### 2. Login

```bash
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid credentials
- `422 Unprocessable Entity`: Validation error (invalid email format, missing fields)

### 3. Get Profile

**Requires Authentication**

```bash
curl -X GET http://localhost:8000/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Response:
```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token

### 4. Get All Todos

**Requires Authentication**

```bash
curl -X GET http://localhost:8000/todos \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Response:
```json
[
  {
    "id": 1,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "user_email": "user@example.com",
    "created_at": "2024-01-15T10:30:00"
  }
]
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token

### 5. Create Todo

**Requires Authentication**

```bash
curl -X POST http://localhost:8000/todos \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, eggs, bread"
  }'
```

**Request Body:**
- `title` (required): Todo title
- `description` (optional): Todo description

Response:
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "user_email": "user@example.com",
  "created_at": "2024-01-15T10:30:00"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `422 Unprocessable Entity`: Validation error

### 6. Update Todo

**Requires Authentication**

```bash
curl -X PUT http://localhost:8000/todos/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true
  }'
```

**Request Body (all fields optional):**
- `title` (optional): Update todo title
- `description` (optional): Update todo description
- `completed` (optional): Update completion status (true/false)

**Example - Update only title:**
```bash
curl -X PUT http://localhost:8000/todos/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated title"
  }'
```

**Example - Mark as completed:**
```bash
curl -X PUT http://localhost:8000/todos/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true
  }'
```

Response:
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": true,
  "user_email": "user@example.com",
  "created_at": "2024-01-15T10:30:00"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Not authorized to update this todo
- `404 Not Found`: Todo not found

### 7. Delete Todo

**Requires Authentication**

```bash
curl -X DELETE http://localhost:8000/todos/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Response:
```json
{
  "message": "Todo deleted"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Not authorized to delete this todo
- `404 Not Found`: Todo not found

## Example: Complete Workflow

1. **Sign up a new user:**
```bash
curl -X POST http://localhost:8000/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123",
    "name": "John Doe"
  }'
```

2. **Save the token from the response and use it for authenticated requests:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

3. **Create a todo:**
```bash
curl -X POST http://localhost:8000/todos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project",
    "description": "Finish the todo app assignment"
  }'
```

4. **Get all todos:**
```bash
curl -X GET http://localhost:8000/todos \
  -H "Authorization: Bearer $TOKEN"
```

5. **Mark todo as completed:**
```bash
curl -X PUT http://localhost:8000/todos/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true
  }'
```

6. **Delete a todo:**
```bash
curl -X DELETE http://localhost:8000/todos/1 \
  -H "Authorization: Bearer $TOKEN"
```

## Tech Stack

- **FastAPI** - Modern, fast web framework for building APIs
- **JWT (PyJWT)** - JSON Web Token authentication
- **Bcrypt** - Password hashing for secure storage
- **Pydantic** - Data validation using Python type annotations
- **Uvicorn** - ASGI server for running FastAPI
- **Python 3.13+** - Programming language

## Data Storage

⚠️ **Note:** This backend uses in-memory storage (`users_db` and `todos_db` dictionaries). This means:
- All data is lost when the server restarts
- Data is not persisted between sessions
- Suitable for development and testing only

For production use, integrate with a database such as:
- PostgreSQL
- MongoDB
- SQLite
- MySQL

## Security Features

- Password hashing using bcrypt
- JWT token-based authentication
- Token expiration (7 days)
- CORS middleware enabled
- Input validation using Pydantic models
- Email format validation

## Error Handling

The API returns appropriate HTTP status codes:
- `200 OK` - Successful request
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Invalid or missing authentication token
- `403 Forbidden` - Not authorized to perform action
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation error

## Development

To run in development mode with auto-reload:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## License

This project is part of a coding assignment.

