import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import random
import os
from dotenv import load_dotenv
import hashlib

load_dotenv()

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client['petite_annonce']

# Prix par m2 selon la région (immobilier)
PRICE_PER_M2 = {
    "Paris": 10500, "Lyon": 5200, "Marseille": 3800, "Toulouse": 3500, "Nice": 5500,
    "Nantes": 4200, "Strasbourg": 3600, "Montpellier": 4000, "Bordeaux": 4800, "Lille": 3400,
    "Rennes": 4100, "Grenoble": 3200, "Dijon": 2800, "Angers": 3000, "Tours": 3100,
    "Orleans": 2900, "Rouen": 2700, "Caen": 2600, "Metz": 2400, "Besancon": 2300,
    "Perpignan": 2200, "Limoges": 1800, "Clermont-Ferrand": 2500, "Le Mans": 2100
}

CITIES_DATA = [
    {"city": "Paris", "cp": "75001"}, {"city": "Paris", "cp": "75008"}, {"city": "Paris", "cp": "75016"},
    {"city": "Lyon", "cp": "69001"}, {"city": "Lyon", "cp": "69006"}, {"city": "Marseille", "cp": "13001"},
    {"city": "Marseille", "cp": "13008"}, {"city": "Toulouse", "cp": "31000"}, {"city": "Nice", "cp": "06000"},
    {"city": "Nantes", "cp": "44000"}, {"city": "Strasbourg", "cp": "67000"}, {"city": "Montpellier", "cp": "34000"},
    {"city": "Bordeaux", "cp": "33000"}, {"city": "Lille", "cp": "59000"}, {"city": "Rennes", "cp": "35000"},
    {"city": "Grenoble", "cp": "38000"}, {"city": "Dijon", "cp": "21000"}, {"city": "Angers", "cp": "49000"},
    {"city": "Tours", "cp": "37000"}, {"city": "Orleans", "cp": "45000"}, {"city": "Rouen", "cp": "76000"},
    {"city": "Caen", "cp": "14000"}, {"city": "Metz", "cp": "57000"}, {"city": "Clermont-Ferrand", "cp": "63000"}
]

# Pseudos réalistes français
PSEUDOS = [
    "Marie_D", "Thomas.L", "Julie33", "Pierre.Martin", "Sophie_B", "Lucas.R", "Emma.Dupont",
    "Antoine75", "Camille_M", "Nicolas.G", "Charlotte44", "Maxime_P", "Lea.Bernard", "Hugo.T",
    "Manon_V", "Alexandre69", "Chloe.F", "Romain.S", "Sarah_L", "Julien.C", "Laura.M", "Kevin_D",
    "Pauline.N", "Mathieu.B", "Clara06", "Quentin_R", "Anais.P", "Florian31", "Marine_G", "Dylan.L",
    "Oceane.H", "Theo_M", "Justine.A", "Clement.V", "Lucie38", "Bastien_C", "Melanie.T", "Adrien.K",
    "Elodie_S", "Valentin.R", "Amandine.D", "Benjamin33", "Aurelie_F", "Sebastien.M", "Nathalie.B",
    "Christophe_L", "Sandrine.P", "Olivier06", "Isabelle.G", "Patrick_D", "Veronique.N", "Jean-Pierre.M",
    "Francoise_T", "Michel.R", "Monique.S", "Alain_B", "Catherine.L", "Bernard.C", "MariePierre44"
]

# Photos Unsplash par catégorie (URLs uniques)
CAR_PHOTOS = [
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?w=800&h=600&fit=crop"
]

MOTO_PHOTOS = [
    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1558980664-769d59546b3d?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1622185135505-2d795003994a?w=800&h=600&fit=crop"
]

HOUSE_PHOTOS = [
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop"
]

APT_PHOTOS = [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=600&fit=crop"
]

