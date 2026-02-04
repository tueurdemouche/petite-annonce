import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import random
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client['petite_annonce']

# French cities
CITIES = [
    "Paris, 75001", "Lyon, 69001", "Marseille, 13001", "Toulouse, 31000", "Nice, 06000",
    "Nantes, 44000", "Strasbourg, 67000", "Montpellier, 34000", "Bordeaux, 33000", "Lille, 59000",
    "Rennes, 35000", "Reims, 51100", "Le Havre, 76600", "Saint-Etienne, 42000", "Toulon, 83000",
    "Grenoble, 38000", "Dijon, 21000", "Angers, 49000", "Nimes, 30000", "Villeurbanne, 69100",
    "Clermont-Ferrand, 63000", "Le Mans, 72000", "Aix-en-Provence, 13100", "Brest, 29200",
    "Tours, 37000", "Amiens, 80000", "Limoges, 87000", "Perpignan, 66000", "Metz, 57000",
    "Besancon, 25000", "Orleans, 45000", "Rouen, 76000", "Mulhouse, 68100", "Caen, 14000"
]

# Car data
CAR_BRANDS = {
    "Renault": ["Clio", "Megane", "Captur", "Kadjar", "Scenic", "Twingo", "Arkana"],
    "Peugeot": ["208", "308", "3008", "2008", "508", "5008", "Partner"],
    "Citroen": ["C3", "C4", "C5 Aircross", "Berlingo", "C3 Aircross"],
    "Volkswagen": ["Golf", "Polo", "Tiguan", "T-Roc", "Passat", "ID.3"],
    "BMW": ["Serie 1", "Serie 3", "Serie 5", "X1", "X3", "X5"],
    "Mercedes": ["Classe A", "Classe C", "Classe E", "GLA", "GLC", "GLE"],
    "Audi": ["A1", "A3", "A4", "Q3", "Q5", "A6"],
    "Toyota": ["Yaris", "Corolla", "RAV4", "C-HR", "Aygo"],
    "Ford": ["Fiesta", "Focus", "Puma", "Kuga", "Mustang"],
    "Opel": ["Corsa", "Astra", "Crossland", "Grandland", "Mokka"]
}

# Motorcycle data
MOTO_BRANDS = {
    "Yamaha": ["MT-07", "MT-09", "Tracer 700", "R1", "XSR 700", "Tenere 700"],
    "Honda": ["CB650R", "Africa Twin", "Rebel 500", "CBR650R", "Forza 125"],
    "Kawasaki": ["Z650", "Z900", "Ninja 650", "Versys 650", "Z400"],
    "BMW": ["R1250GS", "F900R", "S1000RR", "F750GS", "G310R"],
    "Suzuki": ["GSX-S750", "V-Strom 650", "SV650", "Hayabusa"],
    "Ducati": ["Monster", "Multistrada", "Panigale V4", "Scrambler"],
    "KTM": ["Duke 390", "Duke 790", "Adventure 890", "RC 390"],
    "Triumph": ["Street Triple", "Tiger 900", "Bonneville", "Speed Triple"]
}

# Scooter data  
SCOOTER_BRANDS = {
    "Yamaha": ["XMAX 125", "XMAX 300", "NMAX 125", "Tricity"],
    "Honda": ["Forza 125", "Forza 350", "PCX 125", "SH 125"],
    "Piaggio": ["Beverly 300", "MP3 500", "Liberty 125", "Medley"],
    "Vespa": ["Primavera 125", "GTS 300", "Sprint 125"],
    "Kymco": ["Agility 125", "X-Town 300", "Downtown 350"],
    "Sym": ["Symphony 125", "Maxsym 400", "Cruisym 300"]
}

# Real estate data
PROPERTY_TYPES_HOUSE = ["Maison", "Villa", "Pavillon", "Maison de ville", "Ferme renovee"]
PROPERTY_TYPES_APT = ["Appartement", "Studio", "Loft", "Duplex", "Penthouse"]

# Photo URLs (using picsum.photos for variety)
def get_car_photos():
    car_ids = [1071, 116, 133, 136, 171, 183, 188, 201, 514, 1049]
    return [f"https://picsum.photos/id/{random.choice(car_ids)}/800/600" for _ in range(random.randint(2, 5))]

