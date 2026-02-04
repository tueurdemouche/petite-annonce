from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import bcrypt
from jose import JWTError, jwt
import base64
from bson import ObjectId
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'petite_annonce')]

# JWT Settings
SECRET_KEY = os.environ.get('SECRET_KEY', 'petite-annonce-secret-key-2025')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

# Site URL
SITE_URL = os.environ.get('SITE_URL', 'https://lapetiteannonce.fr')

# Email Settings
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'contact@lapetiteannonce.fr')
SMTP_SERVER = os.environ.get('SMTP_SERVER', 'smtp.ionos.fr')
SMTP_PORT = int(os.environ.get('SMTP_PORT', '587'))
SMTP_USER = os.environ.get('SMTP_USER', '')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')

# Create the main app
app = FastAPI(title="Petite Annonce API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: str
    phone: str
    password: str
    first_name: str
    last_name: str
    birth_date: str
    pseudo: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    phone: str
    first_name: str
    last_name: str
    pseudo: str
    birth_date: str
    is_verified: bool
    email_verified: bool = False
    is_admin: bool
    created_at: datetime
    identity_verified: bool

class ResendVerificationEmail(BaseModel):
    email: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class ListingCreate(BaseModel):
    title: str
    description: str
    price: float
    category: str
    sub_category: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    photos: List[str] = []
    brand: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    mileage: Optional[int] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    vehicle_type: Optional[str] = None
    surface_m2: Optional[int] = None
    rooms: Optional[int] = None
    floor: Optional[int] = None
    total_floors: Optional[int] = None
    handicap_access: Optional[bool] = None
    has_garden: Optional[bool] = None
    property_type: Optional[str] = None

class ListingResponse(BaseModel):
    id: str
    user_id: str
    user_name: str
    user_phone: Optional[str] = None
    title: str
    description: str
    price: float
    category: str
    sub_category: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    photos: List[str] = []
    brand: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    mileage: Optional[int] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    vehicle_type: Optional[str] = None
    surface_m2: Optional[int] = None
    rooms: Optional[int] = None
    floor: Optional[int] = None
    total_floors: Optional[int] = None
    handicap_access: Optional[bool] = None
    has_garden: Optional[bool] = None
    property_type: Optional[str] = None
    status: str
    is_boosted: bool = False
    boost_until: Optional[datetime] = None
    views: int = 0
    created_at: datetime
    expires_at: datetime
    last_repost_date: Optional[datetime] = None

class MessageCreate(BaseModel):
    listing_id: str
    content: str

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    listing_id: str
    listing_title: str
    sender_id: str
    sender_name: str
    receiver_id: str
    receiver_name: str
    content: str
    is_read: bool
    created_at: datetime

class ConversationResponse(BaseModel):
    id: str
    listing_id: str
    listing_title: str
    listing_photo: Optional[str] = None
    listing_price: float
    other_user_id: str
    other_user_name: str
    last_message: str
    last_message_date: datetime
    unread_count: int

# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def generate_verification_token():
    return secrets.token_urlsafe(32)

def generate_admin_token(listing_id: str, action: str):
    data = {"listing_id": listing_id, "action": action, "exp": datetime.utcnow() + timedelta(days=7)}
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def verify_admin_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token invalide")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalide")
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise HTTPException(status_code=401, detail="Utilisateur non trouve")
    return user

def calculate_age(birth_date: str) -> int:
    birth = datetime.strptime(birth_date, "%Y-%m-%d")
    today = datetime.today()
    return today.year - birth.year - ((today.month, today.day) < (birth.month, birth.day))

def user_to_response(user: dict) -> UserResponse:
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        phone=user["phone"],
        first_name=user["first_name"],
        last_name=user["last_name"],
        pseudo=user.get("pseudo", user["first_name"]),
        birth_date=user["birth_date"],
        is_verified=user.get("is_verified", False),
        email_verified=user.get("email_verified", False),
        is_admin=user.get("is_admin", False),
        created_at=user.get("created_at", datetime.utcnow()),
        identity_verified=user.get("identity_verified", False)
    )

def validate_pseudo(pseudo: str) -> str:
    import re
    cleaned = re.sub(r'[^a-zA-Z0-9\s]', '', pseudo)
    cleaned = ' '.join(cleaned.split())
    if len(cleaned) < 2:
        raise HTTPException(status_code=400, detail="Le pseudo doit contenir au moins 2 caracteres")
    if len(cleaned) > 30:
        raise HTTPException(status_code=400, detail="Le pseudo ne peut pas depasser 30 caracteres")
    return cleaned

