export const CATEGORIES = {
  auto_moto: {
    name: 'Auto / Moto',
    icon: 'car',
    sub_categories: [
      { id: 'auto', name: 'Auto', icon: 'car' },
      { id: 'moto_homologuee', name: 'Moto homologuée', icon: 'bicycle' },
      { id: 'moto_non_homologuee', name: 'Moto non homologuée', icon: 'bicycle' },
      { id: 'scooter', name: 'Scooter', icon: 'bicycle' },
      { id: 'quad_homologue', name: 'Quad homologué', icon: 'car-sport' },
      { id: 'quad_non_homologue', name: 'Quad non homologué', icon: 'car-sport' }
    ]
  },
  immobilier: {
    name: 'Immobilier',
    icon: 'home',
    sub_categories: [
      { id: 'location', name: 'Location', icon: 'key' },
      { id: 'colocation', name: 'Colocation', icon: 'people' },
      { id: 'vente', name: 'Vente', icon: 'home' }
    ]
  }
};

export const CAR_BRANDS = [
  'Abarth', 'Alfa Romeo', 'Alpine', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Bugatti',
  'Cadillac', 'Chevrolet', 'Chrysler', 'Citroën', 'Cupra', 'Dacia', 'Daewoo', 'Daihatsu',
  'Dodge', 'DS', 'Ferrari', 'Fiat', 'Ford', 'Genesis', 'Honda', 'Hummer', 'Hyundai',
  'Infiniti', 'Isuzu', 'Iveco', 'Jaguar', 'Jeep', 'Kia', 'Lada', 'Lamborghini', 'Lancia',
  'Land Rover', 'Lexus', 'Lincoln', 'Lotus', 'Maserati', 'Mazda', 'McLaren', 'Mercedes-Benz',
  'MG', 'Mini', 'Mitsubishi', 'Nissan', 'Opel', 'Peugeot', 'Polestar', 'Porsche', 'Renault',
  'Rolls-Royce', 'Rover', 'Saab', 'Seat', 'Skoda', 'Smart', 'SsangYong', 'Subaru', 'Suzuki',
  'Tesla', 'Toyota', 'Triumph', 'Volkswagen', 'Volvo'
];

export const MOTO_BRANDS = [
  'Aprilia', 'Benelli', 'Beta', 'BMW', 'Brixton', 'BSA', 'Buell', 'Bultaco', 'Cagiva',
  'CF Moto', 'Daelim', 'Derbi', 'Ducati', 'Fantic', 'Gas Gas', 'Gilera', 'Harley-Davidson',
  'Honda', 'Husqvarna', 'Indian', 'Kawasaki', 'KTM', 'Kymco', 'Laverda', 'Moto Guzzi',
  'Moto Morini', 'MV Agusta', 'Norton', 'Peugeot', 'Piaggio', 'Royal Enfield', 'Sherco',
  'Suzuki', 'SWM', 'Sym', 'Triumph', 'Vespa', 'Victory', 'Yamaha', 'Zero'
];

export const FUEL_TYPES = [
  { id: 'essence', name: 'Essence' },
  { id: 'diesel', name: 'Diesel' },
  { id: 'electrique', name: 'Électrique' },
  { id: 'hybride', name: 'Hybride' },
  { id: 'gpl', name: 'GPL' },
  { id: 'ethanol', name: 'Éthanol' }
];

export const VEHICLE_TYPES = [
  { id: 'citadine', name: 'Citadine' },
  { id: 'berline', name: 'Berline' },
  { id: 'break', name: 'Break' },
  { id: 'cabriolet', name: 'Cabriolet' },
  { id: 'coupe', name: 'Coupé' },
  { id: 'monospace', name: 'Monospace' },
  { id: 'suv', name: 'SUV' },
  { id: '4x4', name: '4x4' },
  { id: 'utilitaire', name: 'Utilitaire' },
  { id: 'pickup', name: 'Pick-up' }
];

export const PROPERTY_TYPES = [
  { id: 'appartement', name: 'Appartement' },
  { id: 'maison', name: 'Maison' },
  { id: 'immeuble', name: 'Immeuble de rapport' },
  { id: 'terrain', name: 'Terrain' },
  { id: 'local', name: 'Local commercial' },
  { id: 'parking', name: 'Parking/Box' }
];

export const TRANSMISSIONS = [
  { id: 'manual', name: 'Manuelle' },
  { id: 'automatic', name: 'Automatique' }
];
