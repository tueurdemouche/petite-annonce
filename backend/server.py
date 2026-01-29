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
    birth_date: str  # YYYY-MM-DD format

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    phone: str
    first_name: str
    last_name: str
    birth_date: str
    is_verified: bool
    is_admin: bool
    created_at: datetime
    identity_verified: bool

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class IdentityVerification(BaseModel):
    id_photo: str  # Base64
    selfie_photo: str  # Base64

class ListingCreate(BaseModel):
    title: str
    description: str
    price: float
    category: str  # "auto_moto" or "immobilier"
    sub_category: str  # "auto", "moto_homologuee", etc.
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    photos: List[str] = []  # Base64 images
    
    # Auto/Moto specific
    brand: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    mileage: Optional[int] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None  # "manual" or "automatic"
    vehicle_type: Optional[str] = None  # "citadine", "cabriolet", "monospace", "4x4", etc.
    
    # Immobilier specific
    surface_m2: Optional[int] = None
    rooms: Optional[int] = None
    floor: Optional[int] = None
    total_floors: Optional[int] = None
    handicap_access: Optional[bool] = None
    has_garden: Optional[bool] = None
    property_type: Optional[str] = None  # "appartement", "maison", "immeuble"

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
    status: str  # "pending", "approved", "rejected"
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
    duration_days: int  # 7 or 14
    payment_method: str  # "stripe", "paypal", "crypto"

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
        raise HTTPException(status_code=401, detail="Utilisateur non trouvé")
    return user

async def get_admin_user(user = Depends(get_current_user)):
    if not user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Accès administrateur requis")
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
        birth_date=user["birth_date"],
        is_verified=user.get("is_verified", False),
        is_admin=user.get("is_admin", False),
        created_at=user.get("created_at", datetime.utcnow()),
        identity_verified=user.get("identity_verified", False)
    )

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    # Check age
    age = calculate_age(user_data.birth_date)
    if age < 18:
        raise HTTPException(status_code=400, detail="Vous devez avoir au moins 18 ans pour vous inscrire")
    
    # Check if email exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
    
    # Check if phone exists
    existing_phone = await db.users.find_one({"phone": user_data.phone})
    if existing_phone:
        raise HTTPException(status_code=400, detail="Ce numéro de téléphone est déjà utilisé")
    
    # Create user
    user_dict = {
        "email": user_data.email,
        "phone": user_data.phone,
        "password": hash_password(user_data.password),
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
        "birth_date": user_data.birth_date,
        "is_verified": False,
        "is_admin": False,
        "identity_verified": False,
        "id_photo": None,
        "selfie_photo": None,
        "created_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user_dict)
    user_dict["_id"] = result.inserted_id
    
    token = create_access_token({"sub": str(result.inserted_id)})
    
    return TokenResponse(
        access_token=token,
        user=user_to_response(user_dict)
    )

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

@api_router.post("/auth/verify-identity")
async def verify_identity(verification: IdentityVerification, user = Depends(get_current_user)):
    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "id_photo": verification.id_photo,
                "selfie_photo": verification.selfie_photo,
                "identity_verification_date": datetime.utcnow(),
                "identity_verified": False  # Will be verified by admin
            }
        }
    )
    return {"message": "Documents soumis pour vérification"}

# ==================== LISTINGS ROUTES ====================

