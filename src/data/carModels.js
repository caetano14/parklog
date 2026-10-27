import { canonicalBrand } from '../utils/brands';
import { norm } from '../utils/text';

// Sugestões de modelo por marca (toca para preencher). Não é uma lista fechada: o campo
// continua a aceitar qualquer texto. Os primeiros de cada lista são os mais conhecidos.
// A chave é o nome da marca como aparece em CAR_BRANDS.
export const CAR_MODELS = {
  Abarth: ['595', '500', '695', '595 Competizione', '695 Biposto', '695 Tributo Ferrari', '124 Spider', '500e'],
  Acura: ['NSX', 'Integra', 'Integra Type S', 'TLX Type S', 'RSX', 'MDX', 'RDX', 'TSX'],
  AC: ['Cobra', 'Ace', 'Aceca', '428'],
  Alpina: ['B3', 'B5', 'B7', 'D3', 'D5', 'XD3', 'XB7', 'B10'],
  'Alfa Romeo': [
    'Giulia', 'Giulia Quadrifoglio', 'Stelvio', 'Stelvio Quadrifoglio', 'Giulietta', 'MiTo', '4C', '8C Competizione', '159',
    '147', '156', '155', 'GTV', 'Spider', 'Brera', 'Tonale', 'Junior', '33 Stradale', 'Montreal', 'Duetto', 'SZ',
  ],
  Alpine: ['A110', 'A110 S', 'A110 R', 'A290', 'A310', 'GTA'],
  'Aston Martin': [
    'DB11', 'DB12', 'DB9', 'DBS Superleggera', 'Vantage', 'V8 Vantage', 'DBX', 'Vanquish', 'Rapide', 'Valkyrie', 'Valhalla',
    'One-77', 'Virage', 'DB5', 'DB4', 'Cygnet',
  ],
  Audi: [
    'A3', 'A4', 'A5', 'A6', 'A1', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'TT RS', 'R8', 'RS3', 'RS4', 'RS5', 'RS6 Avant', 'RS7',
    'RSQ8', 'S3', 'S4', 'S6', 'A7', 'A8', 'e-tron', 'e-tron GT', 'Q4 e-tron', 'Quattro', 'Sport Quattro', 'RS2 Avant', 'A2', '80', '100',
  ],
  Bentley: ['Continental GT', 'Flying Spur', 'Bentayga', 'Mulsanne', 'Azure', 'Arnage', 'Brooklands', 'Turbo R', 'Bacalar', 'Batur'],
  BMW: [
    'Série 1', 'Série 2', 'Série 3', 'Série 4', 'Série 5', 'Série 7', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'Z3', 'Z4', 'i3',
    'i4', 'i8', 'iX', 'M2', 'M3', 'M3 Competition', 'M4', 'M4 CS', 'M5', 'M6', 'M8', 'X5 M', 'X6 M', 'XM', '1M', 'M1', 'Z1', 'Z8', 'Isetta',
  ],
  Brabus: ['G 800', 'G 900', 'Rocket 900', 'Rocket 800'],
  Bugatti: ['Veyron', 'Chiron', 'Chiron Super Sport', 'Divo', 'Centodieci', 'La Voiture Noire', 'Mistral', 'Bolide', 'Tourbillon', 'EB110', 'Type 57'],
  Buick: ['Regal GNX', 'Grand National', 'Riviera', 'Enclave', 'Encore', 'LeSabre', 'Skylark'],
  BYD: ['Dolphin', 'Seal', 'Atto 3', 'Han', 'Tang', 'Seagull', 'Sealion 7', 'Atto 2', 'Yuan Plus'],
  Cadillac: ['Escalade', 'CTS-V', 'CT5-V Blackwing', 'CT4-V Blackwing', 'ATS-V', 'XT5', 'Lyriq', 'Eldorado', 'DeVille', 'Seville', 'Fleetwood'],
  Caterham: ['Seven 360', 'Seven 420', 'Seven 620', 'Seven 170', 'Seven CSR', '21'],
  Chery: ['Tiggo 7', 'Tiggo 8', 'Omoda 5', 'Jaecoo 7', 'QQ'],
  Chevrolet: [
    'Corvette', 'Corvette Stingray', 'Corvette Z06', 'Corvette ZR1', 'Corvette Grand Sport', 'Camaro', 'Camaro SS', 'Camaro ZL1',
    'Silverado', 'Tahoe', 'Suburban', 'Impala', 'Bel Air', 'Chevelle SS', 'El Camino', 'Malibu', 'Cruze', 'Spark', 'Aveo',
    'Matiz', 'Blazer', 'Bolt EV', 'Colorado', 'Corvair',
  ],
  Chrysler: ['300C', '300 SRT-8', 'Voyager', 'PT Cruiser', 'Crossfire', 'Pacifica', 'Sebring', 'Neon'],
  Citroën: [
    'C1', 'C2', 'C3', 'C4', 'C5', 'C3 Aircross', 'C4 Cactus', 'C4 Picasso', 'Saxo', 'Saxo VTS', 'Xsara', 'Xsara Picasso', 'Berlingo',
    '2CV', 'DS 19', 'Ami', 'AX', 'BX', 'CX', 'SM', 'ZX', 'Visa', 'Méhari', 'C6', 'ë-C4', 'Traction Avant',
  ],
  Cupra: ['Formentor', 'Formentor VZ5', 'Leon', 'Ateca', 'Born', 'Tavascan', 'Terramar', 'Raval'],
  Dacia: ['Sandero', 'Sandero Stepway', 'Duster', 'Logan', 'Jogger', 'Spring', 'Bigster', 'Lodgy', 'Dokker', '1300'],
  Daewoo: ['Matiz', 'Lanos', 'Nubira', 'Kalos', 'Tico', 'Espero'],
  Daihatsu: ['Copen', 'Terios', 'Sirion', 'Charade', 'Cuore', 'Move'],
  Datsun: ['240Z', '260Z', '280Z', '280ZX', '510', 'Sunny', 'Go'],
  'De Tomaso': ['Pantera', 'Mangusta', 'Guarà', 'Vallelunga', 'Longchamp', 'Deauville'],
  DeLorean: ['DMC-12'],
  Dodge: [
    'Challenger', 'Challenger Hellcat', 'Challenger Demon', 'Challenger SRT', 'Charger', 'Charger Hellcat', 'Charger Daytona', 'Viper',
    'Durango', 'Dart', 'Caliber', 'Neon SRT-4', 'Coronet', 'Super Bee', 'Journey', 'Nitro', 'Stealth',
  ],
  DS: ['DS 3', 'DS 4', 'DS 5', 'DS 7', 'DS 9', 'DS 3 Crossback'],
  Ferrari: [
    '296 GTB', '296 GTS', 'SF90 Stradale', 'SF90 Spider', '812 Superfast', '812 GTS', '812 Competizione', 'F8 Tributo', 'F8 Spider',
    'Roma', 'Roma Spider', 'Portofino', 'Portofino M', 'Purosangue', '12Cilindri', 'Daytona SP3', 'Monza SP1', 'F80', '488 GTB',
    '488 Pista', '488 Spider', '458 Italia', '458 Speciale', '458 Spider', 'California', 'California T', 'GTC4Lusso', 'FF',
    'F12berlinetta', 'F12tdf', 'LaFerrari', 'Enzo', '599 GTB Fiorano', '599 GTO', '612 Scaglietti', '430 Scuderia', 'F430',
    '360 Modena', '360 Challenge Stradale', '355', '348', '328', '308 GTB', '288 GTO', 'F40', 'F50', '512 TR', 'Testarossa',
    '550 Maranello', '575M Maranello', 'Mondial', 'Dino 246 GT',
  ],
  Fiat: [
    '500', 'Panda', 'Punto', 'Grande Punto', 'Tipo', '500X', '500L', '500e', 'Uno', 'Bravo', 'Stilo', 'Multipla', 'Doblò', 'Seicento',
    'Cinquecento', '126', '127', '124 Spider', 'Barchetta', 'Coupé', 'X1/9', 'Ritmo', 'Strada', 'Marea', '600', 'Topolino', 'Panda 4x4',
  ],
  Fisker: ['Karma', 'Ocean'],
  Ford: [
    'Fiesta', 'Focus', 'Mustang', 'Mustang GT', 'Mustang Mach-E', 'Mustang Shelby GT500', 'Puma', 'Kuga', 'Ka', 'Mondeo', 'Transit',
    'Ranger', 'F-150', 'F-150 Raptor', 'Bronco', 'Explorer', 'Escort', 'Escort RS Cosworth', 'Capri', 'Sierra', 'Sierra RS Cosworth',
    'GT', 'GT40', 'Focus RS', 'Focus ST', 'Fiesta ST', 'Puma ST', 'Mondeo ST', 'Edge', 'Galaxy', 'S-Max', 'C-Max', 'Fusion',
    'Thunderbird', 'Maverick', 'Probe', 'Granada', 'Orion', 'Taurus', 'Model T',
  ],
  Genesis: ['G70', 'G80', 'G90', 'GV60', 'GV70', 'GV80'],
  Geely: ['Coolray', 'Emgrand', 'Monjaro', 'EX5', 'Atlas'],
  GMC: ['Sierra', 'Yukon', 'Hummer EV', 'Canyon', 'Terrain', 'Acadia', 'Typhoon', 'Syclone'],
  'Great Wall': ['Wingle', 'Steed', 'Poer'],
  Haval: ['H6', 'Jolion', 'H9', 'Dargo'],
  Hennessey: ['Venom GT', 'Venom F5', 'Exorcist'],
  Holden: ['Commodore', 'Commodore SS', 'Monaro', 'HSV Maloo', 'Torana', 'Ute', 'Barina', 'Kingswood'],
  Honda: [
    'Civic', 'Civic Type R', 'Civic Si', 'Accord', 'Jazz', 'CR-V', 'HR-V', 'ZR-V', 'NSX', 'S2000', 'Integra', 'Integra Type R',
    'Prelude', 'CR-Z', 'e', 'Fit', 'Legend', 'S800', 'Insight', 'City', 'Beat', 'Odyssey', 'Pilot', 'Ridgeline', 'e:Ny1',
  ],
  Hongqi: ['H9', 'HS5', 'E-HS9', 'L5'],
  Hummer: ['H1', 'H2', 'H3'],
  Hyundai: [
    'i10', 'i20', 'i20 N', 'i30', 'i30 N', 'i40', 'Tucson', 'Kona', 'Kona N', 'Santa Fe', 'Ioniq', 'Ioniq 5', 'Ioniq 5 N', 'Ioniq 6',
    'Bayon', 'Veloster', 'Veloster N', 'Getz', 'Coupé', 'Atos', 'Accent', 'Elantra', 'Elantra N', 'Genesis Coupé', 'Pony', 'Staria',
    'Nexo', 'Palisade', 'Santa Cruz',
  ],
  Infiniti: ['Q50', 'Q60', 'Q30', 'G35', 'G37', 'QX50', 'QX70', 'QX80', 'FX', 'M'],
  Isuzu: ['D-Max', 'Trooper', 'MU-X', 'Piazza', '117 Coupé', 'Gemini', 'VehiCROSS'],
  Jaguar: [
    'F-Type', 'F-Type R', 'F-Type SVR', 'F-Pace', 'F-Pace SVR', 'E-Pace', 'I-Pace', 'XE', 'XF', 'XJ', 'XK', 'XKR', 'XKR-S', 'X-Type',
    'S-Type', 'E-Type', 'XJ220', 'XJS', 'XK8', 'D-Type', 'C-Type', 'Mark 2', 'SS100', 'XFR', 'XJR', 'XK120', 'XK150',
  ],
  Jeep: [
    'Wrangler', 'Wrangler Rubicon', 'Grand Cherokee', 'Grand Cherokee Trackhawk', 'Cherokee', 'Renegade', 'Compass', 'Avenger',
    'Gladiator', 'Commander', 'Patriot', 'Willys', 'CJ-7', 'Wagoneer', 'Grand Wagoneer', 'Recon',
  ],
  Kia: [
    'Picanto', 'Rio', 'Ceed', 'Ceed GT', 'ProCeed', 'XCeed', 'Sportage', 'Sorento', 'Stonic', 'Niro', 'EV6', 'EV9', 'EV3', 'Stinger',
    'Stinger GT', 'Soul', 'Optima', 'Carens', 'Venga', 'Magentis', 'Pride', 'Sephia', 'Shuma', 'Telluride', 'Seltos',
  ],
  Koenigsegg: ['Agera', 'Agera RS', 'Regera', 'Jesko', 'Jesko Absolut', 'Gemera', 'CCX', 'CCXR', 'One:1', 'CC8S'],
  Lada: ['Niva', 'Samara', '2107', '2105', 'Riva', 'Granta', 'Vesta', 'Kalina', 'Priora', 'Taiga'],
  Lamborghini: [
    'Huracán', 'Huracán Evo', 'Huracán Performante', 'Huracán STO', 'Huracán Tecnica', 'Huracán Sterrato', 'Aventador', 'Aventador S',
    'Aventador SVJ', 'Aventador Ultimae', 'Urus', 'Urus Performante', 'Urus SE', 'Revuelto', 'Temerario', 'Gallardo',
    'Gallardo Superleggera', 'Murciélago', 'Murciélago LP 670-4 SV', 'Diablo', 'Diablo SV', 'Countach', 'Countach LPI 800-4', 'Miura',
    'Espada', 'Jarama', 'Jalpa', 'Silhouette', 'LM002', 'Reventón', 'Veneno', 'Sesto Elemento', 'Sián FKP 37', 'Centenario', 'Essenza SCV12',
  ],
  Lancia: [
    'Delta', 'Delta HF Integrale', 'Delta S4', 'Stratos', '037', 'Fulvia', 'Fulvia HF', 'Flavia', 'Beta', 'Thema', 'Thema 8.32', 'Y10',
    'Ypsilon', 'Musa', 'Kappa', 'Lybra', 'Dedra', 'Montecarlo', 'Aurelia', 'Flaminia', 'Gamma', 'Thesis', 'Prisma', 'Appia',
  ],
  'Land Rover': [
    'Defender', 'Defender 90', 'Defender 110', 'Defender 130', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Sport',
    'Range Rover Sport SVR', 'Range Rover Velar', 'Range Rover Evoque', 'Freelander', 'Series I', 'Series II', 'Series III',
    'Range Rover Classic', 'Defender Works V8',
  ],
  Lexus: ['IS', 'IS F', 'ES', 'GS', 'GS F', 'LS', 'LC', 'LC 500', 'RC', 'RC F', 'LFA', 'NX', 'RX', 'UX', 'LX', 'CT', 'SC', 'RZ', 'LBX', 'LM'],
  'Li Auto': ['L9', 'L8', 'L7', 'L6', 'MEGA'],
  Lincoln: ['Navigator', 'Continental', 'Aviator', 'Corsair', 'Nautilus', 'Town Car', 'MKZ', 'MKX', 'Mark VIII', 'Blackwood', 'Zephyr'],
  Lotus: [
    'Elise', 'Exige', 'Evora', 'Emira', 'Eletre', 'Emeya', 'Evija', 'Esprit', 'Europa', 'Elan', 'Seven', 'Cortina', 'Carlton', 'Eclat',
    'Excel', '340R', '2-Eleven', '3-Eleven', 'Evora GT430',
  ],
  Lucid: ['Air', 'Air Sapphire', 'Gravity'],
  'Lynk & Co': ['01', '02', '03', '05', '06', '08', '09'],
  Mahindra: ['Thar', 'Scorpio', 'XUV700', 'XUV300', 'XUV500', 'Bolero', 'Roxor', 'KUV100'],
  Maserati: [
    'Ghibli', 'Quattroporte', 'Levante', 'GranTurismo', 'GranCabrio', 'MC20', 'MC20 Cielo', 'Grecale', 'Grecale Folgore', 'MCXtrema',
    '3200 GT', '4200 GT', 'Coupé', 'Spyder', 'Biturbo', 'Merak', 'Bora', 'Khamsin', 'Indy', 'Mistral', 'MC12', 'Shamal', 'Karif', '222',
  ],
  Maybach: ['57', '62', '57 S', '62 S', 'Landaulet', 'Exelero'],
  Mazda: [
    'Mazda2', 'Mazda3', 'Mazda6', 'CX-3', 'CX-30', 'CX-5', 'CX-60', 'CX-80', 'CX-7', 'CX-9', 'MX-5', 'MX-5 RF', 'RX-7', 'RX-8', 'MX-30',
    '323', '626', 'MX-3', 'MX-6', 'Mazda5', 'Mazda3 MPS', 'Mazda6 MPS', '121', '929', 'Cosmo', 'RX-3', 'BT-50', 'Premacy', 'Xedos 6',
  ],
  McLaren: [
    '570S', '600LT', '620R', '650S', '675LT', '720S', '750S', '765LT', '765LT Spider', '570GT', '540C', '12C', 'MP4-12C', 'P1',
    'P1 GTR', 'Senna', 'Senna GTR', 'Speedtail', 'Elva', 'Artura', 'Artura Spider', 'GT', 'GTS', 'Solus GT', 'F1', 'W1',
  ],
  'Mercedes-Benz': [
    'Classe A', 'Classe B', 'Classe C', 'Classe E', 'Classe S', 'Classe G', 'CLA', 'CLS', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'SLK',
    'SL', 'SLS AMG', 'SLR McLaren', 'AMG GT', 'AMG GT R', 'AMG GT Black Series', 'AMG One', 'A 45 AMG', 'C 63 AMG', 'E 63 AMG',
    'S 63 AMG', 'G 63 AMG', 'G 500', 'EQA', 'EQB', 'EQC', 'EQE', 'EQS', 'Vito', 'Sprinter', 'Classe V', 'Citan', '190E',
    '190E 2.5-16 Evo II', '300 SL', '280 SL Pagoda', '500 E', 'W123', 'W124', 'W126', 'Maybach S 680', 'Maybach GLS 600',
  ],
  Mercury: ['Cougar', 'Grand Marquis', 'Marauder', 'Mountaineer', 'Sable', 'Capri'],
  MG: ['MG3', 'MG4', 'MG5', 'ZS', 'HS', 'Cyberster', 'MGB', 'MGB GT', 'TF', 'ZR', 'ZT', 'MGF', 'Midget', 'Metro 6R4', 'MG4 XPower', 'Marvel R'],
  Mini: ['Cooper', 'Cooper S', 'John Cooper Works', 'John Cooper Works GP', 'Countryman', 'Clubman', 'Paceman', 'Cabrio', 'Roadster', 'Coupé', 'Aceman', 'Classic Mini'],
  Mitsubishi: [
    'Lancer', 'Lancer Evolution', 'Colt', 'Colt CZT', 'Space Star', 'ASX', 'Outlander', 'Eclipse Cross', 'Pajero', 'L200', 'Galant',
    'GTO', '3000GT', 'Eclipse', 'FTO', 'Carisma', 'Mirage', 'i-MiEV', 'Shogun', 'Delica', 'Starion', 'Pajero Evolution',
  ],
  Morgan: ['Plus Four', 'Plus Six', '4/4', 'Aero 8', 'Plus 8', '3 Wheeler', 'Super 3', 'Roadster'],
  Nio: ['ET5', 'ET7', 'ET9', 'ES6', 'ES8', 'EC6'],
  Nissan: [
    'Micra', 'Juke', 'Qashqai', 'X-Trail', 'Leaf', 'Note', 'Navara', 'Pulsar', 'Primera', 'Almera', 'GT-R', 'GT-R Nismo', '350Z', '370Z',
    '200SX', '240SX', '300ZX', 'Skyline GT-R', 'Skyline R34', 'Skyline R33', 'Skyline R32', 'Silvia', 'Fairlady Z', 'Z', 'Ariya', 'Patrol',
    'Murano', 'Pathfinder', 'Terrano', 'Cube', 'Sunny', 'Stagea', 'Figaro', 'Pao', 'Pixo', 'Interstar',
  ],
  Noble: ['M12', 'M400', 'M600', 'M15'],
  Oldsmobile: ['442', 'Cutlass', 'Cutlass Supreme', 'Toronado', 'Delta 88'],
  Opel: [
    'Corsa', 'Astra', 'Insignia', 'Mokka', 'Crossland', 'Grandland', 'Zafira', 'Meriva', 'Vectra', 'Tigra', 'Adam', 'Karl', 'Kadett',
    'Kadett GSi', 'Manta', 'Ascona', 'Calibra', 'Speedster', 'GT', 'Omega', 'Rekord', 'Senator', 'Monza', 'Combo', 'Vivaro',
    'Corsa OPC', 'Astra OPC', 'Insignia OPC', 'Corsa GSi', 'Astra GSi',
  ],
  Pagani: ['Zonda', 'Zonda R', 'Zonda F', 'Zonda Cinque', 'Huayra', 'Huayra BC', 'Huayra Roadster', 'Huayra Tricolore', 'Imola', 'Utopia', 'Codalunga'],
  Peugeot: [
    '108', '208', '308', '408', '508', '2008', '3008', '5008', '107', '206', '207', '307', '407', '607', '106', '205', '305', '405',
    '504', '505', '306', '406', 'RCZ', 'RCZ R', '206 CC', '207 CC', '307 CC', '407 Coupé', 'Partner', 'Rifter', 'Expert', 'Boxer',
    'Traveller', '205 GTI', '306 GTI-6', '106 Rallye', '106 GTI', '208 GTi', '308 GTi', 'e-208', 'e-2008', '504 Coupé',
  ],
  Plymouth: ['Barracuda', 'Road Runner', 'Superbird', 'GTX', 'Duster', 'Prowler', 'Fury', 'Voyager'],
  Polestar: ['1', '2', '3', '4', '5', '6'],
  Pontiac: ['Firebird', 'Firebird Trans Am', 'Trans Am', 'GTO', 'Fiero', 'Bonneville', 'Grand Prix', 'Solstice', 'G8', 'Vibe', 'Aztek', 'Grand Am', 'Sunfire', 'Tempest'],
  Porsche: [
    '911', '911 Carrera', '911 Carrera S', '911 Carrera 4S', '911 Turbo', '911 Turbo S', '911 GT3', '911 GT3 RS', '911 GT2 RS',
    '911 Targa', '911 Speedster', '911 Dakar', '911 S/T', '911 R', '718 Cayman', '718 Cayman GT4', '718 Cayman GT4 RS', '718 Boxster',
    '718 Boxster Spyder', '718 Spyder RS', 'Cayman', 'Boxster', 'Macan', 'Macan GTS', 'Macan Turbo', 'Cayenne', 'Cayenne Turbo',
    'Cayenne Turbo GT', 'Panamera', 'Panamera Turbo S', 'Taycan', 'Taycan Turbo S', 'Taycan Turbo GT', '918 Spyder', 'Carrera GT',
    '959', '944', '944 Turbo', '928', '924', '968', '356', '550 Spyder', '914', '930 Turbo', '964', '993', '996', '997', '991', '992',
  ],
  Radical: ['SR3', 'SR8', 'RXC', 'SR10'],
  Ram: ['1500', '1500 TRX', '2500', '3500', 'ProMaster', 'Dakota'],
  Renault: [
    'Clio', 'Clio RS', 'Clio V6', 'Mégane', 'Mégane RS', 'Mégane R26.R', 'Captur', 'Kadjar', 'Arkana', 'Austral', 'Scénic', 'Twingo',
    'Twingo RS', 'Zoe', 'Kangoo', 'Trafic', 'Master', 'Talisman', 'Laguna', 'Espace', 'Fluence', 'Symbioz', 'Rafale', 'Renault 4',
    'Renault 5', 'R5 Turbo', 'Renault 8', 'Renault 12', 'Renault 19', 'Sport Spider', 'Wind', 'Avantime', 'Vel Satis', 'Twizy',
  ],
  Rimac: ['Nevera', 'Concept One'],
  Rivian: ['R1T', 'R1S', 'R2'],
  'Rolls-Royce': ['Ghost', 'Phantom', 'Wraith', 'Dawn', 'Cullinan', 'Spectre', 'Silver Shadow', 'Silver Spirit', 'Silver Cloud', 'Corniche', 'Camargue', 'Black Badge'],
  Rover: ['25', '45', '75', '200', '400', '600', '800', 'Metro', 'SD1', 'P5', 'P6', 'Mini'],
  Ruf: ['CTR', 'CTR3', 'RT 12', 'R Turbo', 'Yellowbird'],
  Saab: ['9-3', '9-3 Aero', '9-5', '900', '900 Turbo', '99', '96', 'Sonett', '9-3X', '9-2X', '9-7X', '9000', '9-5 Aero', 'Viggen'],
  Saleen: ['S7', 'S281', 'S302'],
  Seat: [
    'Ibiza', 'Ibiza Cupra', 'Leon', 'Leon Cupra', 'Leon FR', 'Arona', 'Ateca', 'Tarraco', 'Altea', 'Toledo', 'Córdoba', 'Marbella', 'Mii',
    'Alhambra', 'Exeo', '600', '124', '131', '1430', 'Fura',
  ],
  Shelby: ['Cobra', 'GT350', 'GT500', 'Super Snake', 'Daytona Coupe', 'Series 1'],
  Škoda: [
    'Fabia', 'Octavia', 'Octavia RS', 'Superb', 'Kodiaq', 'Karoq', 'Kamiq', 'Scala', 'Rapid', 'Citigo', 'Enyaq', 'Roomster', 'Yeti',
    'Felicia', 'Favorit', 'Estelle', '110 R', '130 RS', 'Fabia vRS', 'Octavia vRS', 'Elroq',
  ],
  Smart: ['Fortwo', 'Forfour', 'Roadster', '#1', '#3', 'Fortwo Brabus', 'Crossblade'],
  SsangYong: ['Tivoli', 'Korando', 'Rexton', 'Musso', 'Actyon', 'Kyron', 'Torres', 'Rodius'],
  SSC: ['Tuatara', 'Ultimate Aero', 'Aero TT'],
  Spyker: ['C8', 'C8 Laviolette', 'C8 Aileron', 'D12', 'C12 Zagato'],
  Subaru: [
    'Impreza', 'Impreza WRX', 'WRX STI', 'WRX', 'Impreza 22B', 'Forester', 'Outback', 'Legacy', 'XV', 'Crosstrek', 'BRZ', 'Levorg',
    'Justy', 'SVX', 'Solterra', 'Baja', 'Tribeca', 'Brat',
  ],
  Suzuki: [
    'Swift', 'Swift Sport', 'Vitara', 'S-Cross', 'Jimny', 'Ignis', 'Baleno', 'Celerio', 'Alto', 'SX4', 'Splash', 'Wagon R', 'Grand Vitara',
    'Samurai', 'Cappuccino', 'Liana', 'Across', 'Swace', 'e Vitara',
  ],
  Tata: ['Nexon', 'Punch', 'Harrier', 'Safari', 'Tiago', 'Tigor', 'Altroz', 'Sumo', 'Indica', 'Nano'],
  Tesla: ['Model 3', 'Model Y', 'Model S', 'Model X', 'Model S Plaid', 'Roadster', 'Cybertruck', 'Semi', 'Model 3 Performance'],
  Toyota: [
    'Yaris', 'Yaris Cross', 'GR Yaris', 'Corolla', 'GR Corolla', 'Aygo', 'Aygo X', 'C-HR', 'RAV4', 'Auris', 'Avensis', 'Camry', 'Prius',
    'Hilux', 'Land Cruiser', 'Land Cruiser J70', 'Supra', 'GR Supra', 'GR86', 'GT86', '86', 'MR2', 'Celica', 'Celica GT-Four', 'AE86',
    'Starlet', 'Verso', 'bZ4X', 'Mirai', 'Proace', 'Highlander', 'Tundra', 'Tacoma', 'Sera', '2000GT', 'Soarer', 'Previa', 'iQ',
  ],
  Trabant: ['601', '601 Universal', 'P50', '1.1'],
  Triumph: ['TR6', 'TR4', 'TR3', 'TR7', 'TR8', 'TR5', 'Spitfire', 'Stag', 'GT6', 'Herald', 'Dolomite Sprint', 'Vitesse', 'TR250'],
  TVR: ['Griffith', 'Chimaera', 'Cerbera', 'Tuscan', 'Tamora', 'Sagaris', 'Speed 12', 'Vixen', 'Tasmin', '350i'],
  UMM: ['Alter', 'Alter II', 'Alter 4x4', 'Alter 4x4 Turbo'],
  Vauxhall: ['Corsa', 'Astra', 'Insignia', 'Mokka', 'Crossland', 'Grandland', 'Vectra', 'Zafira', 'Viva', 'VXR8', 'Astra VXR', 'Corsa VXR', 'Cavalier', 'Nova', 'Chevette', 'Calibra'],
  Volkswagen: [
    'Golf', 'Golf GTI', 'Golf R', 'Golf R32', 'Polo', 'Polo GTI', 'Passat', 'Tiguan', 'T-Roc', 'T-Cross', 'Up!', 'Up! GTI', 'Arteon',
    'Touareg', 'Touran', 'Sharan', 'Scirocco', 'Scirocco R', 'Beetle', 'Carocha', 'Corrado', 'Lupo', 'Lupo GTI', 'Fox', 'Jetta', 'Bora',
    'Phaeton', 'ID.3', 'ID.4', 'ID.5', 'ID.7', 'ID.Buzz', 'Caddy', 'Transporter', 'Karmann Ghia', 'Eos', 'XL1', 'Amarok', 'Multivan',
  ],
  Volvo: [
    'XC40', 'XC60', 'XC90', 'V40', 'V60', 'V70', 'V90', 'S40', 'S60', 'S80', 'S90', 'C30', 'C70', 'EX30', 'EX90', 'EC40', '240', '740',
    '850', '850 T-5R', 'V70 R', 'P1800', 'Amazon', 'PV544', '242 Turbo', 'S60 Polestar', 'C30 T5',
  ],
  Xpeng: ['P7', 'G6', 'G9', 'P5', 'G3'],
};

// Chave comparável: sem maiúsculas, acentos, espaços nem pontuação ("Série 3" = "serie3" = "serie-3")
const key = (s) => norm(s).replace(/[^a-z0-9]/g, '');

const BY_BRAND = new Map(Object.entries(CAR_MODELS).map(([brand, models]) => [canonicalBrand(brand), models]));

// Modelos sugeridos para a marca e o texto já escrito (máx. `limit`). Com o campo vazio mostra
// os mais conhecidos. O modelo que já está escrito tal e qual não volta a ser sugerido, mas as
// variantes sim: com "M3" escrito aparece "M3 Competition".
export function modelSuggestions(brand, typed, limit) {
  const models = BY_BRAND.get(canonicalBrand(brand));
  if (!models) return [];
  const q = key(typed);
  if (!q) return models.slice(0, limit ?? 6);
  const current = String(typed ?? '').trim();
  const starts = models.filter((m) => key(m).startsWith(q));
  const contains = models.filter((m) => !key(m).startsWith(q) && key(m).includes(q));
  return [...starts, ...contains].filter((m) => m !== current).slice(0, limit ?? 8);
}
