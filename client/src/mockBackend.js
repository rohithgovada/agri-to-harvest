// Client-side Mock Backend Engine for Agri-to-Harvest
// Ensures 100% glitch-free offline & static GitHub Pages demo functionality

const STORAGE_KEY = 'ath_mock_db';

const INITIAL_USERS = [
  {
    id: 1,
    name: 'AgriAdmin - System Monitor',
    email: 'admin@agritoharvest.org',
    phone: '+91 98490 11223',
    role: 'admin',
    address: 'Agri Innovation Center, Hitec City',
    city: 'Hyderabad',
    lat: 17.4474,
    lng: 78.3762,
    status: 'active'
  },
  {
    id: 2,
    name: 'Ramesh Babu - Rythu Bazar Stall #14',
    email: 'ramesh.veggies@gmail.com',
    phone: '+91 94401 22334',
    role: 'shopkeeper',
    address: 'Bowenpally Agricultural Market Yard, Secunderabad',
    city: 'Hyderabad',
    lat: 17.4721,
    lng: 78.4842,
    status: 'active'
  },
  {
    id: 3,
    name: 'Lakshmi Devi - Fresh Green Grocers',
    email: 'lakshmi.greens@gmail.com',
    phone: '+91 98480 33445',
    role: 'shopkeeper',
    address: 'Plot 42, Ayyappa Society Main Road, Madhapur',
    city: 'Hyderabad',
    lat: 17.4483,
    lng: 78.3915,
    status: 'active'
  },
  {
    id: 4,
    name: 'Suresh Reddy - GreenSoil Bio-Organics',
    email: 'suresh.compost@gmail.com',
    phone: '+91 97011 44556',
    role: 'compost_producer',
    address: 'Survey No 128, Shamshabad Rural Organic Hub',
    city: 'Hyderabad',
    lat: 17.2403,
    lng: 78.4294,
    status: 'active'
  },
  {
    id: 5,
    name: 'Haritha Rao - Haritha Krishi Earth Solutions',
    email: 'haritha.eco@gmail.com',
    phone: '+91 99590 55667',
    role: 'compost_producer',
    address: 'Sector 4, Medchal Agro-Industrial Park',
    city: 'Hyderabad',
    lat: 17.6297,
    lng: 78.4814,
    status: 'active'
  },
  {
    id: 6,
    name: 'Venkat Rao - Organic Paddy & Veg Farmer',
    email: 'venkat.farmer@gmail.com',
    phone: '+91 96180 66778',
    role: 'farmer',
    address: 'Sy No 54, Chevella Mandal, Rangareddy District',
    city: 'Rangareddy',
    lat: 17.3075,
    lng: 78.1362,
    status: 'active'
  },
  {
    id: 7,
    name: 'Anjamma Goud - Sustainable Horticulturist',
    email: 'anjamma.organic@gmail.com',
    phone: '+91 98660 77889',
    role: 'farmer',
    address: 'Village Kondapur, Sangareddy Agri Belt',
    city: 'Sangareddy',
    lat: 17.6190,
    lng: 78.0818,
    status: 'active'
  }
];

const INITIAL_WASTE = [
  {
    id: 1,
    shopkeeper_id: 2,
    shopkeeper_name: 'Ramesh Babu - Rythu Bazar Stall #14',
    shopkeeper_phone: '+91 94401 22334',
    shopkeeper_city: 'Hyderabad',
    title: 'Fresh Spinach, Coriander & Mint Trimmings',
    vegetable_type: 'Leafy Greens',
    description: 'Daily morning market cuts and trimmings. Clean, 100% organic matter without plastics or chemical residue. Highly nitrogen-rich, perfect for aerobic compost.',
    quantity_kg: 180.0,
    available_quantity_kg: 180.0,
    waste_condition: 'Freshly Cut / Trimmings',
    available_datetime: 'Today, 2:00 PM - 7:00 PM',
    collection_address: 'Bowenpally Market Yard Stall 14',
    city: 'Hyderabad',
    lat: 17.4721,
    lng: 78.4842,
    price_per_kg: 0.0,
    is_free: 1,
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    contact_phone: '+91 94401 22334',
    status: 'available',
    is_compostable_verified: 1,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 2,
    shopkeeper_id: 2,
    shopkeeper_name: 'Ramesh Babu - Rythu Bazar Stall #14',
    shopkeeper_phone: '+91 94401 22334',
    shopkeeper_city: 'Hyderabad',
    title: 'Cabbage, Cauliflower Outer Leaves & Carrot Stems',
    vegetable_type: 'Brassicas & Root Vegetables',
    description: 'Crisp discarded vegetable leaves and tops from bulk unpacking. Great carbon-nitrogen balance for vermicomposting pits.',
    quantity_kg: 350.0,
    available_quantity_kg: 150.0,
    waste_condition: 'Freshly Cut / Trimmings',
    available_datetime: 'Daily between 4:00 PM - 8:00 PM',
    collection_address: 'Bowenpally Market Yard Stall 14',
    city: 'Hyderabad',
    lat: 17.4721,
    lng: 78.4842,
    price_per_kg: 0.5,
    is_free: 0,
    image_url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80',
    contact_phone: '+91 94401 22334',
    status: 'partially_reserved',
    is_compostable_verified: 1,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 3,
    shopkeeper_id: 3,
    shopkeeper_name: 'Lakshmi Devi - Fresh Green Grocers',
    shopkeeper_phone: '+91 98480 33445',
    shopkeeper_city: 'Hyderabad',
    title: 'Surplus Ripe Tomatoes, Bell Peppers & Gourds',
    vegetable_type: 'Tomatoes, Gourds & Solanaceae',
    description: 'Overripe tomatoes and gourd trimmings separated this morning. High moisture content, ideal for pre-fermentation or Bokashi digestion.',
    quantity_kg: 220.0,
    available_quantity_kg: 220.0,
    waste_condition: 'Wilted / Overripe',
    available_datetime: 'Today from 1:00 PM onwards',
    collection_address: 'Madhapur Ayyappa Society Grocers',
    city: 'Hyderabad',
    lat: 17.4483,
    lng: 78.3915,
    price_per_kg: 0.0,
    is_free: 1,
    image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
    contact_phone: '+91 98480 33445',
    status: 'available',
    is_compostable_verified: 1,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 4,
    shopkeeper_id: 3,
    shopkeeper_name: 'Lakshmi Devi - Fresh Green Grocers',
    shopkeeper_phone: '+91 98480 33445',
    shopkeeper_city: 'Hyderabad',
    title: 'Sweet Corn Husks, Pea Shells & Banana Peels',
    vegetable_type: 'Dry Husks, Peels & Stems',
    description: 'Bulk dry vegetable biomass, banana skins, and corn outer skins. Excellent brown carbon source to aerate wet compost piles.',
    quantity_kg: 400.0,
    available_quantity_kg: 0.0,
    waste_condition: 'Dry Husks, Peels & Stems',
    available_datetime: 'Yesterday collection completed',
    collection_address: 'Madhapur Ayyappa Society Grocers',
    city: 'Hyderabad',
    lat: 17.4483,
    lng: 78.3915,
    price_per_kg: 0.0,
    is_free: 1,
    image_url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80',
    contact_phone: '+91 98480 33445',
    status: 'collected',
    is_compostable_verified: 1,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 5,
    shopkeeper_id: 2,
    shopkeeper_name: 'Ramesh Babu - Rythu Bazar Stall #14',
    shopkeeper_phone: '+91 94401 22334',
    shopkeeper_city: 'Hyderabad',
    title: 'Mixed Market Sorting Residue (Brinjals, Beans, Okra)',
    vegetable_type: 'Mixed Market Produce',
    description: 'Clean unsold surplus veggies sorted at closing hours. Completely biodegradable, zero trash.',
    quantity_kg: 260.0,
    available_quantity_kg: 260.0,
    waste_condition: 'Spoiled / Excess Market Produce',
    available_datetime: 'Tomorrow morning 8:00 AM - 12:00 PM',
    collection_address: 'Bowenpally Market Yard Stall 14',
    city: 'Hyderabad',
    lat: 17.4721,
    lng: 78.4842,
    price_per_kg: 0.0,
    is_free: 1,
    image_url: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=800&q=80',
    contact_phone: '+91 94401 22334',
    status: 'available',
    is_compostable_verified: 1,
    created_at: new Date(Date.now() - 3600000 * 18).toISOString()
  }
];

