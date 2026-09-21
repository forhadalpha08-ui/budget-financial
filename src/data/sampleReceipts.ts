// Helper to create realistic SVG receipt data URLs for sample testing
function createReceiptDataUrl(title: string, address: string, date: string, items: Array<{ name: string; qty: number; price: string }>, subtotal: string, tax: string, total: string, card: string): string {
  const itemRows = items
    .map(
      (it, idx) => `
      <text x="24" y="${180 + idx * 28}" font-family="monospace" font-size="13" fill="#1f2937">${it.qty}x ${it.name}</text>
      <text x="356" y="${180 + idx * 28}" font-family="monospace" font-size="13" text-anchor="end" fill="#111827">${it.price}</text>
    `
    )
    .join('');

  const height = 280 + items.length * 28 + 120;
  const startTotals = 180 + items.length * 28 + 20;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="380" height="${height}" viewBox="0 0 380 ${height}">
    <rect width="100%" height="100%" fill="#fafaf9"/>
    <rect x="12" y="12" width="356" height="${height - 24}" rx="6" fill="#ffffff" stroke="#e5e7eb" stroke-width="2"/>
    
    <!-- Header -->
    <text x="190" y="52" font-family="system-ui, sans-serif" font-weight="700" font-size="18" text-anchor="middle" fill="#111827">${title.toUpperCase()}</text>
    <text x="190" y="74" font-family="monospace" font-size="11" text-anchor="middle" fill="#6b7280">${address}</text>
    <text x="190" y="92" font-family="monospace" font-size="11" text-anchor="middle" fill="#6b7280">Date: ${date} 14:32</text>
    <text x="190" y="110" font-family="monospace" font-size="11" text-anchor="middle" fill="#9ca3af">Order #TX-892401</text>
    
    <!-- Divider -->
    <line x1="24" y1="130" x2="356" y2="130" stroke="#9ca3af" stroke-width="1.5" stroke-dasharray="4 3"/>
    <text x="24" y="152" font-family="monospace" font-size="11" font-weight="bold" fill="#4b5563">ITEM</text>
    <text x="356" y="152" font-family="monospace" font-size="11" font-weight="bold" text-anchor="end" fill="#4b5563">PRICE</text>
    <line x1="24" y1="162" x2="356" y2="162" stroke="#e5e7eb" stroke-width="1"/>

    <!-- Items -->
    ${itemRows}

    <!-- Divider -->
    <line x1="24" y1="${startTotals}" x2="356" y2="${startTotals}" stroke="#9ca3af" stroke-width="1.5" stroke-dasharray="4 3"/>
    
    <!-- Totals -->
    <text x="24" y="${startTotals + 28}" font-family="monospace" font-size="12" fill="#4b5563">Subtotal</text>
    <text x="356" y="${startTotals + 28}" font-family="monospace" font-size="12" text-anchor="end" fill="#111827">${subtotal}</text>
    
    <text x="24" y="${startTotals + 48}" font-family="monospace" font-size="12" fill="#4b5563">Sales Tax (8.25%)</text>
    <text x="356" y="${startTotals + 48}" font-family="monospace" font-size="12" text-anchor="end" fill="#111827">${tax}</text>
    
    <line x1="24" y1="${startTotals + 60}" x2="356" y2="${startTotals + 60}" stroke="#111827" stroke-width="1.5"/>
    
    <text x="24" y="${startTotals + 84}" font-family="monospace" font-weight="bold" font-size="16" fill="#111827">TOTAL DUE</text>
    <text x="356" y="${startTotals + 84}" font-family="monospace" font-weight="bold" font-size="16" text-anchor="end" fill="#111827">${total}</text>
    
    <text x="190" y="${startTotals + 115}" font-family="monospace" font-size="11" text-anchor="middle" fill="#6b7280">PAID VIA ${card}</text>
    <text x="190" y="${startTotals + 132}" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle" fill="#059669" font-weight="600">THANK YOU FOR YOUR VISIT!</text>
  </svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export interface SampleReceipt {
  id: string;
  title: string;
  category: string;
  total: number;
  date: string;
  merchant: string;
  dataUrl: string;
  description: string;
}

export const SAMPLE_RECEIPTS: SampleReceipt[] = [
  {
    id: 'sample-grocery',
    title: "Whole Foods Market",
    category: "Groceries",
    total: 58.42,
    date: '2026-09-18',
    merchant: "Whole Foods Market",
    description: "Weekly organic produce, dairy, bakery items and kombucha",
    dataUrl: createReceiptDataUrl(
      "Whole Foods Market",
      "399 4th St, San Francisco, CA",
      "2026-09-18",
      [
        { name: "Organic Honeycrisp Apples (2lb)", qty: 1, price: "$5.98" },
        { name: "Organic Whole Milk 1gal", qty: 1, price: "$6.49" },
        { name: "Artisan Sourdough Boule", qty: 1, price: "$7.25" },
        { name: "Pasture Raised Eggs Dozen", qty: 1, price: "$6.99" },
        { name: "Baby Spinach 16oz Clamshell", qty: 1, price: "$4.99" },
        { name: "Organic Rolled Oats 32oz", qty: 1, price: "$5.49" },
        { name: "Avocado Hass 4-Pack", qty: 1, price: "$5.99" },
        { name: "GT's Synergy Kombucha 16oz", qty: 2, price: "$7.98" },
        { name: "Dark Roast Coffee Beans 12oz", qty: 1, price: "$7.26" },
      ],
      "$54.42",
      "$4.00",
      "$58.42",
      "VISA **** 4821"
    ),
  },
  {
    id: 'sample-cafe',
    title: "Blue Bottle Coffee",
    category: "Dining Out",
    total: 24.35,
    date: '2026-09-20',
    merchant: "Blue Bottle Coffee",
    description: "Espresso drinks, matcha latte, and fresh almond pastry",
    dataUrl: createReceiptDataUrl(
      "Blue Bottle Coffee",
      "315 Linden St, San Francisco, CA",
      "2026-09-20",
      [
        { name: "Single Origin Cortado", qty: 1, price: "$5.75" },
        { name: "Iced Oat Milk Latte", qty: 1, price: "$6.75" },
        { name: "Kyoto Cold Brew 12oz", qty: 1, price: "$6.00" },
        { name: "Almond Croissant", qty: 1, price: "$4.50" },
      ],
      "$23.00",
      "$1.35",
      "$24.35",
      "APPLE PAY **** 9102"
    ),
  },
  {
    id: 'sample-supplies',
    title: "Office Depot & Tech",
    category: "Shopping",
    total: 89.20,
    date: '2026-09-15',
    merchant: "Office Depot",
    description: "USB-C braided cables, ergonomics mouse pad, notebook pack",
    dataUrl: createReceiptDataUrl(
      "Office Depot",
      "1233 Market St, San Francisco, CA",
      "2026-09-15",
      [
        { name: "60W Braided USB-C Cable (2pk)", qty: 1, price: "$24.99" },
        { name: "Ergonomic Gel Mouse Pad", qty: 1, price: "$18.50" },
        { name: "Moleskine Grid Journal (L)", qty: 2, price: "$34.00" },
        { name: "Gel Ink Rollerball Pens (5pk)", qty: 1, price: "$6.99" },
      ],
      "$84.48",
      "$4.72",
      "$89.20",
      "MASTERCARD **** 3319"
    ),
  },
];
