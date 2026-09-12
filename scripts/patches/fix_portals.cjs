const fs = require('fs');
let content = fs.readFileSync('src/lib/portals.ts', 'utf-8');

const newLenteraNetworks = `export const lenteraNetworks = [
  { id: 'lenteraid', name: 'Lentera.id' },
  { id: 'lenteraaceh', name: 'Lentera Aceh' },
  { id: 'lenterasumut', name: 'Lentera Sumut' },
  { id: 'lenterasumbar', name: 'Lentera Sumbar' },
  { id: 'lenterariau', name: 'Lentera Riau' },
  { id: 'lenterakepri', name: 'Lentera Kepri' },
  { id: 'lenterajambi', name: 'Lentera Jambi' },
  { id: 'lenterasumsel', name: 'Lentera Sumsel' },
  { id: 'lenterababel', name: 'Lentera Babel' },
  { id: 'lenterabengkulu', name: 'Lentera Bengkulu' },
  { id: 'lenteralampung', name: 'Lentera Lampung' },
  { id: 'lenterajakarta', name: 'Lentera DKI Jakarta' },
  { id: 'lenterajabar', name: 'Lentera Jabar' },
  { id: 'lenterajateng', name: 'Lentera Jateng' },
  { id: 'lenterajogja', name: 'Lentera Jogja' },
  { id: 'lenterajatim', name: 'Lentera Jatim' },
  { id: 'lenterabanten', name: 'Lentera Banten' },
  { id: 'lenterabali', name: 'Lentera Bali' },
  { id: 'lenterantb', name: 'Lentera NTB' },
  { id: 'lenterantt', name: 'Lentera NTT' },
  { id: 'lenterakalbar', name: 'Lentera Kalbar' },
  { id: 'lenterakalteng', name: 'Lentera Kalteng' },
  { id: 'lenterakalsel', name: 'Lentera Kalsel' },
  { id: 'lenterakaltim', name: 'Lentera Kaltim' },
  { id: 'lenterakaltara', name: 'Lentera Kaltara' },
  { id: 'lenterasulut', name: 'Lentera Sulut' },
  { id: 'lenteragorontalo', name: 'Lentera Gorontalo' },
  { id: 'lenterasulteng', name: 'Lentera Sulteng' },
  { id: 'lenterasulbar', name: 'Lentera Sulbar' },
  { id: 'lenterasulsel', name: 'Lentera Sulsel' },
  { id: 'lenterasultra', name: 'Lentera Sultra' },
  { id: 'lenteramaluku', name: 'Lentera Maluku' },
  { id: 'lenteramalut', name: 'Lentera Malut' },
  { id: 'lenterapapua', name: 'Lentera Papua' }
];`;

content = content.replace(/export const lenteraNetworks = \[[^]*?\];/, newLenteraNetworks);
fs.writeFileSync('src/lib/portals.ts', content);