async def send_email(to_email: str, subject: str, html_content: str):
    try:
        if not SMTP_USER or not SMTP_PASSWORD:
            logger.warning("SMTP credentials not configured")
            return False
            
        msg = MIMEMultipart('alternative')
        msg['From'] = SMTP_USER
        msg['To'] = to_email
        msg['Subject'] = subject
        
        html_part = MIMEText(html_content, 'html', 'utf-8')
        msg.attach(html_part)
        
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

async def send_verification_email_to_user(user_email: str, first_name: str, token: str):
    verification_link = f"{SITE_URL}/verify-email?token={token}"
    html_content = f"""
    <!DOCTYPE html><html><head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1>La Petite Annonce</h1>
            </div>
            <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2>Bienvenue {first_name} !</h2>
                <p>Confirmez votre email en cliquant sur le bouton:</p>
                <p style="text-align: center;">
                    <a href="{verification_link}" style="display: inline-block; background: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">Confirmer mon email</a>
                </p>
                <p><strong>Ce lien expire dans 24 heures.</strong></p>
            </div>
        </div>
    </body></html>
    """
    return await send_email(user_email, "Confirmez votre email - La Petite Annonce", html_content)

async def send_admin_listing_notification(listing_data: dict, user_data: dict, listing_id: str):
    approve_token = generate_admin_token(listing_id, "approve")
    reject_token = generate_admin_token(listing_id, "reject")
    approve_link = f"{SITE_URL}/api/admin/listings/action?token={approve_token}"
    reject_link = f"{SITE_URL}/api/admin/listings/action?token={reject_token}"
    price_str = f"{listing_data['price']:,.0f}".replace(",", " ")
    
    html_content = f"""
    <!DOCTYPE html><html><head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
            <div style="background: #1e40af; color: white; padding: 25px; text-align: center;">
                <h1 style="margin: 0;">Nouvelle annonce a valider</h1>
            </div>
            <div style="padding: 30px;">
                <h2 style="color: #1e293b;">{listing_data['title']}</h2>
                <div style="font-size: 28px; font-weight: bold; color: #16a34a;">{price_str} EUR</div>
                <div style="background: #f8fafc; border-radius: 10px; padding: 20px; margin: 20px 0;">
                    <p><strong>Categorie:</strong> {listing_data['category']} / {listing_data['sub_category']}</p>
                    <p><strong>Localisation:</strong> {listing_data['location']}</p>
                    <p><strong>Photos:</strong> {len(listing_data.get('photos', []))} photo(s)</p>
                </div>
                <div style="background: #eff6ff; border-radius: 8px; padding: 15px; margin: 20px 0;">
                    <h4 style="margin-top: 0; color: #1e40af;">Publie par:</h4>
                    <p><strong>Pseudo:</strong> {user_data.get('pseudo', 'N/A')}</p>
                    <p><strong>Email:</strong> {user_data.get('email', 'N/A')}</p>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{approve_link}" style="display: inline-block; padding: 15px 40px; background: #22c55e; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px;">APPROUVER</a>
                    <a href="{reject_link}" style="display: inline-block; padding: 15px 40px; background: #ef4444; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px;">REJETER</a>
                </div>
            </div>
        </div>
    </body></html>
    """
    return await send_email(ADMIN_EMAIL, f"Nouvelle annonce: {listing_data['title'][:50]}", html_content)

async def send_listing_approved_email(user_email: str, user_name: str, listing_title: str):
    html_content = f"""
    <!DOCTYPE html><html><head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #22c55e; color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
                <div style="font-size: 50px;">&#10003;</div>
                <h1>Annonce Approuvee !</h1>
            </div>
            <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2>Bonjour {user_name},</h2>
                <p>Votre annonce <strong>{listing_title}</strong> est maintenant en ligne !</p>
                <p style="text-align: center;">
                    <a href="{SITE_URL}" style="display: inline-block; background: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px;">Voir mon annonce</a>
                </p>
            </div>
        </div>
    </body></html>
    """
    return await send_email(user_email, f"Votre annonce est en ligne ! - {listing_title}", html_content)

