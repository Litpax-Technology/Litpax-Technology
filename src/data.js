// ---------------------------------------------------------------
// All website content lives here. Edit this file to update text,
// products, phone numbers or photos — no need to touch components.
// ---------------------------------------------------------------

// Photos live in /public/photos (free Unsplash photos, saved with the site so
// they load fast). To use your own, replace the file or change the name here.
const ph = (f) => `${import.meta.env.BASE_URL}photos/${f}`;

export const PHOTOS = {
  hero: ph('ev-charge.jpg'),       // EV charging close-up
  band: ph('ev-home.jpg'),         // home EV charging + solar carport
  process: ph('assembly.jpg'),     // precision robotic assembly
  cta: ph('circuit.jpg'),          // electronics / circuit board
  solar: ph('app-solar.jpg'),      // solar panels
};

export const CONTACT = {
  tollFree: { label: '080 6985 9776', tel: '08069859776' },
  sales: { label: '+91 97290 82922', tel: '+919729082922' },
  care: { label: '+91 79889 82922', tel: '+917988982922' },
  service: { label: '98967 82922', tel: '+919896782922' },
  email: 'info@litpaxtechnology.com',
  whatsapp: '919729082922',
  address: '72B HSIIDC Industrial Area, Hisar Road, Sirsa, Haryana – 125055, India',
  map: 'https://maps.app.goo.gl/36sWwxA22g44bRge8',
  hours: 'Mon–Sat · 9 AM – 7 PM',
  shop: 'https://shop.litpaxtechnology.com',
  facebook: 'https://www.facebook.com/litpaxtechnology',
  instagram: 'https://www.instagram.com/litpax_technology/',
};