def get_moto_photos():
    moto_ids = [1059, 195, 416, 519, 787, 829]
    return [f"https://picsum.photos/id/{random.choice(moto_ids)}/800/600" for _ in range(random.randint(2, 4))]

def get_house_photos():
    house_ids = [164, 407, 413, 421, 431, 449, 493, 870, 1029, 1040]
    return [f"https://picsum.photos/id/{random.choice(house_ids)}/800/600" for _ in range(random.randint(3, 5))]

def get_apt_photos():
    apt_ids = [336, 342, 380, 381, 416, 426, 447, 529, 534, 535]
    return [f"https://picsum.photos/id/{random.choice(apt_ids)}/800/600" for _ in range(random.randint(3, 5))]

# Generate car listing
def generate_car():
    brand = random.choice(list(CAR_BRANDS.keys()))
    model = random.choice(CAR_BRANDS[brand])
    year = random.randint(2015, 2024)
    mileage = random.randint(5000, 180000)
    fuel = random.choice(["Essence", "Diesel", "Hybride", "Electrique"])
    transmission = random.choice(["Manuelle", "Automatique"])
    
    # Price based on brand and year
    base_price = {"Renault": 12000, "Peugeot": 13000, "Citroen": 11000, "Volkswagen": 18000, 
                  "BMW": 28000, "Mercedes": 30000, "Audi": 26000, "Toyota": 16000, "Ford": 14000, "Opel": 11000}
    price = base_price.get(brand, 15000)
    price = int(price * (1 + (year - 2015) * 0.08) * (1 - mileage / 500000))
    price = max(3000, min(price, 80000))
    
    descriptions = [
        f"Superbe {brand} {model} de {year} en excellent etat. Entretien suivi chez {brand}. Carnet d'entretien a jour. Controle technique OK. Vehicule non fumeur.",
        f"{brand} {model} {year}, {mileage} km. Premiere main, jamais accidentee. Toutes options: climatisation, GPS, radar de recul. A voir absolument!",
        f"Vends {brand} {model} annee {year}. {fuel}, boite {transmission.lower()}. Tres bon etat general, interieur soigne. Distribution faite recemment.",
        f"Belle {brand} {model} de {year} avec seulement {mileage} km. Equipements: ecran tactile, sieges chauffants, jantes alu. Garantie 6 mois.",
        f"{brand} {model} {year} - Occasion certifiee. Revision complete effectuee. Pneus neufs. Frais de carte grise offerts."
    ]
    
    return {
        "title": f"{brand} {model} {year} - {mileage} km",
        "description": random.choice(descriptions),
        "price": price,
        "category": "auto",
        "sub_category": "voiture",
        "location": random.choice(CITIES),
        "photos": get_car_photos(),
        "brand": brand,
        "model": model,
        "year": year,
        "mileage": mileage,
        "fuel_type": fuel,
        "transmission": transmission,
        "user_id": "demo_user",
        "user_name": random.choice(["AutoPro33", "GarageMartin", "VenteAuto06", "CarDeal75", "OccasionPlus", "AutoSelect", "BonPlan Auto", "VehiculeOK"]),
        "status": "approved",
        "is_boosted": random.random() < 0.1,
        "boost_until": datetime.utcnow() + timedelta(days=14) if random.random() < 0.1 else None,
        "views": random.randint(50, 500),
        "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 30)),
        "expires_at": datetime.utcnow() + timedelta(days=random.randint(30, 60))
    }