CAR_BRANDS = {
    "Renault": {"models": ["Clio V", "Megane IV", "Captur", "Kadjar", "Scenic IV", "Arkana", "Austral"], "base": 14000},
    "Peugeot": {"models": ["208", "308", "3008", "2008", "508", "5008", "Rifter"], "base": 15000},
    "Citroen": {"models": ["C3", "C4", "C5 Aircross", "Berlingo", "C3 Aircross", "C4 X"], "base": 13000},
    "Volkswagen": {"models": ["Golf 8", "Polo", "Tiguan", "T-Roc", "Passat", "ID.4", "Taigo"], "base": 20000},
    "BMW": {"models": ["Serie 1", "Serie 3", "Serie 5", "X1", "X3", "iX1"], "base": 32000},
    "Mercedes": {"models": ["Classe A", "Classe C", "CLA", "GLA", "GLC", "EQA"], "base": 35000},
    "Audi": {"models": ["A1", "A3", "A4", "Q3", "Q5", "Q4 e-tron"], "base": 30000},
    "Toyota": {"models": ["Yaris", "Corolla", "RAV4", "C-HR", "Yaris Cross", "bZ4X"], "base": 18000},
    "Dacia": {"models": ["Sandero", "Duster", "Jogger", "Spring"], "base": 12000},
    "Fiat": {"models": ["500", "Panda", "Tipo", "500X"], "base": 14000}
}

MOTO_BRANDS = {
    "Yamaha": {"models": ["MT-07", "MT-09", "Tracer 700", "XSR 700", "Tenere 700", "R7"], "base": 7500},
    "Honda": {"models": ["CB650R", "Africa Twin", "Rebel 500", "CBR650R", "NC750X", "Hornet"], "base": 8000},
    "Kawasaki": {"models": ["Z650", "Z900", "Ninja 650", "Versys 650", "Z400", "Ninja 400"], "base": 7000},
    "BMW": {"models": ["R1250GS", "F900R", "F750GS", "G310R", "F900XR"], "base": 12000},
    "KTM": {"models": ["Duke 390", "Duke 790", "Adventure 890", "Duke 125", "RC 390"], "base": 6500},
    "Triumph": {"models": ["Street Triple", "Tiger 900", "Trident 660", "Speed Triple"], "base": 9500}
}

SCOOTER_BRANDS = {
    "Yamaha": {"models": ["XMAX 125", "XMAX 300", "NMAX 125", "Tricity 300"], "base": 4000},
    "Honda": {"models": ["Forza 125", "Forza 350", "PCX 125", "SH 125", "ADV 350"], "base": 4500},
    "Piaggio": {"models": ["Beverly 300", "MP3 500", "Liberty 125", "Medley 125"], "base": 4000},
    "Vespa": {"models": ["Primavera 125", "GTS 300", "Sprint 125", "Elettrica"], "base": 5000}
}

def get_unique_photos(photo_list, count, seed):
    random.seed(seed)
    shuffled = photo_list.copy()
    random.shuffle(shuffled)
    return shuffled[:min(count, len(shuffled))]

