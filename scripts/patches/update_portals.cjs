const fs = require('fs');
let content = fs.readFileSync('src/lib/portals.ts', 'utf-8');

content = content.replace(
  /{ id: 'lentera-diy', name: 'Lentera DIY' },/g,
  `{ id: 'lentera-jogja', name: 'Lentera Jogja' },`
);

content = content.replace(
  /  { id: 'lentera-papuabarat', name: 'Lentera Papua Barat' },\n  { id: 'lentera-papuaselatan', name: 'Lentera Papua Selatan' },\n  { id: 'lentera-papuatengah', name: 'Lentera Papua Tengah' },\n  { id: 'lentera-papuapegunungan', name: 'Lentera Papua Pegunungan' },\n  { id: 'lentera-papuabaratdaya', name: 'Lentera Papua Barat Daya' }\n/g,
  ''
);

// Fallback if the above doesn't work perfectly:
const newLenteraNetworks = `export const lenteraNetworks = [
  { id: 'lentera', name: 'Lentera.id' },
  { id: 'lentera-aceh', name: 'Lentera Aceh' },
  { id: 'lentera-sumut', name: 'Lentera Sumut' },
  { id: 'lentera-sumbar', name: 'Lentera Sumbar' },
  { id: 'lentera-riau', name: 'Lentera Riau' },
  { id: 'lentera-kepri', name: 'Lentera Kepri' },
  { id: 'lentera-jambi', name: 'Lentera Jambi' },
  { id: 'lentera-sumsel', name: 'Lentera Sumsel' },
  { id: 'lentera-babel', name: 'Lentera Babel' },
  { id: 'lentera-bengkulu', name: 'Lentera Bengkulu' },
  { id: 'lentera-lampung', name: 'Lentera Lampung' },
  { id: 'lentera-jakarta', name: 'Lentera DKI Jakarta' },
  { id: 'lentera-jabar', name: 'Lentera Jabar' },
  { id: 'lentera-jateng', name: 'Lentera Jateng' },
  { id: 'lentera-jogja', name: 'Lentera Jogja' },
  { id: 'lentera-jatim', name: 'Lentera Jatim' },
  { id: 'lentera-banten', name: 'Lentera Banten' },
  { id: 'lentera-bali', name: 'Lentera Bali' },
  { id: 'lentera-ntb', name: 'Lentera NTB' },
  { id: 'lentera-ntt', name: 'Lentera NTT' },
  { id: 'lentera-kalbar', name: 'Lentera Kalbar' },
  { id: 'lentera-kalteng', name: 'Lentera Kalteng' },
  { id: 'lentera-kalsel', name: 'Lentera Kalsel' },
  { id: 'lentera-kaltim', name: 'Lentera Kaltim' },
  { id: 'lentera-kaltara', name: 'Lentera Kaltara' },
  { id: 'lentera-sulut', name: 'Lentera Sulut' },
  { id: 'lentera-gorontalo', name: 'Lentera Gorontalo' },
  { id: 'lentera-sulteng', name: 'Lentera Sulteng' },
  { id: 'lentera-sulbar', name: 'Lentera Sulbar' },
  { id: 'lentera-sulsel', name: 'Lentera Sulsel' },
  { id: 'lentera-sultra', name: 'Lentera Sultra' },
  { id: 'lentera-maluku', name: 'Lentera Maluku' },
  { id: 'lentera-malut', name: 'Lentera Malut' },
  { id: 'lentera-papua', name: 'Lentera Papua' }
];`;

content = content.replace(/export const lenteraNetworks = \[[^]*?\];/, newLenteraNetworks);

fs.writeFileSync('src/lib/portals.ts', content);
