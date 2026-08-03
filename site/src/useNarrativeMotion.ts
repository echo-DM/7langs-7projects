import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useState, type RefObject } from 'react';
gsap.registerPlugin(useGSAP, ScrollTrigger);

export function useNarrativeMotion(rootRef: RefObject<HTMLDivElement | null>) {
  const [activeSection, setActiveSection] = useState('rules');
  useEffect(() => { const sections = [...document.querySelectorAll<HTMLElement>('main section[id]:not(#top)')]; const observer = new IntersectionObserver(entries => { const hit = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio)[0]; if (hit?.target.id) setActiveSection(hit.target.id); }, { rootMargin: '-25% 0px -60%', threshold: [0,.2,.5] }); sections.forEach(s => observer.observe(s)); return () => observer.disconnect(); }, []);
  useGSAP(() => { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; gsap.to('.read-progress i', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: .2 } }); gsap.utils.toArray<HTMLElement>('[data-entrance]').forEach(el => gsap.from(el, { y: 24, opacity: 0, duration: .55, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } })); gsap.from('[data-project-card]', { y: 22, opacity: 0, duration: .5, stagger: .05, ease: 'power3.out', scrollTrigger: { trigger: '.project-grid', start: 'top 85%', once: true } }); if (matchMedia('(min-width: 1024px)').matches) { const steps = gsap.utils.toArray<HTMLElement>('[data-route-step]'); gsap.timeline({ scrollTrigger: { trigger: '.route-layout', start: 'top 12%', end: 'bottom 88%', scrub: .35, pin: '.route-board' } }).to('.route-board', { '--route-fill': '100%', ease: 'none' }).from(steps, { opacity: .28, x: 32, stagger: .3 }, 0); gsap.from('.stamp', { rotate: -24, scale: 1.7, opacity: 0, duration: .45, ease: 'back.out(1.8)', scrollTrigger: { trigger: '.progress-panel', start: 'top 72%', once: true } }); } }, { scope: rootRef });
  return activeSection;
}