@api_router.post("/listings", response_model=ListingResponse)
async def create_listing(listing: ListingCreate, user = Depends(get_current_user)):
    # Check if user is verified (identity)
    if not user.get("identity_verified", False):
        raise HTTPException(status_code=400, detail="Veuillez vérifier votre identité avant de poster une annonce")
    
    # Limit to 5 free photos
    if len(listing.photos) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 photos gratuites. Achetez l'option photos supplémentaires pour en ajouter plus.")
    
    listing_dict = {
        "user_id": str(user["_id"]),
        "user_name": f"{user['first_name']} {user['last_name']}",
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
    
    return ListingResponse(
        id=str(result.inserted_id),
        **{k: v for k, v in listing_dict.items() if k != "_id"}
    )

@api_router.get("/listings", response_model=List[ListingResponse])
async def get_listings(
    category: Optional[str] = None,
    sub_category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    location: Optional[str] = None,
    # Auto/Moto filters
    brand: Optional[str] = None,
    fuel_type: Optional[str] = None,
    transmission: Optional[str] = None,
    vehicle_type: Optional[str] = None,
    min_year: Optional[int] = None,
    max_year: Optional[int] = None,
    max_mileage: Optional[int] = None,
    # Immobilier filters
    min_surface: Optional[int] = None,
    max_surface: Optional[int] = None,
    min_rooms: Optional[int] = None,
    property_type: Optional[str] = None,
    handicap_access: Optional[bool] = None,
    has_garden: Optional[bool] = None,
    # Pagination
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
    
    # Auto/Moto filters
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
    
    # Immobilier filters
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
    
    # Sort: boosted first, then by date
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
        raise HTTPException(status_code=404, detail="Annonce non trouvée")
    
    # Increment views if not owner
    if str(user["_id"]) != listing["user_id"]:
        await db.listings.update_one({"_id": ObjectId(listing_id)}, {"$inc": {"views": 1}})
        listing["views"] = listing.get("views", 0) + 1
    
    # Show phone only if approved and user is authenticated
    response_data = {k: v for k, v in listing.items() if k != "_id"}
    if listing["status"] == "approved":
        owner = await db.users.find_one({"_id": ObjectId(listing["user_id"])})
        if owner:
            response_data["user_phone"] = owner.get("phone")
    
    return ListingResponse(id=str(listing["_id"]), **response_data)

@api_router.get("/listings/{listing_id}/public")
async def get_listing_public(listing_id: str):
    try:
        listing = await db.listings.find_one({"_id": ObjectId(listing_id), "status": "approved"})
    except:
        raise HTTPException(status_code=400, detail="ID d'annonce invalide")
    
    if not listing:
        raise HTTPException(status_code=404, detail="Annonce non trouvée")
    
    # Increment views
    await db.listings.update_one({"_id": ObjectId(listing_id)}, {"$inc": {"views": 1}})
    listing["views"] = listing.get("views", 0) + 1
    
    # Hide phone for public view
    response_data = {k: v for k, v in listing.items() if k != "_id"}
    response_data["user_phone"] = None
    
    return ListingResponse(id=str(listing["_id"]), **response_data)

@api_router.put("/listings/{listing_id}", response_model=ListingResponse)
async def update_listing(listing_id: str, update: ListingUpdate, user = Depends(get_current_user)):
    try:
        listing = await db.listings.find_one({"_id": ObjectId(listing_id)})
    except:
        raise HTTPException(status_code=400, detail="ID d'annonce invalide")
    
    if not listing:
        raise HTTPException(status_code=404, detail="Annonce non trouvée")
    
    if listing["user_id"] != str(user["_id"]) and not user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Non autorisé")
    
    update_dict = {k: v for k, v in update.dict().items() if v is not None}
    
    # Check photos limit
    if "photos" in update_dict:
        max_photos = 10 if listing.get("has_extra_photos", False) else 5
        if len(update_dict["photos"]) > max_photos:
            raise HTTPException(status_code=400, detail=f"Maximum {max_photos} photos autorisées")
    
    # Reset status to pending if content changed (except by admin)
    if update_dict and not user.get("is_admin", False):
        update_dict["status"] = "pending"
    
    await db.listings.update_one({"_id": ObjectId(listing_id)}, {"$set": update_dict})
    
    updated = await db.listings.find_one({"_id": ObjectId(listing_id)})
    return ListingResponse(id=str(updated["_id"]), **{k: v for k, v in updated.items() if k != "_id"})

@api_router.delete("/listings/{listing_id}")
async def delete_listing(listing_id: str, user = Depends(get_current_user)):
    try:
        listing = await db.listings.find_one({"_id": ObjectId(listing_id)})
    except:
        raise HTTPException(status_code=400, detail="ID d'annonce invalide")
    
    if not listing:
        raise HTTPException(status_code=404, detail="Annonce non trouvée")
    
    if listing["user_id"] != str(user["_id"]) and not user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Non autorisé")
    
    await db.listings.delete_one({"_id": ObjectId(listing_id)})
    return {"message": "Annonce supprimée"}

@api_router.post("/listings/{listing_id}/repost")
async def repost_listing(listing_id: str, user = Depends(get_current_user)):
    try:
        listing = await db.listings.find_one({"_id": ObjectId(listing_id)})
    except:
        raise HTTPException(status_code=400, detail="ID d'annonce invalide")
    
    if not listing:
        raise HTTPException(status_code=404, detail="Annonce non trouvée")
    
    if listing["user_id"] != str(user["_id"]):
        raise HTTPException(status_code=403, detail="Non autorisé")
    
    # Check if already reposted this month
    last_repost = listing.get("last_repost_date")
    if last_repost:
        days_since_repost = (datetime.utcnow() - last_repost).days
        if days_since_repost < 30:
            raise HTTPException(status_code=400, detail=f"Vous pouvez reposter cette annonce dans {30 - days_since_repost} jours")
    
    await db.listings.update_one(
        {"_id": ObjectId(listing_id)},
        {
            "$set": {
                "status": "pending",
                "expires_at": datetime.utcnow() + timedelta(days=30),
                "last_repost_date": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Annonce repostée avec succès, en attente de validation"}

@api_router.get("/my-listings", response_model=List[ListingResponse])
async def get_my_listings(user = Depends(get_current_user)):
    listings = await db.listings.find({"user_id": str(user["_id"])}).sort("created_at", -1).to_list(100)
    return [
        ListingResponse(
            id=str(l["_id"]),
            **{k: v for k, v in l.items() if k != "_id"}
        ) for l in listings
    ]

@api_router.get("/my-stats")
async def get_my_stats(user = Depends(get_current_user)):
    user_id = str(user["_id"])
    
    total_listings = await db.listings.count_documents({"user_id": user_id})
    active_listings = await db.listings.count_documents({
        "user_id": user_id,
        "status": "approved",
        "expires_at": {"$gt": datetime.utcnow()}
    })
    pending_listings = await db.listings.count_documents({"user_id": user_id, "status": "pending"})
    
    # Total views
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": None, "total_views": {"$sum": "$views"}}}
    ]
    result = await db.listings.aggregate(pipeline).to_list(1)
    total_views = result[0]["total_views"] if result else 0
    
    # Unread messages
    unread_messages = await db.messages.count_documents({
        "receiver_id": user_id,
        "is_read": False
    })
    
    return {
        "total_listings": total_listings,
        "active_listings": active_listings,
        "pending_listings": pending_listings,
        "total_views": total_views,
        "unread_messages": unread_messages
    }

# ==================== FAVORITES ROUTES ====================

@api_router.post("/favorites/{listing_id}")
async def add_favorite(listing_id: str, user = Depends(get_current_user)):
    try:
        listing = await db.listings.find_one({"_id": ObjectId(listing_id)})
    except:
        raise HTTPException(status_code=400, detail="ID d'annonce invalide")
    
    if not listing:
        raise HTTPException(status_code=404, detail="Annonce non trouvée")
    
    existing = await db.favorites.find_one({
        "user_id": str(user["_id"]),
        "listing_id": listing_id
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Déjà dans vos favoris")
    
    await db.favorites.insert_one({
        "user_id": str(user["_id"]),
        "listing_id": listing_id,
        "created_at": datetime.utcnow()
    })
    
    return {"message": "Ajouté aux favoris"}

@api_router.delete("/favorites/{listing_id}")
async def remove_favorite(listing_id: str, user = Depends(get_current_user)):
    result = await db.favorites.delete_one({
        "user_id": str(user["_id"]),
        "listing_id": listing_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Favori non trouvé")
    
    return {"message": "Retiré des favoris"}

@api_router.get("/favorites", response_model=List[ListingResponse])
async def get_favorites(user = Depends(get_current_user)):
    favorites = await db.favorites.find({"user_id": str(user["_id"])}).to_list(100)
    listing_ids = [ObjectId(f["listing_id"]) for f in favorites]
    
    if not listing_ids:
        return []
    
    listings = await db.listings.find({"_id": {"$in": listing_ids}}).to_list(100)
    
    return [
        ListingResponse(
            id=str(l["_id"]),
            **{k: v for k, v in l.items() if k != "_id"}
        ) for l in listings
    ]

# ==================== MESSAGES ROUTES ====================

@api_router.post("/messages", response_model=MessageResponse)
async def send_message(message: MessageCreate, user = Depends(get_current_user)):
    try:
        listing = await db.listings.find_one({"_id": ObjectId(message.listing_id)})
    except:
        raise HTTPException(status_code=400, detail="ID d'annonce invalide")
    
    if not listing:
        raise HTTPException(status_code=404, detail="Annonce non trouvée")
    
    receiver = await db.users.find_one({"_id": ObjectId(message.receiver_id)})
    if not receiver:
        raise HTTPException(status_code=404, detail="Destinataire non trouvé")
    
    msg_dict = {
        "listing_id": message.listing_id,
        "listing_title": listing["title"],
        "sender_id": str(user["_id"]),
        "sender_name": f"{user['first_name']} {user['last_name']}",
        "receiver_id": message.receiver_id,
        "receiver_name": f"{receiver['first_name']} {receiver['last_name']}",
        "content": message.content,
        "is_read": False,
        "created_at": datetime.utcnow()
    }
    
    result = await db.messages.insert_one(msg_dict)
    msg_dict["_id"] = result.inserted_id
    
    return MessageResponse(id=str(result.inserted_id), **{k: v for k, v in msg_dict.items() if k != "_id"})

@api_router.get("/messages/conversations", response_model=List[ConversationResponse])
async def get_conversations(user = Depends(get_current_user)):
    user_id = str(user["_id"])
    
    # Get all messages involving this user
    messages = await db.messages.find({
        "$or": [{"sender_id": user_id}, {"receiver_id": user_id}]
    }).sort("created_at", -1).to_list(1000)
    
    # Group by conversation (listing + other user)
    conversations = {}
    for msg in messages:
        other_id = msg["receiver_id"] if msg["sender_id"] == user_id else msg["sender_id"]
        other_name = msg["receiver_name"] if msg["sender_id"] == user_id else msg["sender_name"]
        key = f"{msg['listing_id']}_{other_id}"
        
        if key not in conversations:
            listing = await db.listings.find_one({"_id": ObjectId(msg["listing_id"])})
            listing_photo = listing["photos"][0] if listing and listing.get("photos") else None
            
            unread = await db.messages.count_documents({
                "listing_id": msg["listing_id"],
                "sender_id": other_id,
                "receiver_id": user_id,
                "is_read": False
            })
            
            conversations[key] = ConversationResponse(
                id=key,
                listing_id=msg["listing_id"],
                listing_title=msg["listing_title"],
                listing_photo=listing_photo,
                other_user_id=other_id,
                other_user_name=other_name,
                last_message=msg["content"],
                last_message_date=msg["created_at"],
                unread_count=unread
            )
    
    return list(conversations.values())

@api_router.get("/messages/{listing_id}/{other_user_id}", response_model=List[MessageResponse])
async def get_conversation_messages(listing_id: str, other_user_id: str, user = Depends(get_current_user)):
    user_id = str(user["_id"])
    
    messages = await db.messages.find({
        "listing_id": listing_id,
        "$or": [
            {"sender_id": user_id, "receiver_id": other_user_id},
            {"sender_id": other_user_id, "receiver_id": user_id}
        ]
    }).sort("created_at", 1).to_list(100)
    
    # Mark as read
    await db.messages.update_many(
        {
            "listing_id": listing_id,
            "sender_id": other_user_id,
            "receiver_id": user_id,
            "is_read": False
        },
        {"$set": {"is_read": True}}
    )
    
    return [
        MessageResponse(id=str(m["_id"]), **{k: v for k, v in m.items() if k != "_id"})
        for m in messages
    ]

# ==================== PAYMENT SIMULATION ROUTES ====================

@api_router.post("/payments/boost")
async def boost_listing(request: BoostRequest, user = Depends(get_current_user)):
    try:
        listing = await db.listings.find_one({"_id": ObjectId(request.listing_id)})
    except:
        raise HTTPException(status_code=400, detail="ID d'annonce invalide")
    
    if not listing:
        raise HTTPException(status_code=404, detail="Annonce non trouvée")
    
    if listing["user_id"] != str(user["_id"]):
        raise HTTPException(status_code=403, detail="Non autorisé")
    
    if request.duration_days not in [7, 14]:
        raise HTTPException(status_code=400, detail="Durée invalide (7 ou 14 jours)")
    
    price = 29.99 if request.duration_days == 7 else 49.99
    
    # Simulate payment
    payment_id = str(uuid.uuid4())
    
    # Record payment
    await db.payments.insert_one({
        "user_id": str(user["_id"]),
        "listing_id": request.listing_id,
        "type": "boost",
        "amount": price,
        "method": request.payment_method,
        "status": "completed",  # MVP: auto-complete
        "payment_id": payment_id,
        "created_at": datetime.utcnow()
    })
    
    # Apply boost
    boost_until = datetime.utcnow() + timedelta(days=request.duration_days)
    await db.listings.update_one(
        {"_id": ObjectId(request.listing_id)},
        {"$set": {"is_boosted": True, "boost_until": boost_until}}
    )
    
    return {
        "message": f"Annonce boostée pour {request.duration_days} jours",
        "payment_id": payment_id,
        "amount": price,
        "boost_until": boost_until
    }

@api_router.post("/payments/extra-photos")
async def purchase_extra_photos(request: ExtraPhotosRequest, user = Depends(get_current_user)):
    try:
        listing = await db.listings.find_one({"_id": ObjectId(request.listing_id)})
    except:
        raise HTTPException(status_code=400, detail="ID d'annonce invalide")
    
    if not listing:
        raise HTTPException(status_code=404, detail="Annonce non trouvée")
    
    if listing["user_id"] != str(user["_id"]):
        raise HTTPException(status_code=403, detail="Non autorisé")
    
    if listing.get("has_extra_photos", False):
        raise HTTPException(status_code=400, detail="Option déjà achetée pour cette annonce")
    
    # Simulate payment
    payment_id = str(uuid.uuid4())
    
    # Record payment
    await db.payments.insert_one({
        "user_id": str(user["_id"]),
        "listing_id": request.listing_id,
        "type": "extra_photos",
        "amount": 9.99,
        "method": request.payment_method,
        "status": "completed",
        "payment_id": payment_id,
        "created_at": datetime.utcnow()
    })
    
    # Enable extra photos
    await db.listings.update_one(
        {"_id": ObjectId(request.listing_id)},
        {"$set": {"has_extra_photos": True}}
    )
    
    return {
        "message": "Option photos supplémentaires activée (5 photos de plus)",
        "payment_id": payment_id,
        "amount": 9.99
    }

@api_router.get("/payments/crypto-wallets")
async def get_crypto_wallets():
    # This would be configurable by admin
    return {
        "bitcoin": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        "ethereum": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
        "usdt": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
    }

# ==================== REPORTS ROUTES ====================

@api_router.post("/reports")
async def report_listing(report: ReportCreate, user = Depends(get_current_user)):
    try:
        listing = await db.listings.find_one({"_id": ObjectId(report.listing_id)})
    except:
        raise HTTPException(status_code=400, detail="ID d'annonce invalide")
    
    if not listing:
        raise HTTPException(status_code=404, detail="Annonce non trouvée")
    
    await db.reports.insert_one({
        "listing_id": report.listing_id,
        "listing_title": listing["title"],
        "reporter_id": str(user["_id"]),
        "reporter_name": f"{user['first_name']} {user['last_name']}",
        "reason": report.reason,
        "details": report.details,
        "status": "pending",
        "created_at": datetime.utcnow()
    })
    
    return {"message": "Signalement envoyé"}

# ==================== ADMIN ROUTES ====================

@api_router.get("/admin/pending-listings", response_model=List[ListingResponse])
async def get_pending_listings(admin = Depends(get_admin_user)):
    listings = await db.listings.find({"status": "pending"}).sort("created_at", 1).to_list(100)
    return [
        ListingResponse(
            id=str(l["_id"]),
            **{k: v for k, v in l.items() if k != "_id"}
        ) for l in listings
    ]

@api_router.post("/admin/listings/{listing_id}/approve")
async def approve_listing(listing_id: str, admin = Depends(get_admin_user)):
    try:
        result = await db.listings.update_one(
            {"_id": ObjectId(listing_id)},
            {"$set": {"status": "approved"}}
        )
    except:
        raise HTTPException(status_code=400, detail="ID d'annonce invalide")
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Annonce non trouvée")
    
    return {"message": "Annonce approuvée"}

@api_router.post("/admin/listings/{listing_id}/reject")
async def reject_listing(listing_id: str, reason: str = "", admin = Depends(get_admin_user)):
    try:
        result = await db.listings.update_one(
            {"_id": ObjectId(listing_id)},
            {"$set": {"status": "rejected", "rejection_reason": reason}}
        )
    except:
        raise HTTPException(status_code=400, detail="ID d'annonce invalide")
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Annonce non trouvée")
    
    return {"message": "Annonce rejetée"}

@api_router.get("/admin/pending-verifications")
async def get_pending_verifications(admin = Depends(get_admin_user)):
    users = await db.users.find({
        "id_photo": {"$ne": None},
        "identity_verified": False
    }).to_list(100)
    
    return [
        {
            "id": str(u["_id"]),
            "email": u["email"],
            "first_name": u["first_name"],
            "last_name": u["last_name"],
            "birth_date": u["birth_date"],
            "id_photo": u.get("id_photo"),
            "selfie_photo": u.get("selfie_photo"),
            "submitted_at": u.get("identity_verification_date")
        } for u in users
    ]

@api_router.post("/admin/users/{user_id}/verify-identity")
async def admin_verify_identity(user_id: str, approved: bool, admin = Depends(get_admin_user)):
    try:
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"identity_verified": approved}}
        )
    except:
        raise HTTPException(status_code=400, detail="ID utilisateur invalide")
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    return {"message": f"Identité {'vérifiée' if approved else 'rejetée'}"}

@api_router.get("/admin/reports")
async def get_reports(admin = Depends(get_admin_user)):
    reports = await db.reports.find({"status": "pending"}).sort("created_at", -1).to_list(100)
    return [
        {
            "id": str(r["_id"]),
            **{k: v for k, v in r.items() if k != "_id"}
        } for r in reports
    ]

@api_router.post("/admin/reports/{report_id}/resolve")
async def resolve_report(report_id: str, action: str, admin = Depends(get_admin_user)):
    try:
        report = await db.reports.find_one({"_id": ObjectId(report_id)})
    except:
        raise HTTPException(status_code=400, detail="ID de signalement invalide")
    
    if not report:
        raise HTTPException(status_code=404, detail="Signalement non trouvé")
    
    await db.reports.update_one(
        {"_id": ObjectId(report_id)},
        {"$set": {"status": "resolved", "action": action, "resolved_at": datetime.utcnow()}}
    )
    
    if action == "delete_listing":
        await db.listings.delete_one({"_id": ObjectId(report["listing_id"])})
    
    return {"message": "Signalement traité"}

@api_router.post("/admin/make-admin/{user_id}")
async def make_admin(user_id: str, admin = Depends(get_admin_user)):
    try:
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_admin": True}}
        )
    except:
        raise HTTPException(status_code=400, detail="ID utilisateur invalide")
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    return {"message": "Utilisateur promu administrateur"}

@api_router.get("/admin/stats")
async def get_admin_stats(admin = Depends(get_admin_user)):
    total_users = await db.users.count_documents({})
    verified_users = await db.users.count_documents({"identity_verified": True})
    total_listings = await db.listings.count_documents({})
    pending_listings = await db.listings.count_documents({"status": "pending"})
    active_listings = await db.listings.count_documents({
        "status": "approved",
        "expires_at": {"$gt": datetime.utcnow()}
    })
    pending_reports = await db.reports.count_documents({"status": "pending"})
    
    return {
        "total_users": total_users,
        "verified_users": verified_users,
        "total_listings": total_listings,
        "pending_listings": pending_listings,
        "active_listings": active_listings,
        "pending_reports": pending_reports
    }

# ==================== DATA/CONSTANTS ROUTES ====================

@api_router.get("/constants/categories")
async def get_categories():
    return {
        "auto_moto": {
            "name": "Auto / Moto",
            "sub_categories": [
                {"id": "auto", "name": "Auto"},
                {"id": "moto_homologuee", "name": "Moto homologuée"},
                {"id": "moto_non_homologuee", "name": "Moto non homologuée"},
                {"id": "scooter", "name": "Scooter"},
                {"id": "quad_homologue", "name": "Quad homologué"},
                {"id": "quad_non_homologue", "name": "Quad non homologué"}
            ]
        },
        "immobilier": {
            "name": "Immobilier",
            "sub_categories": [
                {"id": "location", "name": "Location"},
                {"id": "colocation", "name": "Colocation"},
                {"id": "vente", "name": "Vente"}
            ]
        }
    }

@api_router.get("/constants/car-brands")
async def get_car_brands():
    return [
        "Abarth", "Alfa Romeo", "Alpine", "Aston Martin", "Audi", "Bentley", "BMW", "Bugatti",
        "Cadillac", "Chevrolet", "Chrysler", "Citroën", "Cupra", "Dacia", "Daewoo", "Daihatsu",
        "Dodge", "DS", "Ferrari", "Fiat", "Ford", "Genesis", "Honda", "Hummer", "Hyundai",
        "Infiniti", "Isuzu", "Iveco", "Jaguar", "Jeep", "Kia", "Lada", "Lamborghini", "Lancia",
        "Land Rover", "Lexus", "Lincoln", "Lotus", "Maserati", "Mazda", "McLaren", "Mercedes-Benz",
        "MG", "Mini", "Mitsubishi", "Nissan", "Opel", "Peugeot", "Polestar", "Porsche", "Renault",
        "Rolls-Royce", "Rover", "Saab", "Seat", "Skoda", "Smart", "SsangYong", "Subaru", "Suzuki",
        "Tesla", "Toyota", "Triumph", "Volkswagen", "Volvo"
    ]

@api_router.get("/constants/moto-brands")
async def get_moto_brands():
    return [
        "Aprilia", "Benelli", "Beta", "BMW", "Brixton", "BSA", "Buell", "Bultaco", "Cagiva",
        "CF Moto", "Daelim", "Derbi", "Ducati", "Fantic", "Gas Gas", "Gilera", "Harley-Davidson",
        "Honda", "Husqvarna", "Indian", "Kawasaki", "KTM", "Kymco", "Laverda", "Moto Guzzi",
        "Moto Morini", "MV Agusta", "Norton", "Peugeot", "Piaggio", "Royal Enfield", "Sherco",
        "Suzuki", "SWM", "Sym", "Triumph", "Vespa", "Victory", "Yamaha", "Zero"
    ]

@api_router.get("/constants/fuel-types")
async def get_fuel_types():
    return [
        {"id": "essence", "name": "Essence"},
        {"id": "diesel", "name": "Diesel"},
        {"id": "electrique", "name": "Électrique"},
        {"id": "hybride", "name": "Hybride"},
        {"id": "gpl", "name": "GPL"},
        {"id": "ethanol", "name": "Éthanol"}
    ]

@api_router.get("/constants/vehicle-types")
async def get_vehicle_types():
    return [
        {"id": "citadine", "name": "Citadine"},
        {"id": "berline", "name": "Berline"},
        {"id": "break", "name": "Break"},
        {"id": "cabriolet", "name": "Cabriolet"},
        {"id": "coupe", "name": "Coupé"},
        {"id": "monospace", "name": "Monospace"},
        {"id": "suv", "name": "SUV"},
        {"id": "4x4", "name": "4x4"},
        {"id": "utilitaire", "name": "Utilitaire"},
        {"id": "pickup", "name": "Pick-up"}
    ]

@api_router.get("/constants/property-types")
async def get_property_types():
    return [
        {"id": "appartement", "name": "Appartement"},
        {"id": "maison", "name": "Maison"},
        {"id": "immeuble", "name": "Immeuble de rapport"},
        {"id": "terrain", "name": "Terrain"},
        {"id": "local", "name": "Local commercial"},
        {"id": "parking", "name": "Parking/Box"}
    ]

# ==================== INIT ADMIN ====================

@api_router.post("/init-admin")
async def init_first_admin(user_data: UserCreate):
    # Check if any admin exists
    existing_admin = await db.users.find_one({"is_admin": True})
    if existing_admin:
        raise HTTPException(status_code=400, detail="Un administrateur existe déjà")
    
    # Check age
    age = calculate_age(user_data.birth_date)
    if age < 18:
        raise HTTPException(status_code=400, detail="Vous devez avoir au moins 18 ans")
    
    # Check if email exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
    
    # Create admin user
    user_dict = {
        "email": user_data.email,
        "phone": user_data.phone,
        "password": hash_password(user_data.password),
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
        "birth_date": user_data.birth_date,
        "is_verified": True,
        "is_admin": True,
        "identity_verified": True,
        "created_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user_dict)
    user_dict["_id"] = result.inserted_id
    
    token = create_access_token({"sub": str(result.inserted_id)})
    
    return TokenResponse(
        access_token=token,
        user=user_to_response(user_dict)
    )

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