async def send_new_message_notification(receiver_email: str, receiver_name: str, sender_name: str, listing_title: str):
    html_content = f"""
    <!DOCTYPE html><html><head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #1e40af; color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1>Nouveau message !</h1>
            </div>
            <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2>Bonjour {receiver_name},</h2>
                <p>Vous avez recu un nouveau message de <strong>{sender_name}</strong> concernant votre annonce :</p>
                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 20px 0;">
                    <strong>{listing_title}</strong>
                </div>
                <p style="text-align: center;">
                    <a href="{SITE_URL}/messages" style="display: inline-block; background: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px;">Voir mes messages</a>
                </p>
            </div>
        </div>
    </body></html>
    """
    return await send_email(receiver_email, f"Nouveau message - {listing_title}", html_content)

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    age = calculate_age(user_data.birth_date)
    if age < 18:
        raise HTTPException(status_code=400, detail="Vous devez avoir au moins 18 ans")
    
    clean_pseudo = validate_pseudo(user_data.pseudo)
    
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Cet email est deja utilise")
    
    existing_phone = await db.users.find_one({"phone": user_data.phone})
    if existing_phone:
        raise HTTPException(status_code=400, detail="Ce numero est deja utilise")
    
    email_token = generate_verification_token()
    
    user_dict = {
        "email": user_data.email,
        "phone": user_data.phone,
        "password": hash_password(user_data.password),
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
        "pseudo": clean_pseudo,
        "birth_date": user_data.birth_date,
        "is_verified": False,
        "email_verified": False,
        "email_verification_token": email_token,
        "email_verification_expires": datetime.utcnow() + timedelta(hours=24),
        "is_admin": False,
        "identity_verified": False,
        "created_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user_dict)
    user_dict["_id"] = result.inserted_id
    
    await send_verification_email_to_user(user_data.email, user_data.first_name, email_token)
    
    token = create_access_token({"sub": str(result.inserted_id)})
    return TokenResponse(access_token=token, user=user_to_response(user_dict))

@api_router.get("/auth/verify-email")
async def verify_email(token: str):
    user = await db.users.find_one({
        "email_verification_token": token,
        "email_verification_expires": {"$gt": datetime.utcnow()}
    })
    
    if not user:
        raise HTTPException(status_code=400, detail="Lien invalide ou expire")
    
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"email_verified": True}, "$unset": {"email_verification_token": "", "email_verification_expires": ""}}
    )
    
    return {"message": "Email verifie avec succes !", "success": True}

@api_router.post("/auth/resend-verification")
async def resend_verification_email(data: ResendVerificationEmail):
    user = await db.users.find_one({"email": data.email})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouve")
    if user.get("email_verified", False):
        raise HTTPException(status_code=400, detail="Email deja verifie")
    
    new_token = generate_verification_token()
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"email_verification_token": new_token, "email_verification_expires": datetime.utcnow() + timedelta(hours=24)}}
    )
    await send_verification_email_to_user(user["email"], user["first_name"], new_token)
    return {"message": "Email de verification renvoye"}

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    token = create_access_token({"sub": str(user["_id"])})
    return TokenResponse(access_token=token, user=user_to_response(user))

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user = Depends(get_current_user)):
    return user_to_response(user)

# ==================== ADMIN LISTING VALIDATION ====================

@api_router.get("/admin/listings/action")
async def admin_listing_action(token: str):
    payload = verify_admin_token(token)
    if not payload:
        return {"success": False, "message": "Lien invalide ou expire"}
    
    listing_id = payload.get("listing_id")
    action = payload.get("action")
    
    if not listing_id or action not in ["approve", "reject"]:
        return {"success": False, "message": "Action invalide"}
    
    try:
        listing = await db.listings.find_one({"_id": ObjectId(listing_id)})
    except:
        return {"success": False, "message": "Annonce introuvable"}
    
    if not listing:
        return {"success": False, "message": "Annonce introuvable"}
    
    if listing.get("status") != "pending":
        return {"success": False, "message": f"Annonce deja traitee (statut: {listing.get('status')})"}
    
    new_status = "approved" if action == "approve" else "rejected"
    await db.listings.update_one(
        {"_id": ObjectId(listing_id)},
        {"$set": {"status": new_status, "validated_at": datetime.utcnow()}}
    )
    
    if action == "approve":
        user = await db.users.find_one({"_id": ObjectId(listing["user_id"])})
        if user:
            await send_listing_approved_email(user["email"], user.get("pseudo", user["first_name"]), listing["title"])
        return {"success": True, "message": "Annonce APPROUVEE !", "listing_title": listing["title"]}
    else:
        return {"success": True, "message": "Annonce REJETEE.", "listing_title": listing["title"]}