const INITIAL_REQUESTS = [
  {
    id: 1,
    waste_listing_id: 2,
    waste_title: 'Cabbage, Cauliflower Outer Leaves & Carrot Stems',
    producer_id: 4,
    producer_name: 'Suresh Reddy - GreenSoil Bio-Organics',
    producer_phone: '+91 97011 44556',
    shopkeeper_id: 2,
    shopkeeper_name: 'Ramesh Babu - Rythu Bazar Stall #14',
    requested_quantity_kg: 200.0,
    actual_collected_kg: null,
    proposed_pickup_datetime: 'Today at 5:30 PM with 1-ton truck',
    notes: 'We have airtight collection bins and a dedicated hydraulic tipper. Will pay cash on spot.',
    status: 'accepted',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 2,
    waste_listing_id: 4,
    waste_title: 'Sweet Corn Husks, Pea Shells & Banana Peels',
    producer_id: 4,
    producer_name: 'Suresh Reddy - GreenSoil Bio-Organics',
    producer_phone: '+91 97011 44556',
    shopkeeper_id: 3,
    shopkeeper_name: 'Lakshmi Devi - Fresh Green Grocers',
    requested_quantity_kg: 400.0,
    actual_collected_kg: 400.0,
    proposed_pickup_datetime: 'Yesterday 3:00 PM',
    notes: 'Successfully collected full batch for Shamshabad Vermicompost windrows.',
    status: 'collected',
    created_at: new Date(Date.now() - 3600000 * 26).toISOString()
  },
  {
    id: 3,
    waste_listing_id: 1,
    waste_title: 'Fresh Spinach, Coriander & Mint Trimmings',
    producer_id: 5,
    producer_name: 'Haritha Rao - Haritha Krishi Earth Solutions',
    producer_phone: '+91 99590 55667',
    shopkeeper_id: 2,
    shopkeeper_name: 'Ramesh Babu - Rythu Bazar Stall #14',
    requested_quantity_kg: 80.0,
    actual_collected_kg: null,
    proposed_pickup_datetime: 'Tomorrow 10:00 AM',
    notes: 'Requested for Haritha Krishi bio-fertilizer trial pilot.',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

const INITIAL_BATCHES = [
  {
    id: 1,
    producer_id: 4,
    batch_code: 'BATCH-2026-SHM-01',
    source_waste_type: 'Corn husks, pea shells & vegetable greens',
    collection_request_ids: '[2]',
    input_waste_kg: 850.0,
    processing_method: 'Vermicomposting',
    processing_start_date: '2026-08-15',
    estimated_completion_date: '2026-09-25',
    actual_completion_date: '2026-09-26',
    finished_compost_kg: 310.0,
    moisture_loss_percent: 63.5,
    status: 'completed',
    npk_ratio: '2.8 - 1.9 - 2.1',
    moisture_percent: 28.0,
    ph_level: 7.3,
    quality_notes: 'Rich dark brown granular texture, earthworm activity completed, lab verified weed-seed free with superior microbial counts.',
    created_at: '2026-08-15T10:00:00Z',
    linked_products_count: 2
  },
  {
    id: 2,
    producer_id: 4,
    batch_code: 'BATCH-2026-SHM-02',
    source_waste_type: 'Market leafy cuts, cabbage & tomato residue',
    collection_request_ids: '[1]',
    input_waste_kg: 920.0,
    processing_method: 'Aerobic Windrow',
    processing_start_date: '2026-09-28',
    estimated_completion_date: '2026-11-10',
    actual_completion_date: null,
    finished_compost_kg: null,
    moisture_loss_percent: 65.0,
    status: 'in_progress',
    npk_ratio: '2.4 - 1.5 - 1.8',
    moisture_percent: 42.0,
    ph_level: 6.9,
    quality_notes: 'Turned twice weekly, core temperature maintained at 58°C ensuring pathogen elimination.',
    created_at: '2026-09-28T10:00:00Z',
    linked_products_count: 0
  },
  {
    id: 3,
    producer_id: 5,
    batch_code: 'BATCH-2026-MDC-01',
    source_waste_type: 'Mixed vegetable market waste & dry biomass',
    collection_request_ids: '[]',
    input_waste_kg: 600.0,
    processing_method: 'Bokashi Fermentation',
    processing_start_date: '2026-09-10',
    estimated_completion_date: '2026-10-12',
    actual_completion_date: '2026-10-13',
    finished_compost_kg: 240.0,
    moisture_loss_percent: 60.0,
    status: 'completed',
    npk_ratio: '2.6 - 1.7 - 2.0',
    moisture_percent: 30.0,
    ph_level: 7.1,
    quality_notes: 'Anaerobic microbial starter inoculated, high lactic acid bacterium count, excellent soil conditioner.',
    created_at: '2026-09-10T10:00:00Z',
    linked_products_count: 1
  }
];

const INITIAL_PRODUCTS = [
  {
    id: 1,
    producer_id: 4,
    batch_id: 1,
    title: 'Premium Pure Vermicompost (Black Gold)',
    category: 'Vermicompost',
    description: 'Crafted from 100% recycled Bowenpally and Madhapur vegetable waste. Inoculated with Eisenia fetida earthworms. 100% organic, weed-free, odorless, and packed with beneficial soil microbes.',
    price: 320.0,
    stock_quantity: 45.0,
    unit: '25kg bag',
    image_url: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=800&q=80',
    production_date: '2026-09-27',
    usage_instructions: 'Mix 1 to 2 kg per fruit tree or 200g per vegetable pot. Incorporate into top 2-3 inches of soil before irrigation.',
    delivery_options: 'Delivery & Pickup',
    is_verified_organic: 1,
    rating: 4.9,
    total_reviews: 8,
    status: 'active',
    producer_name: 'Suresh Reddy',
    producer_city: 'Hyderabad',
    created_at: '2026-09-27T10:00:00Z'
  },
  {
    id: 2,
    producer_id: 4,
    batch_id: 1,
    title: 'Enriched Vegetable Compost - High Nitrogen',
    category: 'Vegetable Compost',
    description: 'Aerobically decomposed vegetable waste trimmings fortified with rock phosphate and neem cake. Accelerates root development and enhances soil moisture retention by 40%.',
    price: 240.0,
    stock_quantity: 60.0,
    unit: '25kg bag',
    image_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
    production_date: '2026-09-28',
    usage_instructions: 'Apply 1 ton per acre during land preparation or basal dose for horticultural crops.',
    delivery_options: 'Delivery & Pickup',
    is_verified_organic: 1,
    rating: 4.8,
    total_reviews: 5,
    status: 'active',
    producer_name: 'Suresh Reddy',
    producer_city: 'Hyderabad',
    created_at: '2026-09-28T10:00:00Z'
  },
  {
    id: 3,
    producer_id: 5,
    batch_id: 3,
    title: 'Bio-Fermented Bokashi Soil Conditioner',
    category: 'Soil Conditioners',
    description: 'Fermented vegetable organic biomass treated with probiotic beneficial micro-organisms. Restores degraded farmland, prevents fungal root rots, and unlocks bound soil phosphorus.',
    price: 450.0,
    stock_quantity: 30.0,
    unit: '25kg bag',
    image_url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb2251a?auto=format&fit=crop&w=800&q=80',
    production_date: '2026-10-14',
    usage_instructions: 'Broadcast 50g per square meter or mix with farmyard manure prior to sowing.',
    delivery_options: 'Delivery & Pickup',
    is_verified_organic: 1,
    rating: 5.0,
    total_reviews: 3,
    status: 'active',
    producer_name: 'Haritha Rao',
    producer_city: 'Hyderabad',
    created_at: '2026-10-14T10:00:00Z'
  },
  {
    id: 4,
    producer_id: 5,
    batch_id: null,
    title: 'Organic Microbial Plant Booster Liquid (Bio-wash)',
    category: 'Bio-fertilizers',
    description: 'Nutrient-rich liquid leachate extracted from active vermicompost beds. Rich in fulvic and humic acids. Provides rapid leaf greening and pest resistance.',
    price: 180.0,
    stock_quantity: 50.0,
    unit: '5L can',
    image_url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
    production_date: '2026-10-05',
    usage_instructions: 'Dilute 10ml in 1 liter of fresh water. Foliar spray every 15 days on flowering crops.',
    delivery_options: 'Standard Delivery',
    is_verified_organic: 1,
    rating: 4.7,
    total_reviews: 4,
    status: 'active',
    producer_name: 'Haritha Rao',
    producer_city: 'Hyderabad',
    created_at: '2026-10-05T10:00:00Z'
  }
];

const INITIAL_ORDERS = [
  {
    id: 1,
    order_number: 'ATH-2026-8812',
    buyer_id: 6,
    subtotal: 640.0,
    delivery_fee: 80.0,
    total_amount: 720.0,
    status: 'delivered',
    fulfillment_type: 'delivery',
    shipping_name: 'Venkat Rao',
    shipping_phone: '+91 96180 66778',
    shipping_address: 'Survey No 54, Chevella Farm Road',
    shipping_city: 'Rangareddy',
    payment_method: 'UPI / QR',
    payment_status: 'simulated_paid',
    payment_ref: 'UPI-TXN-9021882',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    item_count: 1,
    items: [
      {
        id: 1,
        order_id: 1,
        product_id: 1,
        producer_id: 4,
        product_name: 'Premium Pure Vermicompost (Black Gold)',
        quantity: 2,
        unit: '25kg bag',
        price_per_unit: 320.0,
        total_item_price: 640.0
      }
    ]
  },
  {
    id: 2,
    order_number: 'ATH-2026-9045',
    buyer_id: 7,
    subtotal: 450.0,
    delivery_fee: 0.0,
    total_amount: 450.0,
    status: 'processing',
    fulfillment_type: 'pickup',
    shipping_name: 'Anjamma Goud',
    shipping_phone: '+91 98660 77889',
    shipping_address: 'Pickup from Medchal Agro Hub',
    shipping_city: 'Medchal',
    payment_method: 'Cash on Delivery',
    payment_status: 'simulated_paid',
    payment_ref: 'CASH-REC-1092',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    item_count: 1,
    items: [
      {
        id: 2,
        order_id: 2,
        product_id: 3,
        producer_id: 5,
        product_name: 'Bio-Fermented Bokashi Soil Conditioner',
        quantity: 1,
        unit: '25kg bag',
        price_per_unit: 450.0,
        total_item_price: 450.0
      }
    ]
  }
];

const INITIAL_REVIEWS = [
  {
    id: 1,
    product_id: 1,
    farmer_id: 6,
    farmer_name: 'Venkat Rao',
    rating: 5,
    comment: 'Exceptional quality vermicompost! Used it for my chili and tomato plots in Chevella. The earthworm casts are visible, pleasant earthy smell, zero weeds.',
    created_at: '2026-10-10T12:00:00Z'
  },
  {
    id: 2,
    product_id: 2,
    farmer_id: 7,
    farmer_name: 'Anjamma Goud',
    rating: 5,
    comment: 'Best compost made from vegetable market waste. My drip irrigated gourds showed dark green vigorous foliage within 10 days of application.',
    created_at: '2026-10-12T15:30:00Z'
  }
];

const ROLE_NOTIFICATIONS = {
  shopkeeper: [
    {
      id: 1,
      user_id: 2,
      title: '🚚 Pickup Scheduled Today',
      message: 'Suresh Reddy (GreenSoil Bio-Organics) dispatched an eco-van for 15kg Excess Ridge Gourd & Peels at Stall #14.',
      link: 'shopkeeper_dashboard',
      is_read: 0,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 2,
      user_id: 2,
      title: '🌱 Circular Milestone Achieved',
      message: 'Congratulations! Your market stall has diverted over 450kg of vegetable surplus from city dump yards this month.',
      link: 'impact_page',
      is_read: 0,
      created_at: new Date(Date.now() - 3600000 * 8).toISOString()
    },
    {
      id: 3,
      user_id: 2,
      title: '💰 Waste Revenue Credited',
      message: '₹45.00 credited for 30kg Brassicas & Root stems collection by Haritha Krishi Solutions.',
      link: 'shopkeeper_dashboard',
      is_read: 1,
      created_at: new Date(Date.now() - 3600000 * 24).toISOString()
    }
  ],
  compost_producer: [
    {
      id: 4,
      user_id: 4,
      title: '🛒 New Compost Order Received',
      message: 'Farmer Venkat Rao purchased 2x 25kg Organic Vermicompost bags (Order #ATH-2026-8812). Dispatch ready!',
      link: 'producer_dashboard',
      is_read: 0,
      created_at: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      id: 5,
      user_id: 4,
      title: '🍅 Fresh Vegetable Waste Listed Nearby',
      message: 'Ramesh Babu listed 180kg Fresh Spinach & Greens at Bowenpally Rythu Bazar (Free Collection).',
      link: 'waste_market',
      is_read: 0,
      created_at: new Date(Date.now() - 3600000 * 6).toISOString()
    },
    {
      id: 6,
      user_id: 4,
      title: '🧪 Batch Maturity Reminder',
      message: 'Batch BATCH-2026-SHM-01 reached Day 35. Moisture is optimal at 28% and NPK verified ready for packing.',
      link: 'producer_dashboard',
      is_read: 1,
      created_at: new Date(Date.now() - 3600000 * 36).toISOString()
    }
  ],
  farmer: [
    {
      id: 7,
      user_id: 6,
      title: '📦 Order Out for Delivery',
      message: 'Your order #ATH-2026-8812 (Bio-Enriched Vermicompost) is on its way to Chevella Farmland.',
      link: 'farmer_dashboard',
      is_read: 0,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 8,
      user_id: 6,
      title: '🌾 Seasonal Farm Tip: Microbes & Moisture',
      message: 'Incorporate 500g vegetable-derived compost per plant basin to increase soil water retention by up to 40%.',
      link: 'farmer_dashboard',
      is_read: 0,
      created_at: new Date(Date.now() - 3600000 * 10).toISOString()
    },
    {
      id: 9,
      user_id: 6,
      title: '✨ Verified Fresh Compost in Stock',
      message: 'GreenSoil Bio-Organics just listed fresh 25kg bags of Black Gold Vermicompost at ₹320/bag.',
      link: 'product_market',
      is_read: 1,
      created_at: new Date(Date.now() - 3600000 * 48).toISOString()
    }
  ],
  admin: [
    {
      id: 10,
      user_id: 1,
      title: '📊 Daily Environmental Impact',
      message: '460kg of organic waste diverted today. 165kg of vermicompost currently enriching local soil.',
      link: 'impact_page',
      is_read: 0,
      created_at: new Date(Date.now() - 3600000 * 1).toISOString()
    },
    {
      id: 11,
      user_id: 1,
      title: '🛡️ Quality Compliance Check',
      message: 'All 3 registered compost batches passed heavy metal and weed-seed screening tests.',
      link: 'admin_dashboard',
      is_read: 0,
      created_at: new Date(Date.now() - 3600000 * 12).toISOString()
    }
  ]
};

function getDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse mock DB, recreating:', e);
  }

  const initialDb = {
    users: INITIAL_USERS,
    waste: INITIAL_WASTE,
    requests: INITIAL_REQUESTS,
    batches: INITIAL_BATCHES,
    products: INITIAL_PRODUCTS,
    orders: INITIAL_ORDERS,
    reviews: INITIAL_REVIEWS,
    cart: [],
    notifications: [
      ...ROLE_NOTIFICATIONS.shopkeeper,
      ...ROLE_NOTIFICATIONS.compost_producer,
      ...ROLE_NOTIFICATIONS.farmer,
      ...ROLE_NOTIFICATIONS.admin
    ]
  };
  saveDb(initialDb);
  return initialDb;
}

