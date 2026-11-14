// ---------------------------------------------------------------
// All website content lives here. Edit this file to update text,
// products, phone numbers or photos — no need to touch components.
// ---------------------------------------------------------------

// Free photos from Unsplash (free for commercial use). Replace any URL
// with your own photo, e.g. '/images/factory.jpg' placed in /public/images.
const u = (id, w = 1600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const PHOTOS = {
  hero: u('1593941707874-ef25b8b4a92b', 1400),      // EV charging close-up
  band: u('1775259928422-779c18e32007', 2000),      // home EV charging + clean energy
  process: u('1532186773960-85649e5cb70b', 2000),   // precision robotic assembly
  cta: u('1518770660439-4636190af475', 2000),       // electronics / circuit board
};

export const CONTACT = {
  tollFree: { label: '080 6985 9776', tel: '08069859776' },
  sales: { label: '+91 97290 82922', tel: '+919729082922' },
  care: { label: '+91 79889 82922', tel: '+917988982922' },
  service: { label: '98967 82922', tel: '+919896782922' },
  email: 'info@litpaxtechnology.com',
  whatsapp: '919729082922',
  address: '72B HSIIDC Industrial Area, Hisar Road, Sirsa – 125055',
  map: 'https://maps.app.goo.gl/36sWwxA22g44bRge8',
  hours: 'Mon–Sat · 9 AM – 7 PM',
  shop: 'https://shop.litpaxtechnology.com',
  facebook: 'https://www.facebook.com/litpaxtechnology',
  instagram: 'https://www.instagram.com/litpax_technology/',
};

export const waLink = (text) =>
  `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;

export const APPLICATIONS = [
  { go: 'ebike', title: 'E-Bike & Scooter', text: 'Lightweight, high-range packs for electric two-wheelers.', chips: ['48V', '60V', '74V'], img: u('1761169331195-e079523673c5', 900) },
  { go: 'erick', title: 'E-Rickshaw', text: 'Heavy-duty LFP packs built for full-day commercial runs.', chips: ['51.2V', '60V'], img: u('1564291886459-a39ad7415125', 900) },
  { go: 'solar', title: 'Solar & Inverter', text: 'Long-life energy storage for homes, shops and industry.', chips: ['12.8V', '25.6V', '51.2V'], img: u('1509391366360-2e959784a276', 900) },
  { title: 'E-Cycle', text: 'Compact packs for electric bicycles and conversions.', chips: ['25.6V', 'Custom'], img: u('1673969206245-7da3eb7cde76', 900) },
  { title: 'Medical', text: 'Safe, stable LFP power for critical medical equipment.', chips: ['LFP', 'Custom'], img: u('1516549655169-df83a0774514', 900) },
  { title: 'Telecom & Portable', text: 'Reliable tower backup, plus portable power packs.', chips: ['48V', 'Portable'], img: u('1557174360-3f4f7c724501', 900) },
];

// Update "On request" values with official specifications.
export const PRODUCTS = [
  { c: 'ebike', t: 'E-Bike', v: '48', n: '48V Lithium Battery', cap: '30Ah', r: 'On request', w: 'On request', ch: 'Li-ion' },
  { c: 'ebike', t: 'E-Bike', v: '60', n: '60V Lithium Battery', cap: '30Ah', r: '125 km+', w: 'On request', ch: 'Li-ion' },
  { c: 'ebike', t: 'E-Bike', v: '74', n: '74V Lithium Battery', cap: 'On request', r: 'On request', w: 'On request', ch: 'Li-ion' },
  { c: 'erick', t: 'E-Rickshaw', v: '51.2', n: '51.2V E-Rickshaw Battery', cap: 'On request', r: 'On request', w: 'On request', ch: 'LFP' },
  { c: 'erick', t: 'E-Rickshaw', v: '60', n: '60V E-Rickshaw Battery', cap: 'On request', r: 'On request', w: 'On request', ch: 'LFP' },
  { c: 'solar', t: 'Solar', v: '12.8', n: '12.8V Inverter Battery', cap: 'On request', r: 'Home backup', w: 'On request', ch: 'LFP' },
  { c: 'solar', t: 'Solar', v: '25.6', n: '25.6V Inverter Battery', cap: 'On request', r: 'Home / Shop', w: 'On request', ch: 'LFP' },
  { c: 'solar', t: 'Solar', v: '51.2', n: '51.2V Inverter Battery', cap: 'On request', r: 'Commercial', w: 'On request', ch: 'LFP' },
];

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

export const STATS = [
  [200, 'Happy clients'],
  [50, 'Expert staff'],
  [20, 'Distributors in India'],
  [20, 'Service centers'],
];
