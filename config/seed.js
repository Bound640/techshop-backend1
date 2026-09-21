require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const connectDB = require('./db');

const User     = require('../models/User');
const Category = require('../models/Category');
const Product  = require('../models/Product');

const categoriesSeed = [
  { nom: 'Smartphones',        slug: 'smartphones',     icone: '📱', ordre: 1 },
  { nom: 'Ordinateurs',        slug: 'ordinateurs',     icone: '💻', ordre: 2 },
  { nom: 'Casques Audio',      slug: 'casques',         icone: '🎧', ordre: 3 },
  { nom: 'Montres Connectées', slug: 'montres',         icone: '⌚', ordre: 4 },
  { nom: 'Appareils Photo',    slug: 'appareils-photo', icone: '📷', ordre: 5 },
  { nom: 'Accessoires',        slug: 'accessoires',     icone: '🔌', ordre: 6 },
  { nom: 'Enceintes & Audio',  slug: 'enceintes',       icone: '🔊', ordre: 7 },
  { nom: 'Gaming',             slug: 'gaming',          icone: '🎮', ordre: 8 },
  { nom: 'Tablettes',          slug: 'tablettes',       icone: '📲', ordre: 9 },
  { nom: 'Maison Connectée',   slug: 'maison-connectee',icone: '🏠', ordre: 10 },
];

