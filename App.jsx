import { useState, useRef, useEffect } from "react";

const CLAUDE_API = "https://api.anthropic.com/v1/messages";

async function callClaude(systemPrompt, userMessage, onChunk) {
  const res = await fetch(CLAUDE_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      stream: true,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const lines = decoder.decode(value).split("\n");
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const d = JSON.parse(line.slice(6));
          if (d.type === "content_block_delta" && d.delta?.text) {
            full += d.delta.text;
            onChunk && onChunk(full);
          }
        } catch {}
      }
    }
  }
  return full;
}

// ── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_JOBS = [
  { id: 1, title: "Frontend Engineer", company: "Stripe", location: "Remote", type: "Full-time", salary: "$120k–$150k", tags: ["React", "TypeScript", "CSS"], posted: "2d ago", logo: "S", color: "#635BFF" },
  { id: 2, title: "ML Engineer Intern", company: "Google", location: "Bangalore", type: "Internship", salary: "₹80k/mo", tags: ["Python", "TensorFlow", "ML"], posted: "1d ago", logo: "G", color: "#4285F4" },
  { id: 3, title: "Full Stack Developer", company: "Notion", location: "Hybrid", type: "Full-time", salary: "$100k–$130k", tags: ["Node.js", "React", "PostgreSQL"], posted: "3d ago", logo: "N", color: "#000000" },
  { id: 4, title: "Data Scientist", company: "Anthropic", location: "Remote", type: "Full-time", salary: "$140k–$180k", tags: ["Python", "LLMs", "Statistics"], posted: "5h ago", logo: "A", color: "#C6643C" },
  { id: 5, title: "DevOps Engineer", company: "Vercel", location: "Remote", type: "Full-time", salary: "$110k–$140k", tags: ["AWS", "Docker", "CI/CD"], posted: "1w ago", logo: "V", color: "#000000" },
  { id: 6, title: "Backend Intern", company: "Razorpay", location: "Bangalore", type: "Internship", salary: "₹60k/mo", tags: ["Go", "Microservices", "Redis"], posted: "2d ago", logo: "R", color: "#2EB5C1" },
];

const MOCK_CANDIDATES = [
  { id: 1, name: "Priya Sharma", role: "Frontend Developer", skills: ["React", "TypeScript", "CSS", "Node.js"], score: 94, location: "Bangalore", experience: "3 years", avatar: "PS", status: "Shortlisted" },
  { id: 2, name: "Arjun Mehta", role: "Full Stack Engineer", skills: ["React", "Python", "PostgreSQL", "AWS"], score: 89, location: "Mumbai", experience: "4 years", avatar: "AM", status: "In Review" },
  { id: 3, name: "Sneha Patel", role: "ML Engineer", skills: ["Python", "TensorFlow", "LLMs", "Statistics"], score: 96, location: "Remote", experience: "5 years", avatar: "SP", status: "Shortlisted" },
  { id: 4, name: "Rahul Kumar", role: "Backend Developer", skills: ["Go", "Microservices", "Docker", "Redis"], score: 82, location: "Hyderabad", experience: "2 years", avatar: "RK", status: "Applied" },
  { id: 5, name: "Ananya Singh", role: "DevOps Engineer", skills: ["AWS", "Kubernetes", "CI/CD", "Terraform"], score: 91, location: "Pune", experience: "3 years", avatar: "AS", status: "Interview" },
];

const MOCK_APPLICATIONS = [
  { id: 1, candidate: "Priya Sharma", job: "Frontend Engineer", company: "Stripe", status: "Interview Scheduled", date: "Jun 8", avatar: "PS" },
  { id: 2, candidate: "Self", job: "ML Engineer Intern", company: "Google", status: "Under Review", date: "Jun 5", avatar: "ME" },
  { id: 3, candidate: "Self", job: "Full Stack Developer", company: "Notion", status: "Applied", date: "Jun 3", avatar: "ME" },
];

const ADMIN_STATS = [
  { label: "Total Users", value: "12,847", change: "+12%", icon: "👥" },
  { label: "Active Companies", value: "384", change: "+8%", icon: "🏢" },
  { label: "Jobs Posted", value: "2,156", change: "+23%", icon: "💼" },
  { label: "Placements", value: "891", change: "+31%", icon: "🎯" },
];

// ── STYLE HELPERS ─────────────────────────────────────────────────────────────

const glassCard = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  backdropFilter: "blur(12px)",
};

const inputStyle = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  color: "#e2e8f0",
  padding: "10px 14px",
  fontSize: 14,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const btnPrimary = {
  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
  border: "none",
  borderRadius: 10,
  color: "#fff",
  padding: "10px 20px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  transition: "opacity 0.2s",
};

const btnSecondary = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  color: "#94a3b8",
  padding: "10px 20px",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
};

// ── COMPONENTS ───────────────────────────────────────────────────────────────

