/**
 * Utility functions for Gregorian to Hijri date conversion and formatting.
 */

export const HIJRI_MONTHS = [
  'Muharram',
  'Safar',
  'Rabiul Awal',
  'Rabiul Akhir',
  'Jumadil Awal',
  'Jumadil Akhir',
  'Rajab',
  'Sya’ban',
  'Ramadhan',
  'Syawal',
  'Dzulqaidah',
  'Dzulhijjah'
];

/**
 * Converts a Gregorian Date object to Hijri date string.
 */
export function getHijriDate(date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return formatter.format(date);
  } catch (e) {
    const jd = gregorianToJD(date.getFullYear(), date.getMonth() + 1, date.getDate());
    return jdToHijriString(jd);
  }
}

function gregorianToJD(year: number, month: number, day: number): number {
  if (month < 3) {
    year -= 1;
    month += 12;
  }
  const a = Math.floor(year / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
}

function jdToHijriString(jd: number): string {
  const l = Math.floor(jd - 1948440 + 10632);
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor(50 * l2 / 17719) + Math.floor(l2 / 5670) * Math.floor(43 * l2 / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor(17719 * j / 50) - Math.floor(j / 16) * Math.floor(15238 * j / 43) + 29;
  const month = Math.floor(24 * l3 / 709);
  const day = l3 - Math.floor(709 * month / 24);
  const year = Math.floor(30 * n + j - 30);
  
  const monthName = HIJRI_MONTHS[(month - 1 + 12) % 12] || 'Muharram';
  return `${day} ${monthName} ${year} H`;
}
