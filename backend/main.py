from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import jwt
from datetime import datetime, timedelta
from passlib.hash import bcrypt
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "your-secret-key-12345"
ALGORITHM = "HS256"
security = HTTPBearer()

users_db = {}
todos_db = {}
todo_counter = 0

class UserSignup(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TodoCreate(BaseModel):
    title: str
    description: Optional[str] = ""

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None

def create_token(email: str):
    expire = datetime.utcnow() + timedelta(days=7)
    token = jwt.encode({"sub": email, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)
    return token

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email not in users_db:
            raise HTTPException(status_code=401, detail="Invalid token")
        return email
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/signup")
def signup(user: UserSignup):
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="User already exists")
    
    hashed_password = bcrypt.hash(user.password)
    users_db[user.email] = {
        "email": user.email,
        "password": hashed_password,
        "name": user.name
    }
    
    token = create_token(user.email)
    return {"token": token, "user": {"email": user.email, "name": user.name}}

@app.post("/login")
def login(user: UserLogin):
    if user.email not in users_db:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    if not bcrypt.verify(user.password, users_db[user.email]["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    token = create_token(user.email)
    return {"token": token, "user": {"email": user.email, "name": users_db[user.email]["name"]}}

@app.get("/profile")
def get_profile(email: str = Depends(verify_token)):
    user = users_db[email]
    return {"email": user["email"], "name": user["name"]}

@app.get("/todos")
def get_todos(email: str = Depends(verify_token)):
    user_todos = [todo for todo in todos_db.values() if todo["user_email"] == email]
    return user_todos

@app.post("/todos")
def create_todo(todo: TodoCreate, email: str = Depends(verify_token)):
    global todo_counter
    todo_counter += 1
    
    new_todo = {
        "id": todo_counter,
        "title": todo.title,
        "description": todo.description,
        "completed": False,
        "user_email": email,
        "created_at": datetime.utcnow().isoformat()
    }
    
    todos_db[todo_counter] = new_todo
    return new_todo

@app.put("/todos/{todo_id}")
def update_todo(todo_id: int, todo: TodoUpdate, email: str = Depends(verify_token)):
    if todo_id not in todos_db:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    if todos_db[todo_id]["user_email"] != email:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if todo.title is not None:
        todos_db[todo_id]["title"] = todo.title
    if todo.description is not None:
        todos_db[todo_id]["description"] = todo.description
    if todo.completed is not None:
        todos_db[todo_id]["completed"] = todo.completed
    
    return todos_db[todo_id]

@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int, email: str = Depends(verify_token)):
    if todo_id not in todos_db:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    if todos_db[todo_id]["user_email"] != email:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    del todos_db[todo_id]
    return {"message": "Todo deleted"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

