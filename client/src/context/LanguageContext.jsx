import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    appName: 'Agri to Harvest',
    tagline: 'Turning Vegetable Waste into Farming Wealth',
    home: 'Home',
    howItWorks: 'How It Works',
    availableWaste: 'Available Waste',
    organicProducts: 'Organic Products',
    impact: 'Environmental Impact',
    aboutUs: 'About Us',
    login: 'Login',
    register: 'Get Started',
    logout: 'Logout',
    dashboard: 'Dashboard',
    cart: 'Cart',
    shopkeeper: 'Vegetable Shopkeeper',
    compostProducer: 'Compost Producer',
    farmer: 'Farmer',
    admin: 'Administrator',
    heroTitle: 'From Vegetable Waste to a Greener Harvest',
    heroSub: 'Connecting vegetable markets, compost producers, and farmers to transform waste into valuable organic resources.',
    exploreProducts: 'Explore Organic Products',
    listWaste: 'List Vegetable Waste',
    wasteCollectedKg: 'Total Waste Collected',
    compostProducedKg: 'Total Compost Produced',
    participatingShopkeepers: 'Partner Markets & Grocers',
    participatingFarmers: 'Enriched Farmer Fields',
    step1Title: '1. Shopkeepers List Waste',
    step1Desc: 'Rythu Bazars and vegetable grocers list excess trimmings, peels, and wilted produce instead of dumping into landfills.',
    step2Title: '2. Compost Producers Collect',
    step2Desc: 'Bio-composters schedule swift collections in sealed crates, turning organic waste into valuable feedstock.',
    step3Title: '3. Scientific Composting',
    step3Desc: 'Material undergoes controlled aerobic decomposition or vermicomposting, resulting in pathogen-free, rich humus.',
    step4Title: '4. Farmers Enrich Soil',
    step4Desc: 'Farmers purchase verified organic compost at fair prices, improving moisture retention and crop yields sustainably.',
    orderNow: 'Order Now',
    requestCollection: 'Request Collection',
    freeWaste: 'Free Collection',
    available: 'Available',
    switchRole: 'Quick Role Preview:',
  },
  te: {
    appName: 'అగ్రి టు హార్వెస్ట్ (Agri to Harvest)',
    tagline: 'కూరగాయల వ్యర్థాలను వ్యవసాయ సంపదగా మార్చడం',
    home: 'హోమ్',
    howItWorks: 'ఇది ఎలా పనిచేస్తుంది',
    availableWaste: 'కూరగాయల వ్యర్థాలు',
    organicProducts: 'సేంద్రీయ ఉత్పత్తులు',
    impact: 'పర్యావరణ ప్రభావం',
    aboutUs: 'మా గురించి',
    login: 'లాగిన్',
    register: 'ప్రారంభించండి',
    logout: 'లాగౌట్',
    dashboard: 'డాష్‌బోర్డ్',
    cart: 'షాపింగ్ బుట్ట',
    shopkeeper: 'కూరగాయల వ్యాపారి',
    compostProducer: 'కంపోస్ట్ తయారీదారు',
    farmer: 'రైతు సోదరులు',
    admin: 'అడ్మినిస్ట్రేటర్',
    heroTitle: 'కూరగాయల వ్యర్థాల నుండి పచ్చని పంటల దిగుబడి',
    heroSub: 'రైతు బజార్లు, కంపోస్ట్ తయారీదారులు మరియు రైతులను అనుసంధానిస్తూ వ్యర్థాలను విలువైన సేంద్రీయ ఎరువుగా మారుస్తున్నాము.',
    exploreProducts: 'సేంద్రీయ ఎరువులను చూడండి',
    listWaste: 'వ్యర్థాలను నమోదు చేయండి',
    wasteCollectedKg: 'సేకరించిన మొత్తం వ్యర్థాలు',
    compostProducedKg: 'తయారైన సేంద్రీయ కంపోస్ట్',
    participatingShopkeepers: 'భాగస్వామ్య కూరగాయల దుకాణాలు',
    participatingFarmers: 'లబ్ధి పొందిన రైతులు',
    step1Title: '1. వ్యాపారులు వ్యర్థాలను నమోదు చేస్తారు',
    step1Desc: 'రైతు బజార్లు మరియు దుకాణాల నుండి మిగిలిపోయిన కూరగాయల వ్యర్థాలను చెత్తకుప్పల్లో పడేయకుండా ఇక్కడ నమోదు చేస్తారు.',
    step2Title: '2. కంపోస్ట్ తయారీదారులు సేకరిస్తారు',
    step2Desc: 'కంపోస్ట్ నిపుణులు నేరుగా దుకాణాల వద్ద నుండి వ్యర్థాలను పర్యావరణహితంగా సేకరిస్తారు.',
    step3Title: '3. శాస్త్రీయ వర్మీకంపోస్ట్ తయారీ',
    step3Desc: 'వానపాములు మరియు సహజ సూక్ష్మజీవుల ద్వారా పోషకాలు నిండిన నల్లటి బంగారమైన కంపోస్ట్ ఎరువుగా మారుస్తారు.',
    step4Title: '4. రైతులు నేల సారాన్ని పెంచుకుంటారు',
    step4Desc: 'రైతులు స్వచ్ఛమైన సేంద్రీయ ఎరువును సరసమైన ధరకు కొనుగోలు చేసి అధిక దిగుబడులు సాధిస్తారు.',
    orderNow: 'ఇప్పుడే ఆర్డర్ చేయండి',
    requestCollection: 'సేకరణ అభ్యర్థన పంపండి',
    freeWaste: 'ఉచిత సేకరణ',
    available: 'అందుబాటులో ఉంది',
    switchRole: 'పరీక్షించడానికి ఖాతాను మార్చండి:',
  }
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'te' : 'en');
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