export const waLink = (text) =>
  `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;

export const APPLICATIONS = [
  { go: 'ebike', title: 'E-Bike & Scooter', text: 'Lightweight, high-range packs for electric two-wheelers.', chips: ['40V', '48V', '60V', '74V'], img: ph('app-ebike.jpg') },
  { go: 'erick', title: 'E-Rickshaw', text: 'Heavy-duty LFP packs built for full-day commercial runs.', chips: ['51.2V', '60V'], img: ph('app-erick.jpg') },
  { go: 'solar', title: 'Solar & Inverter', text: 'Long-life energy storage for homes, shops and industry.', chips: ['12.8V', '25.6V', '100Ah', '200Ah'], img: ph('app-solar.jpg') },
  { title: 'E-Cycle', text: 'Compact packs for electric bicycles and conversions.', chips: ['25.6V', 'Custom'], img: ph('app-ecycle.jpg') },
  { title: 'Medical', text: 'Safe, stable LFP power for critical medical equipment.', chips: ['LFP', 'Custom'], img: ph('app-medical.jpg') },
  { title: 'Telecom & Portable', text: 'Reliable tower backup, plus portable power packs.', chips: ['48V', 'Portable'], img: ph('app-telecom.jpg') },
];

// Real Litpax product photos (optimised WebP in /public/products).
// pics(key, count) → ['products/key-1', 'products/key-2', …]; components add -sm.webp / -lg.webp
const BASE = import.meta.env.BASE_URL;
// best = the 3/4-angle shot shown first (it shows the battery's depth, not a flat front)
const pics = (key, n, best = 1) =>
  [best, ...Array.from({ length: n }, (_, i) => i + 1).filter((i) => i !== best)].map((i) => `${BASE}products/${key}-${i}`);

// Update "On request" values with official specifications.
export const PRODUCTS = [
  { c: 'ebike', t: 'E-Bike / Scooter', v: '40', n: '40V 23Ah Lithium Battery', cap: '23Ah', r: 'On request', w: 'On request', ch: 'Li-ion', img: pics('40v23ah', 3, 3) },
  { c: 'ebike', t: 'E-Bike / Scooter', v: '48', n: '48V 27Ah Lithium Battery', cap: '27Ah', r: 'On request', w: 'On request', ch: 'Li-ion', img: pics('48v27ah', 9, 3) },
  { c: 'ebike', t: 'E-Bike / Scooter', v: '60', n: '60V 27Ah Lithium Battery', cap: '27Ah', r: 'On request', w: 'On request', ch: 'Li-ion', img: pics('60v27ah', 5, 3) },
  { c: 'ebike', t: 'E-Bike / Scooter', v: '60', n: '60V 32Ah Lithium Battery', cap: '32Ah', r: 'On request', w: 'On request', ch: 'Li-ion', img: pics('60v32ah', 5, 3) },
  { c: 'ebike', t: 'E-Bike / Scooter', v: '60', n: '60V 36Ah Lithium Battery', cap: '36Ah', r: 'On request', w: 'On request', ch: 'Li-ion', img: pics('60v36ah', 2, 2) },
  { c: 'ebike', t: 'E-Bike / Scooter', v: '74', n: '74V 27Ah Lithium Battery', cap: '27Ah', r: 'On request', w: 'On request', ch: 'Li-ion', img: pics('74v27ah', 4, 2) },
  { c: 'erick', t: 'E-Rickshaw', v: '51.2', n: '51.2V E-Rickshaw Battery', cap: 'On request', r: 'On request', w: 'On request', ch: 'LFP' },
  { c: 'erick', t: 'E-Rickshaw', v: '60', n: '60V E-Rickshaw Battery', cap: 'On request', r: 'On request', w: 'On request', ch: 'LFP' },
  { c: 'solar', t: 'Inverter / Solar', v: '12.8', n: '12.8V 100Ah Power Pack', cap: '100Ah', r: 'Home backup', w: 'On request', ch: 'Lithium', img: pics('12_8v100ah', 5, 2) },
  { c: 'solar', t: 'Inverter / Solar', v: '12.8', n: '12.8V 200Ah Power Pack', cap: '200Ah', r: 'Home backup', w: 'On request', ch: 'Lithium', img: pics('12_8v200ah', 3, 3) },
  { c: 'solar', t: 'Inverter / Solar', v: '25.6', n: '25.6V 100Ah Power Pack', cap: '100Ah', r: 'Home / Shop', w: 'On request', ch: 'Lithium', img: pics('25_6v100ah', 3, 1) },
  { c: 'solar', t: 'Inverter / Solar', v: '25.6', n: '25.6V 200Ah Power Pack', cap: '200Ah', r: 'Home / Shop', w: 'On request', ch: 'Lithium', img: pics('25_6v200ah', 3, 3) },
  { c: 'solar', t: 'Inverter / Solar', v: '51.2', n: '51.2V Inverter Battery', cap: 'On request', r: 'Commercial', w: 'On request', ch: 'Lithium' },
];
// All product photos have a transparent background (AI cut-out) with a soft contact shadow
export const HERO_PRODUCT = `${BASE}products/60v32ah-3-lg.webp`;
// Hero line-up: front EV pack + two inverter packs behind it
export const HERO_LINEUP = {
  front: HERO_PRODUCT,
  left: `${BASE}products/12_8v200ah-3-lg.webp`,
  right: `${BASE}products/25_6v100ah-1-lg.webp`,
};

export const FILTERS = [
  { f: 'all', label: 'All' },
  { f: 'ebike', label: 'E-Bike' },
  { f: 'erick', label: 'E-Rickshaw' },
  { f: 'solar', label: 'Solar' },
];

export const STEPS = [
  ['Cell selection', 'Grade-A Li-ion & LFP cells, matched and sorted.'],
  ['Smart BMS integration', 'Protection against over-charge, deep discharge & short circuit.'],
  ['Precision assembly', 'Pack welding and assembly in our Sirsa facility.'],
  ['Quality testing', 'Load, capacity and safety tests under ISO 9001:2015 processes.'],
];

export const WHY = [
  ['In-house manufacturing', 'A well-equipped production and testing line in Sirsa, Haryana.'],
  ['Smart BMS protection', 'Built-in safety against over-charge, deep discharge and short circuit.'],
  ['Custom solutions', 'Voltage, capacity and form factor engineered to your requirement.'],
  ['Pan-India service', '20 distributors and 20 service centers for fast, local support.'],
  ['Strong warranty', 'Comprehensive warranty with dedicated after-sales care.'],
  ['Dealer friendly', 'Competitive pricing and flexible bulk ordering options.'],
];

export const COMPARE = [
  ['Maintenance', 'Zero', 'Water topping'],
  ['Weight', 'Much lighter', 'Heavy'],
  ['Charging', 'Fast', '8–10 hours'],
  ['Life', 'Several times longer', 'Frequent replacement'],
  ['Usable capacity', 'Near full', '~50%'],
  ['Environment', 'No acid, no fumes', 'Acid & lead'],
];

export const REVIEWS = [
  ['Kiara', 'E-scooter owner', 'I bought a 60V 30Ah battery and the range is 125 km+ on a single charge.'],
  ['Aakil', 'Customer', 'Good experience with great services and quality products.'],
  ['Dhruv', 'Customer', 'Quality product and also great service support.'],
];

export const FAQ = [
  ['What is the difference between Li-ion and LFP batteries?', 'LFP (Lithium Iron Phosphate) is a lithium chemistry known for high thermal stability and long cycle life, which makes it ideal for e-rickshaws, solar storage and medical use. Li-ion (NMC) packs are lighter for the same energy, making them a great fit for e-bikes and scooters.'],
  ['How long does a lithium battery last compared with lead-acid?', 'Lithium batteries typically last several times longer than lead-acid and need no water topping. Actual life depends on usage, charging habits and temperature — our team will share the expected cycle life for your pack.'],
  ['Can Litpax build a custom battery pack?', 'Yes. We engineer packs to your voltage, capacity and size requirements. Share your specs on WhatsApp or through the quote form below.'],
  ['Which battery is right for my vehicle or home?', 'Use the Battery Finder above for a quick estimate, then talk to our team for the exact recommendation.'],
  ['Where can I get service support?', 'Litpax has 20 service centers and 20 distributors across India, plus a dedicated service line: +91 98967 82922.'],
  ['Do you offer dealership opportunities?', 'Yes — we are growing our distributor network across India. Tap "Apply for dealership" to get in touch with our sales team.'],
];

// Side navigation dots (id must match a section id)
export const SECTIONS = [
  ['top', 'Home'],
  ['applications', 'Applications'],
  ['process', 'Process'],
  ['products', 'Products'],
  ['finder', 'Battery Finder'],
  ['why', 'Why Litpax'],
  ['faq', 'FAQ'],
  ['contact', 'Contact'],
];

export const STATS = [
  [200, 'Happy clients'],
  [50, 'Expert staff'],
  [20, 'Distributors in India'],
  [20, 'Service centers'],
];

// Brands that use Litpax packs. Logos in /public/brands/ are the real logos with
// a transparent background; white lettering was turned graphite so every logo
// reads on the light tiles (brand colours are kept).
export const BRANDS = [
  { name: 'Zelio', logo: `${BASE}brands/zelio.png` },
  { name: 'Yakuza', logo: `${BASE}brands/yakuza.png` },
  { name: 'Warivo', logo: `${BASE}brands/warivo.png` },
  { name: 'Evey', logo: `${BASE}brands/evey.png` },
  { name: 'Worzo', logo: `${BASE}brands/worzo.png` },
  { name: 'Urban eBikes', logo: `${BASE}brands/urban-ebikes.png` },
];

// Certificates. Put a scan/photo in /public/certificates/ and set img to show a
// "View certificate" button. Edit the text to match each certificate exactly.
export const CERTS = [
  { name: 'ISO 9001:2015', by: 'Quality Management System', note: 'Certified manufacturing and testing processes.', img: null },
  { name: 'IndiaMART', by: 'IndiaMART certificate', note: 'Certificate issued by IndiaMART, the B2B marketplace.', img: null },
  { name: 'ESCPL', by: 'ESCPL certificate', note: 'Certificate issued by ESCPL.', img: null },
];

// Google Maps embed for the factory (uses the address above)
export const MAP_EMBED = `https://www.google.com/maps?q=${encodeURIComponent('Litpax Technology, ' + CONTACT.address)}&output=embed`;