def generate_car(index):
    brand = random.choice(list(CAR_BRANDS.keys()))
    data = CAR_BRANDS[brand]
    model = random.choice(data["models"])
    year = random.randint(2018, 2024)
    mileage = random.randint(8000, 150000)
    fuel = random.choice(["Essence", "Diesel", "Hybride"]) if "ID" not in model and "EQ" not in model and "e-tron" not in model and "bZ" not in model and "Spring" not in model else "Electrique"
    transmission = random.choice(["Manuelle", "Automatique"])
    
    price = data["base"]
    price = int(price * (1 + (year - 2018) * 0.1) * (1 - mileage / 300000) * random.uniform(0.9, 1.1))
    price = max(4000, min(price, 65000))
    
    city_data = random.choice(CITIES_DATA)
    pseudo = random.choice(PSEUDOS)
    
    descriptions = [
        f"Je vends ma {brand} {model} de {year} suite a l'achat d'un nouveau vehicule. Elle a {mileage} km au compteur et a toujours ete entretenue dans le reseau {brand}. Carnet d'entretien complet disponible. Le vehicule est en excellent etat, aussi bien mecanique qu'esthetique. Controle technique a jour, valable jusqu'en 2026. N'hesitez pas a me contacter pour plus d'informations ou pour organiser un essai.",
        f"A vendre {brand} {model} annee {year}. Voiture de premiere main, non fumeur, toujours garee en garage. Kilometrage certifie : {mileage} km. Equipements : climatisation automatique, GPS integre, camera de recul, capteurs de stationnement. Revision complete effectuee il y a moins de 3 mois. Je reste disponible pour toute question.",
        f"Superbe {brand} {model} {year} en parfait etat de fonctionnement. {mileage} km, entretien rigoureux avec factures a l'appui. {fuel}, boite {transmission.lower()}. Pneus neufs a l'avant, batterie changee recemment. Aucun frais a prevoir. Vendue car je passe a l'electrique. Prix ferme, pas d'echange.",
        f"Mise en vente de ma {brand} {model} de {year}. C'est une voiture fiable et agreable a conduire au quotidien. Elle cumule {mileage} km et n'a jamais eu le moindre probleme mecanique. Interieur tres propre, carrosserie sans rayures. Je la vends avec le certificat de non-gage et les cles supplementaires. A saisir rapidement !",
        f"Particulier vend {brand} {model} {year}. Kilometrage : {mileage} km. Motorisation {fuel.lower()}, transmission {transmission.lower()}. Cette voiture a ete regulierement entretenue et n'a subi aucun accident. Elle dispose de nombreuses options de confort. Je suis ouvert a la discussion pour le prix. Possibilite de paiement en plusieurs fois."
    ]
    
    return {
        "title": f"{brand} {model} - {year} - {mileage:,} km".replace(",", " "),
        "description": random.choice(descriptions),
        "price": price,
        "category": "auto",
        "sub_category": "voiture",
        "location": f"{city_data['city']}, {city_data['cp']}",
        "photos": get_unique_photos(CAR_PHOTOS, random.randint(3, 5), index),
        "brand": brand,
        "model": model,
        "year": year,
        "mileage": mileage,
        "fuel_type": fuel,
        "transmission": transmission,
        "user_id": f"demo_{index}",
        "user_name": pseudo,
        "status": "approved",
        "is_boosted": random.random() < 0.08,
        "boost_until": datetime.utcnow() + timedelta(days=14) if random.random() < 0.08 else None,
        "views": random.randint(45, 380),
        "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 25), hours=random.randint(0, 23)),
        "expires_at": datetime.utcnow() + timedelta(days=random.randint(35, 55))
    }

def generate_moto(index):
    brand = random.choice(list(MOTO_BRANDS.keys()))
    data = MOTO_BRANDS[brand]
    model = random.choice(data["models"])
    year = random.randint(2019, 2024)
    mileage = random.randint(2000, 45000)
    
    price = data["base"]
    price = int(price * (1 + (year - 2019) * 0.12) * (1 - mileage / 100000) * random.uniform(0.85, 1.15))
    price = max(3000, min(price, 20000))
    
    city_data = random.choice(CITIES_DATA)
    pseudo = random.choice(PSEUDOS)
    
    descriptions = [
        f"Vends ma {brand} {model} de {year} avec {mileage} km. Moto en excellent etat, entretenue exclusivement chez {brand}. Elle n'a jamais chute et a toujours ete garee en garage. Equipee d'un echappement Akrapovic et de protections moteur. Livree avec 2 cles et le manuel d'utilisation. Prix negociable pour les connaisseurs.",
        f"{brand} {model} annee {year}, {mileage} km compteur. Premiere main, jamais accidentee. La moto a ete utilisee principalement pour des balades le week-end, d'ou le faible kilometrage. Revision effectuee recemment, pneus en bon etat. Je la vends car je n'ai plus le temps de rouler. A voir absolument !",
        f"Je me separe de ma fidele {brand} {model} {year}. Elle cumule {mileage} km et fonctionne parfaitement. Toutes les revisions ont ete faites dans les temps. C'est une moto fiable, puissante et tres agreable a conduire. Accessoires inclus : sacoches laterales, top case et support telephone. Contact par message de preference."
    ]
    
    return {
        "title": f"{brand} {model} {year} - {mileage:,} km".replace(",", " "),
        "description": random.choice(descriptions),
        "price": price,
        "category": "moto",
        "sub_category": "moto_homologuee",
        "location": f"{city_data['city']}, {city_data['cp']}",
        "photos": get_unique_photos(MOTO_PHOTOS, random.randint(2, 4), index + 100),
        "brand": brand,
        "model": model,
        "year": year,
        "mileage": mileage,
        "fuel_type": "Essence",
        "user_id": f"demo_{index + 100}",
        "user_name": pseudo,
        "status": "approved",
        "is_boosted": random.random() < 0.1,
        "boost_until": datetime.utcnow() + timedelta(days=14) if random.random() < 0.1 else None,
        "views": random.randint(30, 250),
        "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 20), hours=random.randint(0, 23)),
        "expires_at": datetime.utcnow() + timedelta(days=random.randint(30, 50))
    }