const seed = async () => {
  try {
    await connectDB();
    console.log('🌱 Démarrage du seed...');

    // Nettoyage
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
    ]);
    console.log('🗑️  Collections nettoyées');

    // ---- Admin & Client de test ----------------------------
    const motDePasse = await bcrypt.hash('Admin@2025', 12);
    await User.create([
  {
    nom: 'NDAO', prenom: 'Boundia',
    email: 'admin@techshop.sn',
    motDePasse: 'Admin@2025',
    role: 'admin',
  },
  {
    nom: 'DIABY', prenom: 'Fatoumata',
    email: 'client@techshop.sn',
    motDePasse: 'Client@2025',
    role: 'client',
  },
    ]);
    console.log('👤 Utilisateurs créés');

    // ---- Catégories ----------------------------------------
    const cats = await Category.insertMany(categoriesSeed);
    const catMap = Object.fromEntries(cats.map(c => [c.slug, c._id]));
    console.log('📂 Catégories créées');

    // ---- Produits ------------------------------------------
    const produitsSeed = [
      {
        nom: 'iPhone 15 Pro', prix: 785000, stock: 15, badge: 'Nouveau',
        description: 'Le dernier iPhone avec puce A17 Pro, système de caméra pro avec zoom optique 5x, titane de qualité aérospatiale et écran Super Retina XDR 6,1".',
        categorie: catMap['smartphones'], vedette: true,
        note: 4.8, nombreAvis: 324,
        images: [{ url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80', principale: true }],
        
        specifications: new Map([['Processeur','Apple A17 Pro'],['Écran','6,1" Super Retina XDR'],['Stockage','256 Go'],['Batterie','3274 mAh'],['OS','iOS 17']]),
      },
      {
        nom: 'Samsung Galaxy S24 Ultra', prix: 885000, stock: 8, badge: 'Best-seller',
        description: 'Smartphone haut de gamme avec stylet S Pen intégré, écran Dynamic AMOLED 6,8" et quadruple caméra 200 MP.',
        categorie: catMap['smartphones'], vedette: false,
        note: 4.7, nombreAvis: 218,
        images: [{ url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80', principale: true }],
        specifications: new Map([['Processeur','Snapdragon 8 Gen 3'],['Écran','6,8" Dynamic AMOLED'],['Stockage','512 Go']]),
      },
      {
        nom: 'MacBook Pro 14" M3', prix: 1310000, stock: 5, badge: 'Top rated',
        description: 'MacBook Pro avec puce M3, écran Liquid Retina XDR 14,2" et jusqu\'à 18h d\'autonomie.',
        categorie: catMap['ordinateurs'], vedette: true,
        note: 4.9, nombreAvis: 156,
        images: [{ url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80', principale: true }],
        specifications: new Map([['Processeur','Apple M3'],['RAM','18 Go'],['Stockage','512 Go SSD']]),
      },
      {
        nom: 'Dell XPS 15', prix: 1050000, stock: 12, badge: null,
        description: 'Laptop premium avec écran OLED 4K 15,6", Intel Core i7 et NVIDIA RTX 4060.',
        categorie: catMap['ordinateurs'], vedette: false,
        note: 4.6, nombreAvis: 89,
        images: [{ url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500&q=80', principale: true }],
        specifications: new Map([['Processeur','Intel Core i7-13700H'],['RAM','32 Go DDR5'],['GPU','NVIDIA RTX 4060']]),
      },
      {
        nom: 'Sony WH-1000XM5', prix: 230000, stock: 20, badge: 'Best-seller',
        description: 'Casque over-ear avec la meilleure réduction de bruit du marché et 30h d\'autonomie.',
        categorie: catMap['casques'], vedette: true,
        note: 4.8, nombreAvis: 542,
        images: [{ url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80', principale: true }],
        specifications: new Map([['Type','Over-ear sans fil'],['Autonomie','30 heures'],['Bluetooth','5.2']]),
      },
      {
        nom: 'Apple Watch Series 9', prix: 282000, stock: 18, badge: 'Nouveau',
        description: 'Apple Watch Series 9 avec puce S9, écran Always-On 2000 nits et suivi santé complet.',
        categorie: catMap['montres'], vedette: true,
        note: 4.7, nombreAvis: 287,
        images: [{ url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80', principale: true }],
        specifications: new Map([['Processeur','Apple S9'],['Autonomie','18 heures'],['Étanchéité','50 mètres']]),
      },
      {
        nom: 'Sony Alpha 7 IV', prix: 1835000, stock: 3, badge: 'Pro',
        description: 'Appareil photo hybride plein format 33 MP, autofocus temps réel et vidéo 4K 60fps.',
        categorie: catMap['appareils-photo'], vedette: false,
        note: 4.9, nombreAvis: 64,
        images: [{ url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80', principale: true }],
        specifications: new Map([['Capteur','Plein format 33 MP'],['Vidéo','4K 60fps'],['Stabilisation','5 axes IBIS']]),
      },
      {
        nom: 'AirPods Pro 2e génération', prix: 184000, stock: 25, badge: null,
        description: 'Écouteurs true wireless avec puce H2, réduction de bruit active 2x plus puissante.',
        categorie: catMap['casques'], vedette: false,
        note: 4.6, nombreAvis: 413,
        images: [{ url: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500&q=80', principale: true }],
        
        specifications: new Map([['Type','In-ear True Wireless'],['Autonomie','6h + 24h (boîtier)'],['Résistance','IPX4']]),
      },

      // ---- Accessoires -------------------------------------
      {
        nom: 'Chargeur Solaire Blindé Vert 30000mAh', prix: 45000, stock: 40, badge: 'Nouveau',
        description: 'Chargeur portable ultra-résistant (coque blindée verte anti-choc et étanche IP65), 30000mAh, charge solaire d\'appoint et double sortie USB rapide. Idéal randonnée, chantier et voyage.',
        categorie: catMap['accessoires'], vedette: true,
        note: 4.7, nombreAvis: 96,
        images: [{ url: 'https://loremflickr.com/500/500/solar,powerbank,green', principale: true }],
        specifications: new Map([['Capacité','30000 mAh'],['Couleur','Vert blindé'],['Étanchéité','IP65'],['Charge','Solaire + USB-C 22.5W'],['Sorties','2x USB-A + 1x USB-C']]),
      },
      {
        nom: 'Chargeur Rapide USB-C 65W', prix: 18000, stock: 60, badge: 'Best-seller',
        description: 'Chargeur secteur GaN compact 65W, charge simultanée de 3 appareils (laptop, tablette, smartphone).',
        categorie: catMap['accessoires'], vedette: false,
        note: 4.6, nombreAvis: 210,
        images: [{ url: 'https://loremflickr.com/500/500/usbc,charger', principale: true }],
        specifications: new Map([['Puissance','65W'],['Ports','2x USB-C + 1x USB-A'],['Technologie','GaN']]),
      },
      {
        nom: 'Câble USB-C vers USB-C Tressé 2m', prix: 6500, stock: 100, badge: null,
        description: 'Câble renforcé en nylon tressé, charge rapide 100W et transfert de données haute vitesse.',
        categorie: catMap['accessoires'], vedette: false,
        note: 4.5, nombreAvis: 178,
        images: [{ url: 'https://loremflickr.com/500/500/usb,cable', principale: true }],
        specifications: new Map([['Longueur','2 mètres'],['Puissance max','100W'],['Matériau','Nylon tressé']]),
      },
      {
        nom: 'Powerbank MagSafe 10000mAh', prix: 32000, stock: 30, badge: 'Nouveau',
        description: 'Batterie externe magnétique sans fil, compatible MagSafe, se fixe directement au dos du téléphone.',
        categorie: catMap['accessoires'], vedette: true,
        note: 4.4, nombreAvis: 87,
        images: [{ url: 'https://loremflickr.com/500/500/wireless,powerbank', principale: true }],
        specifications: new Map([['Capacité','10000 mAh'],['Charge','Sans fil 15W MagSafe'],['Compatibilité','iPhone 12 et plus récent']]),
      },
      {
        nom: 'Coque de Protection Renforcée', prix: 9500, stock: 80, badge: null,
        description: 'Coque antichoc certifiée militaire, protection à 360° avec coins renforcés en silicone.',
        categorie: catMap['accessoires'], vedette: false,
        note: 4.3, nombreAvis: 145,
        images: [{ url: 'https://loremflickr.com/500/500/phonecase', principale: true }],
        specifications: new Map([['Protection','Certifiée MIL-STD-810G'],['Matériau','TPU + Polycarbonate']]),
      },

      // ---- Enceintes & Audio ---------------------------------
      {
        nom: 'JBL Charge 5 Bluetooth', prix: 98000, stock: 22, badge: 'Best-seller',
        description: 'Enceinte portable étanche IP67 avec son puissant JBL Pro, 20h d\'autonomie et powerbank intégré.',
        categorie: catMap['enceintes'], vedette: true,
        note: 4.8, nombreAvis: 356,
        images: [{ url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80', principale: true }],
        specifications: new Map([['Étanchéité','IP67'],['Autonomie','20 heures'],['Bluetooth','5.1'],['Fonction','Powerbank intégré']]),
      },
      {
        nom: 'Sonos One SL', prix: 145000, stock: 12, badge: null,
        description: 'Enceinte connectée compacte avec son riche à 360°, idéale pour le multiroom audio.',
        categorie: catMap['enceintes'], vedette: false,
        note: 4.7, nombreAvis: 92,
        images: [{ url: 'https://loremflickr.com/500/500/smartspeaker', principale: true }],
        specifications: new Map([['Type','Enceinte connectée WiFi'],['Multiroom','Oui'],['Assistant vocal','Compatible']]),
      },
      {
        nom: 'Barre de Son Samsung Q-Series', prix: 220000, stock: 8, badge: 'Pro',
        description: 'Barre de son 3.1.2 canaux avec caisson de basses sans fil, Dolby Atmos et DTS:X.',
        categorie: catMap['enceintes'], vedette: false,
        note: 4.6, nombreAvis: 64,
        images: [{ url: 'https://loremflickr.com/500/500/soundbar', principale: true }],
        specifications: new Map([['Canaux','3.1.2'],['Audio','Dolby Atmos, DTS:X'],['Connectique','HDMI eARC, Bluetooth']]),
      },

      // ---- Gaming ---------------------------------------------
      {
        nom: 'Manette PS5 DualSense', prix: 62000, stock: 35, badge: 'Best-seller',
        description: 'Manette sans fil avec retour haptique, gâchettes adaptatives et micro intégré.',
        categorie: catMap['gaming'], vedette: true,
        note: 4.8, nombreAvis: 289,
        images: [{ url: 'https://images.unsplash.com/photo-1606318313647-e9cfec6ab5a4?w=500&q=80', principale: true }],
        specifications: new Map([['Compatibilité','PS5, PC'],['Connectique','Bluetooth + USB-C'],['Autonomie','~12h']]),
      },
      {
        nom: 'Clavier Mécanique RGB Gaming', prix: 55000, stock: 25, badge: 'Nouveau',
        description: 'Clavier mécanique switches rouges, rétroéclairage RGB personnalisable, châssis aluminium.',
        categorie: catMap['gaming'], vedette: false,
        note: 4.5, nombreAvis: 134,
        images: [{ url: 'https://loremflickr.com/500/500/mechanicalkeyboard,rgb', principale: true }],
        specifications: new Map([['Switches','Mécaniques Rouge'],['Rétroéclairage','RGB'],['Connectique','USB-C filaire']]),
      },
      {
        nom: 'Souris Gaming Sans Fil 26000 DPI', prix: 38000, stock: 40, badge: null,
        description: 'Souris gaming ultra-légère (58g), capteur optique 26000 DPI, autonomie 70h.',
        categorie: catMap['gaming'], vedette: false,
        note: 4.6, nombreAvis: 176,
        images: [{ url: 'https://loremflickr.com/500/500/gamingmouse', principale: true }],
        specifications: new Map([['DPI','26000'],['Poids','58g'],['Autonomie','70 heures']]),
      },
      {
        nom: 'Casque Gaming Surround 7.1', prix: 42000, stock: 28, badge: 'Best-seller',
        description: 'Casque gaming avec son surround 7.1, micro antibruit détachable et coussinets mémoire de forme.',
        categorie: catMap['gaming'], vedette: true,
        note: 4.5, nombreAvis: 201,
        images: [{ url: 'https://loremflickr.com/500/500/gamingheadset', principale: true }],
        specifications: new Map([['Son','Surround 7.1'],['Micro','Antibruit détachable'],['Connectique','USB / Jack 3.5mm']]),
      },
      {
        nom: 'Nintendo Switch OLED', prix: 285000, stock: 10, badge: 'Top rated',
        description: 'Console hybride avec écran OLED 7 pouces, 64 Go de stockage et dock TV inclus.',
        categorie: catMap['gaming'], vedette: true,
        note: 4.9, nombreAvis: 412,
        images: [{ url: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=500&q=80', principale: true }],
        specifications: new Map([['Écran','7\" OLED'],['Stockage','64 Go'],['Mode','Portable + TV']]),
      },

      // ---- Tablettes --------------------------------------------
      {
        nom: 'iPad Air 11" (M2)', prix: 495000, stock: 14, badge: 'Nouveau',
        description: 'Tablette iPad Air avec puce M2, écran Liquid Retina 11", compatible Apple Pencil Pro.',
        categorie: catMap['tablettes'], vedette: true,
        note: 4.8, nombreAvis: 178,
        images: [{ url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80', principale: true }],
        specifications: new Map([['Processeur','Apple M2'],['Écran','11" Liquid Retina'],['Stockage','128 Go']]),
      },
      {
        nom: 'Samsung Galaxy Tab S9', prix: 460000, stock: 9, badge: 'Pro',
        description: 'Tablette Android premium avec écran Dynamic AMOLED 2X 11", S Pen inclus, certifiée IP68.',
        categorie: catMap['tablettes'], vedette: false,
        note: 4.6, nombreAvis: 98,
        images: [{ url: 'https://loremflickr.com/500/500/androidtablet', principale: true }],
        specifications: new Map([['Écran','11" Dynamic AMOLED 2X'],['Stylet','S Pen inclus'],['Étanchéité','IP68']]),
      },

      // ---- Maison connectée --------------------------------------
      {
        nom: 'Ampoule Connectée RGB (lot de 4)', prix: 22000, stock: 50, badge: null,
        description: 'Ampoules LED intelligentes contrôlables via application, 16 millions de couleurs, compatible assistants vocaux.',
        categorie: catMap['maison-connectee'], vedette: false,
        note: 4.4, nombreAvis: 156,
        images: [{ url: 'https://loremflickr.com/500/500/smartbulb,rgb', principale: true }],
        specifications: new Map([['Quantité','4 ampoules'],['Couleurs','16 millions'],['Contrôle','App + vocal']]),
      },
      {
        nom: 'Caméra de Surveillance WiFi 360°', prix: 35000, stock: 30, badge: 'Best-seller',
        description: 'Caméra intelligente rotation 360°, vision nocturne, détection de mouvement et audio bidirectionnel.',
        categorie: catMap['maison-connectee'], vedette: true,
        note: 4.5, nombreAvis: 223,
        images: [{ url: 'https://loremflickr.com/500/500/securitycamera,home', principale: true }],
        specifications: new Map([['Résolution','1080p Full HD'],['Vision nocturne','Oui'],['Rotation','360°']]),
      },
      {
        nom: 'Prise Connectée WiFi (lot de 2)', prix: 14000, stock: 60, badge: null,
        description: 'Prises intelligentes pilotables à distance, programmation horaire et suivi de consommation.',
        categorie: catMap['maison-connectee'], vedette: false,
        note: 4.3, nombreAvis: 112,
        images: [{ url: 'https://loremflickr.com/500/500/smartplug', principale: true }],
        specifications: new Map([['Quantité','2 prises'],['Puissance max','16A'],['Contrôle','App WiFi']]),
      },
      {
        nom: 'Robot Aspirateur Intelligent', prix: 175000, stock: 15, badge: 'Nouveau',
        description: 'Robot aspirateur avec cartographie laser, aspiration 4000Pa et vidange automatique.',
        categorie: catMap['maison-connectee'], vedette: true,
        note: 4.6, nombreAvis: 189,
        images: [{ url: 'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?w=500&q=80', principale: true }],
        specifications: new Map([['Aspiration','4000 Pa'],['Navigation','Cartographie laser'],['Autonomie','150 minutes']]),
      },

      // ---- Smartphones supplémentaires --------------------------
      {
        nom: 'Google Pixel 8 Pro', prix: 620000, stock: 11, badge: 'Nouveau',
        description: 'Smartphone Google avec IA Gemini intégrée, appareil photo 50MP et écran LTPO 6,7".',
        categorie: catMap['smartphones'], vedette: false,
        note: 4.6, nombreAvis: 143,
        images: [{ url: 'https://loremflickr.com/500/500/googlepixel,smartphone', principale: true }],
        specifications: new Map([['Processeur','Google Tensor G3'],['Écran','6,7" LTPO OLED'],['Stockage','256 Go']]),
      },
      {
        nom: 'Xiaomi 14 Ultra', prix: 545000, stock: 13, badge: 'Best-seller',
        description: 'Smartphone photo avec optique Leica, quadruple capteur 50MP et charge rapide 90W.',
        categorie: catMap['smartphones'], vedette: false,
        note: 4.5, nombreAvis: 97,
        images: [{ url: 'https://loremflickr.com/500/500/xiaomi,smartphone', principale: true }],
        specifications: new Map([['Caméra','Leica Quad 50MP'],['Charge','90W filaire'],['Écran','6,73" AMOLED']]),
      },

      // ---- Ordinateurs supplémentaires ----------------------------
      {
        nom: 'HP Spectre x360 14', prix: 980000, stock: 7, badge: null,
        description: 'Laptop convertible premium, écran tactile OLED 3K2K, châssis aluminium ciselé.',
        categorie: catMap['ordinateurs'], vedette: false,
        note: 4.5, nombreAvis: 61,
        images: [{ url: 'https://loremflickr.com/500/500/laptop,ultrabook', principale: true }],
        specifications: new Map([['Écran','14" OLED tactile'],['Processeur','Intel Core Ultra 7'],['Format','Convertible 360°']]),
      },
      {
        nom: 'Lenovo Legion Pro 7 (Gaming)', prix: 1450000, stock: 5, badge: 'Pro',
        description: 'PC portable gaming avec RTX 4070, écran 240Hz et refroidissement avancé.',
        categorie: catMap['ordinateurs'], vedette: true,
        note: 4.7, nombreAvis: 78,
        images: [{ url: 'https://loremflickr.com/500/500/gaminglaptop', principale: true }],
        specifications: new Map([['GPU','NVIDIA RTX 4070'],['Écran','16" 240Hz'],['RAM','32 Go']]),
      },

      // ---- Casques supplémentaires --------------------------------
      {
        nom: 'Bose QuietComfort Ultra', prix: 265000, stock: 16, badge: 'Top rated',
        description: 'Casque premium avec réduction de bruit immersive et son spatial personnalisé.',
        categorie: catMap['casques'], vedette: false,
        note: 4.8, nombreAvis: 203,
        images: [{ url: 'https://loremflickr.com/500/500/headphones,premium', principale: true }],
        specifications: new Map([['Réduction de bruit','Immersive active'],['Autonomie','24 heures'],['Son','Spatial']]),
      },

      // ---- Appareils photo supplémentaires -------------------------
      {
        nom: 'GoPro HERO12 Black', prix: 385000, stock: 18, badge: 'Nouveau',
        description: 'Caméra d\'action étanche 5.3K, stabilisation HyperSmooth 6.0 et autonomie améliorée.',
        categorie: catMap['appareils-photo'], vedette: true,
        note: 4.7, nombreAvis: 167,
        images: [{ url: 'https://loremflickr.com/500/500/actioncamera,gopro', principale: true }],
        specifications: new Map([['Vidéo','5.3K60'],['Étanchéité','10m sans caisson'],['Stabilisation','HyperSmooth 6.0']]),
      },
      {
        nom: 'DJI Mini 4 Pro (Drone)', prix: 720000, stock: 6, badge: 'Pro',
        description: 'Drone compact sous 249g avec caméra 4K/60fps, détection d\'obstacles omnidirectionnelle.',
        categorie: catMap['appareils-photo'], vedette: true,
        note: 4.8, nombreAvis: 84,
        images: [{ url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500&q=80', principale: true }],
        specifications: new Map([['Poids','<249g'],['Vidéo','4K/60fps'],['Autonomie de vol','34 minutes']]),
      },
    ];

    await Product.insertMany(produitsSeed);
    console.log('📦 Produits créés');

    console.log('\n✅ Seed terminé avec succès !');
    console.log('🔑 Admin    : admin@techshop.sn   / Admin@2025');
    console.log('👤 Client   : client@techshop.sn  / Client@2025');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur seed :', err.message);
    process.exit(1);
  }
};

seed();