function saveDb(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('LocalStorage save error:', e);
  }
}

function getCurrentUser(db) {
  const token = localStorage.getItem('ath_token');
  if (!token) return null;
  // If token is mock_token_USERID
  const match = token.match(/mock_token_(\d+)/);
  if (match) {
    const userId = parseInt(match[1]);
    return db.users.find(u => u.id === userId) || db.users[1];
  }
  // Default to Ramesh (Shopkeeper) or Venkat (Farmer)
  return db.users[1];
}

// Router for mock requests
export async function handleMockRequest(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const db = getDb();
  const currentUser = getCurrentUser(db);
  const body = options.body ? JSON.parse(options.body) : {};

  // Parse path & params
  const [path, queryString] = endpoint.split('?');
  const params = new URLSearchParams(queryString || '');

  // Artificial mini delay (40ms) for snappy, realistic UX
  await new Promise(r => setTimeout(r, 40));

  // -------------------------------------------------------------
  // 1. AUTH ROUTES
  // -------------------------------------------------------------
  if (path === '/auth/demo-login' && method === 'POST') {
    const targetRole = body.role || 'farmer';
    const user = db.users.find(u => u.role === targetRole) || db.users[0];
    const token = `mock_token_${user.id}`;
    return { success: true, token, user };
  }

  if (path === '/auth/login' && method === 'POST') {
    const { email, password } = body;
    const user = db.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
    if (!user) {
      const err = new Error('Invalid email or password.');
      err.status = 401;
      throw err;
    }
    const token = `mock_token_${user.id}`;
    return { success: true, token, user };
  }

  if (path === '/auth/register' && method === 'POST') {
    const newUser = {
      id: Date.now(),
      name: body.name || 'New Member',
      email: body.email || `user_${Date.now()}@agritoharvest.org`,
      phone: body.phone || '+91 90000 00000',
      role: body.role || 'farmer',
      address: body.address || 'Local Market Area',
      city: body.city || 'Hyderabad',
      lat: 17.385044,
      lng: 78.486671,
      status: 'active'
    };
    db.users.push(newUser);
    saveDb(db);
    const token = `mock_token_${newUser.id}`;
    return { success: true, token, user: newUser };
  }

  if (path === '/auth/me' && method === 'GET') {
    if (!currentUser) {
      const err = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }
    return { success: true, user: currentUser };
  }

  if (path === '/auth/profile' && method === 'PUT') {
    if (!currentUser) throw new Error('Unauthorized');
    Object.assign(currentUser, body);
    saveDb(db);
    return { success: true, user: currentUser };
  }

  // -------------------------------------------------------------
  // 2. WASTE ROUTES
  // -------------------------------------------------------------
  if (path === '/waste' && method === 'GET') {
    const search = params.get('search')?.toLowerCase() || '';
    const type = params.get('type');
    const condition = params.get('condition');
    const isFree = params.get('isFree') === 'true';

    let list = db.waste.filter(w => w.status !== 'collected');
    if (search) {
      list = list.filter(w =>
        w.title.toLowerCase().includes(search) ||
        (w.description || '').toLowerCase().includes(search) ||
        w.vegetable_type.toLowerCase().includes(search)
      );
    }
    if (type && type !== 'all') {
      list = list.filter(w => w.vegetable_type === type);
    }
    if (condition && condition !== 'all') {
      list = list.filter(w => w.waste_condition === condition);
    }
    if (isFree) {
      list = list.filter(w => w.is_free === 1 || w.price_per_kg === 0);
    }

    return { success: true, count: list.length, listings: list };
  }

  if (path === '/waste' && method === 'POST') {
    const user = currentUser || db.users[1];
    const newListing = {
      id: Date.now(),
      shopkeeper_id: user.id,
      shopkeeper_name: user.name,
      shopkeeper_phone: user.phone,
      shopkeeper_city: user.city,
      title: body.title,
      vegetable_type: body.vegetable_type || 'Leafy Greens',
      description: body.description || '',
      quantity_kg: parseFloat(body.quantity_kg) || 50,
      available_quantity_kg: parseFloat(body.quantity_kg) || 50,
      waste_condition: body.waste_condition || 'Freshly Cut / Trimmings',
      available_datetime: body.available_datetime || 'Today, 2:00 PM - 7:00 PM',
      collection_address: body.collection_address || user.address,
      city: body.city || user.city,
      lat: user.lat || 17.4721,
      lng: user.lng || 78.4842,
      price_per_kg: body.is_free ? 0.0 : (parseFloat(body.price_per_kg) || 0.0),
      is_free: body.is_free ? 1 : 0,
      image_url: body.image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      contact_phone: body.contact_phone || user.phone,
      status: 'available',
      is_compostable_verified: 1,
      created_at: new Date().toISOString()
    };
    db.waste.unshift(newListing);

    // Add notification for compost producers
    db.notifications.unshift({
      id: Date.now() + 1,
      user_id: 4, // Suresh Reddy
      title: '🍅 Fresh Waste Listed Nearby',
      message: `${user.name} listed ${newListing.quantity_kg}kg of "${newListing.title}" (${newListing.is_free ? 'Free Collection' : '₹' + newListing.price_per_kg + '/kg'}).`,
      link: 'waste_market',
      is_read: 0,
      created_at: new Date().toISOString()
    });

    saveDb(db);
    return { success: true, message: 'Vegetable waste listed successfully.', listing: newListing };
  }

  if (path === '/waste/shopkeeper/my-listings' && method === 'GET') {
    const user = currentUser || db.users[1];
    const listings = db.waste.filter(w => w.shopkeeper_id === user.id);
    const stats = {
      totalListings: listings.length,
      activeListings: listings.filter(l => l.status === 'available' || l.status === 'partially_reserved').length,
      totalWasteKg: listings.reduce((sum, l) => sum + (parseFloat(l.quantity_kg) || 0), 0),
      collectedWasteKg: listings.filter(l => l.status === 'collected').reduce((sum, l) => sum + (parseFloat(l.quantity_kg) || 0), 0)
    };
    return { success: true, stats, listings };
  }

  if (path === '/waste/shopkeeper/requests' && method === 'GET') {
    const user = currentUser || db.users[1];
    const requests = db.requests.filter(r => r.shopkeeper_id === user.id);
    return { success: true, requests };
  }

  if (path === '/waste/request-collection' && method === 'POST') {
    const user = currentUser || db.users[3]; // Suresh Reddy
    const wasteItem = db.waste.find(w => w.id === parseInt(body.waste_listing_id));
    if (!wasteItem) throw new Error('Listing not found');

    const newReq = {
      id: Date.now(),
      waste_listing_id: wasteItem.id,
      waste_title: wasteItem.title,
      producer_id: user.id,
      producer_name: user.name,
      producer_phone: user.phone,
      shopkeeper_id: wasteItem.shopkeeper_id,
      shopkeeper_name: wasteItem.shopkeeper_name,
      requested_quantity_kg: parseFloat(body.requested_quantity_kg) || wasteItem.available_quantity_kg,
      actual_collected_kg: null,
      proposed_pickup_datetime: body.proposed_pickup_datetime || 'Tomorrow 10:00 AM',
      notes: body.notes || '',
      status: 'pending',
      created_at: new Date().toISOString()
    };
    db.requests.unshift(newReq);

    // Update listing status
    wasteItem.status = 'partially_reserved';

    // Notify shopkeeper
    db.notifications.unshift({
      id: Date.now() + 2,
      user_id: wasteItem.shopkeeper_id,
      title: '🚚 New Waste Pickup Requested',
      message: `${user.name} requested collection of ${newReq.requested_quantity_kg}kg for "${wasteItem.title}".`,
      link: 'shopkeeper_dashboard',
      is_read: 0,
      created_at: new Date().toISOString()
    });

    saveDb(db);
    return { success: true, message: 'Collection request submitted.', request: newReq };
  }

  if (path === '/waste/producer/my-requests' && method === 'GET') {
    const user = currentUser || db.users[3];
    const requests = db.requests.filter(r => r.producer_id === user.id);
    return { success: true, requests };
  }

  if (path.startsWith('/waste/requests/') && path.endsWith('/status') && method === 'PUT') {
    const id = parseInt(path.split('/')[3]);
    const reqItem = db.requests.find(r => r.id === id);
    if (!reqItem) throw new Error('Request not found');

    reqItem.status = body.status;
    if (body.actual_collected_kg) {
      reqItem.actual_collected_kg = parseFloat(body.actual_collected_kg);
    }

    if (body.status === 'collected') {
      const wasteItem = db.waste.find(w => w.id === reqItem.waste_listing_id);
      if (wasteItem) {
        wasteItem.available_quantity_kg = Math.max(0, wasteItem.available_quantity_kg - (reqItem.actual_collected_kg || reqItem.requested_quantity_kg));
        if (wasteItem.available_quantity_kg <= 0) {
          wasteItem.status = 'collected';
        }
      }
    }

    // Notify producer
    db.notifications.unshift({
      id: Date.now() + 3,
      user_id: reqItem.producer_id,
      title: `Pickup Request ${body.status.toUpperCase()}`,
      message: `Your pickup request for "${reqItem.waste_title}" was marked as ${body.status}.`,
      link: 'producer_dashboard',
      is_read: 0,
      created_at: new Date().toISOString()
    });

    saveDb(db);
    return { success: true, request: reqItem };
  }

  // -------------------------------------------------------------
  // 3. COMPOST PRODUCTION ROUTES
  // -------------------------------------------------------------
  if (path === '/compost/my-batches' && method === 'GET') {
    const user = currentUser || db.users[3];
    const batches = db.batches.filter(b => b.producer_id === user.id);
    return { success: true, batches };
  }

  if (path === '/compost/batches' && method === 'POST') {
    const user = currentUser || db.users[3];
    const year = new Date().getFullYear();
    const batchCode = `BATCH-${year}-P${user.id}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBatch = {
      id: Date.now(),
      producer_id: user.id,
      batch_code: batchCode,
      source_waste_type: body.source_waste_type || 'Market leafy trimmings and vegetable peels',
      collection_request_ids: '[]',
      input_waste_kg: parseFloat(body.input_waste_kg) || 500,
      processing_method: body.processing_method || 'Vermicomposting',
      processing_start_date: body.processing_start_date || new Date().toISOString().split('T')[0],
      estimated_completion_date: body.estimated_completion_date || new Date(Date.now() + 35 * 86400000).toISOString().split('T')[0],
      actual_completion_date: null,
      finished_compost_kg: null,
      moisture_loss_percent: 65.0,
      status: 'in_progress',
      npk_ratio: body.npk_ratio || '2.5 - 1.6 - 1.8',
      moisture_percent: parseFloat(body.moisture_percent) || 35.0,
      ph_level: parseFloat(body.ph_level) || 7.2,
      quality_notes: body.quality_notes || 'Processing under active monitoring.',
      created_at: new Date().toISOString(),
      linked_products_count: 0
    };
    db.batches.unshift(newBatch);
    saveDb(db);
    return { success: true, message: 'Production batch created.', batch: newBatch };
  }

  if (path.startsWith('/compost/batches/') && method === 'PUT') {
    const id = parseInt(path.split('/')[3]);
    const batch = db.batches.find(b => b.id === id);
    if (!batch) throw new Error('Batch not found');

    Object.assign(batch, body);
    if (body.status === 'completed' && !batch.actual_completion_date) {
      batch.actual_completion_date = new Date().toISOString().split('T')[0];
    }
    saveDb(db);
    return { success: true, batch };
  }

  if (path === '/compost/dashboard-stats' && method === 'GET') {
    const user = currentUser || db.users[3];
    const myReqs = db.requests.filter(r => r.producer_id === user.id);
    const myBatches = db.batches.filter(b => b.producer_id === user.id);
    const myProducts = db.products.filter(p => p.producer_id === user.id);

    const totalWasteCollectedKg = myReqs
      .filter(r => r.status === 'collected')
      .reduce((sum, r) => sum + (r.actual_collected_kg || r.requested_quantity_kg || 0), 0);

    const totalCompostProducedKg = myBatches
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (parseFloat(b.finished_compost_kg) || 0), 0);

    const availableMarketWasteKg = db.waste
      .filter(w => w.status !== 'collected')
      .reduce((sum, w) => sum + (parseFloat(w.available_quantity_kg) || 0), 0);

    return {
      success: true,
      stats: {
        totalWasteCollectedKg,
        pendingRequests: myReqs.filter(r => r.status === 'pending').length,
        acceptedRequests: myReqs.filter(r => r.status === 'accepted').length,
        totalCompostProducedKg,
        activeBatches: myBatches.filter(b => b.status === 'in_progress').length,
        totalProducts: myProducts.length,
        totalOrders: 2,
        totalRevenue: 1090,
        availableMarketWasteKg
      }
    };
  }

  // -------------------------------------------------------------
  // 4. PRODUCTS ROUTES
  // -------------------------------------------------------------
  if (path === '/products' && method === 'GET') {
    const search = params.get('search')?.toLowerCase() || '';
    const category = params.get('category');

    let list = [...db.products];
    if (search) {
      list = list.filter(p => p.title.toLowerCase().includes(search) || p.description.toLowerCase().includes(search));
    }
    if (category && category !== 'all') {
      list = list.filter(p => p.category === category);
    }
    return { success: true, count: list.length, products: list };
  }

  if (path.startsWith('/products/') && path.split('/').length === 3 && method === 'GET') {
    const id = parseInt(path.split('/')[2]);
    const prod = db.products.find(p => p.id === id);
    if (!prod) throw new Error('Product not found');
    const reviews = db.reviews.filter(r => r.product_id === id);
    return { success: true, product: prod, reviews };
  }

  if (path === '/products/producer/my-products' && method === 'GET') {
    const user = currentUser || db.users[3];
    const products = db.products.filter(p => p.producer_id === user.id);
    return { success: true, products };
  }

  if (path === '/products' && method === 'POST') {
    const user = currentUser || db.users[3];
    const newProduct = {
      id: Date.now(),
      producer_id: user.id,
      producer_name: user.name,
      producer_city: user.city,
      batch_id: body.batch_id ? parseInt(body.batch_id) : null,
      title: body.title,
      category: body.category || 'Vermicompost',
      description: body.description || '',
      price: parseFloat(body.price) || 250,
      stock_quantity: parseFloat(body.stock_quantity) || 50,
      unit: body.unit || '25kg bag',
      image_url: body.image_url || 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=800&q=80',
      production_date: new Date().toISOString().split('T')[0],
      usage_instructions: body.usage_instructions || 'Incorporate 1-2kg per fruit tree.',
      delivery_options: 'Delivery & Pickup',
      is_verified_organic: 1,
      rating: 5.0,
      total_reviews: 0,
      status: 'active',
      created_at: new Date().toISOString()
    };
    db.products.unshift(newProduct);
    saveDb(db);
    return { success: true, message: 'Product published.', product: newProduct };
  }

  // -------------------------------------------------------------
  // 5. CART ROUTES
  // -------------------------------------------------------------
  if (path === '/cart' && method === 'GET') {
    const items = db.cart.map(c => {
      const p = db.products.find(prod => prod.id === c.product_id) || {};
      return {
        cart_item_id: c.id,
        quantity: c.quantity,
        product_id: p.id,
        title: p.title,
        price: p.price,
        unit: p.unit,
        stock_quantity: p.stock_quantity,
        image_url: p.image_url,
        category: p.category,
        producer_name: p.producer_name,
        producer_city: p.producer_city
      };
    });
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return { success: true, items, subtotal };
  }

  if (path === '/cart/add' && method === 'POST') {
    const prodId = parseInt(body.product_id);
    const qty = parseInt(body.quantity) || 1;
    const existing = db.cart.find(c => c.product_id === prodId);
    if (existing) {
      existing.quantity += qty;
    } else {
      db.cart.push({ id: Date.now(), product_id: prodId, quantity: qty });
    }
    saveDb(db);
    return { success: true, message: 'Product added to cart.' };
  }

  if (path.startsWith('/cart/items/') && method === 'PUT') {
    const id = parseInt(path.split('/')[3]);
    const item = db.cart.find(c => c.id === id);
    if (item && body.quantity) {
      item.quantity = parseInt(body.quantity);
    }
    saveDb(db);
    return { success: true };
  }

  if (path.startsWith('/cart/items/') && method === 'DELETE') {
    const id = parseInt(path.split('/')[3]);
    db.cart = db.cart.filter(c => c.id !== id);
    saveDb(db);
    return { success: true };
  }

  if (path === '/cart/clear' && method === 'DELETE') {
    db.cart = [];
    saveDb(db);
    return { success: true };
  }

  // -------------------------------------------------------------
  // 6. ORDERS ROUTES
  // -------------------------------------------------------------
  if (path === '/orders' && method === 'POST') {
    const user = currentUser || db.users[5]; // Venkat Rao (Farmer)
    const orderItems = [];
    let subtotal = 0;

    for (const c of db.cart) {
      const p = db.products.find(prod => prod.id === c.product_id);
      if (p) {
        const itemPrice = p.price * c.quantity;
        subtotal += itemPrice;
        orderItems.push({
          id: Date.now() + Math.random(),
          product_id: p.id,
          producer_id: p.producer_id,
          product_name: p.title,
          quantity: c.quantity,
          unit: p.unit,
          price_per_unit: p.price,
          total_item_price: itemPrice
        });
        // Deduct stock
        p.stock_quantity = Math.max(0, p.stock_quantity - c.quantity);
      }
    }

    if (orderItems.length === 0) {
      // Fallback single item order
      const p = db.products[0];
      subtotal = p.price;
      orderItems.push({
        id: Date.now(),
        product_id: p.id,
        producer_id: p.producer_id,
        product_name: p.title,
        quantity: 1,
        unit: p.unit,
        price_per_unit: p.price,
        total_item_price: p.price
      });
    }

    const deliveryFee = body.fulfillment_type === 'pickup' ? 0.0 : 80.0;
    const totalAmount = subtotal + deliveryFee;
    const orderNum = `ATH-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      id: Date.now(),
      order_number: orderNum,
      buyer_id: user.id,
      buyer_name: body.shipping_name || user.name,
      buyer_phone: body.shipping_phone || user.phone,
      subtotal,
      delivery_fee: deliveryFee,
      total_amount: totalAmount,
      status: 'order_placed',
      fulfillment_type: body.fulfillment_type || 'delivery',
      shipping_name: body.shipping_name || user.name,
      shipping_phone: body.shipping_phone || user.phone,
      shipping_address: body.shipping_address || user.address,
      shipping_city: body.shipping_city || user.city,
      payment_method: body.payment_method || 'UPI / QR',
      payment_status: 'simulated_paid',
      payment_ref: `UPI-TXN-${Math.floor(1000000 + Math.random() * 9000000)}`,
      notes: body.notes || '',
      created_at: new Date().toISOString(),
      item_count: orderItems.length,
      items: orderItems
    };

    db.orders.unshift(newOrder);
    db.cart = []; // clear cart

    // Notify farmer
    db.notifications.unshift({
      id: Date.now() + 10,
      user_id: user.id,
      title: '📦 Order Confirmed',
      message: `Your order #${orderNum} for ₹${totalAmount} has been placed successfully.`,
      link: 'farmer_dashboard',
      is_read: 0,
      created_at: new Date().toISOString()
    });

    // Notify producers
    for (const it of orderItems) {
      db.notifications.unshift({
        id: Date.now() + Math.random() * 1000,
        user_id: it.producer_id,
        title: '🛒 New Compost Order Received',
        message: `${newOrder.shipping_name} purchased ${it.quantity}x ${it.product_name} in order #${orderNum}.`,
        link: 'producer_dashboard',
        is_read: 0,
        created_at: new Date().toISOString()
      });
    }

    saveDb(db);
    return {
      success: true,
      message: 'Order placed successfully.',
      order: {
        orderId: newOrder.id,
        orderNumber: newOrder.order_number,
        totalAmount: newOrder.total_amount,
        paymentRef: newOrder.payment_ref
      }
    };
  }

  if (path === '/orders/my-orders' && method === 'GET') {
    const user = currentUser || db.users[5];
    let orders = [];
    if (user.role === 'farmer') {
      orders = db.orders.filter(o => o.buyer_id === user.id);
    } else if (user.role === 'compost_producer') {
      orders = db.orders.filter(o => o.items && o.items.some(it => it.producer_id === user.id));
    } else {
      orders = db.orders;
    }
    return { success: true, count: orders.length, orders };
  }

  if (path.startsWith('/orders/') && !path.endsWith('/status') && method === 'GET') {
    const id = parseInt(path.split('/')[2]);
    const order = db.orders.find(o => o.id === id);
    if (!order) throw new Error('Order not found');
    return { success: true, order };
  }

  if (path.startsWith('/orders/') && path.endsWith('/status') && method === 'PUT') {
    const id = parseInt(path.split('/')[2]);
    const order = db.orders.find(o => o.id === id);
    if (!order) throw new Error('Order not found');
    order.status = body.status;
    saveDb(db);
    return { success: true, order };
  }

  // -------------------------------------------------------------
  // 7. REVIEWS ROUTES
  // -------------------------------------------------------------
  if (path === '/reviews' && method === 'POST') {
    const user = currentUser || db.users[5];
    const newRev = {
      id: Date.now(),
      product_id: parseInt(body.product_id),
      farmer_id: user.id,
      farmer_name: user.name,
      rating: parseInt(body.rating) || 5,
      comment: body.comment || 'Verified effective organic compost.',
      created_at: new Date().toISOString()
    };
    db.reviews.unshift(newRev);

    // Update product rating
    const prod = db.products.find(p => p.id === newRev.product_id);
    if (prod) {
      prod.total_reviews = (prod.total_reviews || 0) + 1;
    }
    saveDb(db);
    return { success: true, message: 'Review added.', review: newRev };
  }

  // -------------------------------------------------------------
  // 8. IMPACT STATS ROUTE
  // -------------------------------------------------------------
  if (path === '/impact' && method === 'GET') {
    const totalWasteCollectedKg = db.requests
      .filter(r => r.status === 'collected')
      .reduce((sum, r) => sum + (r.actual_collected_kg || r.requested_quantity_kg || 0), 0);

    const totalCompostProducedKg = db.batches
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (parseFloat(b.finished_compost_kg) || 0), 0);

    const completedCollections = db.requests.filter(r => r.status === 'collected').length;
    const completedOrders = db.orders.filter(o => o.status === 'delivered').length;

    const estimatedCo2SavedKg = Math.round(totalWasteCollectedKg * 0.45 * 10) / 10;
    const estimatedLandNourishedSqM = Math.round((totalCompostProducedKg / 2.5) * 10) / 10;

    return {
      success: true,
      metrics: {
        totalWasteCollectedKg,
        totalCompostProducedKg,
        completedCollections,
        activeShopkeepers: db.users.filter(u => u.role === 'shopkeeper').length,
        activeProducers: db.users.filter(u => u.role === 'compost_producer').length,
        activeFarmers: db.users.filter(u => u.role === 'farmer').length,
        completedOrders,
        activeBatches: db.batches.filter(b => b.status === 'in_progress').length,
        estimatedCo2SavedKg,
        estimatedLandNourishedSqM,
        averageConversionEfficiency: totalCompostProducedKg > 0 && totalWasteCollectedKg > 0
          ? `${Math.round((totalCompostProducedKg / totalWasteCollectedKg) * 100)}%`
          : '36.5%'
      },
      monthlyData: [
        { month: 'Jun', wasteCollected: 120, compostProduced: 45 },
        { month: 'Jul', wasteCollected: 210, compostProduced: 78 },
        { month: 'Aug', wasteCollected: 380, compostProduced: 140 },
        { month: 'Sep', wasteCollected: 650, compostProduced: 245 },
        { month: 'Oct', wasteCollected: Math.max(850, totalWasteCollectedKg), compostProduced: Math.max(310, totalCompostProducedKg) }
      ]
    };
  }

  // -------------------------------------------------------------
  // 9. NOTIFICATIONS ROUTES
  // -------------------------------------------------------------
  if (path === '/notifications' && method === 'GET') {
    const user = currentUser || db.users[1];
    const userNotifs = db.notifications.filter(n => n.user_id === user.id);
    const unreadCount = userNotifs.filter(n => !n.is_read).length;
    return {
      success: true,
      unreadCount,
      notifications: userNotifs
    };
  }

  if (path === '/notifications/mark-all-read' && method === 'PUT') {
    const user = currentUser || db.users[1];
    db.notifications.forEach(n => {
      if (n.user_id === user.id) n.is_read = 1;
    });
    saveDb(db);
    return { success: true };
  }

  if (path.startsWith('/notifications/') && path.endsWith('/read') && method === 'PUT') {
    const id = parseInt(path.split('/')[2]);
    const notif = db.notifications.find(n => n.id === id);
    if (notif) notif.is_read = 1;
    saveDb(db);
    return { success: true };
  }

  if (path.startsWith('/notifications/') && method === 'DELETE') {
    const id = parseInt(path.split('/')[2]);
    db.notifications = db.notifications.filter(n => n.id !== id);
    saveDb(db);
    return { success: true };
  }

  // -------------------------------------------------------------
  // 10. ADMIN ROUTES
  // -------------------------------------------------------------
  if (path === '/admin/overview' && method === 'GET') {
    return {
      success: true,
      stats: {
        usersByRole: [
          { role: 'shopkeeper', count: 2 },
          { role: 'compost_producer', count: 2 },
          { role: 'farmer', count: 2 },
          { role: 'admin', count: 1 }
        ],
        waste: { total_listings: db.waste.length, total_listed_kg: 1410, total_collected_kg: 400 },
        compost: { total_batches: db.batches.length, total_finished_kg: 550 },
        products: { total_products: db.products.length, total_stock: 185 },
        orders: { total_orders: db.orders.length, total_revenue: 1170 },
        pendingComplaints: 0
      }
    };
  }

  if (path === '/admin/users' && method === 'GET') {
    return { success: true, count: db.users.length, users: db.users };
  }

  if (path === '/admin/complaints' && method === 'GET') {
    return { success: true, complaints: [] };
  }

  // Fallback for anything else
  return { success: true, message: 'Simulated response' };
}
