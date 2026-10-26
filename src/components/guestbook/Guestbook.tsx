'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Heart, Paperclip, PenLine, ArrowUpRight } from 'lucide-react';
import styles from './Guestbook.module.css';
const API=process.env.NEXT_PUBLIC_GUESTBOOK_API_URL || 'https://wayaairon-guestbook.zhouzhouyuyu.chatgpt.site/api';
const TOKEN_KEY='wenyu-guestbook-visitor';
type Note={id:string;nickname:string;body:string;reply:string|null;created_at:number;replied_at:number|null;likes:number};
type Stats={likes:number;notes:number};
let tokenPromise:Promise<string>|null=null;
let memoryToken:string|null=null;
function storedToken(){try{return localStorage.getItem(TOKEN_KEY)||memoryToken}catch{return memoryToken}}
function clearExpiredToken(error:unknown){if((error as Error & {status?:number}).status===401){memoryToken=null;try{localStorage.removeItem(TOKEN_KEY)}catch{}}}
async function request<T>(path:string,options:RequestInit={},token?:string):Promise<T>{
 const r=await fetch(API+path,{...options,headers:{...(options.body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{}),...options.headers}});
 const d=await r.json();if(!r.ok){const error=new Error(d.error||'Something went wrong. Please try again.') as Error & {status:number};error.status=r.status;throw error;}return d as T;
}
async function visitorToken(){const saved=storedToken();if(saved)return saved;if(!tokenPromise)tokenPromise=request<{token:string}>('/session',{method:'POST'}).then(d=>{memoryToken=d.token;try{localStorage.setItem(TOKEN_KEY,d.token)}catch{}return d.token}).finally(()=>{tokenPromise=null});return tokenPromise}
const date=(value:number)=>new Date(value).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
// Match the selected “彩色碎光” preview; the canvas exists only during a new like.
function launchLikeFireworks(anchor: HTMLElement) {
 const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
 if (motion.matches) return;
 const canvas = document.createElement('canvas');
 const ctx = canvas.getContext('2d');
 if (!ctx) return;
 canvas.className = styles.fireworkCanvas;
 canvas.setAttribute('aria-hidden', 'true');
 canvas.dataset.likeFireworks = '';
 const width = window.innerWidth, height = window.innerHeight;
 const dpr = Math.min(window.devicePixelRatio || 1, 2);
 canvas.width = Math.round(width * dpr);
 canvas.height = Math.round(height * dpr);
 ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
 const box = anchor.getBoundingClientRect();
 const x = box.left + box.width / 2, y = box.top + box.height / 2;
 const palette = document.documentElement.classList.contains('dark')
  ? ['#f7a9c5', '#9dd3ed', '#efd18b'] : ['#ca7191', '#6f9fc1', '#c5a05b'];
 const born = performance.now(), radius = 88;
 type Particle = {x:number;y:number;born:number;life:number;angle:number;distance:number;fall:number;size:number;color:string};
 const particles: Particle[] = [];
 const rings: {x:number;y:number;born:number;color:string}[] = [];
 for (let b = 0; b < 2; b++) {
  const bx = x + (b ? 18 : 0), by = y - (b ? 18 : 0), delay = b * 105;
  rings.push({x:bx,y:by,born:born+delay,color:palette[0]});
  for (let i = 0; i < 36; i++) {
   const angle = i / 36 * Math.PI * 2 + (Math.random() - .5) * .12;
   const fall = Math.min(radius * .42, Math.max(0, height - by - 12));
   const dx = Math.cos(angle), dy = Math.sin(angle);
   const horizontal = (dx > 0 ? width - bx - 8 : bx - 8) / Math.max(Math.abs(dx), .001);
   const vertical = (dy > 0 ? height - by - fall - 8 : by - 8) / Math.max(Math.abs(dy), .001);
   const distance = Math.max(4, Math.min(radius * (.58 + Math.random() * .5) * (b ? .72 : 1), horizontal, vertical));
   particles.push({x:bx,y:by,born:born+delay,life:1050*(.76+Math.random()*.24),angle,distance,fall,size:1.25+Math.random()*.55,color:palette[i%3]});
  }
 }
 function position(p: Particle, t: number) {
  const spread = 1 - Math.exp(-4.8 * t);
  return {x:p.x+Math.cos(p.angle)*p.distance*spread,y:p.y+Math.sin(p.angle)*p.distance*spread+p.fall*t*t};
 }
 let frame = 0, stopped = false;
 function cleanup() {
  if (stopped) return;
  stopped = true;
  cancelAnimationFrame(frame);
  canvas.remove();
  window.removeEventListener('resize', cleanup);
  window.removeEventListener('scroll', cleanup, true);
  motion.removeEventListener('change', cleanup);
 }
 function draw(now: number) {
  if (!ctx || stopped) return;
  ctx.clearRect(0, 0, width, height);
  let active = false;
  for (const r of rings) {
   const t = (now - r.born) / 250;
   if (t >= 1) continue;
   active = true;
   if (t < 0) continue;
   ctx.globalAlpha = (1-t)*.24;
   ctx.strokeStyle = r.color; ctx.lineWidth = .8;
   ctx.beginPath(); ctx.arc(r.x,r.y,5+t*21,0,Math.PI*2); ctx.stroke();
  }
  for (const p of particles) {
   const t = (now - p.born) / p.life;
   if (t >= 1) continue;
   active = true;
   if (t < 0) continue;
   const point = position(p,t), tail = position(p,Math.max(0,t-.04));
   const opacity = Math.min(t*12,1)*Math.pow(1-t,1.1);
   ctx.globalAlpha = opacity; ctx.strokeStyle = p.color; ctx.fillStyle = p.color;
   ctx.lineCap = 'round'; ctx.lineWidth = p.size;
   ctx.shadowColor = p.color; ctx.shadowBlur = 2.5;
   ctx.beginPath(); ctx.moveTo(tail.x,tail.y); ctx.lineTo(point.x,point.y); ctx.stroke();
   ctx.shadowBlur = 0; ctx.globalAlpha = opacity*.8;
   ctx.beginPath(); ctx.arc(point.x,point.y,p.size*.65,0,Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  if (active) frame = requestAnimationFrame(draw); else cleanup();
 }
 document.body.appendChild(canvas);
 window.addEventListener('resize', cleanup);
 window.addEventListener('scroll', cleanup, true);
 motion.addEventListener('change', cleanup);
 frame = requestAnimationFrame(draw);
 return cleanup;
}
function LikeHeart({liked,burst}:{liked:boolean;burst:number}) {
 const heartRef = useRef<HTMLSpanElement>(null);
 useEffect(() => {
  if (liked && burst > 0 && heartRef.current) return launchLikeFireworks(heartRef.current);
 }, [liked, burst]);
 return <span ref={heartRef} className={styles.heartWrap} aria-hidden="true">
  <Heart size={16} strokeWidth={1.7} fill={liked?'currentColor':'none'}/>
 </span>;
}

export function SiteLikeButton(){const[count,setCount]=useState<number|null>(null),[liked,setLiked]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[burst,setBurst]=useState(0);
 useEffect(()=>{let live=true;request<Stats>('/stats').then(d=>{if(live)setCount(d.likes)}).catch(()=>{});const token=storedToken();if(token)request<{liked:string[]}>('/mine',{},token).then(d=>{if(live)setLiked(d.liked.includes('site'))}).catch(clearExpiredToken);return()=>{live=false}},[]);
 async function toggle(){if(busy)return;setBusy(true);setError('');try{const d=await request<{likes:number;liked:boolean}>('/likes',{method:'PUT',body:JSON.stringify({target:'site',liked:!liked})},await visitorToken());setCount(d.likes);setLiked(d.liked);setBurst(v=>d.liked?v+1:0)}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 return <div className={styles.siteLikeWrap}><button type="button" className={styles.siteLike} aria-pressed={liked} disabled={busy} onClick={toggle}><LikeHeart liked={liked} burst={burst}/><span>{liked?'Thanks for the love':'Like this space'}</span><span className={styles.count}>{count===null?'—':count}</span></button>{error&&<p className={styles.likeError} role="status">{error}</p>}</div>
}
export default function Guestbook(){const[notes,setNotes]=useState<Note[]>([]),[next,setNext]=useState<number|null>(null),[liked,setLiked]=useState<Set<string>>(new Set()),[loading,setLoading]=useState(true),[loadError,setLoadError]=useState(''),[nickname,setNickname]=useState(''),[body,setBody]=useState(''),[website,setWebsite]=useState(''),[sending,setSending]=useState(false),[notice,setNotice]=useState(''),[sendError,setSendError]=useState(''),[busyIds,setBusyIds]=useState<Set<string>>(new Set()),[moreBusy,setMoreBusy]=useState(false),[noteBursts,setNoteBursts]=useState<Record<string,number>>({});const formRef=useRef<HTMLFormElement>(null);
 const load=useCallback(async()=>{setLoading(true);setLoadError('');try{const d=await request<{notes:Note[];next:number|null}>('/notes');setNotes(d.notes);setNext(d.next)}catch(e){setLoadError((e as Error).message)}finally{setLoading(false)}},[]);
 useEffect(()=>{load();const token=storedToken();if(token)request<{liked:string[]}>('/mine',{},token).then(d=>setLiked(new Set(d.liked))).catch(clearExpiredToken);try{setNickname(localStorage.getItem('wenyu-guestbook-nickname')||'')}catch{}},[load]);
 async function submit(e:React.FormEvent){e.preventDefault();if(sending)return;setSending(true);setSendError('');setNotice('');try{await request('/notes',{method:'POST',body:JSON.stringify({nickname,body,website})},await visitorToken());try{localStorage.setItem('wenyu-guestbook-nickname',nickname.trim())}catch{}setBody('');setNotice('Your note is safely tucked away for review. It will appear here once approved. Thank you!')}catch(e){setSendError((e as Error).message)}finally{setSending(false)}}
 async function like(note:Note){if(busyIds.has(note.id))return;setBusyIds(v=>new Set(v).add(note.id));setLoadError('');try{const d=await request<{likes:number;liked:boolean}>('/likes',{method:'PUT',body:JSON.stringify({target:note.id,liked:!liked.has(note.id)})},await visitorToken());setNotes(v=>v.map(n=>n.id===note.id?{...n,likes:d.likes}:n));setNoteBursts(v=>({...v,[note.id]:d.liked?(v[note.id]||0)+1:0}));setLiked(v=>{const s=new Set(v);if(d.liked)s.add(note.id);else s.delete(note.id);return s})}catch(e){setLoadError((e as Error).message)}finally{setBusyIds(v=>{const s=new Set(v);s.delete(note.id);return s})}}
 async function more(){setMoreBusy(true);try{const d=await request<{notes:Note[];next:number|null}>('/notes?before='+next);setNotes(v=>[...v,...d.notes.filter(n=>!v.some(x=>x.id===n.id))]);setNext(d.next)}catch(e){setLoadError((e as Error).message)}finally{setMoreBusy(false)}}
 return <div className={styles.page}><header className={styles.heading}><div><p className={styles.eyebrow}>A LITTLE SPACE FOR GOOD COMPANY</p><h1>Guestbook</h1><p className={styles.intro}>A thought, a question, or a little hello — leave it on a note.</p></div><SiteLikeButton/></header>
 <form ref={formRef} onSubmit={submit} className={styles.compose}><div className={styles.composeTitle}><PenLine size={18}/><h2>Leave a note</h2></div><div className={styles.formGrid}><label>Nickname<input required maxLength={32} autoComplete="nickname" placeholder="What should I call you?" value={nickname} onChange={e=>setNickname(e.target.value)}/></label><label className={styles.messageField}>Your note<textarea required maxLength={1000} rows={3} placeholder="Say hello, share a thought, or leave a little encouragement…" value={body} onChange={e=>setBody(e.target.value)}/></label></div><div className={styles.trap} aria-hidden="true"><label>Leave this field empty<input tabIndex={-1} autoComplete="off" value={website} onChange={e=>setWebsite(e.target.value)}/></label></div><footer className={styles.composeFooter}><p>No login needed. Notes appear after review.</p><button type="submit" className={styles.submit} disabled={sending||!nickname.trim()||!body.trim()}>{sending?'Sending…':'Send for review'}<ArrowUpRight size={16}/></button></footer>{notice&&<p className={styles.success} role="status">{notice}</p>}{sendError&&<p className={styles.error} role="alert">{sendError}</p>}</form>
 <section className={styles.wall} aria-labelledby="notes-heading"><div className={styles.wallHeading}><h2 id="notes-heading">Notes from visitors</h2><span>Read, smile, leave a little love.</span></div>{loadError&&<div className={styles.error} role="alert">{loadError} <button type="button" onClick={load}>Try again</button></div>}{loading?<p className={styles.empty} role="status">Gathering the notes…</p>:notes.length===0&&!loadError?<div className={styles.empty}><Paperclip size={24}/><h3>The first page is still blank.</h3><p>Be the first to leave a little hello.</p><button type="button" onClick={()=>{formRef.current?.scrollIntoView({behavior:'smooth',block:'center'});formRef.current?.querySelector('input')?.focus()}}>Write the first note</button></div>:<div className={styles.grid}>{notes.map(n=><article className={styles.note} key={n.id}><span className={styles.paperclip} aria-hidden="true"/><header className={styles.noteHeader}><h3>{n.nickname}</h3><time dateTime={new Date(n.created_at).toISOString()}>{date(n.created_at)}</time></header><p className={styles.message}>{n.body}</p>{n.reply&&<div className={styles.reply}><span>↳ Wenyu <span className={styles.author}>Author</span></span><p>{n.reply}</p></div>}<footer className={styles.noteFooter}><span>a little note, kept here</span><button type="button" disabled={busyIds.has(n.id)} aria-label={`Like ${n.nickname}’s note`} aria-pressed={liked.has(n.id)} onClick={()=>like(n)}><LikeHeart liked={liked.has(n.id)} burst={noteBursts[n.id]||0}/><span>{n.likes}</span></button></footer></article>)}</div>}{next&&<button className={styles.more} type="button" disabled={moreBusy} onClick={more}>{moreBusy?'Loading…':'Read more notes'}</button>}</section>
 <footer className={styles.pageFooter}><span>Made for kind words & curious minds.</span><a href="https://wayaairon-guestbook.zhouzhouyuyu.chatgpt.site/admin" target="_blank" rel="noopener noreferrer">Owner management ↗</a></footer></div>
}
