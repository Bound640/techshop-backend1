require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const connectDB = require('./db');

const User     = require('../models/User');
const Category = require('../models/Category');
const Product  = require('../models/Product');

const categoriesSeed = [
  { nom: "Audio", slug: 'audio', icone: '🎧', ordre: 1 },
  { nom: "Charge & Alimentation", slug: 'charge-alimentation', icone: '🔌', ordre: 2 },
  { nom: "Téléphones", slug: 'telephones', icone: '📱', ordre: 3 },
  { nom: "Ordinateurs", slug: 'ordinateurs', icone: '💻', ordre: 4 },
  { nom: "Accessoires PC", slug: 'accessoires-pc', icone: '🖥️', ordre: 5 },
  { nom: "Connectés", slug: 'connectes', icone: '⌚', ordre: 6 },
  { nom: "Gaming", slug: 'gaming', icone: '🎮', ordre: 7 },
  { nom: "Photo & Vidéo", slug: 'photo-video', icone: '📷', ordre: 8 },
  { nom: "Stockage", slug: 'stockage', icone: '💾', ordre: 9 },
  { nom: "Protection", slug: 'protection', icone: '🛡️', ordre: 10 },
];

const seed = async () => {
  try {
    connectDB();

    // Attendre que la connexion MongoDB soit réellement établie
    // (connectDB() ne bloque plus et réessaie indéfiniment en arrière-plan
    // depuis la version résiliente du serveur — on patiente ici explicitement)
    console.log('🌱 Démarrage du seed...');
    console.log('⏳ Connexion à MongoDB en cours...');
    const mongoose2 = require('mongoose');
    const attenteMax = 30000; // 30 secondes max
    const debut = Date.now();
    while (mongoose2.connection.readyState !== 1) {
      if (Date.now() - debut > attenteMax) {
        throw new Error('Impossible de se connecter à MongoDB après 30 secondes. Vérifie MONGO_URI et la liste d\'accès IP sur Atlas.');
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    console.log('✅ Connecté à MongoDB, poursuite du seed...');

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
        nom: "Écouteurs Bluetooth Pro JBL", prix: 15000, stock: 15, badge: "Best-seller",
        marque: "JBL",
        description: "Écouteurs sans fil avec son profond JBL Pure Bass, réduction de bruit active et boîtier de charge rapide.",
        categorie: catMap["audio"], vedette: true,
        note: 4.5, nombreAvis: 128,
        images: [{ url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80", principale: true }, { url: "https://loremflickr.com/500/500/earbuds,case", principale: false }, { url: "https://loremflickr.com/500/500/earbuds,box", principale: false }],
        specifications: new Map([["Autonomie","24 heures (avec boîtier)"], ["Bluetooth","5.3"], ["Type","Intra-auriculaire sans fil"], ["Couleur","Noir"]]),
      },
      {
        nom: "Casque Sony WH-1000XM5", prix: 195000, stock: 10, badge: "Top rated",
        marque: "Sony",
        description: "Casque circum-aural avec la meilleure réduction de bruit du marché, son Hi-Res et 30h d'autonomie.",
        categorie: catMap["audio"], vedette: true,
        note: 4.9, nombreAvis: 267,
        images: [{ url: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80", principale: true }],
        specifications: new Map([["Autonomie","30 heures"], ["Réduction de bruit","Adaptative premium"], ["Bluetooth","5.2"], ["Poids","250g"]]),
      },
      {
        nom: "Enceinte Bluetooth JBL Flip 6", prix: 62000, stock: 20, badge: null,
        marque: "JBL",
        description: "Enceinte portable étanche IP67, son puissant à 360°, 12h d'autonomie.",
        categorie: catMap["audio"], vedette: false,
        note: 4.6, nombreAvis: 189,
        images: [{ url: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80", principale: true }],
        specifications: new Map([["Étanchéité","IP67"], ["Autonomie","12 heures"], ["Bluetooth","5.1"], ["Poids","550g"]]),
      },
      {
        nom: "Écouteurs Filaires Xiaomi", prix: 5000, stock: 40, badge: null,
        marque: "Xiaomi",
        description: "Écouteurs filaires avec jack 3.5mm, son clair et micro intégré pour appels.",
        categorie: catMap["audio"], vedette: false,
        note: 4.1, nombreAvis: 76,
        images: [{ url: "https://loremflickr.com/500/500/wired,earphones", principale: true }],
        specifications: new Map([["Connectique","Jack 3.5mm"], ["Micro","Intégré"], ["Longueur câble","1.2m"]]),
      },
      {
        nom: "Casque Gamer HyperX Cloud II", prix: 45000, stock: 12, badge: "Best-seller",
        marque: "HyperX",
        description: "Casque gaming avec son surround 7.1 virtuel, micro amovible antibruit et coussinets en mousse à mémoire de forme.",
        categorie: catMap["audio"], vedette: false,
        note: 4.7, nombreAvis: 154,
        images: [{ url: "https://loremflickr.com/500/500/gaming,headset,red", principale: true }],
        specifications: new Map([["Son","Surround 7.1"], ["Micro","Amovible"], ["Connectique","USB / Jack 3.5mm"]]),
      },
      {
        nom: "Chargeur Solaire Blindé Vert 30000mAh", prix: 45000, stock: 40, badge: "Nouveau",
        marque: "TechShop",
        description: "Chargeur portable ultra-résistant (coque blindée verte anti-choc et étanche IP65), 30000mAh, charge solaire d'appoint et double sortie USB rapide. Idéal randonnée, chantier et voyage.",
        categorie: catMap["charge-alimentation"], vedette: true,
        note: 4.7, nombreAvis: 96,
        images: [{ url: "https://loremflickr.com/500/500/solar,powerbank,green", principale: true }, { url: "https://loremflickr.com/500/500/rugged,charger,outdoor", principale: false }],
        specifications: new Map([["Capacité","30000 mAh"], ["Couleur","Vert blindé"], ["Étanchéité","IP65"], ["Charge","Solaire + USB-C 22.5W"], ["Sorties","2x USB-A + 1x USB-C"]]),
      },
      {
        nom: "Chargeur Rapide USB-C 65W", prix: 18000, stock: 60, badge: "Best-seller",
        marque: "Anker",
        description: "Chargeur secteur GaN compact 65W, charge simultanée de 3 appareils (laptop, tablette, smartphone).",
        categorie: catMap["charge-alimentation"], vedette: false,
        note: 4.6, nombreAvis: 210,
        images: [{ url: "https://loremflickr.com/500/500/usbc,charger", principale: true }],
        specifications: new Map([["Puissance","65W"], ["Ports","2x USB-C + 1x USB-A"], ["Technologie","GaN"]]),
      },
      {
        nom: "Câble USB-C vers USB-C Tressé 2m", prix: 6500, stock: 100, badge: null,
        marque: "Anker",
        description: "Câble renforcé en nylon tressé, charge rapide 100W et transfert de données haute vitesse.",
        categorie: catMap["charge-alimentation"], vedette: false,
        note: 4.5, nombreAvis: 178,
        images: [{ url: "https://loremflickr.com/500/500/usb,cable", principale: true }],
        specifications: new Map([["Longueur","2 mètres"], ["Puissance max","100W"], ["Matériau","Nylon tressé"]]),
      },
      {
        nom: "Câble Lightning MFi 1m", prix: 7000, stock: 70, badge: null,
        marque: "Apple",
        description: "Câble Lightning certifié Apple (MFi), charge rapide et synchronisation fiable.",
        categorie: catMap["charge-alimentation"], vedette: false,
        note: 4.4, nombreAvis: 92,
        images: [{ url: "https://loremflickr.com/500/500/lightning,cable", principale: true }],
        specifications: new Map([["Longueur","1 mètre"], ["Certification","MFi"], ["Compatibilité","iPhone / iPad"]]),
      },
      {
        nom: "Powerbank MagSafe 10000mAh", prix: 32000, stock: 0, badge: "Nouveau",
        marque: "Anker",
        description: "Batterie externe magnétique sans fil, compatible MagSafe, se fixe directement au dos du téléphone.",
        categorie: catMap["charge-alimentation"], vedette: false,
        note: 4.4, nombreAvis: 87,
        images: [{ url: "https://loremflickr.com/500/500/wireless,powerbank", principale: true }],
        specifications: new Map([["Capacité","10000 mAh"], ["Charge","Sans fil 15W MagSafe"], ["Compatibilité","iPhone 12 et plus récent"]]),
      },
      {
        nom: "iPhone 15 Pro", prix: 785000, stock: 15, badge: "Nouveau",
        prixPromo: 749000,
        marque: "Apple",
        description: "Le dernier iPhone avec puce A17 Pro, système de caméra pro avec zoom optique 5x, titane de qualité aérospatiale et écran Super Retina XDR 6,1\".",
        categorie: catMap["telephones"], vedette: true,
        note: 4.8, nombreAvis: 324,
        images: [{ url: "https://images.unsplash.com/photo-1592286927505-1def25115481?w=500&q=80", principale: true }, { url: "https://loremflickr.com/500/500/iphone,back", principale: false }, { url: "https://loremflickr.com/500/500/iphone,box", principale: false }],
        specifications: new Map([["Écran","6,1\" Super Retina XDR"], ["Processeur","A17 Pro"], ["Stockage","256 Go"], ["Caméra","48MP + téléobjectif 5x"], ["Couleur","Titane naturel"]]),
      },
      {
        nom: "Samsung Galaxy S24 Ultra", prix: 720000, stock: 12, badge: "Best-seller",
        marque: "Samsung",
        description: "Smartphone premium avec S Pen intégré, zoom 100x Space Zoom, écran Dynamic AMOLED 2X et IA Galaxy intégrée.",
        categorie: catMap["telephones"], vedette: true,
        note: 4.7, nombreAvis: 256,
        images: [{ url: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80", principale: true }],
        specifications: new Map([["Écran","6,8\" Dynamic AMOLED 2X"], ["Processeur","Snapdragon 8 Gen 3"], ["Stockage","256 Go"], ["Caméra","200MP"], ["S Pen","Intégré"]]),
      },
      {
        nom: "Xiaomi Redmi Note 13 Pro", prix: 165000, stock: 25, badge: "Best-seller",
        marque: "Xiaomi",
        description: "Excellent rapport qualité-prix avec écran AMOLED 120Hz, caméra 200MP et charge rapide 67W.",
        categorie: catMap["telephones"], vedette: false,
        note: 4.5, nombreAvis: 189,
        images: [{ url: "https://loremflickr.com/500/500/xiaomi,redmi,smartphone", principale: true }],
        specifications: new Map([["Écran","6,67\" AMOLED 120Hz"], ["Stockage","256 Go"], ["Caméra","200MP"], ["Charge","67W filaire"]]),
      },
      {
        nom: "Tecno Camon 20", prix: 95000, stock: 30, badge: null,
        marque: "Tecno",
        description: "Smartphone accessible avec grand écran AMOLED incurvé, caméra 64MP et design élégant.",
        categorie: catMap["telephones"], vedette: false,
        note: 4.2, nombreAvis: 84,
        images: [{ url: "https://loremflickr.com/500/500/android,smartphone,black", principale: true }],
        specifications: new Map([["Écran","6,67\" AMOLED incurvé"], ["Stockage","128 Go"], ["Caméra","64MP"]]),
      },
      {
        nom: "Google Pixel 8 Pro", prix: 620000, stock: 11, badge: "Nouveau",
        marque: "Google",
        description: "Smartphone Google avec IA Gemini intégrée, appareil photo 50MP et écran LTPO 6,7\".",
        categorie: catMap["telephones"], vedette: false,
        note: 4.6, nombreAvis: 143,
        images: [{ url: "https://loremflickr.com/500/500/googlepixel,smartphone", principale: true }],
        specifications: new Map([["Processeur","Google Tensor G3"], ["Écran","6,7\" LTPO OLED"], ["Stockage","256 Go"]]),
      },
      {
        nom: "MacBook Air M3 13\"", prix: 950000, stock: 8, badge: "Top rated",
        marque: "Apple",
        description: "Ordinateur portable ultra-fin avec puce M3, jusqu'à 18h d'autonomie et écran Liquid Retina.",
        categorie: catMap["ordinateurs"], vedette: true,
        note: 4.9, nombreAvis: 201,
        images: [{ url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80", principale: true }],
        specifications: new Map([["Processeur","Apple M3"], ["RAM","8 Go"], ["Stockage","256 Go SSD"], ["Autonomie","18 heures"], ["Écran","13,6\" Liquid Retina"]]),
      },
      {
        nom: "HP Spectre x360 14", prix: 980000, stock: 7, badge: null,
        marque: "HP",
        description: "Laptop convertible premium, écran tactile OLED 3K2K, châssis aluminium ciselé.",
        categorie: catMap["ordinateurs"], vedette: false,
        note: 4.5, nombreAvis: 61,
        images: [{ url: "https://loremflickr.com/500/500/laptop,ultrabook", principale: true }],
        specifications: new Map([["Écran","14\" OLED tactile"], ["Processeur","Intel Core Ultra 7"], ["Format","Convertible 360°"]]),
      },
      {
        nom: "Lenovo Legion Pro 7 (Gaming)", prix: 1450000, stock: 5, badge: "Pro",
        marque: "Lenovo",
        description: "PC portable gaming avec RTX 4070, écran 240Hz et refroidissement avancé.",
        categorie: catMap["ordinateurs"], vedette: true,
        note: 4.7, nombreAvis: 78,
        images: [{ url: "https://loremflickr.com/500/500/gaminglaptop", principale: true }],
        specifications: new Map([["GPU","NVIDIA RTX 4070"], ["Écran","16\" 240Hz"], ["RAM","32 Go"]]),
      },
      {
        nom: "Dell XPS 13", prix: 890000, stock: 9, badge: null,
        marque: "Dell",
        description: "Ultrabook compact et élégant avec écran InfinityEdge et performances solides pour le quotidien.",
        categorie: catMap["ordinateurs"], vedette: false,
        note: 4.6, nombreAvis: 112,
        images: [{ url: "https://loremflickr.com/500/500/dell,laptop", principale: true }],
        specifications: new Map([["Écran","13,4\" InfinityEdge"], ["Processeur","Intel Core i7"], ["RAM","16 Go"]]),
      },
      {
        nom: "PC de Bureau TechShop Pro", prix: 650000, stock: 6, badge: null,
        marque: "TechShop",
        description: "Ordinateur de bureau assemblé pour le travail et la bureautique intensive, silencieux et performant.",
        categorie: catMap["ordinateurs"], vedette: false,
        note: 4.3, nombreAvis: 34,
        images: [{ url: "https://loremflickr.com/500/500/desktop,computer,tower", principale: true }],
        specifications: new Map([["Processeur","Intel Core i5"], ["RAM","16 Go"], ["Stockage","512 Go SSD"]]),
      },
      {
        nom: "Clavier Mécanique RGB", prix: 55000, stock: 25, badge: "Nouveau",
        marque: "Logitech",
        description: "Clavier mécanique switches rouges, rétroéclairage RGB personnalisable, châssis aluminium.",
        categorie: catMap["accessoires-pc"], vedette: false,
        note: 4.5, nombreAvis: 134,
        images: [{ url: "https://loremflickr.com/500/500/mechanicalkeyboard,rgb", principale: true }],
        specifications: new Map([["Switches","Mécaniques Rouge"], ["Rétroéclairage","RGB"], ["Connectique","USB-C filaire"]]),
      },
      {
        nom: "Souris Sans Fil Ergonomique", prix: 22000, stock: 45, badge: null,
        marque: "Logitech",
        description: "Souris sans fil silencieuse avec capteur haute précision et forme ergonomique pour un usage prolongé.",
        categorie: catMap["accessoires-pc"], vedette: false,
        note: 4.6, nombreAvis: 187,
        images: [{ url: "https://loremflickr.com/500/500/wireless,mouse", principale: true }],
        specifications: new Map([["DPI","4000"], ["Connectique","Bluetooth + USB"], ["Autonomie","18 mois (pile)"]]),
      },
      {
        nom: "Tapis de Souris XXL Gaming", prix: 8000, stock: 60, badge: null,
        marque: "Razer",
        description: "Grand tapis de souris avec surface tissée précise et base antidérapante, éclairage RGB en bordure.",
        categorie: catMap["accessoires-pc"], vedette: false,
        note: 4.4, nombreAvis: 95,
        images: [{ url: "https://loremflickr.com/500/500/mousepad,rgb", principale: true }],
        specifications: new Map([["Dimensions","900x400mm"], ["Éclairage","RGB bordure"], ["Base","Antidérapante"]]),
      },
      {
        nom: "Webcam Full HD 1080p", prix: 25000, stock: 30, badge: "Best-seller",
        marque: "Logitech",
        description: "Webcam avec autofocus, correction de lumière automatique et micro intégré, idéale pour visioconférences.",
        categorie: catMap["accessoires-pc"], vedette: false,
        note: 4.5, nombreAvis: 143,
        images: [{ url: "https://loremflickr.com/500/500/webcam", principale: true }],
        specifications: new Map([["Résolution","1080p Full HD"], ["Champ de vision","90°"], ["Micro","Intégré"]]),
      },
      {
        nom: "Hub USB-C 7-en-1", prix: 19000, stock: 35, badge: null,
        marque: "Ugreen",
        description: "Hub multiport avec HDMI 4K, lecteur de cartes, 3x USB 3.0 et charge PD 100W.",
        categorie: catMap["accessoires-pc"], vedette: false,
        note: 4.5, nombreAvis: 108,
        images: [{ url: "https://loremflickr.com/500/500/usb,hub", principale: true }],
        specifications: new Map([["Ports","HDMI, 3x USB 3.0, SD/TF, USB-C PD"], ["Sortie vidéo","4K@30Hz"]]),
      },
      {
        nom: "Apple Watch Series 9", prix: 285000, stock: 18, badge: "Top rated",
        marque: "Apple",
        description: "Montre connectée avec puce S9, écran Always-On plus lumineux, et fonctions avancées de santé.",
        categorie: catMap["connectes"], vedette: true,
        note: 4.8, nombreAvis: 298,
        images: [{ url: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80", principale: true }],
        specifications: new Map([["Écran","Always-On Retina"], ["Étanchéité","50m"], ["Autonomie","18 heures"], ["Capteurs","Cardiaque, oxygène, ECG"]]),
      },
      {
        nom: "Samsung Galaxy Watch 6", prix: 195000, stock: 15, badge: null,
        marque: "Samsung",
        description: "Montre connectée Android avec suivi de sommeil avancé, cadran rotatif tactile et design premium.",
        categorie: catMap["connectes"], vedette: false,
        note: 4.6, nombreAvis: 156,
        images: [{ url: "https://loremflickr.com/500/500/smartwatch,samsung", principale: true }],
        specifications: new Map([["Écran","AMOLED tactile"], ["Étanchéité","5ATM"], ["Autonomie","40 heures"]]),
      },
      {
        nom: "Bracelet Connecté Xiaomi Mi Band 8", prix: 22000, stock: 50, badge: "Best-seller",
        marque: "Xiaomi",
        description: "Bracelet fitness léger avec suivi du sommeil, fréquence cardiaque et plus de 150 modes sportifs.",
        categorie: catMap["connectes"], vedette: false,
        note: 4.5, nombreAvis: 267,
        images: [{ url: "https://loremflickr.com/500/500/fitness,tracker,band", principale: true }],
        specifications: new Map([["Écran","AMOLED 1,62\""], ["Autonomie","16 jours"], ["Étanchéité","5ATM"]]),
      },
      {
        nom: "Montre Connectée Sport Amazfit", prix: 68000, stock: 20, badge: null,
        marque: "Amazfit",
        description: "Montre GPS avec plus de 100 modes sportifs, autonomie longue durée et suivi santé complet.",
        categorie: catMap["connectes"], vedette: false,
        note: 4.4, nombreAvis: 89,
        images: [{ url: "https://loremflickr.com/500/500/sport,smartwatch", principale: true }],
        specifications: new Map([["GPS","Intégré"], ["Autonomie","14 jours"], ["Étanchéité","5ATM"]]),
      },
      {
        nom: "Bague Connectée Oura Ring", prix: 320000, stock: 4, badge: "Pro",
        marque: "Oura",
        description: "Bague intelligente discrète pour le suivi du sommeil, de la récupération et de l'activité physique.",
        categorie: catMap["connectes"], vedette: false,
        note: 4.7, nombreAvis: 42,
        images: [{ url: "https://loremflickr.com/500/500/smart,ring", principale: true }],
        specifications: new Map([["Autonomie","7 jours"], ["Étanchéité","100m"], ["Matériau","Titane"]]),
      },
      {
        nom: "Manette PS5 DualSense", prix: 62000, stock: 35, badge: "Best-seller",
        marque: "Sony",
        description: "Manette sans fil avec retour haptique, gâchettes adaptatives et micro intégré.",
        categorie: catMap["gaming"], vedette: true,
        note: 4.8, nombreAvis: 289,
        images: [{ url: "https://images.unsplash.com/photo-1606318313647-e9cfec6ab5a4?w=500&q=80", principale: true }],
        specifications: new Map([["Compatibilité","PS5, PC"], ["Connectique","Bluetooth + USB-C"], ["Autonomie","~12h"]]),
      },
      {
        nom: "Nintendo Switch OLED", prix: 285000, stock: 10, badge: "Top rated",
        marque: "Nintendo",
        description: "Console hybride avec écran OLED 7 pouces, 64 Go de stockage et dock TV inclus.",
        categorie: catMap["gaming"], vedette: true,
        note: 4.9, nombreAvis: 412,
        images: [{ url: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=500&q=80", principale: true }],
        specifications: new Map([["Écran","7\" OLED"], ["Stockage","64 Go"], ["Mode","Portable + TV"]]),
      },
      {
        nom: "Clavier Gaming Mécanique RGB", prix: 48000, stock: 22, badge: null,
        marque: "Razer",
        description: "Clavier gaming avec switches optiques, anti-ghosting complet et repose-poignet magnétique.",
        categorie: catMap["gaming"], vedette: false,
        note: 4.6, nombreAvis: 176,
        images: [{ url: "https://loremflickr.com/500/500/gaming,keyboard,rgb", principale: true }],
        specifications: new Map([["Switches","Optiques"], ["Anti-ghosting","N-Key Rollover"], ["RGB","Par touche"]]),
      },
      {
        nom: "Souris Gaming 26000 DPI", prix: 38000, stock: 40, badge: "Best-seller",
        marque: "Logitech",
        description: "Souris gaming ultra-légère (58g), capteur optique 26000 DPI, autonomie 70h.",
        categorie: catMap["gaming"], vedette: false,
        note: 4.6, nombreAvis: 176,
        images: [{ url: "https://loremflickr.com/500/500/gamingmouse", principale: true }],
        specifications: new Map([["DPI","26000"], ["Poids","58g"], ["Autonomie","70 heures"]]),
      },
      {
        nom: "Casque Gaming Surround 7.1", prix: 42000, stock: 0, badge: null,
        marque: "HyperX",
        description: "Casque gaming avec son surround 7.1, micro antibruit détachable et coussinets mémoire de forme.",
        categorie: catMap["gaming"], vedette: false,
        note: 4.5, nombreAvis: 201,
        images: [{ url: "https://loremflickr.com/500/500/gamingheadset", principale: true }],
        specifications: new Map([["Son","Surround 7.1"], ["Micro","Antibruit détachable"], ["Connectique","USB / Jack 3.5mm"]]),
      },
      {
        nom: "GoPro HERO12 Black", prix: 385000, stock: 18, badge: "Nouveau",
        marque: "GoPro",
        description: "Caméra d'action étanche 5.3K, stabilisation HyperSmooth 6.0 et autonomie améliorée.",
        categorie: catMap["photo-video"], vedette: true,
        note: 4.7, nombreAvis: 167,
        images: [{ url: "https://loremflickr.com/500/500/actioncamera,gopro", principale: true }],
        specifications: new Map([["Vidéo","5.3K60"], ["Étanchéité","10m sans caisson"], ["Stabilisation","HyperSmooth 6.0"]]),
      },
      {
        nom: "DJI Mini 4 Pro (Drone)", prix: 720000, stock: 6, badge: "Pro",
        marque: "DJI",
        description: "Drone compact sous 249g avec caméra 4K/60fps, détection d'obstacles omnidirectionnelle.",
        categorie: catMap["photo-video"], vedette: true,
        note: 4.8, nombreAvis: 84,
        images: [{ url: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500&q=80", principale: true }],
        specifications: new Map([["Poids","<249g"], ["Vidéo","4K/60fps"], ["Autonomie de vol","34 minutes"]]),
      },
      {
        nom: "Trépied Photo/Vidéo Professionnel", prix: 32000, stock: 20, badge: null,
        marque: "Manfrotto",
        description: "Trépied robuste et léger en aluminium, hauteur ajustable et tête fluide pour vidéo.",
        categorie: catMap["photo-video"], vedette: false,
        note: 4.5, nombreAvis: 67,
        images: [{ url: "https://loremflickr.com/500/500/tripod,camera", principale: true }],
        specifications: new Map([["Matériau","Aluminium"], ["Hauteur max","1,6m"], ["Charge max","5kg"]]),
      },
      {
        nom: "Ring Light LED 18 pouces", prix: 24000, stock: 25, badge: null,
        marque: "Neewer",
        description: "Anneau lumineux LED avec trépied, 3 modes de couleur et support smartphone, idéal pour contenu vidéo.",
        categorie: catMap["photo-video"], vedette: false,
        note: 4.4, nombreAvis: 98,
        images: [{ url: "https://loremflickr.com/500/500/ring,light,studio", principale: true }],
        specifications: new Map([["Diamètre","18 pouces"], ["Modes","3 températures de couleur"], ["Alimentation","USB"]]),
      },
      {
        nom: "Appareil Photo Canon EOS R50", prix: 545000, stock: 7, badge: "Nouveau",
        marque: "Canon",
        description: "Appareil photo hybride léger avec autofocus intelligent et vidéo 4K, parfait pour débuter en photo pro.",
        categorie: catMap["photo-video"], vedette: false,
        note: 4.7, nombreAvis: 53,
        images: [{ url: "https://loremflickr.com/500/500/mirrorless,camera,canon", principale: true }],
        specifications: new Map([["Capteur","APS-C 24,2MP"], ["Vidéo","4K30p"], ["Autofocus","Détection sujet IA"]]),
      },
      {
        nom: "Clé USB 128 Go", prix: 9500, stock: 80, badge: null,
        marque: "SanDisk",
        description: "Clé USB 3.2 compacte et rapide, idéale pour le transfert et la sauvegarde de fichiers.",
        categorie: catMap["stockage"], vedette: false,
        note: 4.4, nombreAvis: 156,
        images: [{ url: "https://loremflickr.com/500/500/usb,flashdrive", principale: true }],
        specifications: new Map([["Capacité","128 Go"], ["Vitesse","USB 3.2 jusqu'à 150 Mo/s"]]),
      },
      {
        nom: "Carte Mémoire microSD 256 Go", prix: 22000, stock: 50, badge: "Best-seller",
        marque: "Samsung",
        description: "Carte microSD haute vitesse classe A2, parfaite pour smartphone, drone ou console portable.",
        categorie: catMap["stockage"], vedette: false,
        note: 4.6, nombreAvis: 203,
        images: [{ url: "https://loremflickr.com/500/500/microsd,card", principale: true }],
        specifications: new Map([["Capacité","256 Go"], ["Vitesse","Jusqu'à 160 Mo/s"], ["Classe","A2, U3, V30"]]),
      },
      {
        nom: "SSD Externe 1 To", prix: 68000, stock: 22, badge: "Top rated",
        marque: "Samsung",
        description: "Disque SSD externe ultra-rapide et compact, résistant aux chocs, USB-C 3.2.",
        categorie: catMap["stockage"], vedette: true,
        note: 4.8, nombreAvis: 178,
        images: [{ url: "https://loremflickr.com/500/500/external,ssd", principale: true }],
        specifications: new Map([["Capacité","1 To"], ["Vitesse","Jusqu'à 1050 Mo/s"], ["Connectique","USB-C 3.2"]]),
      },
      {
        nom: "Disque Dur Externe 2 To", prix: 55000, stock: 18, badge: null,
        marque: "Seagate",
        description: "Disque dur externe classique, grande capacité pour sauvegardes et archivage de fichiers volumineux.",
        categorie: catMap["stockage"], vedette: false,
        note: 4.3, nombreAvis: 89,
        images: [{ url: "https://loremflickr.com/500/500/external,harddrive", principale: true }],
        specifications: new Map([["Capacité","2 To"], ["Connectique","USB 3.0"]]),
      },
      {
        nom: "Clé USB-C 64 Go Double Connectique", prix: 12500, stock: 45, badge: null,
        marque: "SanDisk",
        description: "Clé USB avec connecteurs USB-A et USB-C, pratique pour transférer entre smartphone et ordinateur.",
        categorie: catMap["stockage"], vedette: false,
        note: 4.5, nombreAvis: 112,
        images: [{ url: "https://loremflickr.com/500/500/usbc,flashdrive", principale: true }],
        specifications: new Map([["Capacité","64 Go"], ["Connectique","USB-A + USB-C"]]),
      },
      {
        nom: "Coque de Protection Renforcée", prix: 9500, stock: 80, badge: null,
        marque: "Spigen",
        description: "Coque antichoc certifiée militaire, protection à 360° avec coins renforcés en silicone.",
        categorie: catMap["protection"], vedette: false,
        note: 4.3, nombreAvis: 145,
        images: [{ url: "https://loremflickr.com/500/500/phonecase", principale: true }],
        specifications: new Map([["Protection","Certifiée MIL-STD-810G"], ["Matériau","TPU + Polycarbonate"]]),
      },
      {
        nom: "Verre Trempé Protection Écran (lot de 2)", prix: 4500, stock: 100, badge: "Best-seller",
        marque: "Spigen",
        description: "Verre trempé haute transparence, dureté 9H, installation facile sans bulles.",
        categorie: catMap["protection"], vedette: false,
        note: 4.4, nombreAvis: 234,
        images: [{ url: "https://loremflickr.com/500/500/screen,protector,glass", principale: true }],
        specifications: new Map([["Dureté","9H"], ["Épaisseur","0,3mm"], ["Quantité","2 unités"]]),
      },
      {
        nom: "Sacoche PC Portable 15\"", prix: 18000, stock: 30, badge: null,
        marque: "TechShop",
        description: "Sacoche rembourrée avec compartiments multiples, résistante à l'eau, poignée et bandoulière.",
        categorie: catMap["protection"], vedette: false,
        note: 4.5, nombreAvis: 87,
        images: [{ url: "https://loremflickr.com/500/500/laptop,bag", principale: true }],
        specifications: new Map([["Taille","Jusqu'à 15,6\""], ["Matériau","Résistant à l'eau"], ["Compartiments","3"]]),
      },
      {
        nom: "Coque Rigide MacBook", prix: 14000, stock: 25, badge: null,
        marque: "TechShop",
        description: "Coque rigide légère protégeant intégralement le MacBook sans ajouter d'épaisseur excessive.",
        categorie: catMap["protection"], vedette: false,
        note: 4.2, nombreAvis: 56,
        images: [{ url: "https://loremflickr.com/500/500/laptop,case,protective", principale: true }],
        specifications: new Map([["Compatibilité","MacBook Air/Pro"], ["Matériau","Polycarbonate"]]),
      },
      {
        nom: "Étui Étanche Universel Smartphone", prix: 6500, stock: 40, badge: null,
        marque: "TechShop",
        description: "Étui étanche jusqu'à 30m, compatible avec la plupart des smartphones, idéal plage et piscine.",
        categorie: catMap["protection"], vedette: false,
        note: 4.1, nombreAvis: 43,
        images: [{ url: "https://loremflickr.com/500/500/waterproof,phone,case", principale: true }],
        specifications: new Map([["Étanchéité","IPX8 jusqu'à 30m"], ["Compatibilité","Universelle jusqu'à 6,9\""]]),
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

