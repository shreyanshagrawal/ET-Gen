import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import { initLandingAnimations } from './landingAnimations';

export default function LandingPage() {
  useEffect(() => {
    // Slight delay to ensure DOM nodes are ready and GSAP is loaded
    const timer = setTimeout(() => {
      initLandingAnimations();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="landing-page-container">
      {/* TARGET CURSOR */}
<div id="target-cursor-wrapper">
  <div id="target-cursor-dot"></div>
  <div className="target-cursor-corner corner-tl"></div>
  <div className="target-cursor-corner corner-tr"></div>
  <div className="target-cursor-corner corner-br"></div>
  <div className="target-cursor-corner corner-bl"></div>
</div>

{/* NAVBAR */}
<nav id="nav">
  <a href="#" className="logo cursor-target">Axi<em>om</em></a>
  <ul className="nav-links">
    <li><a href="#features" className="cursor-target">Platform</a></li>
    <li><a href="#how" className="cursor-target">Process</a></li>
    <li><a href="#roles" className="cursor-target">Roles</a></li>
    <li><a href="#performance" className="cursor-target">Insights</a></li>
  </ul>
  <div className="nav-actions">
    <a href="/signup" className="btn-nav-ghost cursor-target">Login</a>
    <a href="/signup" className="btn-nav cursor-target">Register</a>
  </div>
</nav>

{/* HERO */}
<section id="hero">
  <div className="hero-rays-container" id="hero-rays-container"></div>
  <div className="hero-atmosphere"></div>
  <div className="hero-rule-left"></div>
  <div className="hero-rule-right"></div>
  {/* Vertical nav links aligned to left rule */}
  <nav className="hero-nav r">
    <a href="#features" className="cursor-target">Platform</a>
    <a href="#how" className="cursor-target">Process</a>
    <a href="#roles" className="cursor-target">Roles</a>
    <a href="#performance" className="cursor-target">Insights</a>
  </nav>
  <div className="hero-content">
    <span className="hero-overline r">Enterprise AI Project Management</span>
    <h1 aria-label="Orchestrate. Execute. Deliver Brilliance.">
      <span className="blur-h1-line"><span className="blur-text-wrap" data-blur-text="Orchestrate." data-delay="0"></span></span>
      <span className="blur-h1-line"><span className="blur-text-wrap" data-blur-text="Execute." data-delay="120" style={{fontStyle: 'italic', color: 'var(--lavender-soft)'}}></span></span>
      <span className="blur-h1-line"><span className="blur-text-wrap" data-blur-text="Deliver Brilliance." data-delay="240"></span></span>
    </h1>
    <p className="hero-body r d2">AXIOM transforms enterprise project management with autonomous intelligence that plans, assigns, reviews, and scores — so your teams ship faster and smarter.</p>
    <div className="hero-actions r d3">
      <a href="/signup" className="btn-primary cursor-target">Start Free Trial</a>
      <a href="#how" className="btn-ghost cursor-target">See How It Works</a>
    </div>
  </div>
  <div className="hero-figures">
    <div className="hfig r"><span className="hfig-num"><span className="counter" data-target="500">0</span><em>+</em></span><span className="hfig-label">Projects Managed</span></div>
    <div className="hfig-sep"></div>
    <div className="hfig r d1"><span className="hfig-num"><span className="counter" data-target="98">0</span><em>%</em></span><span className="hfig-label">Delivery Rate</span></div>
    <div className="hfig-sep"></div>
    <div className="hfig r d2"><span className="hfig-num"><span className="counter" data-target="50">0</span><em>k+</em></span><span className="hfig-label">Tasks Automated</span></div>
    <div className="hfig-sep"></div>
    <div className="hfig r d3"><span className="hfig-num"><span className="counter" data-target="200">0</span><em>+</em></span><span className="hfig-label">Enterprise Teams</span></div>
  </div>
  <div className="scroll-cue">
    <span className="scroll-cue-text">Scroll</span>
    <div className="scroll-track"><div className="scroll-fill"></div></div>
  </div>
</section>

{/* TICKER */}
<div id="ticker">
  <div className="ticker-inner">
    <div className="ticker-track" aria-hidden="true">
      <span className="tick-item">AI Task Generation <span className="tick-sep">·</span></span>
      <span className="tick-item">Smart Assignment <span className="tick-sep">·</span></span>
      <span className="tick-item">Code Review Engine <span className="tick-sep">·</span></span>
      <span className="tick-item">Performance Scoring <span className="tick-sep">·</span></span>
      <span className="tick-item">Kanban Boards <span className="tick-sep">·</span></span>
      <span className="tick-item">Gantt Charts <span className="tick-sep">·</span></span>
      <span className="tick-item">Role-Based Access <span className="tick-sep">·</span></span>
      <span className="tick-item">Version Tracking <span className="tick-sep">·</span></span>
      <span className="tick-item">AI Task Generation <span className="tick-sep">·</span></span>
      <span className="tick-item">Smart Assignment <span className="tick-sep">·</span></span>
      <span className="tick-item">Code Review Engine <span className="tick-sep">·</span></span>
      <span className="tick-item">Performance Scoring <span className="tick-sep">·</span></span>
      <span className="tick-item">Kanban Boards <span className="tick-sep">·</span></span>
      <span className="tick-item">Gantt Charts <span className="tick-sep">·</span></span>
      <span className="tick-item">Role-Based Access <span className="tick-sep">·</span></span>
      <span className="tick-item">Version Tracking <span className="tick-sep">·</span></span>
    </div>
  </div>
</div>

{/* FEATURES */}
<section id="features">
  <div className="feat-intro">
    <span className="sec-label r">Platform Capabilities</span>
    <h2 className="r d1">Everything your enterprise<br /><em>needs to ship</em></h2>
    <p className="sec-sub r d2">Six interconnected pillars of intelligence — from AI workflow creation to intelligent performance evaluation.</p>
  </div>
  <div className="feat-grid r d2">
    <div className="feat-cell cursor-target"><span className="fc-index">01</span><div className="fc-title">AI Task Flow Generation</div><div className="fc-desc">Automatically deconstructs project requirements into Epics, Tasks, and Subtasks with inferred dependencies and smart timelines.</div><div className="fc-tags"><span className="fc-tag">epics</span><span className="fc-tag">tasks</span><span className="fc-tag">dependencies</span><span className="fc-tag">timelines</span></div></div>
    <div className="feat-cell cursor-target"><span className="fc-index">02</span><div className="fc-title">Smart Task Assignment</div><div className="fc-desc">AI analyses roles, skill profiles, and current workloads to assign tasks optimally across teams. Manual override always available.</div><div className="fc-tags"><span className="fc-tag">role-match</span><span className="fc-tag">workload</span><span className="fc-tag">override</span></div></div>
    <div className="feat-cell cursor-target"><span className="fc-index">03</span><div className="fc-title">Real-Time Task Tracking</div><div className="fc-desc">Kanban boards and Gantt charts update live. Status flows from Pending through Review to Completion with full audit trails.</div><div className="fc-tags"><span className="fc-tag">kanban</span><span className="fc-tag">gantt</span><span className="fc-tag">audit</span></div></div>
    <div className="feat-cell cursor-target"><span className="fc-index">04</span><div className="fc-title">AI Code Review Engine</div><div className="fc-desc">Submit code, files, or URLs for instant AI feedback — bug detection, quality analysis, optimisation suggestions and inline reports.</div><div className="fc-tags"><span className="fc-tag">bug-detect</span><span className="fc-tag">quality</span><span className="fc-tag">inline</span></div></div>
    <div className="feat-cell cursor-target"><span className="fc-index">05</span><div className="fc-title">Scoring and Leaderboards</div><div className="fc-desc">Performance scores computed from code quality, timeliness, and completeness. Individual and team rankings updated per submission.</div><div className="fc-tags"><span className="fc-tag">individual</span><span className="fc-tag">team</span><span className="fc-tag">ranking</span></div></div>
    <div className="feat-cell cursor-target"><span className="fc-index">06</span><div className="fc-title">Final Project Compilation</div><div className="fc-desc">AI compiles complete deliverables — documentation, architecture overviews, and summary reports — ready for admin sign-off.</div><div className="fc-tags"><span className="fc-tag">docs</span><span className="fc-tag">architecture</span><span className="fc-tag">export</span></div></div>
  </div>
</section>
<div className="rule"></div>

{/* STATS */}
<div id="stats">
  <div className="stats-row">
    <div className="stat-block r"><span className="stat-n"><span className="counter" data-target="3">0</span><em>x</em></span><span className="stat-l">Faster Delivery</span></div>
    <div className="stat-block r d1"><span className="stat-n"><span className="counter" data-target="87">0</span><em>%</em></span><span className="stat-l">Reduced Review Time</span></div>
    <div className="stat-block r d2"><span className="stat-n"><span className="counter" data-target="1200">0</span><em>+</em></span><span className="stat-l">Teams Onboarded</span></div>
    <div className="stat-block r d3"><span className="stat-n">$<span className="counter" data-target="40">0</span><em>M+</em></span><span className="stat-l">Cost Savings Generated</span></div>
  </div>
</div>
<div className="rule"></div>

{/* HOW */}
<section id="how">
  <div className="r"><span className="sec-label">Process</span></div>
  <h2 className="r d1">How AXIOM <em>transforms</em> projects</h2>
  <div className="how-wrap">
    <div className="steps">
      <div className="step active cursor-target"><div className="step-node"></div><div><span className="step-idx">01</span><div className="step-title">Submit Your Project</div><div className="step-desc">Define your project with title, description, requirements, deadline, and optional tech stack. Submit for admin validation in seconds.</div></div></div>
      <div className="step cursor-target"><div className="step-node"></div><div><span className="step-idx">02</span><div className="step-title">AI Generates Task Flow</div><div className="step-desc">The intelligence engine instantly breaks your project into Epics, Tasks, and Subtasks with dependencies and timelines. Fully editable and regeneratable.</div></div></div>
      <div className="step cursor-target"><div className="step-node"></div><div><span className="step-idx">03</span><div className="step-title">Smart Team Assignment</div><div className="step-desc">AXIOM matches tasks to team members based on skill sets, roles, and workload. Full transparency with override controls for managers.</div></div></div>
      <div className="step cursor-target"><div className="step-node"></div><div><span className="step-idx">04</span><div className="step-title">Execute and Review</div><div className="step-desc">Teams submit work — code, files, or links. AI reviews instantly, flags issues, and requests iteration where quality standards need improvement.</div></div></div>
      <div className="step cursor-target"><div className="step-node"></div><div><span className="step-idx">05</span><div className="step-title">Score and Compile</div><div className="step-desc">AI scores all contributions, generates the final project bundle, and prepares full documentation for admin sign-off. Ship with confidence.</div></div></div>
    </div>
    <div className="how-panel r d2">
      <div className="panel-bar"><div className="pd pd1"></div><div className="pd pd2"></div><div className="pd pd3"></div><span className="panel-label">axiom — project board — sprint 14</span></div>
      <div className="panel-body">
        <div className="kanban">
          <div className="kb-col"><div className="kbc-head">Pending</div><div className="kbc">Auth middleware refactor<div><span className="kbt kbt-hi">High</span></div></div><div className="kbc">DB schema migration<div><span className="kbt kbt-lo">Low</span></div></div><div className="kbc">Documentation update</div></div>
          <div className="kb-col"><div className="kbc-head">In Progress</div><div className="kbc accent">AI review pipeline<div><span className="kbt kbt-ai">AI</span></div></div><div className="kbc accent">Dashboard v2 UI<div><span className="kbt kbt-hi">High</span></div></div></div>
          <div className="kb-col"><div className="kbc-head">Complete</div><div className="kbc faded">Setup CI / CD</div><div className="kbc faded">API Gateway config</div><div className="kbc faded">Team onboarding</div><div className="kbc faded">Sprint planning</div></div>
        </div>
      </div>
    </div>
  </div>
</section>

{/* ROLES */}
<section id="roles" className="on-dark">
  <div className="roles-head">
    <span className="sec-label r">Access Control</span>
    <h2 className="r d1">Designed for <em>every level</em></h2>
    <p className="sec-sub r d2" style={{margin: '0 auto', textAlign: 'center'}}>Role-based access ensures each user sees exactly what they need — with precision at every tier.</p>
  </div>
  <div className="roles-grid">
    <div className="gcard r d1 cursor-target">
      <div className="gcard-title">Administrator</div>
      <div className="gcard-desc">Full platform authority. Manage every project, team, and approval. The command centre of your enterprise.</div>
      <ul className="gcard-list"><li>Create and approve projects</li><li>Manage teams and members</li><li>Override AI assignments</li><li>Access all analytics</li><li>Final delivery sign-off</li></ul>
    </div>
    <div className="gcard r d2 cursor-target">
      <div className="gcard-title">Team Manager</div>
      <div className="gcard-desc">Oversee your squad's performance, reassign tasks, and track sprint progress across all project dashboards.</div>
      <ul className="gcard-list"><li>Monitor team progress</li><li>Reassign and adjust tasks</li><li>Review team submissions</li><li>View team performance scores</li><li>Escalate to administrator</li></ul>
    </div>
    <div className="gcard r d3 cursor-target">
      <div className="gcard-title">Team Member</div>
      <div className="gcard-desc">Execute assigned tasks with clarity. Submit work, receive AI feedback, iterate, and track personal performance scores.</div>
      <ul className="gcard-list"><li>View assigned tasks</li><li>Submit code and files</li><li>Receive AI code review</li><li>Track personal score</li><li>Iterate on AI feedback</li></ul>
    </div>
  </div>
</section>

{/* PERFORMANCE */}
<section id="performance">
  <div className="perf-head">
    <span className="sec-label r">Performance</span>
    <h2 className="r d1">Team <em>Leaderboard</em></h2>
    <p className="sec-sub r d2" style={{margin: '0 auto', textAlign: 'center'}}>Transparent, merit-based scoring keeps teams engaged and accountable. Rankings update per submission.</p>
  </div>
  <div className="lb r d2">
    <div className="lb-top"><span className="lb-top-title">Sprint 14 — Top Performers</span><span className="lb-top-sub">March 2026</span></div>
    <div className="lb-row cursor-target"><div className="lb-rank r1">1</div><div className="lb-av" style={{background: 'linear-gradient(135deg,#2C0952,#7B1FFA)'}}>SK</div><div className="lb-info"><div className="lb-name">Sophia Kim</div><div className="lb-role-label">Lead Engineer</div></div><div className="lb-bar-bg"><div className="lb-bar" style={{width: '100%'}}></div></div><div className="lb-pts">98<small> pts</small></div><div className="lb-badge badge-a">MVP</div></div>
    <div className="lb-row cursor-target"><div className="lb-rank r2">2</div><div className="lb-av" style={{background: 'linear-gradient(135deg,#3A1268,#9040FF)'}}>MR</div><div className="lb-info"><div className="lb-name">Marcus Reid</div><div className="lb-role-label">Full-Stack Developer</div></div><div className="lb-bar-bg"><div className="lb-bar" style={{width: '91%'}}></div></div><div className="lb-pts">91<small> pts</small></div><div className="lb-badge badge-b">Top</div></div>
    <div className="lb-row cursor-target"><div className="lb-rank r3">3</div><div className="lb-av" style={{background: 'linear-gradient(135deg,#1A032E,#6B18E0)'}}>AL</div><div className="lb-info"><div className="lb-name">Anika Lowe</div><div className="lb-role-label">Backend Engineer</div></div><div className="lb-bar-bg"><div className="lb-bar" style={{width: '87%'}}></div></div><div className="lb-pts">87<small> pts</small></div></div>
    <div className="lb-row cursor-target"><div className="lb-rank rn">4</div><div className="lb-av" style={{background: 'linear-gradient(135deg,#2C0952,#7B1FFA)'}}>JT</div><div className="lb-info"><div className="lb-name">Jae Tran</div><div className="lb-role-label">DevOps Specialist</div></div><div className="lb-bar-bg"><div className="lb-bar" style={{width: '79%'}}></div></div><div className="lb-pts">79<small> pts</small></div></div>
    <div className="lb-row cursor-target"><div className="lb-rank rn">5</div><div className="lb-av" style={{background: 'linear-gradient(135deg,#1A032E,#4A1580)'}}>CP</div><div className="lb-info"><div className="lb-name">Cleo Patel</div><div className="lb-role-label">Frontend Developer</div></div><div className="lb-bar-bg"><div className="lb-bar" style={{width: '74%'}}></div></div><div className="lb-pts">74<small> pts</small></div></div>
  </div>
</section>

{/* CTA */}
<section id="cta" className="cta on-dark">
  <div className="cta-rays-container" id="cta-rays-container"></div>
  <div className="cta-atm"></div>
  <div className="cta-inner">
    <span className="cta-label r">Join the enterprise revolution</span>
    <h2 className="r d1">Ready to <em>transform</em><br />how your teams work?</h2>
    <p className="cta-sub r d2" id="cta-blur-sub">Join 1,200 enterprise teams already shipping faster with AXIOM. Start your 30-day free trial — no credit card required.</p>
    <div className="cta-form r d3"><input className="cta-input" type="email" placeholder="your@company.com" /><a href="#" className="btn-primary cursor-target">Get Access</a></div>
    <p className="cta-note r d4">SOC 2 Type II Certified &nbsp; GDPR Compliant &nbsp; 99.9% Uptime SLA</p>
  </div>
</section>

{/* FOOTER */}
<footer>
  <div className="foot-grid">
    <div className="foot-brand">
      <a href="#" className="logo cursor-target" style={{color: '#FAF8FF'}}>Axi<em style={{fontStyle: 'normal', color: 'var(--lavender-soft)'}}>om</em></a>
      <p>Enterprise project management, re-engineered with AI at its core. Built for teams that refuse to settle.</p>
      <div className="foot-soc">
        <a href="#" className="soc-btn cursor-target"><svg viewBox="0 0 24 24"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg></a>
        <a href="#" className="soc-btn cursor-target"><svg viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></a>
        <a href="#" className="soc-btn cursor-target"><svg viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg></a>
      </div>
    </div>
    <div className="foot-col"><h4>Product</h4><ul><li><a href="#" className="cursor-target">Features</a></li><li><a href="#" className="cursor-target">Pricing</a></li><li><a href="#" className="cursor-target">Changelog</a></li><li><a href="#" className="cursor-target">Roadmap</a></li><li><a href="#" className="cursor-target">Status</a></li></ul></div>
    <div className="foot-col"><h4>Company</h4><ul><li><a href="#" className="cursor-target">About</a></li><li><a href="#" className="cursor-target">Blog</a></li><li><a href="#" className="cursor-target">Careers</a></li><li><a href="#" className="cursor-target">Press</a></li><li><a href="#" className="cursor-target">Contact</a></li></ul></div>
    <div className="foot-col"><h4>Resources</h4><ul><li><a href="#" className="cursor-target">Documentation</a></li><li><a href="#" className="cursor-target">API Reference</a></li><li><a href="#" className="cursor-target">Community</a></li><li><a href="#" className="cursor-target">Security</a></li><li><a href="#" className="cursor-target">Support</a></li></ul></div>
  </div>
  <div className="foot-bottom">
    <p>2026 AXIOM Technologies, Inc. All rights reserved.</p>
    <div className="foot-legal"><a href="#" className="cursor-target">Privacy</a><a href="#" className="cursor-target">Terms</a><a href="#" className="cursor-target">Cookies</a></div>
  </div>
</footer>
    </div>
  );
}
