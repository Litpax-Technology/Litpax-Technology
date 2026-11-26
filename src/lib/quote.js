// Quote list: a local shortlist of batteries the visitor wants a price for.
// Nothing is ordered or paid here; the list is sent to Litpax on WhatsApp.
import { waLink } from '../data.js';

const KEY = 'litpax-quote-v1';
const listeners = new Set();

const load = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(raw)
      ? raw.filter((e) => e && typeof e.name === 'string' && typeof e.qty === 'string').map((e) => (String(e.img || '').startsWith('blob:') ? { ...e, img: '' } : e)).slice(0, 40)
      : [];
  } catch { return []; }
};
let items = load();
const save = () => {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  listeners.forEach((fn) => fn(items));
};

export const quote = {
  get items() { return items; },
  get count() { return items.length; },
  has: (name) => items.some((e) => e.name === name),
  add(entry) {
    const i = items.findIndex((e) => e.name === entry.name);
    if (i >= 0) items = items.map((e, k) => (k === i ? { ...e, qty: entry.qty } : e));
    else items = [...items, { name: entry.name, qty: entry.qty, img: entry.img || '', type: entry.type || '' }];
    save();
  },
  remove(name) { items = items.filter((e) => e.name !== name); save(); },
  clear() { items = []; save(); },
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  open() { dispatchEvent(new CustomEvent('litpax:quote-open')); },
  whatsapp() {
    const lines = items.map((e) => `• ${e.name} × ${e.qty}`).join('\n');
    return waLink(`Hi Litpax, please share a quote for:\n${lines}`);
  },
};