def generate_scooter(index):
    brand = random.choice(list(SCOOTER_BRANDS.keys()))
    data = SCOOTER_BRANDS[brand]
    model = random.choice(data["models"])
    year = random.randint(2020, 2024)
    mileage = random.randint(1000, 20000)
    
    price = data["base"]
    price = int(price * (1 + (year - 2020) * 0.1) * (1 - mileage / 60000) * random.uniform(0.9, 1.1))
    price = max(1500, min(price, 9000))
    
    city_data = random.choice(CITIES_DATA)
    pseudo = random.choice(PSEUDOS)
    
    descriptions = [
        f"Scooter {brand} {model} {year} en parfait etat. Seulement {mileage} km, utilise principalement pour les trajets domicile-travail. Tres economique et facile a garer en ville. Entretien suivi, pas de frais a prevoir. Top case offert avec la vente. Ideal pour les deplacements urbains quotidiens.",
        f"A vendre {brand} {model} annee {year}. Ce scooter est une vraie pepite : fiable, confortable et economique. Il a {mileage} km et a toujours ete entretenu regulierement. Je le vends car je demenage et n'en ai plus besoin. Possibilite d'essai sur place.",
        f"Je vends mon {brand} {model} de {year} avec {mileage} km. Scooter tres agreable au quotidien, parfait pour eviter les embouteillages. Moteur reactif, freinage efficace. Vendu avec le carnet d'entretien et tous les papiers en regle. Prix a debattre."
    ]
    
    return {
        "title": f"{brand} {model} {year} - {mileage:,} km".replace(",", " "),
        "description": random.choice(descriptions),
        "price": price,
        "category": "moto",
        "sub_category": "scooter_homologue",
        "location": f"{city_data['city']}, {city_data['cp']}",
        "photos": get_unique_photos(MOTO_PHOTOS, random.randint(2, 3), index + 200),
        "brand": brand,
        "model": model,
        "year": year,
        "mileage": mileage,
        "fuel_type": "Essence",
        "user_id": f"demo_{index + 200}",
        "user_name": pseudo,
        "status": "approved",
        "is_boosted": random.random() < 0.06,
        "boost_until": datetime.utcnow() + timedelta(days=14) if random.random() < 0.06 else None,
        "views": random.randint(20, 180),
        "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 18), hours=random.randint(0, 23)),
        "expires_at": datetime.utcnow() + timedelta(days=random.randint(30, 45))
    }

