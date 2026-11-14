'use client'

import { useEffect, useState } from 'react'
import { Bell, CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin, Moon, Settings2, Sun, X } from 'lucide-react'

const initialPrayers = [
  { name: 'Subuh', time: '05:48', iqamah: '06:05' },
  { name: 'Syuruk', time: '07:02', iqamah: '—' },
  { name: 'Zohor', time: '13:08', iqamah: '13:25' },
  { name: 'Asar', time: '16:29', iqamah: '16:45' },
  { name: 'Maghrib', time: '19:12', iqamah: '19:17' },
  { name: 'Isyak', time: '20:24', iqamah: '20:40' },
]
const initialImams = [
  { prayer: 'Subuh', imam: 'Ustaz Ahmad Firdaus' },
  { prayer: 'Zohor', imam: 'Ustaz Muhammad Hakim' },
  { prayer: 'Asar', imam: 'Ustaz Abdul Rahman' },
  { prayer: 'Maghrib', imam: 'Ustaz Ahmad Firdaus' },
  { prayer: 'Isyak', imam: 'Ustaz Muhammad Hakim' },
]
const initialAnnouncements = ['Kuliah Maghrib malam ini bersama Ustaz Ahmad Firdaus', 'Sumbangan tabung Ramadan kini dibuka di pejabat masjid']