# Generate motorcycle listing
def generate_moto():
    brand = random.choice(list(MOTO_BRANDS.keys()))
    model = random.choice(MOTO_BRANDS[brand])
    year = random.randint(2017, 2024)
    mileage = random.randint(1000, 60000)
    
    base_price = {"Yamaha": 7000, "Honda": 7500, "Kawasaki": 7000, "BMW": 12000, 
                  "Suzuki": 6500, "Ducati": 14000, "KTM": 8000, "Triumph": 10000}
    price = base_price.get(brand, 8000)
    price = int(price * (1 + (year - 2017) * 0.12) * (1 - mileage / 150000))
    price = max(2000, min(price, 25000))
    
    descriptions = [
        f"Magnifique {brand} {model} de {year}. {mileage} km compteur. Entretien {brand} exclusivement. Echappement Akrapovic, protection moteur.",
        f"Vends ma {brand} {model} {year} pour changement de cylindree. Tres bien entretenue, jamais chutte. Controle technique OK.",
        f"{brand} {model} annee {year} - {mileage} km. Premiere main, garage. Options: ABS, quickshifter, modes de conduite.",
        f"Belle {brand} {model} {year} en parfait etat. Pneus neufs, chaine kit recents. Vendue avec sacoches et top case."
    ]
    
    return {
        "title": f"{brand} {model} {year} - {mileage} km",
        "description": random.choice(descriptions),
        "price": price,
        "category": "moto",
        "sub_category": "moto_homologuee",
        "location": random.choice(CITIES),
        "photos": get_moto_photos(),
        "brand": brand,
        "model": model,
        "year": year,
        "mileage": mileage,
        "fuel_type": "Essence",
        "user_id": "demo_user",
        "user_name": random.choice(["MotoPassion", "BikerShop", "2RouesOccas", "MotoCenter", "RiderPro", "MotoVente"]),
        "status": "approved",
        "is_boosted": random.random() < 0.1,
        "boost_until": datetime.utcnow() + timedelta(days=14) if random.random() < 0.1 else None,
        "views": random.randint(30, 300),
        "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 30)),
        "expires_at": datetime.utcnow() + timedelta(days=random.randint(30, 60))
    }

# Generate scooter listing
def generate_scooter():
    brand = random.choice(list(SCOOTER_BRANDS.keys()))
    model = random.choice(SCOOTER_BRANDS[brand])
    year = random.randint(2018, 2024)
    mileage = random.randint(500, 30000)
    
    price = random.randint(1500, 8000)
    
    descriptions = [
        f"Scooter {brand} {model} {year} en excellent etat. Ideal pour trajets urbains. {mileage} km, entretien a jour.",
        f"Vends {brand} {model} annee {year}. Tres peu servi, {mileage} km. Parfait pour debutant ou trajets quotidiens.",
        f"{brand} {model} {year} - Premiere main, jamais chute. Top case inclus. Revisions effectuees regulierement."
    ]
    
    return {
        "title": f"{brand} {model} {year} - {mileage} km",
        "description": random.choice(descriptions),
        "price": price,
        "category": "moto",
        "sub_category": "scooter_homologue",
        "location": random.choice(CITIES),
        "photos": get_moto_photos(),
        "brand": brand,
        "model": model,
        "year": year,
        "mileage": mileage,
        "fuel_type": "Essence",
        "user_id": "demo_user",
        "user_name": random.choice(["ScooterCity", "UrbanMobility", "2RouesFacile", "ScootOccas"]),
        "status": "approved",
        "is_boosted": random.random() < 0.08,
        "boost_until": datetime.utcnow() + timedelta(days=14) if random.random() < 0.08 else None,
        "views": random.randint(20, 200),
        "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 30)),
        "expires_at": datetime.utcnow() + timedelta(days=random.randint(30, 60))
    }

# Generate house listing
def generate_house():
    surface = random.randint(80, 300)
    rooms = random.randint(3, 8)
    property_type = random.choice(PROPERTY_TYPES_HOUSE)
    has_garden = random.random() < 0.8
    
    # Price based on surface (avg 2500-4000 EUR/m2)
    price_per_m2 = random.randint(2000, 5000)
    price = surface * price_per_m2
    
    descriptions = [
        f"Belle {property_type.lower()} de {surface} m2 avec {rooms} pieces. {'Grand jardin arbore.' if has_garden else ''} Cuisine equipee, double vitrage, chauffage gaz.",
        f"{property_type} {rooms} pieces, {surface} m2 habitables. Lumineux et calme. {'Jardin de 500m2.' if has_garden else ''} Proche commerces et ecoles.",
        f"A vendre: {property_type.lower()} de charme, {surface} m2, {rooms} pieces. Renovation recente, prestations de qualite. {'Exterieur sans vis-a-vis.' if has_garden else ''}",
        f"Magnifique {property_type.lower()} familiale. {surface} m2, {rooms} chambres. {'Piscine et jardin paysager.' if has_garden and random.random() < 0.3 else 'Terrasse exposee sud.'}"
    ]
    
    return {
        "title": f"{property_type} {rooms} pieces - {surface} m2",
        "description": random.choice(descriptions),
        "price": price,
        "category": "immobilier",
        "sub_category": "vente_maison",
        "location": random.choice(CITIES),
        "photos": get_house_photos(),
        "surface_m2": surface,
        "rooms": rooms,
        "property_type": property_type,
        "has_garden": has_garden,
        "handicap_access": random.random() < 0.2,
        "user_id": "demo_user",
        "user_name": random.choice(["ImmoPlus", "AgenceduCentre", "VenteDirecte", "ProprioPrive", "ImmoConseil", "HabitatVente"]),
        "status": "approved",
        "is_boosted": random.random() < 0.15,
        "boost_until": datetime.utcnow() + timedelta(days=14) if random.random() < 0.15 else None,
        "views": random.randint(100, 800),
        "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 30)),
        "expires_at": datetime.utcnow() + timedelta(days=random.randint(30, 90))
    }

