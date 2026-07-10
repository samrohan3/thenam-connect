// Mock data used across the ERP frontend. Replace with real API responses later.

export const stats = [
  { label: "Total Revenue", value: "$2.4M", delta: "+12.4%", tone: "royal" },
  { label: "Monthly Profit", value: "$318K", delta: "+8.1%", tone: "emerald" },
  { label: "Active Ventures", value: "4", delta: "+1", tone: "gold" },
  { label: "Employees", value: "128", delta: "+6", tone: "royal" },
  { label: "Completed Projects", value: "87", delta: "+14", tone: "emerald" },
  { label: "Pending Tasks", value: "42", delta: "-5", tone: "gold" },
] as const;

export const revenueSeries = [
  { month: "Jan", revenue: 120, expense: 70, profit: 50 },
  { month: "Feb", revenue: 145, expense: 82, profit: 63 },
  { month: "Mar", revenue: 168, expense: 90, profit: 78 },
  { month: "Apr", revenue: 190, expense: 100, profit: 90 },
  { month: "May", revenue: 210, expense: 115, profit: 95 },
  { month: "Jun", revenue: 235, expense: 128, profit: 107 },
  { month: "Jul", revenue: 260, expense: 140, profit: 120 },
  { month: "Aug", revenue: 288, expense: 150, profit: 138 },
  { month: "Sep", revenue: 305, expense: 165, profit: 140 },
  { month: "Oct", revenue: 330, expense: 180, profit: 150 },
  { month: "Nov", revenue: 360, expense: 195, profit: 165 },
  { month: "Dec", revenue: 402, expense: 210, profit: 192 },
];

export const expenseBreakdown = [
  { name: "Payroll", value: 45 },
  { name: "Operations", value: 22 },
  { name: "Marketing", value: 15 },
  { name: "Tools & SaaS", value: 10 },
  { name: "Other", value: 8 },
];

export const productivity = [
  { team: "Design", value: 82 },
  { team: "Engineering", value: 91 },
  { team: "Marketing", value: 74 },
  { team: "Sales", value: 88 },
  { team: "Support", value: 79 },
];

export const projectStatus = [
  { name: "Planning", value: 8 },
  { name: "UI/UX", value: 6 },
  { name: "Development", value: 14 },
  { name: "Testing", value: 5 },
  { name: "Completed", value: 22 },
];

export const ventures = [
  {
    key: "paperheros",
    name: "PaperHeros",
    tagline: "Educational content & workbooks",
    revenue: "$820K",
    projects: 18,
    employees: 34,
    growth: 24,
    gradient: "gradient-royal",
  },
  {
    key: "zaymazone",
    name: "Zaymazone",
    tagline: "E-commerce marketplace",
    revenue: "$1.1M",
    projects: 22,
    employees: 48,
    growth: 31,
    gradient: "gradient-emerald",
  },
  {
    key: "printkada",
    name: "PrintKada",
    tagline: "On-demand printing solutions",
    revenue: "$420K",
    projects: 12,
    employees: 26,
    growth: 18,
    gradient: "gradient-gold",
  },
  {
    key: "future",
    name: "Future Ventures",
    tagline: "R&D and incubation lab",
    revenue: "$60K",
    projects: 4,
    employees: 8,
    growth: 42,
    gradient: "gradient-brand",
  },
] as const;

export const employees = Array.from({ length: 24 }).map((_, i) => {
  const roles = ["Product Designer", "Frontend Engineer", "Backend Engineer", "Marketing Lead", "Data Analyst", "QA Engineer", "HR Manager", "Sales Executive"];
  const depts = ["Design", "Engineering", "Marketing", "Sales", "Support", "Operations"];
  const first = ["Aarav","Isha","Rohan","Priya","Kabir","Neha","Vikram","Ananya","Dev","Zara","Aditya","Meera","Yash","Riya","Arjun","Sana","Nikhil","Tara","Karan","Diya","Aryan","Kiara","Rehan","Ira"];
  const last = ["Sharma","Patel","Khan","Iyer","Menon","Reddy","Kapoor","Bose","Joshi","Rao","Sinha","Nair","Verma","Das","Roy","Malik","Shah","Pillai","Kumar","Bhat","Gupta","Chopra","Ali","Mehta"];
  return {
    id: i + 1,
    name: `${first[i % first.length]} ${last[i % last.length]}`,
    role: roles[i % roles.length],
    department: depts[i % depts.length],
    performance: 60 + ((i * 7) % 40),
    projects: 2 + (i % 6),
    status: i % 5 === 0 ? "On leave" : "Active",
    avatar: `https://i.pravatar.cc/120?img=${(i % 70) + 1}`,
  };
});