function Avatar({ initials, size = 36, color = "#6366f1" }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color + "33", border: `1px solid ${color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, color, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function Badge({ children, color = "#6366f1" }) {
  return (
    <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 6, fontSize: 11, fontWeight: 600, padding: "2px 8px" }}>
      {children}
    </span>
  );
}

function ScoreBadge({ score }) {
  const color = score >= 90 ? "#22c55e" : score >= 75 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", background: color + "22", border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color }}>
        {score}
      </div>
    </div>
  );
}

function StreamingText({ text, loading }) {
  return (
    <div style={{ fontSize: 14, lineHeight: 1.8, color: "#cbd5e1", whiteSpace: "pre-wrap" }}>
      {loading && !text ? (
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", animation: "pulse 1s infinite", animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      ) : text || ""}
    </div>
  );
}

function Sidebar({ role, active, setActive, setRole }) {
  const studentNav = [
    { id: "dashboard", icon: "🏠", label: "Dashboard" },
    { id: "resume", icon: "📄", label: "Resume & ATS" },
    { id: "skills", icon: "🧠", label: "Skill Gap" },
    { id: "roadmap", icon: "🗺️", label: "Roadmap" },
    { id: "jobs", icon: "💼", label: "Job Search" },
    { id: "tracker", icon: "📊", label: "Applications" },
    { id: "interview", icon: "🎤", label: "Interview Prep" },
    { id: "mentor", icon: "🤖", label: "AI Mentor" },
  ];
  const companyNav = [
    { id: "co-dashboard", icon: "🏠", label: "Dashboard" },
    { id: "co-profile", icon: "🏢", label: "Company Profile" },
    { id: "co-jobs", icon: "📝", label: "Job Postings" },
    { id: "co-search", icon: "🔍", label: "Candidate Search" },
    { id: "co-ats", icon: "📋", label: "Applicant Tracking" },
    { id: "co-ranking", icon: "⭐", label: "AI Ranking" },
  ];
  const adminNav = [
    { id: "ad-dashboard", icon: "📊", label: "Analytics" },
    { id: "ad-users", icon: "👥", label: "Users" },
    { id: "ad-companies", icon: "🏢", label: "Companies" },
    { id: "ad-jobs", icon: "💼", label: "Job Monitor" },
  ];
  const nav = role === "student" ? studentNav : role === "company" ? companyNav : adminNav;
  const roleColor = role === "student" ? "#6366f1" : role === "company" ? "#06b6d4" : "#f59e0b";
  const roleName = role === "student" ? "Student Portal" : role === "company" ? "Company Portal" : "Admin Portal";

  return (
    <div style={{ width: 220, background: "rgba(15,15,25,0.95)", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", height: "100%", flexShrink: 0 }}>
      <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚡</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>TalentAI</div>
            <div style={{ fontSize: 10, color: roleColor, fontWeight: 600 }}>{roleName}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {["student", "company", "admin"].map(r => (
            <button key={r} onClick={() => { setRole(r); setActive(r === "student" ? "dashboard" : r === "company" ? "co-dashboard" : "ad-dashboard"); }}
              style={{ flex: 1, padding: "4px 2px", fontSize: 9, fontWeight: 600, borderRadius: 6, cursor: "pointer", border: "none", background: role === r ? roleColor + "33" : "transparent", color: role === r ? roleColor : "#64748b", transition: "all 0.2s" }}>
              {r === "student" ? "STU" : r === "company" ? "CO" : "ADM"}
            </button>
          ))}
        </div>
      </div>
      <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
        {nav.map(item => (
          <button key={item.id} onClick={() => setActive(item.id)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, marginBottom: 2, border: "none", cursor: "pointer", background: active === item.id ? roleColor + "22" : "transparent", color: active === item.id ? roleColor : "#64748b", fontSize: 13, fontWeight: active === item.id ? 600 : 400, transition: "all 0.2s", textAlign: "left" }}>
            <span style={{ fontSize: 15 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.04)" }}>
          <Avatar initials="ME" size={28} color={roleColor} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {role === "student" ? "Alex Johnson" : role === "company" ? "Acme Corp" : "Admin"}
            </div>
            <div style={{ fontSize: 10, color: "#475569" }}>Online</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── STUDENT PAGES ─────────────────────────────────────────────────────────────

function StudentDashboard() {
  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Good morning, Alex 👋</h1>
        <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: 14 }}>Your career progress at a glance</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "ATS Score", value: "87/100", sub: "+5 this week", color: "#6366f1" },
          { label: "Skills Matched", value: "14/18", sub: "4 gaps remaining", color: "#06b6d4" },
          { label: "Applications", value: "6", sub: "2 in review", color: "#8b5cf6" },
          { label: "Profile Views", value: "34", sub: "↑ 12 today", color: "#22c55e" },
        ].map(s => (
          <div key={s.label} style={{ ...glassCard, padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#475569" }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ ...glassCard, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 16 }}>Recent Applications</div>
          {MOCK_APPLICATIONS.slice(0, 3).map(a => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <Avatar initials={a.company?.[0] || "?"} size={32} color="#6366f1" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>{a.job}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{a.company} · {a.date}</div>
              </div>
              <Badge color={a.status === "Interview Scheduled" ? "#22c55e" : a.status === "Under Review" ? "#f59e0b" : "#6366f1"}>
                {a.status}
              </Badge>
            </div>
          ))}
        </div>
        <div style={{ ...glassCard, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 16 }}>Recommended Jobs</div>
          {MOCK_JOBS.slice(0, 3).map(j => (
            <div key={j.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: j.color + "33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: j.color, border: `1px solid ${j.color}44` }}>{j.logo}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>{j.title}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{j.company} · {j.location}</div>
              </div>
              <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 600 }}>98%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResumePage() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  async function analyze() {
    if (!file && !true) return;
    setLoading(true);
    setAnalysis("");
    await callClaude(
      "You are an expert ATS and resume analysis engine. Provide a structured, detailed analysis.",
      `Analyze a resume for the role of Software Engineer. The candidate has uploaded: "${file?.name || "sample_resume.pdf"}". Provide: 1) ATS Score out of 100 with breakdown (Keywords 30pts, Format 20pts, Experience 30pts, Skills 20pts), 2) Top 3 strengths, 3) Top 3 gaps/improvements, 4) Missing keywords for Software Engineer roles, 5) Quick wins to improve score. Format clearly with sections.`,
      (t) => setAnalysis(t)
    );
    setLoading(false);
  }

  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px" }}>Resume & ATS Analysis</h1>
      <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 24px" }}>Upload your resume to get an AI-powered ATS score and improvement tips</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 20 }}>
        <div>
          <div style={{ ...glassCard, padding: 24, marginBottom: 16 }}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); setFile(e.dataTransfer.files[0]); }}>
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 6 }}>
                {file ? file.name : "Drop your resume here"}
              </div>
              <div style={{ fontSize: 12, color: "#475569", marginBottom: 16 }}>PDF, DOCX up to 5MB</div>
              <input ref={fileRef} type="file" accept=".pdf,.docx" style={{ display: "none" }} onChange={e => setFile(e.target.files[0])} />
              <button style={btnSecondary} onClick={() => fileRef.current.click()}>Browse Files</button>
            </div>
          </div>
          <button style={{ ...btnPrimary, width: "100%", padding: "12px", fontSize: 14 }} onClick={analyze} disabled={loading}>
            {loading ? "Analyzing…" : "⚡ Analyze with AI"}
          </button>
          {file && (
            <div style={{ ...glassCard, padding: 14, marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>📎</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>{file.name}</div>
                <div style={{ fontSize: 11, color: "#475569" }}>{(file.size / 1024).toFixed(1)} KB</div>
              </div>
              <button style={{ marginLeft: "auto", background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16 }} onClick={() => setFile(null)}>✕</button>
            </div>
          )}
        </div>
        <div style={{ ...glassCard, padding: 24, minHeight: 300 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <span>🤖</span> AI Analysis
            {loading && <span style={{ fontSize: 11, color: "#6366f1", fontWeight: 400 }}>Streaming…</span>}
          </div>
          {!analysis && !loading ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🎯</div>
              <div style={{ fontSize: 13, color: "#475569" }}>Upload your resume and click Analyze to get your ATS score and personalized feedback</div>
            </div>
          ) : (
            <StreamingText text={analysis} loading={loading} />
          )}
        </div>
      </div>
    </div>
  );
}

function SkillGapPage() {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("Full Stack Engineer");

  async function analyze() {
    setLoading(true);
    setAnalysis("");
    await callClaude(
      "You are a career skills expert. Provide structured, actionable skill gap analysis.",
      `Perform a skill gap analysis for a student targeting the role: "${role}". Current skills: React, JavaScript, basic Python, HTML/CSS, Git. Provide: 1) Skills already matching the role (with proficiency levels), 2) Critical missing skills ranked by importance, 3) Nice-to-have skills, 4) Estimated time to bridge each gap, 5) Top 3 free resources for each critical gap. Be specific and actionable.`,
      (t) => setAnalysis(t)
    );
    setLoading(false);
  }

  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px" }}>Skill Gap Analysis</h1>
      <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 24px" }}>Discover exactly what skills you need for your target role</p>
      <div style={{ ...glassCard, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#94a3b8", marginBottom: 8 }}>Target Role</div>
        <div style={{ display: "flex", gap: 10 }}>
          <input style={{ ...inputStyle, flex: 1 }} value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Full Stack Engineer, Data Scientist…" />
          <button style={btnPrimary} onClick={analyze} disabled={loading}>{loading ? "Analyzing…" : "Analyze"}</button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 16 }}>
        <div style={{ ...glassCard, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 14 }}>Your Current Skills</div>
          {["React", "JavaScript", "HTML/CSS", "Git", "Python (basic)", "REST APIs"].map(s => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ fontSize: 13, color: "#94a3b8", flex: 1 }}>{s}</span>
              <div style={{ width: 80, height: 4, borderRadius: 4, background: "rgba(255,255,255,0.06)" }}>
                <div style={{ height: "100%", borderRadius: 4, background: "#22c55e", width: `${Math.random() * 40 + 50}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ ...glassCard, padding: 20, minHeight: 200 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span>🧠</span> AI Gap Analysis
          </div>
          <StreamingText text={analysis} loading={loading} />
          {!analysis && !loading && (
            <div style={{ textAlign: "center", padding: "30px 0", color: "#475569", fontSize: 13 }}>Enter a target role and click Analyze</div>
          )}
        </div>
      </div>
    </div>
  );
}

