'use client'

import { useEffect, useState } from 'react'
import { Bell, CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin, Moon, Settings2, Sun, X } from 'lucide-react'
import { useSiteConfig } from '@/lib/use-site-config'

export default function Page() {
  const [now, setNow] = useState(() => new Date(0))
  const [adminOpen, setAdminOpen] = useState(false)
  const [adminToken, setAdminToken] = useState('')
  const [adminKeyDraft, setAdminKeyDraft] = useState('')
  const [adminError, setAdminError] = useState('')
  const [slide, setSlide] = useState(0)
  const { config, setConfig, ready, saveStatus } = useSiteConfig(adminToken)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    setNow(new Date())
    const clock = window.setInterval(() => setNow(new Date()), 1000)
    const carousel = window.setInterval(() => setSlide((current) => (current + 1) % config.slides.length), 9000)
    return () => { window.clearInterval(clock); window.clearInterval(carousel) }
  }, [config.slides.length])

  const dateLabel = new Intl.DateTimeFormat(config.locale, { timeZone: config.timeZone, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now)
  const hijriParts = new Intl.DateTimeFormat(config.hijriLocale, { timeZone: config.timeZone, day: 'numeric', month: 'long', year: 'numeric' }).formatToParts(now)
  const hijriDay = hijriParts.find((part) => part.type === 'day')?.value
  const hijriMonth = hijriParts.find((part) => part.type === 'month')?.value
  const hijriYear = hijriParts.find((part) => part.type === 'year')?.value
  const timeLabel = new Intl.DateTimeFormat(config.locale, { timeZone: config.timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now)
  const clockParts = new Intl.DateTimeFormat('en-GB', { timeZone: config.timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(now)
  const currentSeconds = Number(clockParts.find((part) => part.type === 'hour')?.value ?? 0) * 3600
    + Number(clockParts.find((part) => part.type === 'minute')?.value ?? 0) * 60
    + Number(clockParts.find((part) => part.type === 'second')?.value ?? 0)
  const nextPrayerIndex = config.prayers.findIndex((prayer) => {
    const [hour, minute] = prayer.time.split(':').map(Number)
    return hour * 3600 + minute * 60 > currentSeconds
  })
  const nextPrayer = config.prayers[nextPrayerIndex < 0 ? 0 : nextPrayerIndex]
  let secondsUntilPrayer = nextPrayer.time.split(':').map(Number).reduce((seconds, value, index) => seconds + value * (index === 0 ? 3600 : 60), 0) - currentSeconds
  if (secondsUntilPrayer <= 0) secondsUntilPrayer += 86400
  const countdown = `${String(Math.floor(secondsUntilPrayer / 3600)).padStart(2, '0')}:${String(Math.floor(secondsUntilPrayer % 3600 / 60)).padStart(2, '0')}:${String(secondsUntilPrayer % 60).padStart(2, '0')}`
  const currentPrayerIndex = nextPrayerIndex < 0 ? config.prayers.length - 1 : (nextPrayerIndex + config.prayers.length - 1) % config.prayers.length
  const timeZoneLabel = new Intl.DateTimeFormat(config.locale, { timeZone: config.timeZone, timeZoneName: 'short' }).formatToParts(now).find((part) => part.type === 'timeZoneName')?.value
  const slides = config.slides
  const activeSlide = slides[slide]
  const updateConfig = <K extends keyof typeof config>(key: K, value: (typeof config)[K]) => {
    setConfig((current) => ({ ...current, [key]: value }))
  }

  async function unlockAdmin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAdminError('')
    try {
      const response = await fetch('/api/site-config', {
        method: 'POST',
        headers: { 'x-admin-token': adminKeyDraft },
      })
      if (!response.ok) throw new Error('Invalid admin key')
      setAdminToken(adminKeyDraft)
      setAdminKeyDraft('')
    } catch {
      setAdminError('Admin key is invalid or not configured')
    }
  }

  useEffect(() => {
    if (slide >= slides.length) setSlide(0)
  }, [slide, slides.length])

  return (
    <main className="signage-shell">
      <header className="topbar">
        <div className="brand"><div className="brand-mark"><Moon size={22} strokeWidth={1.6} /></div><div><div className="brand-name">{config.mosqueName}</div><div className="brand-sub">{config.mosqueSubtitle}</div></div></div>
        <div className="top-right"><div className="location"><MapPin size={14} /> {config.location}</div><button className="admin-trigger" onClick={() => setAdminOpen(true)}><Settings2 size={15} /> Admin panel</button></div>
      </header>

      <section className="main-grid">
        <aside className="announcement-rail">
          <div className="rail-heading"><span className="live-dot" /><span>MAKLUMAN</span><Bell size={15} /></div>
          <div className="rail-date">{dateLabel}</div>
          <div className="hijri-card"><div className="hijri-label">HARI INI · HIJRI</div><div className="hijri-date">{hijriDay} <span>{hijriMonth}</span></div><div className="hijri-year">{hijriYear} H</div><div className="hijri-divider"/><div className="gregorian-small"><CalendarDays size={14}/><span>{new Intl.DateTimeFormat(config.locale, {timeZone:config.timeZone, day:'numeric', month:'short', year:'numeric'}).format(now)}</span></div></div>
          <div className="announcements"><div className="section-label">PENGUMUMAN <span className="label-line" /></div>
            {config.announcements.map((item, index) => <article className="announcement" key={`${item}-${index}`}><div className="announcement-index">0{index + 1}</div><p>{item}</p><div className="announcement-time">{index === 0 ? 'HARI INI · 8:00 MALAM' : 'MAKLUMAN UMUM'}</div></article>)}
          </div>
          <div className="rail-footer"><span className="footer-rule"/>SILA SENYAPKAN TELEFON BIMBIT</div>
        </aside>

        <div className="content-column">
          <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(7,28,24,.87) 0%, rgba(7,28,24,.56) 47%, rgba(7,28,24,.08) 100%), url('${activeSlide.image}')` }}>
            <div className="hero-content"><div className="hero-eyebrow"><span className="eyebrow-mark"/>{activeSlide.eyebrow}</div><h1>{activeSlide.title.split('\n').map((line) => <span key={line}>{line}<br/></span>)}</h1><p>{activeSlide.text}</p><button className="hero-cta" onClick={() => setSlide((slide + 1) % slides.length)}>Terokai aktiviti <ChevronRight size={15}/></button></div>
            <div className="slide-controls"><button aria-label="Previous slide" onClick={() => setSlide((slide + slides.length - 1) % slides.length)}><ChevronLeft size={17}/></button><div className="slide-dots">{slides.map((_, index) => <button aria-label={`Go to slide ${index + 1}`} className={slide === index ? 'active' : ''} onClick={() => setSlide(index)} key={index}/>)}</div><button aria-label="Next slide" onClick={() => setSlide((slide + 1) % slides.length)}><ChevronRight size={17}/></button></div>
            <div className="hero-caption">{String(slide + 1).padStart(2, '0')} — {String(slides.length).padStart(2, '0')} <span/> {config.mosqueName}</div>
          </section>

          <section className="imam-panel"><div className="imam-heading"><div><div className="section-label">JADUAL IMAM</div><h2>Imam bertugas hari ini</h2></div><div className="imam-date"><CalendarDays size={14}/>{new Intl.DateTimeFormat(config.locale,{timeZone:config.timeZone,day:'numeric',month:'long'}).format(now)}</div></div>
            <div className="imam-list">{config.imams.map((item, index) => <div className="imam-row" key={`${item.prayer}-${index}`}><span className="imam-prayer">{item.prayer}</span><span className="imam-dash"/><span className="imam-name">{item.imam}</span><span className="imam-role">IMAM</span></div>)}</div>
          </section>
        </div>
      </section>

      <footer className="prayer-bar"><div className="next-prayer"><div className="next-icon"><Clock3 size={20}/></div><div><div className="next-label">WAKTU SOLAT SETERUSNYA</div><div className="next-name">{nextPrayer.name} <span>· {countdown} lagi</span></div></div></div><div className="prayer-times">{config.prayers.map((prayer, index) => <div className={`prayer-item ${index === currentPrayerIndex ? 'current' : ''}`} key={prayer.name}><span className="prayer-name">{prayer.name}</span><span className="prayer-time">{prayer.time}</span><span className="iqamah">Iqamah {prayer.iqamah}</span></div>)}</div><div className="digital-clock"><Sun size={16}/><span>{timeLabel}</span><small>{timeZoneLabel}</small></div></footer>

      {adminOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setAdminOpen(false) }}>
        <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-title">
          <div className="modal-header">
            <div><div className="section-label">PENGURUSAN PAPARAN</div><h2 id="admin-title">Admin panel</h2></div>
            <button className="close-button" aria-label="Close admin panel" onClick={() => setAdminOpen(false)}><X size={18}/></button>
          </div>
          {!adminToken ? <form className="admin-content" onSubmit={unlockAdmin}>
            <label className="edit-row"><span>Admin key</span><input type="password" autoComplete="current-password" value={adminKeyDraft} onChange={(event) => setAdminKeyDraft(event.target.value)} required /></label>
            {adminError && <div className="admin-note" role="alert">{adminError}</div>}
            <button className="save-button" type="submit">Unlock editing</button>
          </form> : <>
            <div className="admin-content">
              <div className="admin-section">
                <div className="admin-section-title">Mosque details</div>
                <label className="edit-row"><span>Name</span><input value={config.mosqueName} onChange={(event) => updateConfig('mosqueName', event.target.value)} /></label>
                <label className="edit-row"><span>Subtitle</span><input value={config.mosqueSubtitle} onChange={(event) => updateConfig('mosqueSubtitle', event.target.value)} /></label>
                <label className="edit-row"><span>Location</span><input value={config.location} onChange={(event) => updateConfig('location', event.target.value)} /></label>
              </div>
              <div className="admin-section">
                <div className="admin-section-title">Prayer times <span>{config.prayers.length} times</span></div>
                {config.prayers.map((prayer, index) => <label className="edit-row" key={`${prayer.name}-${index}`} style={{ gridTemplateColumns: '80px 1fr 1fr' }}>
                  <span>{prayer.name}</span>
                  <input type="time" aria-label={`${prayer.name} prayer time`} value={prayer.time} onChange={(event) => updateConfig('prayers', config.prayers.map((row, rowIndex) => rowIndex === index ? { ...row, time: event.target.value } : row))} />
                  <input type="time" aria-label={`${prayer.name} iqamah time`} value={prayer.iqamah === '—' ? '' : prayer.iqamah} onChange={(event) => updateConfig('prayers', config.prayers.map((row, rowIndex) => rowIndex === index ? { ...row, iqamah: event.target.value || '—' } : row))} />
                </label>)}
              </div>
              <div className="admin-section">
                <div className="admin-section-title">Imam schedule <span>{config.imams.length} times</span></div>
                {config.imams.map((item, index) => <label className="edit-row" key={`${item.prayer}-${index}`}><span>{item.prayer}</span><input value={item.imam} onChange={(event) => updateConfig('imams', config.imams.map((row, rowIndex) => rowIndex === index ? { ...row, imam: event.target.value } : row))} aria-label={`Imam for ${item.prayer}`} /></label>)}
              </div>
              <div className="admin-section">
                <div className="admin-section-title">Announcements <span>{config.announcements.length} active</span></div>
                {config.announcements.map((item, index) => <div className="edit-announcement" key={`${item}-${index}`}><span>{item}</span><button onClick={() => updateConfig('announcements', config.announcements.filter((_, rowIndex) => rowIndex !== index))} aria-label="Remove announcement"><X size={14}/></button></div>)}
                <form className="add-announcement" onSubmit={(event) => { event.preventDefault(); if (draft.trim()) { updateConfig('announcements', [...config.announcements, draft.trim()]); setDraft('') } }}>
                  <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Tulis pengumuman baharu..." aria-label="New announcement" />
                  <button type="submit">Tambah</button>
                </form>
              </div>
              <div className="admin-section">
                <div className="admin-section-title">Slideshow <span>{config.slides.length} slides</span></div>
                {config.slides.map((item, index) => <div key={`slide-${index}`}>
                  <label className="edit-row"><span>Slide {index + 1} eyebrow</span><input value={item.eyebrow} onChange={(event) => updateConfig('slides', config.slides.map((row, rowIndex) => rowIndex === index ? { ...row, eyebrow: event.target.value } : row))} /></label>
                  <label className="edit-row"><span>Slide {index + 1} title</span><input value={item.title} onChange={(event) => updateConfig('slides', config.slides.map((row, rowIndex) => rowIndex === index ? { ...row, title: event.target.value } : row))} /></label>
                  <label className="edit-row"><span>Slide {index + 1} text</span><input value={item.text} onChange={(event) => updateConfig('slides', config.slides.map((row, rowIndex) => rowIndex === index ? { ...row, text: event.target.value } : row))} /></label>
                  <label className="edit-row"><span>Slide {index + 1} image</span><input value={item.image} onChange={(event) => updateConfig('slides', config.slides.map((row, rowIndex) => rowIndex === index ? { ...row, image: event.target.value } : row))} /></label>
                </div>)}
              </div>
              <div className="admin-note" role="status">{ready ? saveStatus : 'Loading settings…'} · edits sync automatically</div>
            </div>
            <div className="admin-actions"><button className="save-button" onClick={() => setAdminOpen(false)}>Done</button><button className="save-button" onClick={() => setAdminToken('')}>Lock panel</button></div>
          </>}
        </section>
      </div>}
    </main>
  )
}