def generate_house(index):
    city_data = random.choice(CITIES_DATA)
    city = city_data["city"]
    surface = random.randint(85, 250)
    rooms = max(3, min(8, surface // 30))
    property_types = ["Maison", "Villa", "Pavillon", "Maison de ville", "Longere renovee"]
    property_type = random.choice(property_types)
    has_garden = random.random() < 0.85
    garden_size = random.randint(200, 1500) if has_garden else 0
    
    base_price = PRICE_PER_M2.get(city, 2500)
    price = int(surface * base_price * random.uniform(0.85, 1.2))
    
    pseudo = random.choice(PSEUDOS)
    
    descriptions = [
        f"Magnifique {property_type.lower()} de {surface} m2 situee dans un quartier calme et recherche de {city}. Cette maison comprend {rooms} pieces dont {rooms-2} chambres, un sejour lumineux de 35 m2, une cuisine equipee et 2 salles d'eau. {'Le jardin de ' + str(garden_size) + ' m2 est parfaitement entretenu avec terrasse exposee sud.' if has_garden else 'Cour interieure privative.'} Proche ecoles, commerces et transports. A visiter sans tarder !",
        f"A vendre : {property_type.lower()} familiale de {surface} m2 a {city}. Disposition ideale avec {rooms} pieces sur 2 niveaux. Au rez-de-chaussee : entree, salon-sejour, cuisine ouverte. A l'etage : {rooms-2} chambres et salle de bains. {'Grand jardin arbore de ' + str(garden_size) + ' m2 sans vis-a-vis.' if has_garden else 'Petit exterieur privatif.'} Chauffage gaz, double vitrage. Maison saine, prete a habiter.",
        f"Rare sur le marche ! {property_type} de caractere de {surface} m2 au coeur de {city}. {rooms} pieces spacieuses et lumineuses, parquet d'origine, cheminee dans le salon. Cuisine recente entierement equipee. {'Jardin paysager de ' + str(garden_size) + ' m2 avec abri de jardin.' if has_garden else ''} DPE classe C. Une opportunite a saisir pour les amoureux de l'ancien !",
        f"Particulier vend {property_type.lower()} de {surface} m2 a {city}. Cette maison offre {rooms} belles pieces : entree avec placard, sejour-salon traversant, cuisine amenagee, {rooms-2} chambres dont une suite parentale avec dressing. {'Agreable jardin clos de ' + str(garden_size) + ' m2.' if has_garden else ''} Garage et places de stationnement. Quartier residentiel tres apprecie. Frais d'agence reduits."
    ]
    
    return {
        "title": f"{property_type} {rooms} pieces - {surface} m2 - {city}",
        "description": random.choice(descriptions),
        "price": price,
        "category": "immobilier",
        "sub_category": "vente_maison",
        "location": f"{city}, {city_data['cp']}",
        "photos": get_unique_photos(HOUSE_PHOTOS, random.randint(4, 5), index + 300),
        "surface_m2": surface,
        "rooms": rooms,
        "property_type": property_type,
        "has_garden": has_garden,
        "handicap_access": random.random() < 0.15,
        "user_id": f"demo_{index + 300}",
        "user_name": pseudo,
        "status": "approved",
        "is_boosted": random.random() < 0.12,
        "boost_until": datetime.utcnow() + timedelta(days=14) if random.random() < 0.12 else None,
        "views": random.randint(80, 550),
        "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 28), hours=random.randint(0, 23)),
        "expires_at": datetime.utcnow() + timedelta(days=random.randint(45, 75))
    }

def generate_apartment(index):
    city_data = random.choice(CITIES_DATA)
    city = city_data["city"]
    surface = random.randint(25, 95)
    rooms = max(1, min(5, surface // 20))
    property_types = ["Appartement", "Studio", "Loft", "Duplex", "T" + str(rooms)]
    property_type = random.choice(property_types)
    floor = random.randint(0, 8)
    has_balcony = random.random() < 0.6
    has_parking = random.random() < 0.5
    
    base_price = PRICE_PER_M2.get(city, 3000)
    price = int(surface * base_price * random.uniform(0.9, 1.15))
    
    pseudo = random.choice(PSEUDOS)
    floor_text = "RDC" if floor == 0 else f"{floor}e etage"
    
    descriptions = [
        f"Superbe {property_type.lower()} de {surface} m2 au {floor_text} d'une residence securisee a {city}. Ce bien lumineux comprend {rooms} piece{'s' if rooms > 1 else ''}, une cuisine americaine equipee et une salle d'eau avec WC. {'Balcon de 8 m2.' if has_balcony else ''} {'Place de parking en sous-sol incluse.' if has_parking else ''} Ascenseur, gardien, digicode. Charges de copropriete raisonnables. Ideal investissement ou premiere acquisition !",
        f"A vendre : {property_type.lower()} {rooms} piece{'s' if rooms > 1 else ''} de {surface} m2 a {city}, {floor_text}. Appartement fonctionnel et bien agence : sejour avec coin cuisine, {'chambre separee, ' if rooms > 1 else ''}salle de bains. {'Agreable balcon sans vis-a-vis.' if has_balcony else 'Vue degagee.'} Immeuble recent aux normes, faibles charges. DPE B. {'Parking privatif.' if has_parking else ''} Disponible immediatement.",
        f"Vends {property_type.lower()} de {surface} m2 au {floor_text} dans le centre de {city}. Cet appartement a ete entierement renove avec gout : cuisine neuve, salle d'eau moderne, parquet stratifie. {rooms} piece{'s' if rooms > 1 else ''} {'avec balcon filant.' if has_balcony else 'tres lumineuse.'} Copropriete bien entretenue. {'Stationnement en sous-sol.' if has_parking else 'Parking facile dans la rue.'} A visiter rapidement !",
        f"Opportunite a {city} ! {property_type} de {surface} m2 au {floor_text}. Disposition ideale avec {rooms} piece{'s' if rooms > 1 else ''} : entree avec rangement, piece de vie ouverte sur cuisine equipee. {'Belle terrasse.' if has_balcony else ''} Double vitrage, chauffage individuel electrique. Residence calme avec espaces verts. {'Garage ferme.' if has_parking else ''} Parfait pour habiter ou louer."
    ]
    
    return {
        "title": f"{property_type} {rooms} piece{'s' if rooms > 1 else ''} - {surface} m2 - {city}",
        "description": random.choice(descriptions),
        "price": price,
        "category": "immobilier",
        "sub_category": "vente_appartement",
        "location": f"{city}, {city_data['cp']}",
        "photos": get_unique_photos(APT_PHOTOS, random.randint(3, 5), index + 400),
        "surface_m2": surface,
        "rooms": rooms,
        "property_type": property_type,
        "floor": floor,
        "has_garden": False,
        "handicap_access": floor == 0 or random.random() < 0.2,
        "user_id": f"demo_{index + 400}",
        "user_name": pseudo,
        "status": "approved",
        "is_boosted": random.random() < 0.1,
        "boost_until": datetime.utcnow() + timedelta(days=14) if random.random() < 0.1 else None,
        "views": random.randint(60, 420),
        "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 22), hours=random.randint(0, 23)),
        "expires_at": datetime.utcnow() + timedelta(days=random.randint(40, 70))
    }

async def generate_listings():
    print("Generation des annonces realistes...")
    
    listings = []
    
    print("- 35 voitures...")
    for i in range(35):
        listings.append(generate_car(i))
    
    print("- 20 motos...")
    for i in range(20):
        listings.append(generate_moto(i))
    
    print("- 10 scooters...")
    for i in range(10):
        listings.append(generate_scooter(i))
    
    print("- 20 maisons...")
    for i in range(20):
        listings.append(generate_house(i))
    
    print("- 15 appartements...")
    for i in range(15):
        listings.append(generate_apartment(i))
    
    print(f"\nInsertion de {len(listings)} annonces...")
    result = await db.listings.insert_many(listings)
    print(f"✓ {len(result.inserted_ids)} annonces creees avec succes!")

if __name__ == "__main__":
    asyncio.run(generate_listings())