function RoadmapPage() {
  const [roadmap, setRoadmap] = useState("");
  const [loading, setLoading] = useState(false);
  const [goal, setGoal] = useState("Become a Full Stack Engineer in 6 months");

  async function generate() {
    setLoading(true);
    setRoadmap("");
    await callClaude(
      "You are a senior engineering mentor creating personalized learning roadmaps.",
      `Create a detailed, week-by-week learning roadmap for: "${goal}". Current level: intermediate (knows React, JS, basic Python). Include: Phase 1 (Weeks 1-4), Phase 2 (Weeks 5-8), Phase 3 (Weeks 9-12), Phase 4+ (beyond). For each phase: key skills to learn, projects to build, resources, milestones, and what jobs you'd qualify for. Make it realistic and actionable.`,
      (t) => setRoadmap(t)
    );
    setLoading(false);
  }

  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px" }}>Learning Roadmap</h1>
      <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 24px" }}>AI-generated personalized roadmap to reach your career goal</p>
      <div style={{ ...glassCard, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#94a3b8", marginBottom: 8 }}>Career Goal</div>
        <div style={{ display: "flex", gap: 10 }}>
          <input style={{ ...inputStyle, flex: 1 }} value={goal} onChange={e => setGoal(e.target.value)} />
          <button style={btnPrimary} onClick={generate} disabled={loading}>{loading ? "Generating…" : "🗺️ Generate"}</button>
        </div>
      </div>
      <div style={{ ...glassCard, padding: 24, minHeight: 300 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 16 }}>Your Personalized Roadmap</div>
        {!roadmap && !loading ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗺️</div>
            <div style={{ fontSize: 13, color: "#475569" }}>Set your career goal above and generate your roadmap</div>
          </div>
        ) : <StreamingText text={roadmap} loading={loading} />}
      </div>
    </div>
  );
}

function JobSearchPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [applied, setApplied] = useState([]);
  const filtered = MOCK_JOBS.filter(j =>
    (filter === "All" || j.type === filter) &&
    (j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px" }}>Job Search</h1>
      <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 20px" }}>AI-matched jobs based on your profile</p>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input style={{ ...inputStyle, flex: 1 }} placeholder="Search jobs, companies…" value={search} onChange={e => setSearch(e.target.value)} />
        {["All", "Full-time", "Internship"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ ...btnSecondary, background: filter === f ? "#6366f133" : "rgba(255,255,255,0.06)", color: filter === f ? "#6366f1" : "#64748b", border: filter === f ? "1px solid #6366f155" : "1px solid rgba(255,255,255,0.12)" }}>
            {f}
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {filtered.map(j => (
          <div key={j.id} style={{ ...glassCard, padding: 20, transition: "border 0.2s", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: j.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: j.color, border: `1px solid ${j.color}33`, flexShrink: 0 }}>{j.logo}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9" }}>{j.title}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{j.company} · {j.location}</div>
              </div>
              <Badge color={j.type === "Internship" ? "#06b6d4" : "#6366f1"}>{j.type}</Badge>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {j.tags.map(t => <Badge key={t} color="#8b5cf6">{t}</Badge>)}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#22c55e" }}>{j.salary}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#475569" }}>{j.posted}</span>
                <button onClick={() => setApplied(a => a.includes(j.id) ? a : [...a, j.id])}
                  style={{ ...btnPrimary, padding: "6px 14px", fontSize: 12, background: applied.includes(j.id) ? "#22c55e33" : "linear-gradient(135deg,#6366f1,#8b5cf6)", color: applied.includes(j.id) ? "#22c55e" : "#fff", border: applied.includes(j.id) ? "1px solid #22c55e55" : "none" }}>
                  {applied.includes(j.id) ? "✓ Applied" : "Apply"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrackerPage() {
  const statuses = ["Applied", "Under Review", "Interview Scheduled", "Offer", "Rejected"];
  const statusColor = { "Applied": "#6366f1", "Under Review": "#f59e0b", "Interview Scheduled": "#22c55e", "Offer": "#06b6d4", "Rejected": "#ef4444" };
  const apps = [
    ...MOCK_APPLICATIONS,
    { id: 4, candidate: "Self", job: "DevOps Engineer", company: "Vercel", status: "Applied", date: "Jun 1", avatar: "ME" },
    { id: 5, candidate: "Self", job: "Backend Intern", company: "Razorpay", status: "Rejected", date: "May 28", avatar: "ME" },
  ];
  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px" }}>Application Tracker</h1>
      <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 24px" }}>Track all your job applications in one place</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 24 }}>
        {statuses.map(s => {
          const count = apps.filter(a => a.status === s).length;
          return (
            <div key={s} style={{ ...glassCard, padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: statusColor[s] }}>{count}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{s}</div>
            </div>
          );
        })}
      </div>
      <div style={{ ...glassCard, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr", gap: 12 }}>
          {["Job", "Company", "Status", "Date"].map(h => <div key={h} style={{ fontSize: 11, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: 1 }}>{h}</div>)}
        </div>
        {apps.map(a => (
          <div key={a.id} style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr", gap: 12, alignItems: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#e2e8f0" }}>{a.job}</div>
            <div style={{ fontSize: 13, color: "#64748b" }}>{a.company}</div>
            <Badge color={statusColor[a.status] || "#6366f1"}>{a.status}</Badge>
            <div style={{ fontSize: 12, color: "#475569" }}>{a.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InterviewPage() {
  const [questions, setQuestions] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("Full Stack Engineer");
  const [level, setLevel] = useState("Mid-level");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [fbLoading, setFbLoading] = useState(false);

  async function generate() {
    setLoading(true);
    setQuestions("");
    await callClaude(
      "You are a senior technical interviewer at a top tech company.",
      `Generate 8 interview questions for a ${level} ${role} position. Include: 2 behavioral (STAR format), 3 technical coding concepts, 2 system design, 1 role-specific scenario. For each question, note the concept being tested and a brief hint on what a great answer covers.`,
      (t) => setQuestions(t)
    );
    setLoading(false);
  }

  async function getFeedback() {
    if (!answer.trim()) return;
    setFbLoading(true);
    setFeedback("");
    await callClaude(
      "You are an expert interview coach providing constructive feedback.",
      `Rate this interview answer (1-10) and provide feedback: "${answer}". Evaluate: clarity, technical depth, structure, relevance. Give specific improvements.`,
      (t) => setFeedback(t)
    );
    setFbLoading(false);
  }

  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px" }}>Interview Preparation</h1>
      <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 20px" }}>AI-generated questions with real-time answer feedback</p>
      <div style={{ ...glassCard, padding: 20, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <input style={{ ...inputStyle, flex: 1 }} value={role} onChange={e => setRole(e.target.value)} placeholder="Target role…" />
          <select style={{ ...inputStyle, width: 140 }} value={level} onChange={e => setLevel(e.target.value)}>
            {["Junior", "Mid-level", "Senior", "Lead"].map(l => <option key={l}>{l}</option>)}
          </select>
          <button style={btnPrimary} onClick={generate} disabled={loading}>{loading ? "Generating…" : "🎤 Generate"}</button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ ...glassCard, padding: 20, minHeight: 300 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 14 }}>Interview Questions</div>
          {!questions && !loading ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#475569", fontSize: 13 }}>Generate questions to start practicing</div>
          ) : <StreamingText text={questions} loading={loading} />}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ ...glassCard, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 10 }}>Practice Your Answer</div>
            <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} placeholder="Type your answer here and get AI feedback…" value={answer} onChange={e => setAnswer(e.target.value)} />
            <button style={{ ...btnPrimary, marginTop: 10, width: "100%" }} onClick={getFeedback} disabled={fbLoading}>{fbLoading ? "Evaluating…" : "Get AI Feedback"}</button>
          </div>
          {(feedback || fbLoading) && (
            <div style={{ ...glassCard, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 10 }}>AI Feedback</div>
              <StreamingText text={feedback} loading={fbLoading} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MentorPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your AI Career Mentor 👋 I can help with career advice, job search strategy, skill development, salary negotiation, and more. What's on your mind?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef();

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(m => [...m, { role: "user", content: userMsg }]);
    setLoading(true);
    let reply = "";
    setMessages(m => [...m, { role: "assistant", content: "" }]);
    await callClaude(
      "You are an expert AI Career Mentor for students and recent graduates. You have deep knowledge of tech careers, job markets, interview preparation, skill development, and career strategy. Be encouraging, specific, and actionable. Keep responses concise (under 200 words) but impactful.",
      userMsg,
      (t) => {
        reply = t;
        setMessages(m => [...m.slice(0, -1), { role: "assistant", content: t }]);
      }
    );
    setLoading(false);
  }

  return (
    <div style={{ padding: 28, height: "calc(100vh - 56px)", display: "flex", flexDirection: "column" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px" }}>AI Career Mentor</h1>
      <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 16px" }}>Your personal AI-powered career advisor</p>
      <div style={{ ...glassCard, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 16, flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
              {m.role === "assistant" && <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#6366f133", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🤖</div>}
              <div style={{ maxWidth: "75%", padding: "12px 16px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: m.role === "user" ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.06)", border: m.role === "user" ? "none" : "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: 14, lineHeight: 1.7, color: "#e2e8f0", whiteSpace: "pre-wrap" }}>
                  {m.content || (loading && i === messages.length - 1 ? <span style={{ color: "#6366f1" }}>●●●</span> : "")}
                </div>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 10 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8, width: "100%" }}>
            {["How do I negotiate salary?", "What skills should I learn for AI roles?", "How to prepare for system design?"].map(q => (
              <button key={q} style={{ ...btnSecondary, fontSize: 11, padding: "4px 10px" }} onClick={() => { setInput(q); }}>{q}</button>
            ))}
          </div>
        </div>
        <div style={{ padding: "0 16px 16px", display: "flex", gap: 10 }}>
          <input style={{ ...inputStyle, flex: 1 }} placeholder="Ask your career mentor…" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} />
          <button style={{ ...btnPrimary, padding: "10px 16px" }} onClick={send} disabled={loading}>Send</button>
        </div>
      </div>
    </div>
  );
}

// ── COMPANY PAGES ─────────────────────────────────────────────────────────────

function CompanyDashboard() {
  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px" }}>Company Dashboard</h1>
      <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 24px" }}>Acme Corp · Verified ✓</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Active Jobs", value: "8", color: "#06b6d4" },
          { label: "Total Applicants", value: "247", color: "#6366f1" },
          { label: "Shortlisted", value: "34", color: "#22c55e" },
          { label: "Hired This Month", value: "6", color: "#f59e0b" },
        ].map(s => (
          <div key={s.label} style={{ ...glassCard, padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{ ...glassCard, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 16 }}>Top Candidates Pipeline</div>
        {MOCK_CANDIDATES.slice(0, 4).map(c => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <Avatar initials={c.avatar} size={36} color="#06b6d4" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#e2e8f0" }}>{c.name}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{c.role} · {c.experience}</div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", maxWidth: 200 }}>
              {c.skills.slice(0, 2).map(s => <Badge key={s} color="#06b6d4">{s}</Badge>)}
            </div>
            <ScoreBadge score={c.score} />
            <Badge color={c.status === "Shortlisted" ? "#22c55e" : c.status === "Interview" ? "#f59e0b" : "#6366f1"}>{c.status}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function CandidateSearch() {
  const [search, setSearch] = useState("");
  const [rankingResult, setRankingResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function aiRank() {
    setLoading(true);
    setRankingResult("");
    await callClaude(
      "You are an AI recruitment specialist ranking candidates objectively.",
      `Rank these candidates for a Full Stack Engineer role at a fintech startup. Candidates: ${JSON.stringify(MOCK_CANDIDATES.map(c => ({ name: c.name, skills: c.skills, score: c.score, experience: c.experience })))}. Provide ranking with reasoning, culture fit notes, and hiring recommendation. Be specific.`,
      (t) => setRankingResult(t)
    );
    setLoading(false);
  }

  const filtered = MOCK_CANDIDATES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px" }}>Candidate Search</h1>
      <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 20px" }}>Find and evaluate top candidates with AI assistance</p>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input style={{ ...inputStyle, flex: 1 }} placeholder="Search by name, skill, role…" value={search} onChange={e => setSearch(e.target.value)} />
        <button style={btnPrimary} onClick={aiRank} disabled={loading}>{loading ? "Ranking…" : "⭐ AI Rank All"}</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        <div>
          {filtered.map(c => (
            <div key={c.id} style={{ ...glassCard, padding: 18, marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <Avatar initials={c.avatar} size={40} color="#06b6d4" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9" }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{c.role} · {c.location} · {c.experience}</div>
                </div>
                <ScoreBadge score={c.score} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                {c.skills.map(s => <Badge key={s} color="#8b5cf6">{s}</Badge>)}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ ...btnSecondary, fontSize: 12, padding: "6px 12px" }}>View Profile</button>
                <button style={{ ...btnPrimary, fontSize: 12, padding: "6px 12px" }}>Shortlist</button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ ...glassCard, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 14 }}>⭐ AI Candidate Ranking</div>
          {!rankingResult && !loading ? (
            <div style={{ textAlign: "center", padding: "40px 16px", color: "#475569", fontSize: 13 }}>Click "AI Rank All" to get intelligent candidate rankings for your role</div>
          ) : <StreamingText text={rankingResult} loading={loading} />}
        </div>
      </div>
    </div>
  );
}

function ATSBoard() {
  const columns = ["Applied", "Screened", "Interview", "Offer", "Hired"];
  const colColor = { Applied: "#6366f1", Screened: "#8b5cf6", Interview: "#f59e0b", Offer: "#06b6d4", Hired: "#22c55e" };
  const cardsByCol = {
    Applied: MOCK_CANDIDATES.filter(c => c.status === "Applied"),
    Screened: MOCK_CANDIDATES.filter(c => c.status === "In Review"),
    Interview: MOCK_CANDIDATES.filter(c => c.status === "Interview"),
    Offer: [],
    Hired: MOCK_CANDIDATES.filter(c => c.status === "Shortlisted").slice(0, 1),
  };
  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px" }}>Applicant Tracking</h1>
      <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 20px" }}>Kanban-style pipeline management</p>
      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
        {columns.map(col => (
          <div key={col} style={{ minWidth: 200, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: colColor[col] }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>{col}</span>
              <span style={{ fontSize: 11, background: colColor[col] + "22", color: colColor[col], borderRadius: 10, padding: "1px 7px", marginLeft: "auto" }}>{cardsByCol[col]?.length || 0}</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: 10, minHeight: 200 }}>
              {(cardsByCol[col] || []).map(c => (
                <div key={c.id} style={{ ...glassCard, padding: 14, marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <Avatar initials={c.avatar} size={28} color={colColor[col]} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{c.name}</div>
                      <div style={{ fontSize: 10, color: "#64748b" }}>{c.role}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 600 }}>Score: {c.score}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ADMIN PAGES ───────────────────────────────────────────────────────────────

function AdminDashboard() {
  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px" }}>Platform Analytics</h1>
      <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 24px" }}>Real-time platform metrics</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {ADMIN_STATS.map(s => (
          <div key={s.label} style={{ ...glassCard, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 600, background: "#22c55e22", padding: "2px 8px", borderRadius: 10 }}>{s.change}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#f1f5f9" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ ...glassCard, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 16 }}>Top Companies</div>
          {[{ name: "Google", jobs: 34, hires: 12 }, { name: "Stripe", jobs: 18, hires: 7 }, { name: "Anthropic", jobs: 22, hires: 9 }, { name: "Razorpay", jobs: 41, hires: 15 }].map(c => (
            <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <Avatar initials={c.name[0]} size={32} color="#f59e0b" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>{c.name}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{c.jobs} jobs · {c.hires} hires</div>
              </div>
              <Badge color="#22c55e">Verified</Badge>
            </div>
          ))}
        </div>
        <div style={{ ...glassCard, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 16 }}>Recent Activity</div>
          {[
            { text: "New company registered: TechCorp", time: "2m ago", icon: "🏢" },
            { text: "Student Alex landed offer at Google", time: "15m ago", icon: "🎉" },
            { text: "Job flagged for review: Dev at XYZ", time: "1h ago", icon: "⚠️" },
            { text: "500 new student registrations today", time: "2h ago", icon: "📈" },
          ].map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: 16 }}>{a.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "#94a3b8" }}>{a.text}</div>
                <div style={{ fontSize: 11, color: "#475569" }}>{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminUsers() {
  const users = [
    { name: "Alex Johnson", email: "alex@student.com", role: "Student", joined: "Jun 1", status: "Active", avatar: "AJ" },
    { name: "Priya Sharma", email: "priya@dev.com", role: "Student", joined: "May 28", status: "Active", avatar: "PS" },
    { name: "Acme Corp", email: "hr@acme.com", role: "Company", joined: "May 15", status: "Verified", avatar: "AC" },
    { name: "Rahul Kumar", email: "rahul@mail.com", role: "Student", joined: "Jun 5", status: "Active", avatar: "RK" },
    { name: "TechCorp", email: "jobs@techcorp.com", role: "Company", joined: "Jun 8", status: "Pending", avatar: "TC" },
  ];
  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px" }}>User Management</h1>
      <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 20px" }}>Manage all platform users</p>
      <div style={{ ...glassCard, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr", gap: 12 }}>
          {["User", "Email", "Role", "Joined", "Status", "Actions"].map(h => <div key={h} style={{ fontSize: 11, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: 1 }}>{h}</div>)}
        </div>
        {users.map((u, i) => (
          <div key={i} style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr", gap: 12, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar initials={u.avatar} size={28} color={u.role === "Company" ? "#f59e0b" : "#6366f1"} />
              <span style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>{u.name}</span>
            </div>
            <div style={{ fontSize: 13, color: "#64748b" }}>{u.email}</div>
            <Badge color={u.role === "Company" ? "#f59e0b" : "#6366f1"}>{u.role}</Badge>
            <div style={{ fontSize: 12, color: "#475569" }}>{u.joined}</div>
            <Badge color={u.status === "Active" ? "#22c55e" : u.status === "Verified" ? "#06b6d4" : "#f59e0b"}>{u.status}</Badge>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={{ ...btnSecondary, fontSize: 11, padding: "4px 8px" }}>Edit</button>
              <button style={{ background: "#ef444422", border: "1px solid #ef444444", borderRadius: 6, color: "#ef4444", fontSize: 11, padding: "4px 8px", cursor: "pointer" }}>Ban</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── AUTH ──────────────────────────────────────────────────────────────────────

function AuthPage({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at 20% 50%, #1e1b4b 0%, #0f0f1a 60%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>⚡</div>
            <span style={{ fontSize: 28, fontWeight: 800, color: "#f1f5f9" }}>TalentAI</span>
          </div>
          <p style={{ color: "#64748b", fontSize: 14 }}>AI-Powered Recruitment & Career Intelligence</p>
        </div>
        <div style={{ ...glassCard, padding: 32 }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 4 }}>
            {["login", "register"].map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: tab === t ? "#6366f1" : "transparent", color: tab === t ? "#fff" : "#64748b", transition: "all 0.2s", textTransform: "capitalize" }}>
                {t === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>I am a</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[{ id: "student", label: "Student", icon: "🎓" }, { id: "company", label: "Company", icon: "🏢" }, { id: "admin", label: "Admin", icon: "⚙️" }].map(r => (
                <button key={r.id} onClick={() => setRole(r.id)}
                  style={{ flex: 1, padding: "10px 8px", borderRadius: 10, border: `1px solid ${role === r.id ? "#6366f155" : "rgba(255,255,255,0.08)"}`, cursor: "pointer", background: role === r.id ? "#6366f122" : "rgba(255,255,255,0.03)", color: role === r.id ? "#6366f1" : "#64748b", fontSize: 13, fontWeight: 600 }}>
                  <div style={{ fontSize: 18, marginBottom: 2 }}>{r.icon}</div>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          {tab === "register" && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 6 }}>Full Name</label>
              <input style={inputStyle} placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 6 }}>Email</label>
            <input style={inputStyle} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 6 }}>Password</label>
            <input style={inputStyle} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button style={{ ...btnPrimary, width: "100%", padding: "12px", fontSize: 15 }} onClick={() => onLogin(role)}>
            {tab === "login" ? "Sign In →" : "Create Account →"}
          </button>
          <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "#475569" }}>
            Demo: any email/password works · select role above
          </div>
        </div>
      </div>
    </div>
  );
}

// ── LANDING ───────────────────────────────────────────────────────────────────

function LandingPage({ onEnter }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a14", color: "#e2e8f0", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: "radial-gradient(ellipse 80% 50% at 50% -20%, #6366f133 0%, transparent 60%)", minHeight: "100vh" }}>
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}>TalentAI</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...btnSecondary, fontSize: 13 }} onClick={onEnter}>Sign In</button>
            <button style={{ ...btnPrimary, fontSize: 13 }} onClick={onEnter}>Get Started →</button>
          </div>
        </nav>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 40px 60px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#6366f122", border: "1px solid #6366f144", borderRadius: 20, padding: "6px 16px", fontSize: 12, fontWeight: 600, color: "#a5b4fc", marginBottom: 32 }}>
            <span style={{ fontSize: 10, background: "#22c55e", borderRadius: "50%", width: 8, height: 8, display: "inline-block" }} />
            Now with GPT-4 & Advanced AI Matching
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.1, margin: "0 0 20px", background: "linear-gradient(135deg, #f1f5f9 30%, #a5b4fc 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            The AI Platform That Connects Talent to Opportunity
          </h1>
          <p style={{ fontSize: 18, color: "#64748b", maxWidth: 600, margin: "0 auto 36px", lineHeight: 1.7 }}>
            Students get AI career mentorship, ATS optimization, and smart job matching. Companies get AI-ranked candidates and intelligent hiring pipelines.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{ ...btnPrimary, fontSize: 15, padding: "13px 28px" }} onClick={onEnter}>Start Free →</button>
            <button style={{ ...btnSecondary, fontSize: 15, padding: "13px 28px" }} onClick={onEnter}>View Demo</button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, maxWidth: 900, margin: "0 auto", padding: "0 40px 80px" }}>
          {[
            { icon: "🤖", title: "AI Career Mentor", desc: "24/7 personalized career guidance, interview prep, and job search strategy powered by advanced AI." },
            { icon: "📊", title: "ATS Optimization", desc: "Get your resume scored against real ATS systems and receive specific improvements to pass screening." },
            { icon: "⭐", title: "Smart Matching", desc: "AI matches students to jobs and ranks candidates for companies — reducing hiring time by 60%." },
          ].map(f => (
            <div key={f.title} style={{ ...glassCard, padding: 24 }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState("landing"); // landing | auth | app
  const [role, setRole] = useState("student");
  const [active, setActive] = useState("dashboard");

  function handleLogin(r) {
    setRole(r);
    setActive(r === "student" ? "dashboard" : r === "company" ? "co-dashboard" : "ad-dashboard");
    setScreen("app");
  }

  if (screen === "landing") return <LandingPage onEnter={() => setScreen("auth")} />;
  if (screen === "auth") return <AuthPage onLogin={handleLogin} />;

  const pages = {
    // Student
    dashboard: <StudentDashboard />,
    resume: <ResumePage />,
    skills: <SkillGapPage />,
    roadmap: <RoadmapPage />,
    jobs: <JobSearchPage />,
    tracker: <TrackerPage />,
    interview: <InterviewPage />,
    mentor: <MentorPage />,
    // Company
    "co-dashboard": <CompanyDashboard />,
    "co-profile": <div style={{ padding: 28 }}><h1 style={{ color: "#f1f5f9" }}>Company Profile</h1><p style={{ color: "#64748b" }}>Edit your company info, culture, and branding.</p></div>,
    "co-jobs": <div style={{ padding: 28 }}><h1 style={{ color: "#f1f5f9" }}>Job Postings</h1><p style={{ color: "#64748b" }}>Manage your active job listings.</p></div>,
    "co-search": <CandidateSearch />,
    "co-ats": <ATSBoard />,
    "co-ranking": <CandidateSearch />,
    // Admin
    "ad-dashboard": <AdminDashboard />,
    "ad-users": <AdminUsers />,
    "ad-companies": <div style={{ padding: 28 }}><h1 style={{ color: "#f1f5f9" }}>Company Verification</h1><p style={{ color: "#64748b" }}>Review and approve company registrations.</p></div>,
    "ad-jobs": <div style={{ padding: 28 }}><h1 style={{ color: "#f1f5f9" }}>Job Monitor</h1><p style={{ color: "#64748b" }}>Monitor and moderate job postings.</p></div>,
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0a0a14", fontFamily: "system-ui,-apple-system,sans-serif", overflow: "hidden" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.4;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:#ffffff18;border-radius:4px}
        * { box-sizing: border-box; }
      `}</style>
      <Sidebar role={role} active={active} setActive={setActive} setRole={(r) => { setRole(r); setActive(r === "student" ? "dashboard" : r === "company" ? "co-dashboard" : "ad-dashboard"); }} />
      <div style={{ flex: 1, overflowY: "auto", background: "radial-gradient(ellipse 60% 40% at 70% 20%, #1e1b4b22 0%, transparent 60%)" }}>
        {pages[active] || <div style={{ padding: 28, color: "#64748b" }}>Page coming soon</div>}
      </div>
    </div>
  );
}