export const kanbanColumns = [
  {
    key: "planning",
    title: "Planning",
    tint: "royal",
    tasks: [
      { id: "t1", title: "Q3 Roadmap workshop", priority: "High", assignee: "Isha Patel", progress: 15, due: "Jul 28", tags: ["strategy"] },
      { id: "t2", title: "Vendor onboarding brief", priority: "Medium", assignee: "Rohan Khan", progress: 30, due: "Aug 02", tags: ["ops"] },
    ],
  },
  {
    key: "uiux",
    title: "UI/UX",
    tint: "gold",
    tasks: [
      { id: "t3", title: "PaperHeros storefront redesign", priority: "High", assignee: "Aarav Sharma", progress: 55, due: "Jul 30", tags: ["design","web"] },
      { id: "t4", title: "Zaymazone checkout flow", priority: "Medium", assignee: "Priya Iyer", progress: 40, due: "Aug 05", tags: ["mobile"] },
    ],
  },
  {
    key: "dev",
    title: "Development",
    tint: "royal",
    tasks: [
      { id: "t5", title: "Wallet API v2", priority: "High", assignee: "Kabir Menon", progress: 68, due: "Aug 10", tags: ["backend"] },
      { id: "t6", title: "Reporting engine", priority: "High", assignee: "Neha Reddy", progress: 72, due: "Aug 12", tags: ["data"] },
      { id: "t7", title: "Notifications service", priority: "Low", assignee: "Vikram Kapoor", progress: 45, due: "Aug 15", tags: ["infra"] },
    ],
  },
  {
    key: "testing",
    title: "Testing",
    tint: "gold",
    tasks: [
      { id: "t8", title: "PrintKada order QA", priority: "Medium", assignee: "Ananya Bose", progress: 82, due: "Jul 26", tags: ["qa"] },
    ],
  },
  {
    key: "done",
    title: "Completed",
    tint: "emerald",
    tasks: [
      { id: "t9", title: "SSO rollout", priority: "High", assignee: "Dev Joshi", progress: 100, due: "Jul 12", tags: ["security"] },
      { id: "t10", title: "Employee handbook v3", priority: "Low", assignee: "Zara Rao", progress: 100, due: "Jul 08", tags: ["hr"] },
    ],
  },
] as const;

export const transactions = [
  { id: "TX-10241", party: "Zaymazone Retail",   type: "Income",  amount: 24500, date: "Jul 22, 2026", status: "Completed" },
  { id: "TX-10240", party: "AWS Cloud Services", type: "Expense", amount: 4820,  date: "Jul 21, 2026", status: "Completed" },
  { id: "TX-10239", party: "PaperHeros Subs",    type: "Income",  amount: 18240, date: "Jul 20, 2026", status: "Completed" },
  { id: "TX-10238", party: "Payroll July",       type: "Expense", amount: 92000, date: "Jul 20, 2026", status: "Completed" },
  { id: "TX-10237", party: "Investor Payout",    type: "Expense", amount: 15000, date: "Jul 19, 2026", status: "Pending"   },
  { id: "TX-10236", party: "PrintKada Orders",   type: "Income",  amount: 9800,  date: "Jul 18, 2026", status: "Completed" },
  { id: "TX-10235", party: "Marketing Retainer", type: "Expense", amount: 6400,  date: "Jul 17, 2026", status: "Completed" },
];

export const leaderboard = [
  { name: "Neha Reddy",   role: "Engineering",  points: 4820, badges: ["🏆","⚡","🎯"] },
  { name: "Aarav Sharma", role: "Design",       points: 4520, badges: ["🏆","🎨"] },
  { name: "Kabir Menon",  role: "Engineering",  points: 4310, badges: ["⚡","🚀"] },
  { name: "Priya Iyer",   role: "Design",       points: 4090, badges: ["🎨","🎯"] },
  { name: "Vikram Kapoor",role: "Operations",   points: 3860, badges: ["🎯"] },
  { name: "Zara Rao",     role: "HR",           points: 3620, badges: ["💎"] },
  { name: "Dev Joshi",    role: "Security",     points: 3510, badges: ["🛡️"] },
];

export const documents = [
  { name: "Employee Handbook v3", category: "HR",       size: "2.4 MB", updated: "Jul 12, 2026" },
  { name: "Q2 Financial Report",  category: "Finance",  size: "1.8 MB", updated: "Jul 05, 2026" },
  { name: "Zaymazone Brand Kit",  category: "Design",   size: "18.6 MB",updated: "Jun 28, 2026" },
  { name: "Vendor MSA Template",  category: "Legal",    size: "312 KB", updated: "Jun 22, 2026" },
  { name: "Product Roadmap H2",   category: "Strategy", size: "984 KB", updated: "Jun 18, 2026" },
  { name: "Security Policy 2026", category: "Security", size: "540 KB", updated: "Jun 10, 2026" },
  { name: "Marketing Playbook",   category: "Marketing",size: "3.2 MB", updated: "Jun 04, 2026" },
  { name: "Investor Deck v7",     category: "Finance",  size: "6.1 MB", updated: "May 30, 2026" },
];

export const announcements = [
  { author: "CEO", title: "H2 2026 Kickoff — All-hands Friday 4pm", time: "2h ago", tone: "royal" },
  { author: "HR",  title: "New wellness benefits live in your portal", time: "1d ago", tone: "emerald" },
  { author: "IT",  title: "Scheduled maintenance Sunday 02:00–04:00 IST", time: "2d ago", tone: "gold" },
];

export const chatThreads = [
  { name: "Engineering", last: "Kabir: Deploy is green ✅", time: "12:04" },
  { name: "Design Guild", last: "Aarav: New tokens shipped", time: "11:48" },
  { name: "Founders", last: "You: Let's sync at 3", time: "10:22" },
  { name: "Marketing", last: "Neha: Draft attached", time: "Yesterday" },
];
