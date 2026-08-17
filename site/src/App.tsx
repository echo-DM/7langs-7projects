import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { projects, type Project } from './projects';
import { useNarrativeMotion } from './useNarrativeMotion';

const REPOSITORY_URL = 'https://github.com/echo-DM/7langs-7projects';
const VIDEO_URL = 'https://www.bilibili.com/video/BV1fj346iEhy/';
const statusLabels: Record<Project['status'], string> = {
  completed: 'COMPLETE',
  'in-progress': 'IN PROGRESS',
  planned: 'PLANNED',
};
const currentProject = projects.find((project) => project.status === 'in-progress')
  ?? projects.find((project) => project.status === 'completed')
  ?? projects[0];
const completedProjectCount = projects.filter((project) => project.status === 'completed').length;
const inProgressProjectCount = projects.filter((project) => project.status === 'in-progress').length;
const progressPercentage = (completedProjectCount / projects.length) * 100;

function routeStatusLabel(status: Project['status']) {
  return status === 'planned' ? 'LOCKED' : statusLabels[status];
}

function cardStatusLabel(status: Project['status']) {
  return status === 'planned' ? 'TO UNLOCK' : statusLabels[status];
}

function languageStyle(project: Project) {
  return { '--language-accent': project.accent } as CSSProperties;
}

const navItems = [
  { id: 'rules', label: '挑战规则' }, { id: 'route', label: '30 天路线' },
  { id: 'projects', label: '项目档案' }, { id: 'progress', label: '当前进度' },
] as const;

function Icon({ name }: { readonly name: 'arrow' | 'github' | 'play' | 'menu' | 'close' }) {
  if (name === 'github') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.7a9.5 9.5 0 0 0-3 18.52c.48.08.65-.2.65-.46v-1.84c-2.66.58-3.22-1.13-3.22-1.13-.43-1.1-1.06-1.4-1.06-1.4-.87-.59.07-.58.07-.58.96.07 1.47.99 1.47.99.85 1.47 2.24 1.04 2.79.8.09-.62.33-1.04.61-1.28-2.12-.24-4.35-1.06-4.35-4.7 0-1.04.37-1.89.98-2.56-.1-.24-.43-1.21.09-2.52 0 0 .8-.26 2.61.98A9.08 9.08 0 0 1 12 7.2c.81 0 1.61.11 2.37.32 1.81-1.23 2.61-.98 2.61-.98.52 1.31.19 2.28.09 2.52.61.67.98 1.52.98 2.56 0 3.65-2.24 4.46-4.37 4.7.34.3.65.88.65 1.78v2.66c0 .26.17.55.66.46A9.5 9.5 0 0 0 12 2.7Z" /></svg>;
  if (name === 'play') return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 5 8 5-8 5V5Z" /></svg>;
  if (name === 'menu') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 17h16" /></svg>;
  if (name === 'close') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19" /></svg>;
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h13M11 5l5 5-5 5" /></svg>;
}

function Header({ activeSection }: { readonly activeSection: string }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (!open) return;
    firstLinkRef.current?.focus();
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); buttonRef.current?.focus(); } };
    document.body.classList.add('menu-open'); addEventListener('keydown', close);
    return () => { document.body.classList.remove('menu-open'); removeEventListener('keydown', close); };
  }, [open]);
  return <header className="site-header">
    <div className="read-progress" aria-hidden="true"><i /></div>
    <a className="brand" href="#top" aria-label="返回页面顶部"><b>7L/7P</b><span>30 DAY<br />FIELD MANUAL</span></a>
    <nav id="main-navigation" className={open ? 'site-nav is-open' : 'site-nav'} aria-label="主导航">
      {navItems.map((item, i) => <a key={item.id} ref={i === 0 ? firstLinkRef : undefined} href={`#${item.id}`} className={activeSection === item.id ? 'is-active' : ''} onClick={() => setOpen(false)}><span>0{i + 1}</span>{item.label}</a>)}
      <a className="nav-repo" href={REPOSITORY_URL} target="_blank" rel="noreferrer"><Icon name="github" /> GitHub<span className="sr-only">（在新窗口打开）</span></a>
    </nav>
    <button ref={buttonRef} className="menu-button" type="button" aria-expanded={open} aria-controls="main-navigation" aria-label={open ? '关闭导航菜单' : '打开导航菜单'} onClick={() => setOpen(!open)}><Icon name={open ? 'close' : 'menu'} /></button>
  </header>;
}

