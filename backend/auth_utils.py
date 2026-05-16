from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv()

# to get a string like this run:
# openssl rand -hex 32
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "b3363bdcda0538f7253b7feff86014e7a83dcc6ed53ff84dcc4285b0d0c3eb2a")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def verify_password(plain_password, hashed_password):
    if hashed_password is None:
        return False
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
