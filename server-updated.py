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

# Email Settings for verification notifications
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'contact@lapetiteannonce.fr')
SMTP_SERVER = os.environ.get('SMTP_SERVER', 'smtp.ionos.fr')
SMTP_PORT = int(os.environ.get('SMTP_PORT', '587'))
SMTP_USER = os.environ.get('SMTP_USER', '')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')

# Pricing Configuration (in EUR)
PRICING = {
    "extra_photos": 3.99,
    "boost_14_days": 19.99,
    "boost_30_days": 24.99
}

# Create the main app
app = FastAPI(title="Petite Annonce API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Configure logging
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

class IdentityVerification(BaseModel):
    id_photo_front: str
    id_photo_back: str
    selfie_photo: str

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

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    photos: Optional[List[str]] = None
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
    receiver_id: str
    content: str

class MessageResponse(BaseModel):
    id: str
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
    other_user_id: str
    other_user_name: str
    last_message: str
    last_message_date: datetime
    unread_count: int

class BoostRequest(BaseModel):
    listing_id: str
    duration_days: int
    payment_method: str

class ExtraPhotosRequest(BaseModel):
    listing_id: str
    payment_method: str

class ReportCreate(BaseModel):
    listing_id: str
    reason: str
    details: Optional[str] = None

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
    """Generate a secure token for admin actions (approve/reject)"""
    data = {"listing_id": listing_id, "action": action, "exp": datetime.utcnow() + timedelta(days=7)}
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def verify_admin_token(token: str):
    """Verify admin action token"""
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

async def get_admin_user(user = Depends(get_current_user)):
    if not user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Acces administrateur requis")
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
        raise HTTPException(status_code=400, detail="Le pseudo doit contenir au moins 2 caracteres alphanumeriques")
    if len(cleaned) > 30:
        raise HTTPException(status_code=400, detail="Le pseudo ne peut pas depasser 30 caracteres")
    return cleaned

async def send_email(to_email: str, subject: str, html_content: str):
    """Send email using SMTP"""
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
    """Send verification email to new user"""
    verification_link = f"{SITE_URL}/verify-email?token={token}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }}
            .button {{ display: inline-block; background: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            .footer {{ text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>La Petite Annonce</h1>
            </div>
            <div class="content">
                <h2>Bienvenue {first_name} !</h2>
                <p>Merci de vous etre inscrit sur La Petite Annonce.</p>
                <p>Pour activer votre compte et pouvoir poster des annonces, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>
                <p style="text-align: center;">
                    <a href="{verification_link}" class="button" style="color: white;">Confirmer mon email</a>
                </p>
                <p>Ou copiez ce lien dans votre navigateur :</p>
                <p style="word-break: break-all; background: #e2e8f0; padding: 10px; border-radius: 5px;">{verification_link}</p>
                <p><strong>Ce lien expire dans 24 heures.</strong></p>
            </div>
            <div class="footer">
                <p>2026 La Petite Annonce - lapetiteannonce.fr</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_email(user_email, "Confirmez votre email - La Petite Annonce", html_content)

async def send_admin_listing_notification(listing_data: dict, user_data: dict, listing_id: str):
    """Send email to admin for new listing validation with approve/reject links"""
    approve_token = generate_admin_token(listing_id, "approve")
    reject_token = generate_admin_token(listing_id, "reject")
    
    approve_link = f"{SITE_URL}/api/admin/listings/action?token={approve_token}"
    reject_link = f"{SITE_URL}/api/admin/listings/action?token={reject_token}"
    
    # Format price
    price_str = f"{listing_data['price']:,.0f}".replace(",", " ")
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
            .header {{ background: #1e40af; color: white; padding: 25px; text-align: center; }}
            .header h1 {{ margin: 0; font-size: 24px; }}
            .content {{ padding: 30px; }}
            .listing-info {{ background: #f8fafc; border-radius: 10px; padding: 20px; margin: 20px 0; }}
            .info-row {{ display: flex; margin-bottom: 10px; }}
            .info-label {{ font-weight: bold; color: #475569; width: 120px; }}
            .info-value {{ color: #1e293b; }}
            .price {{ font-size: 28px; font-weight: bold; color: #16a34a; margin: 15px 0; }}
            .description {{ background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 15px 0; }}
            .buttons {{ text-align: center; margin: 30px 0; }}
            .btn {{ display: inline-block; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 10px; }}
            .btn-approve {{ background: #22c55e; color: white; }}
            .btn-reject {{ background: #ef4444; color: white; }}
            .user-info {{ background: #eff6ff; border-radius: 8px; padding: 15px; margin: 20px 0; }}
            .footer {{ text-align: center; padding: 20px; color: #64748b; font-size: 12px; background: #f8fafc; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Nouvelle annonce a valider</h1>
            </div>
            <div class="content">
                <h2 style="color: #1e293b; margin-top: 0;">{listing_data['title']}</h2>
                
                <div class="price">{price_str} EUR</div>
                
                <div class="listing-info">
                    <div class="info-row">
                        <span class="info-label">Categorie:</span>
                        <span class="info-value">{listing_data['category']} / {listing_data['sub_category']}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Localisation:</span>
                        <span class="info-value">{listing_data['location']}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Photos:</span>
                        <span class="info-value">{len(listing_data.get('photos', []))} photo(s)</span>
                    </div>
                </div>
                
                <h3 style="color: #475569;">Description:</h3>
                <div class="description">
                    {listing_data['description'][:500]}{'...' if len(listing_data['description']) > 500 else ''}
                </div>
                
                <div class="user-info">
                    <h4 style="margin-top: 0; color: #1e40af;">Publie par:</h4>
                    <p style="margin: 5px 0;"><strong>Pseudo:</strong> {user_data.get('pseudo', 'N/A')}</p>
                    <p style="margin: 5px 0;"><strong>Email:</strong> {user_data.get('email', 'N/A')}</p>
                    <p style="margin: 5px 0;"><strong>Telephone:</strong> {user_data.get('phone', 'N/A')}</p>
                </div>
                
                <div class="buttons">
                    <a href="{approve_link}" class="btn btn-approve">APPROUVER</a>
                    <a href="{reject_link}" class="btn btn-reject">REJETER</a>
                </div>
                
                <p style="text-align: center; color: #64748b; font-size: 13px;">
                    Ces liens sont valides pendant 7 jours.
                </p>
            </div>
            <div class="footer">
                <p>La Petite Annonce - Systeme de validation automatique</p>
                <p>ID Annonce: {listing_id}</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    subject = f"Nouvelle annonce: {listing_data['title'][:50]} - A valider"
    return await send_email(ADMIN_EMAIL, subject, html_content)

async def send_listing_approved_email(user_email: str, user_name: str, listing_title: str):
    """Send email to user when their listing is approved"""
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #22c55e; color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }}
            .success-icon {{ font-size: 50px; margin-bottom: 15px; }}
            .button {{ display: inline-block; background: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }}
            .footer {{ text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="success-icon">&#10003;</div>
                <h1>Annonce Approuvee !</h1>
            </div>
            <div class="content">
                <h2>Bonjour {user_name},</h2>
                <p>Excellente nouvelle ! Votre annonce a ete approuvee et est maintenant visible sur La Petite Annonce.</p>
                
                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #1e40af;">{listing_title}</h3>
                </div>
                
                <p>Votre annonce est desormais visible par tous les utilisateurs du site et vous pouvez recevoir des messages d'acheteurs potentiels.</p>
                
                <p style="text-align: center;">
                    <a href="{SITE_URL}" class="button" style="color: white;">Voir mon annonce</a>
                </p>
                
                <p>Merci de votre confiance !</p>
            </div>
            <div class="footer">
                <p>2026 La Petite Annonce - lapetiteannonce.fr</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_email(user_email, f"Votre annonce est en ligne ! - {listing_title}", html_content)

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    age = calculate_age(user_data.birth_date)
    if age < 18:
        raise HTTPException(status_code=400, detail="Vous devez avoir au moins 18 ans pour vous inscrire")
    
    clean_pseudo = validate_pseudo(user_data.pseudo)
    
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Cet email est deja utilise")
    
    existing_phone = await db.users.find_one({"phone": user_data.phone})
    if existing_phone:
        raise HTTPException(status_code=400, detail="Ce numero de telephone est deja utilise")
    
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
        "id_photo": None,
        "selfie_photo": None,
        "created_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user_dict)
    user_dict["_id"] = result.inserted_id
    
    await send_verification_email_to_user(user_data.email, user_data.first_name, email_token)
    
    token = create_access_token({"sub": str(result.inserted_id)})
    
    return TokenResponse(
        access_token=token,
        user=user_to_response(user_dict)
    )

@api_router.get("/auth/verify-email")
async def verify_email(token: str):
    user = await db.users.find_one({
        "email_verification_token": token,
        "email_verification_expires": {"$gt": datetime.utcnow()}
    })
    
    if not user:
        raise HTTPException(status_code=400, detail="Lien de verification invalide ou expire")
    
    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {"email_verified": True},
            "$unset": {"email_verification_token": "", "email_verification_expires": ""}
        }
    )
    
    return {"message": "Email verifie avec succes ! Vous pouvez maintenant poster des annonces.", "success": True}

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
        {
            "$set": {
                "email_verification_token": new_token,
                "email_verification_expires": datetime.utcnow() + timedelta(hours=24)
            }
        }
    )
    
    await send_verification_email_to_user(user["email"], user["first_name"], new_token)
    
    return {"message": "Email de verification renvoye"}

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    token = create_access_token({"sub": str(user["_id"])})
    
    return TokenResponse(
        access_token=token,
        user=user_to_response(user)
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user = Depends(get_current_user)):
    return user_to_response(user)

# ==================== ADMIN LISTING VALIDATION ====================

@api_router.get("/admin/listings/action")
async def admin_listing_action(token: str):
    """Handle admin approve/reject action from email link"""
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
        return {"success": False, "message": f"Cette annonce a deja ete traitee (statut: {listing.get('status')})"}
    
    new_status = "approved" if action == "approve" else "rejected"
    
    await db.listings.update_one(
        {"_id": ObjectId(listing_id)},
        {"$set": {"status": new_status, "validated_at": datetime.utcnow()}}
    )
    
    # Send confirmation email to user if approved
    if action == "approve":
        user = await db.users.find_one({"_id": ObjectId(listing["user_id"])})
        if user:
            await send_listing_approved_email(
                user["email"],
                user.get("pseudo", user["first_name"]),
                listing["title"]
            )
    
    if action == "approve":
        return {
            "success": True,
            "message": f"Annonce APPROUVEE avec succes ! L'utilisateur a ete notifie par email.",
            "listing_title": listing["title"]
        }
    else:
        return {
            "success": True,
            "message": f"Annonce REJETEE.",
            "listing_title": listing["title"]
        }

# ==================== LISTINGS ROUTES ====================

@api_router.post("/listings", response_model=ListingResponse)
async def create_listing(listing: ListingCreate, user = Depends(get_current_user)):
    if not user.get("email_verified", False):
        raise HTTPException(status_code=400, detail="Veuillez verifier votre email avant de poster une annonce.")
    
    if len(listing.photos) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 photos gratuites.")
    
    listing_dict = {
        "user_id": str(user["_id"]),
        "user_name": user.get("pseudo", f"{user['first_name']} {user['last_name']}"),
        **listing.dict(),
        "status": "pending",
        "is_boosted": False,
        "boost_until": None,
        "views": 0,
        "has_extra_photos": False,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(days=30),
        "last_repost_date": None
    }
    
    result = await db.listings.insert_one(listing_dict)
    listing_dict["_id"] = result.inserted_id
    listing_id = str(result.inserted_id)
    
    # Send email to admin for validation
    await send_admin_listing_notification(
        listing_dict,
        {
            "pseudo": user.get("pseudo"),
            "email": user.get("email"),
            "phone": user.get("phone")
        },
        listing_id
    )
    
    return ListingResponse(
        id=listing_id,
        **{k: v for k, v in listing_dict.items() if k != "_id"}
    )

@api_router.get("/listings", response_model=List[ListingResponse])
async def get_listings(
    category: Optional[str] = None,
    sub_category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    location: Optional[str] = None,
    brand: Optional[str] = None,
    fuel_type: Optional[str] = None,
    transmission: Optional[str] = None,
    vehicle_type: Optional[str] = None,
    min_year: Optional[int] = None,
    max_year: Optional[int] = None,
    max_mileage: Optional[int] = None,
    min_surface: Optional[int] = None,
    max_surface: Optional[int] = None,
    min_rooms: Optional[int] = None,
    property_type: Optional[str] = None,
    handicap_access: Optional[bool] = None,
    has_garden: Optional[bool] = None,
    skip: int = 0,
    limit: int = 20,
    boosted_only: bool = False
):
    query = {"status": "approved", "expires_at": {"$gt": datetime.utcnow()}}
    
    if category:
        query["category"] = category
    if sub_category:
        query["sub_category"] = sub_category
    if min_price is not None:
        query["price"] = query.get("price", {})
        query["price"]["$gte"] = min_price
    if max_price is not None:
        query["price"] = query.get("price", {})
        query["price"]["$lte"] = max_price
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    if brand:
        query["brand"] = {"$regex": brand, "$options": "i"}
    if fuel_type:
        query["fuel_type"] = fuel_type
    if transmission:
        query["transmission"] = transmission
    if vehicle_type:
        query["vehicle_type"] = vehicle_type
    if min_year:
        query["year"] = query.get("year", {})
        query["year"]["$gte"] = min_year
    if max_year:
        query["year"] = query.get("year", {})
        query["year"]["$lte"] = max_year
    if max_mileage:
        query["mileage"] = {"$lte": max_mileage}
    if min_surface:
        query["surface_m2"] = query.get("surface_m2", {})
        query["surface_m2"]["$gte"] = min_surface
    if max_surface:
        query["surface_m2"] = query.get("surface_m2", {})
        query["surface_m2"]["$lte"] = max_surface
    if min_rooms:
        query["rooms"] = {"$gte": min_rooms}
    if property_type:
        query["property_type"] = property_type
    if handicap_access is not None:
        query["handicap_access"] = handicap_access
    if has_garden is not None:
        query["has_garden"] = has_garden
    
    if boosted_only:
        query["is_boosted"] = True
        query["boost_until"] = {"$gt": datetime.utcnow()}
    
    sort = [("is_boosted", -1), ("boost_until", -1), ("created_at", -1)]
    
    listings = await db.listings.find(query).sort(sort).skip(skip).limit(limit).to_list(limit)
    
    return [
        ListingResponse(
            id=str(l["_id"]),
            **{k: v for k, v in l.items() if k != "_id"}
        ) for l in listings
    ]

@api_router.get("/listings/boosted", response_model=List[ListingResponse])
async def get_boosted_listings(limit: int = 10):
    query = {
        "status": "approved",
        "is_boosted": True,
        "boost_until": {"$gt": datetime.utcnow()},
        "expires_at": {"$gt": datetime.utcnow()}
    }
    
    listings = await db.listings.find(query).sort("boost_until", -1).limit(limit).to_list(limit)
    
    return [
        ListingResponse(
            id=str(l["_id"]),
            **{k: v for k, v in l.items() if k != "_id"}
        ) for l in listings
    ]

@api_router.get("/listings/{listing_id}", response_model=ListingResponse)
async def get_listing(listing_id: str, user = Depends(get_current_user)):
    try:
        listing = await db.listings.find_one({"_id": ObjectId(listing_id)})
    except:
        raise HTTPException(status_code=400, detail="ID d'annonce invalide")
    
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
    return [
        ListingResponse(
            id=str(l["_id"]),
            **{k: v for k, v in l.items() if k != "_id"}
        ) for l in listings
    ]

@api_router.delete("/listings/{listing_id}")
async def delete_listing(listing_id: str, user = Depends(get_current_user)):
    try:
        listing = await db.listings.find_one({"_id": ObjectId(listing_id)})
    except:
        raise HTTPException(status_code=400, detail="ID d'annonce invalide")
    
    if not listing:
        raise HTTPException(status_code=404, detail="Annonce non trouvee")
    
    if listing["user_id"] != str(user["_id"]) and not user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Non autorise")
    
    await db.listings.delete_one({"_id": ObjectId(listing_id)})
    return {"message": "Annonce supprimee"}

# ==================== FAVORITES ====================

@api_router.post("/favorites/{listing_id}")
async def add_favorite(listing_id: str, user = Depends(get_current_user)):
    try:
        listing = await db.listings.find_one({"_id": ObjectId(listing_id)})
    except:
        raise HTTPException(status_code=400, detail="ID d'annonce invalide")
    
    if not listing:
        raise HTTPException(status_code=404, detail="Annonce non trouvee")
    
    existing = await db.favorites.find_one({
        "user_id": str(user["_id"]),
        "listing_id": listing_id
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Deja dans les favoris")
    
    await db.favorites.insert_one({
        "user_id": str(user["_id"]),
        "listing_id": listing_id,
        "created_at": datetime.utcnow()
    })
    
    return {"message": "Ajoute aux favoris"}

@api_router.delete("/favorites/{listing_id}")
async def remove_favorite(listing_id: str, user = Depends(get_current_user)):
    result = await db.favorites.delete_one({
        "user_id": str(user["_id"]),
        "listing_id": listing_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Favori non trouve")
    
    return {"message": "Retire des favoris"}

@api_router.get("/favorites", response_model=List[ListingResponse])
async def get_favorites(user = Depends(get_current_user)):
    favorites = await db.favorites.find({"user_id": str(user["_id"])}).to_list(100)
    listing_ids = [ObjectId(f["listing_id"]) for f in favorites]
    
    listings = await db.listings.find({"_id": {"$in": listing_ids}}).to_list(100)
    
    return [
        ListingResponse(
            id=str(l["_id"]),
            **{k: v for k, v in l.items() if k != "_id"}
        ) for l in listings
    ]

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