function Hero() {
  return <section className="hero" id="top">
    <div className="hero-number" aria-hidden="true">30</div>
    <div className="hero-copy" data-entrance><p className="kicker">CHALLENGE FILE № 001 · {String(completedProjectCount).padStart(2, '0')} / {String(projects.length).padStart(2, '0')} COMPLETE · {String(inProgressProjectCount).padStart(2, '0')} IN PROGRESS</p><h1>30 天，挑战 7 种语言，完成 7 个 AI 项目</h1><p className="hero-lead">不是课程清单，是一场有截止日期的工程实战。每种语言负责一个项目，每个项目解决一个真实的 AI 工程问题。</p><div className="hero-actions"><a className="button primary" href="#route">查看挑战路线 <Icon name="arrow" /></a><a className="text-link" href={REPOSITORY_URL} target="_blank" rel="noreferrer">GitHub ↗</a></div></div>
    <div className="formula" aria-label="30 天，7 种语言，7 个 AI 项目"><b>30 DAYS</b><span>×</span><b>7 LANGUAGES</b><span>×</span><b>7 AI PROJECTS</b></div>
    <div className="language-matrix" aria-label="七种编程语言及项目状态">{projects.map((p) => <div className={`language-chip ${p.status}`} style={languageStyle(p)} key={p.id}><span className="language-order">{p.order}</span><small>{statusLabels[p.status]}</small><strong>{p.shortLanguage}</strong><b>{p.language}</b></div>)}</div>
  </section>;
}

function Rules() {
  const rules = [{ n: '01', title: '30 天封顶', text: '从 Day 01 到 Day 30，按固定路线推进，不无限延期。' }, { n: '02', title: '一语言一项目', text: '用项目检验语言，而不是停留在语法练习。' }, { n: '03', title: '只做 AI 工程', text: 'Token、评估、Agent、路由、恢复与推理全部落到可运行系统。' }];
  return <section className="section" id="rules"><SectionHead no="01" tag="RULES OF ENGAGEMENT" title="挑战规则，写在开工之前。" /><div className="rules-grid">{rules.map(r => <article data-entrance key={r.n}><span>{r.n}</span><h3>{r.title}</h3><p>{r.text}</p></article>)}</div></section>;
}

function SectionHead({ no, tag, title, text }: { no: string; tag: string; title: string; text?: string }) { return <div className="section-head" data-entrance><div><span>{no} / 04</span><b>{tag}</b></div><h2>{title}</h2>{text && <p>{text}</p>}</div>; }

function Route() { return <section className="section route" id="route"><SectionHead no="02" tag="30-DAY ROUTE" title="七站路线，从可观察性走到推理底层。" text="时间表是静态作战计划；完成状态只认仓库里的真实结果。" /><div className="route-layout"><aside className="route-board" style={{ ...languageStyle(currentProject), '--route-fill': `${progressPercentage}%` } as CSSProperties}><span>CURRENT MISSION</span><strong>{currentProject.order}</strong><b className="route-board-language"><span>{currentProject.shortLanguage}</span>{currentProject.language}</b><i>{statusLabels[currentProject.status]}</i></aside><ol className="route-list">{projects.map(p => <li key={p.id} data-route-step className={p.status} style={languageStyle(p)}><span className="route-day">{p.dayRange}</span><div><small>MISSION {p.order}</small><div className="route-language"><b>{p.shortLanguage}</b><strong>{p.language}</strong></div><h3>{p.title}</h3><p>{p.challenge}</p></div><b className="route-status">{routeStatusLabel(p.status)}</b></li>)}</ol></div></section>; }