export default function Page() {
  const [now, setNow] = useState(new Date())
  const [adminOpen, setAdminOpen] = useState(false)
  const [slide, setSlide] = useState(0)
  const [imams, setImams] = useState(initialImams)
  const [announcements, setAnnouncements] = useState(initialAnnouncements)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    const clock = window.setInterval(() => setNow(new Date()), 1000)
    const carousel = window.setInterval(() => setSlide((current) => (current + 1) % 3), 9000)
    return () => { window.clearInterval(clock); window.clearInterval(carousel) }
  }, [])

  const malaysiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }))
  const dateLabel = new Intl.DateTimeFormat('en-MY', { timeZone: 'Asia/Kuala_Lumpur', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now)
  const hijriParts = new Intl.DateTimeFormat('en-MY-u-ca-islamic-umalqura', { timeZone: 'Asia/Kuala_Lumpur', day: 'numeric', month: 'long', year: 'numeric' }).formatToParts(now)
  const hijriDay = hijriParts.find((part) => part.type === 'day')?.value
  const hijriMonth = hijriParts.find((part) => part.type === 'month')?.value
  const hijriYear = hijriParts.find((part) => part.type === 'year')?.value
  const timeLabel = new Intl.DateTimeFormat('en-MY', { timeZone: 'Asia/Kuala_Lumpur', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now)
  const slides = [
    { eyebrow: 'MASJID AL-HIDAYAH  ·  KUALA LUMPUR', title: 'A place to pause.\nA place to belong.', text: 'May every step towards the masjid bring peace to your heart.', image: '/mosque-dusk.png' },
    { eyebrow: 'ILMU & TARBIAH', title: 'Grow in knowledge.\nGrow in faith.', text: 'Kuliah Maghrib malam ini · Dewan solat utama · 8:00 malam', image: '/mosque-dusk.png' },
    { eyebrow: 'JEMAAH DIUTAMAKAN', title: 'The masjid is\nyour second home.', text: 'Jaga kebersihan, rapatkan saf, dan berikan ruang kepada semua.', image: '/mosque-dusk.png' },
  ]
  const activeSlide = slides[slide]

  return (
    <main className="signage-shell">
      <header className="topbar">
        <div className="brand"><div className="brand-mark"><Moon size={22} strokeWidth={1.6} /></div><div><div className="brand-name">MASJID <span>AL-HIDAYAH</span></div><div className="brand-sub">PUSAT KOMUNITI ISLAM · KUALA LUMPUR</div></div></div>
        <div className="top-right"><div className="location"><MapPin size={14} /> Kuala Lumpur, Malaysia</div><button className="admin-trigger" onClick={() => setAdminOpen(true)}><Settings2 size={15} /> Admin panel</button></div>
      </header>

      <section className="main-grid">
        <aside className="announcement-rail">
          <div className="rail-heading"><span className="live-dot" /><span>MAKLUMAN</span><Bell size={15} /></div>
          <div className="rail-date">{dateLabel}</div>
          <div className="hijri-card"><div className="hijri-label">HARI INI · HIJRI</div><div className="hijri-date">{hijriDay} <span>{hijriMonth}</span></div><div className="hijri-year">{hijriYear} H</div><div className="hijri-divider"/><div className="gregorian-small"><CalendarDays size={14}/><span>{new Intl.DateTimeFormat('en-MY', {timeZone:'Asia/Kuala_Lumpur', day:'numeric', month:'short', year:'numeric'}).format(now)}</span></div></div>
          <div className="announcements"><div className="section-label">PENGUMUMAN <span className="label-line" /></div>
            {announcements.map((item, index) => <article className="announcement" key={`${item}-${index}`}><div className="announcement-index">0{index + 1}</div><p>{item}</p><div className="announcement-time">{index === 0 ? 'HARI INI · 8:00 MALAM' : 'MAKLUMAN UMUM'}</div></article>)}
          </div>
          <div className="rail-footer"><span className="footer-rule"/>SILA SENYAPKAN TELEFON BIMBIT</div>
        </aside>

        <div className="content-column">
          <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(7,28,24,.87) 0%, rgba(7,28,24,.56) 47%, rgba(7,28,24,.08) 100%), url('${activeSlide.image}')` }}>
            <div className="hero-content"><div className="hero-eyebrow"><span className="eyebrow-mark"/>{activeSlide.eyebrow}</div><h1>{activeSlide.title.split('\n').map((line) => <span key={line}>{line}<br/></span>)}</h1><p>{activeSlide.text}</p><button className="hero-cta" onClick={() => setSlide((slide + 1) % slides.length)}>Terokai aktiviti <ChevronRight size={15}/></button></div>
            <div className="slide-controls"><button aria-label="Previous slide" onClick={() => setSlide((slide + slides.length - 1) % slides.length)}><ChevronLeft size={17}/></button><div className="slide-dots">{slides.map((_, index) => <button aria-label={`Go to slide ${index + 1}`} className={slide === index ? 'active' : ''} onClick={() => setSlide(index)} key={index}/>)}</div><button aria-label="Next slide" onClick={() => setSlide((slide + 1) % slides.length)}><ChevronRight size={17}/></button></div>
            <div className="hero-caption">01 — 03 <span/> MASJID AL-HIDAYAH</div>
          </section>

          <section className="imam-panel"><div className="imam-heading"><div><div className="section-label">JADUAL IMAM</div><h2>Imam bertugas hari ini</h2></div><div className="imam-date"><CalendarDays size={14}/>{new Intl.DateTimeFormat('en-MY',{timeZone:'Asia/Kuala_Lumpur',day:'numeric',month:'long'}).format(now)}</div></div>
            <div className="imam-list">{imams.map((item, index) => <div className="imam-row" key={`${item.prayer}-${index}`}><span className="imam-prayer">{item.prayer}</span><span className="imam-dash"/><span className="imam-name">{item.imam}</span><span className="imam-role">IMAM</span></div>)}</div>
          </section>
        </div>
      </section>

      <footer className="prayer-bar"><div className="next-prayer"><div className="next-icon"><Clock3 size={20}/></div><div><div className="next-label">WAKTU SOLAT SETERUSNYA</div><div className="next-name">Maghrib <span>· 00:18:42 lagi</span></div></div></div><div className="prayer-times">{initialPrayers.map((prayer, index) => <div className={`prayer-item ${index === 4 ? 'current' : ''}`} key={prayer.name}><span className="prayer-name">{prayer.name}</span><span className="prayer-time">{prayer.time}</span><span className="iqamah">Iqamah {prayer.iqamah}</span></div>)}</div><div className="digital-clock"><Sun size={16}/><span>{timeLabel}</span><small>MYT</small></div></footer>

      {adminOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setAdminOpen(false) }}><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-title"><div className="modal-header"><div><div className="section-label">PENGURUSAN PAPARAN</div><h2 id="admin-title">Admin panel</h2></div><button className="close-button" aria-label="Close admin panel" onClick={() => setAdminOpen(false)}><X size={18}/></button></div><div className="admin-content"><div className="admin-section"><div className="admin-section-title">Jadual imam hari ini <span>{imams.length} waktu</span></div>{imams.map((item,index)=><label className="edit-row" key={index}><span>{item.prayer}</span><input value={item.imam} onChange={(event)=>setImams(imams.map((row,i)=>i===index?{...row,imam:event.target.value}:row))} aria-label={`Imam for ${item.prayer}`}/></label>)}</div><div className="admin-section"><div className="admin-section-title">Pengumuman <span>{announcements.length} aktif</span></div>{announcements.map((item,index)=><div className="edit-announcement" key={`${item}-${index}`}><span>{item}</span><button onClick={()=>setAnnouncements(announcements.filter((_,i)=>i!==index))} aria-label="Remove announcement"><X size={14}/></button></div>)}<form className="add-announcement" onSubmit={(event)=>{event.preventDefault();if(draft.trim()){setAnnouncements([...announcements,draft.trim()]);setDraft('')}}}><input value={draft} onChange={(event)=>setDraft(event.target.value)} placeholder="Tulis pengumuman baharu..." aria-label="New announcement"/><button type="submit">Tambah</button></form></div><div className="admin-note">Perubahan dipaparkan serta-merta pada skrin ini. Waktu solat mengikut zon Kuala Lumpur.</div></div><button className="save-button" onClick={()=>setAdminOpen(false)}>Selesai</button></section></div>}
    </main>
  )
}
