export type PrayerConfig = {
  name: string
  time: string
  iqamah: string
}

export type ImamConfig = {
  prayer: string
  imam: string
}

export type SlideConfig = {
  eyebrow: string
  title: string
  text: string
  image: string
}

export type SiteConfig = {
  mosqueName: string
  mosqueSubtitle: string
  location: string
  timeZone: string
  locale: string
  hijriLocale: string
  prayers: PrayerConfig[]
  imams: ImamConfig[]
  announcements: string[]
  slides: SlideConfig[]
}

export function isSiteConfig(value: unknown): value is SiteConfig {
  if (!value || typeof value !== 'object') return false
  const config = value as Partial<SiteConfig>
  const isString = (item: unknown) => typeof item === 'string'
  return isString(config.mosqueName)
    && isString(config.mosqueSubtitle)
    && isString(config.location)
    && isString(config.timeZone)
    && isString(config.locale)
    && isString(config.hijriLocale)
    && Array.isArray(config.prayers)
    && config.prayers.length > 0
    && config.prayers.every((item) => item && isString(item.name) && isString(item.time) && isString(item.iqamah))
    && Array.isArray(config.imams)
    && config.imams.every((item) => item && isString(item.prayer) && isString(item.imam))
    && Array.isArray(config.announcements)
    && config.announcements.every(isString)
    && Array.isArray(config.slides)
    && config.slides.length > 0
    && config.slides.every((item) => item && isString(item.eyebrow) && isString(item.title) && isString(item.text) && isString(item.image))
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  mosqueName: 'Masjid Al-Hidayah',
  mosqueSubtitle: 'Pusat Komuniti Islam · Kuala Lumpur',
  location: 'Kuala Lumpur, Malaysia',
  timeZone: 'Asia/Kuala_Lumpur',
  locale: 'en-MY',
  hijriLocale: 'en-MY-u-ca-islamic-umalqura',
  prayers: [
    { name: 'Subuh', time: '05:48', iqamah: '06:05' },
    { name: 'Syuruk', time: '07:02', iqamah: '—' },
    { name: 'Zohor', time: '13:08', iqamah: '13:25' },
    { name: 'Asar', time: '16:29', iqamah: '16:45' },
    { name: 'Maghrib', time: '19:12', iqamah: '19:17' },
    { name: 'Isyak', time: '20:24', iqamah: '20:40' },
  ],
  imams: [
    { prayer: 'Subuh', imam: 'Ustaz Ahmad Firdaus' },
    { prayer: 'Zohor', imam: 'Ustaz Muhammad Hakim' },
    { prayer: 'Asar', imam: 'Ustaz Abdul Rahman' },
    { prayer: 'Maghrib', imam: 'Ustaz Ahmad Firdaus' },
    { prayer: 'Isyak', imam: 'Ustaz Muhammad Hakim' },
  ],
  announcements: [
    'Kuliah Maghrib malam ini bersama Ustaz Ahmad Firdaus',
    'Sumbangan tabung Ramadan kini dibuka di pejabat masjid',
  ],
  slides: [
    {
      eyebrow: 'MASJID AL-HIDAYAH · KUALA LUMPUR',
      title: 'A place to pause.\nA place to belong.',
      text: 'May every step towards the masjid bring peace to your heart.',
      image: '/mosque-dusk.png',
    },
    {
      eyebrow: 'ILMU & TARBIAH',
      title: 'Grow in knowledge.\nGrow in faith.',
      text: 'Kuliah Maghrib malam ini · Dewan solat utama · 8:00 malam',
      image: '/mosque-dusk.png',
    },
    {
      eyebrow: 'JEMAAH DIUTAMAKAN',
      title: 'The masjid is\nyour second home.',
      text: 'Jaga kebersihan, rapatkan saf, dan berikan ruang kepada semua.',
      image: '/mosque-dusk.png',
    },
  ],
}