function ProjectCard({ project }: { readonly project: Project }) { const body = <><div className="card-top"><span>FILE {project.order}</span><b>{cardStatusLabel(project.status)}</b></div><div className="card-language"><strong>{project.shortLanguage}</strong><div><small>LANGUAGE / {project.order}</small><b>{project.language}</b></div></div><div className="card-project"><small>{project.dayRange}</small><h3>{project.title}</h3></div><p>{project.description}</p><div className="challenge"><span>CHALLENGE OBJECTIVE</span>{project.challenge}</div><ul>{project.focus.map(x => <li key={x}>{x}</li>)}</ul>{project.repository && <span className="open-project">打开项目 <Icon name="arrow" /></span>}</>;
  return project.repository ? <a className={`project-card ${project.status}`} style={languageStyle(project)} data-project-card href={project.repository} target="_blank" rel="noreferrer" aria-label={`查看 ${project.language} 项目 ${project.title}（在新窗口打开）`}>{body}</a> : <article className={`project-card ${project.status}`} style={languageStyle(project)} data-project-card>{body}</article>; }

function Projects() { return <section className="section" id="projects"><SectionHead no="03" tag="PROJECT DOSSIERS" title="七份项目档案，一条完整能力链。" text="语言选择、项目目标与工程重点统一记录；尚未完成的项目不提前宣告成果。" /><div className="project-grid">{projects.map(p => <ProjectCard key={p.id} project={p} />)}</div></section>; }

function Progress() { const remainingProjectCount = projects.length - completedProjectCount - inProgressProjectCount; return <section className="section progress" id="progress"><SectionHead no="04" tag="PROGRESS REPORT" title="当前战况：第二站进行中。" /><div className="progress-panel" data-entrance><div className="progress-count"><strong>{String(completedProjectCount).padStart(2, '0')}</strong><span>/ {String(projects.length).padStart(2, '0')}<br />COMPLETE</span></div><div className="progress-copy"><div className="current-language" style={languageStyle(currentProject)}><strong>{currentProject.shortLanguage}</strong><span><small>CURRENT PROJECT</small><b>{currentProject.title}</b></span></div><p>{currentProject.title} 正在进行中。TokenLens 已完成，其余 {remainingProjectCount} 个项目仍处于待解锁状态。</p><div className="progress-bar" aria-label={`挑战进度：${projects.length} 个项目中完成 ${completedProjectCount} 个`}><i style={{ width: `${progressPercentage}%` }} /></div><small>{progressPercentage.toFixed(1)}% COMPLETE · STATUS BASED ON REAL OUTPUT</small></div><div className="stamp">IN<br />PROGRESS</div></div></section>; }

function Closing() { return <section className="closing"><span>DAY 01 → DAY 30</span><h2>路线已经画好。<br />现在，继续构建。</h2><p>在 GitHub 查看挑战仓库，或在 Bilibili 跟随完整记录。</p><div><a className="button primary" href={REPOSITORY_URL} target="_blank" rel="noreferrer"><Icon name="github" />查看挑战仓库</a><a className="button secondary" href={VIDEO_URL} target="_blank" rel="noreferrer"><Icon name="play" />观看 Bilibili</a></div></section>; }

export default function App() { const rootRef = useRef<HTMLDivElement>(null); const active = useNarrativeMotion(rootRef); return <div className="site-shell" ref={rootRef}><a className="skip-link" href="#main">跳到主要内容</a><Header activeSection={active} /><main id="main"><Hero /><Rules /><Route /><Projects /><Progress /><Closing /></main><footer><span>7 LANGS / 7 PROJECTS</span><span>30 DAY AI ENGINEERING CHALLENGE</span><span>© {new Date().getFullYear()} ECHODM</span></footer></div>; }