# ==================== LISTINGS ROUTES ====================

@api_router.post("/listings", response_model=ListingResponse)
async def create_listing(listing: ListingCreate, user = Depends(get_current_user)):
    if not user.get("email_verified", False):
        raise HTTPException(status_code=400, detail="Veuillez verifier votre email")
    
    if len(listing.photos) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 photos")
    
    listing_dict = {
        "user_id": str(user["_id"]),
        "user_name": user.get("pseudo", user["first_name"]),
        **listing.dict(),
        "status": "pending",
        "is_boosted": False,
        "boost_until": None,
        "views": 0,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(days=30),
    }
    
    result = await db.listings.insert_one(listing_dict)
    listing_id = str(result.inserted_id)
    
    await send_admin_listing_notification(
        listing_dict,
        {"pseudo": user.get("pseudo"), "email": user.get("email"), "phone": user.get("phone")},
        listing_id
    )
    
    return ListingResponse(id=listing_id, **{k: v for k, v in listing_dict.items() if k != "_id"})

@api_router.get("/listings", response_model=List[ListingResponse])
async def get_listings(
    category: Optional[str] = None, sub_category: Optional[str] = None,
    min_price: Optional[float] = None, max_price: Optional[float] = None,
    location: Optional[str] = None, skip: int = 0, limit: int = 20
):
    query = {"status": "approved", "expires_at": {"$gt": datetime.utcnow()}}
    if category: query["category"] = category
    if sub_category: query["sub_category"] = sub_category
    if min_price: query.setdefault("price", {})["$gte"] = min_price
    if max_price: query.setdefault("price", {})["$lte"] = max_price
    if location: query["location"] = {"$regex": location, "$options": "i"}
    
    sort = [("is_boosted", -1), ("created_at", -1)]
    listings = await db.listings.find(query).sort(sort).skip(skip).limit(limit).to_list(limit)
    
    return [ListingResponse(id=str(l["_id"]), **{k: v for k, v in l.items() if k != "_id"}) for l in listings]

@api_router.get("/listings/boosted", response_model=List[ListingResponse])
async def get_boosted_listings(limit: int = 10):
    query = {"status": "approved", "is_boosted": True, "boost_until": {"$gt": datetime.utcnow()}, "expires_at": {"$gt": datetime.utcnow()}}
    listings = await db.listings.find(query).sort("boost_until", -1).limit(limit).to_list(limit)
    return [ListingResponse(id=str(l["_id"]), **{k: v for k, v in l.items() if k != "_id"}) for l in listings]

@api_router.get("/listings/{listing_id}", response_model=ListingResponse)
async def get_listing(listing_id: str, user = Depends(get_current_user)):
    try:
        listing = await db.listings.find_one({"_id": ObjectId(listing_id)})
    except:
        raise HTTPException(status_code=400, detail="ID invalide")
    
    if not listing:
        raise HTTPException(status_code=404, detail="Annonce non trouvee")
    
    if str(user["_id"]) != listing["user_id"]:
        await db.listings.update_one({"_id": ObjectId(listing_id)}, {"$inc": {"views": 1}})
        listing["views"] = listing.get("views", 0) + 1
    
    response_data = {k: v for k, v in listing.items() if k != "_id"}
    if listing["status"] == "approved":
        owner = await db.users.find_one({"_id": ObjectId(listing["user_id"])})
        if owner:
            response_data["user_phone"] = owner.get("phone")
    
    return ListingResponse(id=str(listing["_id"]), **response_data)

@api_router.get("/my-listings", response_model=List[ListingResponse])
async def get_my_listings(user = Depends(get_current_user)):
    listings = await db.listings.find({"user_id": str(user["_id"])}).sort("created_at", -1).to_list(100)
    return [ListingResponse(id=str(l["_id"]), **{k: v for k, v in l.items() if k != "_id"}) for l in listings]

@api_router.delete("/listings/{listing_id}")
async def delete_listing(listing_id: str, user = Depends(get_current_user)):
    try:
        listing = await db.listings.find_one({"_id": ObjectId(listing_id)})
    except:
        raise HTTPException(status_code=400, detail="ID invalide")
    
    if not listing:
        raise HTTPException(status_code=404, detail="Annonce non trouvee")
    if listing["user_id"] != str(user["_id"]):
        raise HTTPException(status_code=403, detail="Non autorise")
    
    await db.listings.delete_one({"_id": ObjectId(listing_id)})
    return {"message": "Annonce supprimee"}