# Generate apartment listing
def generate_apartment():
    surface = random.randint(20, 120)
    rooms = max(1, surface // 25)
    property_type = random.choice(PROPERTY_TYPES_APT)
    floor = random.randint(0, 10)
    
    # Price based on surface
    price_per_m2 = random.randint(2500, 6000)
    price = surface * price_per_m2
    
    descriptions = [
        f"{property_type} {rooms} pieces de {surface} m2 au {floor}e etage. Lumineux, vue degagee. Ascenseur, gardien, parking en option.",
        f"Bel {property_type.lower()} de {surface} m2, {rooms} pieces. Balcon, cave. Residence securisee, proche transports.",
        f"A vendre: {property_type.lower()} {rooms}P, {surface} m2. Etage {floor}, ascenseur. Cuisine americaine, parquet.",
        f"{property_type} moderne {surface} m2. Standing, prestations haut de gamme. Terrasse, 2 places parking."
    ]
    
    return {
        "title": f"{property_type} {rooms} pieces - {surface} m2",
        "description": random.choice(descriptions),
        "price": price,
        "category": "immobilier",
        "sub_category": "vente_appartement",
        "location": random.choice(CITIES),
        "photos": get_apt_photos(),
        "surface_m2": surface,
        "rooms": rooms,
        "property_type": property_type,
        "floor": floor,
        "has_garden": False,
        "handicap_access": floor == 0 or random.random() < 0.3,
        "user_id": "demo_user",
        "user_name": random.choice(["AppartCity", "ImmoService", "VenteAppart", "AgenceImmo", "DirectProprio", "ImmoExpert"]),
        "status": "approved",
        "is_boosted": random.random() < 0.12,
        "boost_until": datetime.utcnow() + timedelta(days=14) if random.random() < 0.12 else None,
        "views": random.randint(80, 600),
        "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 30)),
        "expires_at": datetime.utcnow() + timedelta(days=random.randint(30, 90))
    }

async def generate_listings():
    print("Generation des annonces de demonstration...")
    
    listings = []
    
    # Generate 35 cars
    print("- Generation de 35 annonces de voitures...")
    for _ in range(35):
        listings.append(generate_car())
    
    # Generate 20 motorcycles
    print("- Generation de 20 annonces de motos...")
    for _ in range(20):
        listings.append(generate_moto())
    
    # Generate 10 scooters
    print("- Generation de 10 annonces de scooters...")
    for _ in range(10):
        listings.append(generate_scooter())
    
    # Generate 20 houses
    print("- Generation de 20 annonces de maisons...")
    for _ in range(20):
        listings.append(generate_house())
    
    # Generate 15 apartments
    print("- Generation de 15 annonces d'appartements...")
    for _ in range(15):
        listings.append(generate_apartment())
    
    # Insert into database
    print(f"\nInsertion de {len(listings)} annonces dans la base de donnees...")
    result = await db.listings.insert_many(listings)
    print(f"✓ {len(result.inserted_ids)} annonces inserees avec succes!")
    
    # Summary
    print("\n=== RESUME ===")
    print(f"Voitures: 35")
    print(f"Motos: 20")
    print(f"Scooters: 10")
    print(f"Maisons: 20")
    print(f"Appartements: 15")
    print(f"TOTAL: {len(listings)} annonces")

if __name__ == "__main__":
    asyncio.run(generate_listings())