# ==================== MESSAGING ROUTES ====================

@api_router.post("/messages")
async def send_message(message: MessageCreate, user = Depends(get_current_user)):
    """Send a message to a listing owner"""
    try:
        listing = await db.listings.find_one({"_id": ObjectId(message.listing_id)})
    except:
        raise HTTPException(status_code=400, detail="ID annonce invalide")
    
    if not listing:
        raise HTTPException(status_code=404, detail="Annonce non trouvee")
    
    sender_id = str(user["_id"])
    receiver_id = listing["user_id"]
    
    if sender_id == receiver_id:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas vous envoyer un message")
    
    # Find or create conversation
    conversation = await db.conversations.find_one({
        "listing_id": message.listing_id,
        "$or": [
            {"participant_1": sender_id, "participant_2": receiver_id},
            {"participant_1": receiver_id, "participant_2": sender_id}
        ]
    })
    
    if not conversation:
        conv_result = await db.conversations.insert_one({
            "listing_id": message.listing_id,
            "participant_1": sender_id,
            "participant_2": receiver_id,
            "created_at": datetime.utcnow(),
            "last_message_at": datetime.utcnow()
        })
        conversation_id = str(conv_result.inserted_id)
    else:
        conversation_id = str(conversation["_id"])
        await db.conversations.update_one(
            {"_id": conversation["_id"]},
            {"$set": {"last_message_at": datetime.utcnow()}}
        )
    
    # Create message
    msg_dict = {
        "conversation_id": conversation_id,
        "listing_id": message.listing_id,
        "sender_id": sender_id,
        "receiver_id": receiver_id,
        "content": message.content,
        "is_read": False,
        "created_at": datetime.utcnow()
    }
    
    result = await db.messages.insert_one(msg_dict)
    
    # Send email notification to receiver
    receiver = await db.users.find_one({"_id": ObjectId(receiver_id)})
    if receiver:
        await send_new_message_notification(
            receiver["email"],
            receiver.get("pseudo", receiver["first_name"]),
            user.get("pseudo", user["first_name"]),
            listing["title"]
        )
    
    return {
        "message": "Message envoye",
        "message_id": str(result.inserted_id),
        "conversation_id": conversation_id
    }

@api_router.get("/messages/conversations", response_model=List[ConversationResponse])
async def get_conversations(user = Depends(get_current_user)):
    """Get all conversations for current user"""
    user_id = str(user["_id"])
    
    conversations = await db.conversations.find({
        "$or": [{"participant_1": user_id}, {"participant_2": user_id}]
    }).sort("last_message_at", -1).to_list(100)
    
    result = []
    for conv in conversations:
        # Get the other participant
        other_user_id = conv["participant_2"] if conv["participant_1"] == user_id else conv["participant_1"]
        other_user = await db.users.find_one({"_id": ObjectId(other_user_id)})
        
        # Get the listing
        try:
            listing = await db.listings.find_one({"_id": ObjectId(conv["listing_id"])})
        except:
            continue
        
        if not listing or not other_user:
            continue
        
        # Get last message
        last_msg = await db.messages.find_one(
            {"conversation_id": str(conv["_id"])},
            sort=[("created_at", -1)]
        )
        
        # Count unread messages
        unread_count = await db.messages.count_documents({
            "conversation_id": str(conv["_id"]),
            "receiver_id": user_id,
            "is_read": False
        })
        
        result.append(ConversationResponse(
            id=str(conv["_id"]),
            listing_id=conv["listing_id"],
            listing_title=listing["title"],
            listing_photo=listing.get("photos", [None])[0] if listing.get("photos") else None,
            listing_price=listing["price"],
            other_user_id=other_user_id,
            other_user_name=other_user.get("pseudo", other_user["first_name"]),
            last_message=last_msg["content"] if last_msg else "",
            last_message_date=last_msg["created_at"] if last_msg else conv["created_at"],
            unread_count=unread_count
        ))
    
    return result

@api_router.get("/messages/conversation/{conversation_id}", response_model=List[MessageResponse])
async def get_conversation_messages(conversation_id: str, user = Depends(get_current_user)):
    """Get all messages in a conversation"""
    user_id = str(user["_id"])
    
    # Verify user is part of conversation
    try:
        conversation = await db.conversations.find_one({"_id": ObjectId(conversation_id)})
    except:
        raise HTTPException(status_code=400, detail="ID conversation invalide")
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation non trouvee")
    
    if user_id not in [conversation["participant_1"], conversation["participant_2"]]:
        raise HTTPException(status_code=403, detail="Acces non autorise")
    
    # Mark messages as read
    await db.messages.update_many(
        {"conversation_id": conversation_id, "receiver_id": user_id, "is_read": False},
        {"$set": {"is_read": True}}
    )
    
    # Get messages
    messages = await db.messages.find({"conversation_id": conversation_id}).sort("created_at", 1).to_list(500)
    
    # Get listing info
    try:
        listing = await db.listings.find_one({"_id": ObjectId(conversation["listing_id"])})
    except:
        listing = None
    
    result = []
    for msg in messages:
        sender = await db.users.find_one({"_id": ObjectId(msg["sender_id"])})
        receiver = await db.users.find_one({"_id": ObjectId(msg["receiver_id"])})
        
        result.append(MessageResponse(
            id=str(msg["_id"]),
            conversation_id=msg["conversation_id"],
            listing_id=msg["listing_id"],
            listing_title=listing["title"] if listing else "Annonce supprimee",
            sender_id=msg["sender_id"],
            sender_name=sender.get("pseudo", "Utilisateur") if sender else "Utilisateur",
            receiver_id=msg["receiver_id"],
            receiver_name=receiver.get("pseudo", "Utilisateur") if receiver else "Utilisateur",
            content=msg["content"],
            is_read=msg["is_read"],
            created_at=msg["created_at"]
        ))
    
    return result

@api_router.get("/messages/unread-count")
async def get_unread_count(user = Depends(get_current_user)):
    """Get count of unread messages"""
    user_id = str(user["_id"])
    count = await db.messages.count_documents({"receiver_id": user_id, "is_read": False})
    return {"unread_count": count}

# ==================== FAVORITES ====================

@api_router.post("/favorites/{listing_id}")
async def add_favorite(listing_id: str, user = Depends(get_current_user)):
    try:
        listing = await db.listings.find_one({"_id": ObjectId(listing_id)})
    except:
        raise HTTPException(status_code=400, detail="ID invalide")
    
    if not listing:
        raise HTTPException(status_code=404, detail="Annonce non trouvee")
    
    existing = await db.favorites.find_one({"user_id": str(user["_id"]), "listing_id": listing_id})
    if existing:
        raise HTTPException(status_code=400, detail="Deja dans les favoris")
    
    await db.favorites.insert_one({"user_id": str(user["_id"]), "listing_id": listing_id, "created_at": datetime.utcnow()})
    return {"message": "Ajoute aux favoris"}

@api_router.delete("/favorites/{listing_id}")
async def remove_favorite(listing_id: str, user = Depends(get_current_user)):
    result = await db.favorites.delete_one({"user_id": str(user["_id"]), "listing_id": listing_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Favori non trouve")
    return {"message": "Retire des favoris"}

@api_router.get("/favorites", response_model=List[ListingResponse])
async def get_favorites(user = Depends(get_current_user)):
    favorites = await db.favorites.find({"user_id": str(user["_id"])}).to_list(100)
    listing_ids = [ObjectId(f["listing_id"]) for f in favorites]
    listings = await db.listings.find({"_id": {"$in": listing_ids}}).to_list(100)
    return [ListingResponse(id=str(l["_id"]), **{k: v for k, v in l.items() if k != "_id"}) for l in listings]

# ==================== STATS ====================

@api_router.get("/my-stats")
async def get_my_stats(user = Depends(get_current_user)):
    user_id = str(user["_id"])
    total = await db.listings.count_documents({"user_id": user_id})
    active = await db.listings.count_documents({"user_id": user_id, "status": "approved", "expires_at": {"$gt": datetime.utcnow()}})
    pending = await db.listings.count_documents({"user_id": user_id, "status": "pending"})
    unread = await db.messages.count_documents({"receiver_id": user_id, "is_read": False})
    
    return {"total_listings": total, "active_listings": active, "pending_listings": pending, "unread_messages": unread}

# ==================== CORS & APP SETUP ====================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
