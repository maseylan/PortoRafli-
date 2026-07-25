import { Project, Experience } from "../types";

export const PROJECT_DATA: Project[] = [
  {
    id: "elyra-pos",
    title: "ElyraPoS - Multi-Tenant SaaS Point of Sale Platform",
    category: "Full-Stack Web & Mobile",
    image: "/PoS/image.webp",
    gallery: [
      "/PoS/image copy.webp",
      "/PoS/image2.webp"
    ],
    description: "Multi-tenant SaaS Point of Sale platform with schema-per-tenant data isolation.",
    longDescription: "Architecting a multi-tenant SaaS Point of Sale platform with schema-per-tenant data isolation, deployed on self-hosted VPS infrastructure. Designing the backend with Express.js, TypeScript, PostgreSQL, and Drizzle ORM, using PgBouncer transaction pooling, Redis caching, and Socket.io for real-time updates. Implementing tenant resolution middleware with a fail-closed security posture, plus pool-per-tenant connection management using LRU caching and AsyncLocalStorage for context propagation. Building the frontend with Vite + React + Chakra UI (web) and a separate Expo app (mobile), covering auth, cart/order management, F&B table management, and multi-payment support including QRIS.",
    role: "Full-Stack Developer",
    client: "Personal Project",
    year: "2026 - Present",
    tags: ["Express.js", "TypeScript", "PostgreSQL", "React", "Chakra UI", "Expo", "Redis", "Socket.io"]
  },
  {
    id: "chatbot-ai",
    title: "Chatbot AI - Full-Stack AI Chatbot Platform",
    category: "Full-Stack Web",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80",
    description: "Full-stack AI chatbot end-to-end with multi-model AI support.",
    longDescription: "Built a full-stack AI chatbot end-to-end: a MongoDB/Express/Node.js backend paired with a Next.js 15 + React 19 frontend. Integrated multi-model AI support (Anthropic Claude and Google Gemini APIs) with real-time response streaming via Server-Sent Events. Implemented JWT authentication with cookie-based middleware token handling and Redis-backed API rate limiting. Added file upload with .docx parsing (mammoth) and real-time web scraping (cheerio) as chatbot capabilities.",
    role: "Full-Stack Developer",
    client: "Personal Project",
    year: "2026",
    tags: ["MongoDB", "Express", "Next.js", "React", "Claude API", "Gemini API", "Redis"]
  },
  {
    id: "hrm-system-web",
    title: "HRM System - Enterprise HR Management Platform (Web)",
    category: "Full-Stack Web",
    image: "/HRM/Web/image.webp",
    gallery: [
      "/HRM/Web/image copy.webp",
      "/HRM/Web/image copy 2.webp",
      "/HRM/Web/image copy 3.webp",
      "/HRM/Web/image copy 4.webp",
      "/HRM/Web/image copy 5.webp"
    ],
    description: "Comprehensive HRM system for the Indonesian corporate market.",
    longDescription: "Architecting a comprehensive HRM system for the Indonesian corporate market on the MERN stack with TypeScript, driven by detailed technical specifications (PRDs). Designing core modules covering face-recognition attendance, payroll compliant with Indonesian regulations (BPJS, PPh21, THR), leave management, and performance management. Building a real-time internal chat module using Socket.io. Leading iterative UI/UX review of the HRM dashboard, resolving usability issues.",
    role: "Full-Stack Developer",
    client: "Personal Project",
    year: "2026 - Present",
    tags: ["MERN Stack", "TypeScript", "Socket.io", "Face Recognition"]
  },
  {
    id: "hrm-system-mobile",
    title: "HRM System - Employee Attendance & Self-Service (Mobile)",
    category: "Mobile App",
    image: "/HRM/Mobile/image.webp",
    gallery: [
      "/HRM/Mobile/image copy.webp",
      "/HRM/Mobile/image copy 3.webp",
      "/HRM/Mobile/image2.webp"
    ],
    description: "Mobile companion app for the HRM system, dibangun dengan React Native.",
    longDescription: "Dibangun dengan React Native, aplikasi mobile ini merupakan pendamping untuk sistem HRM. Berfokus pada kemudahan akses absensi face-recognition, pengajuan cuti, serta fitur chat internal secara real-time.",
    role: "Mobile Developer",
    client: "Personal Project",
    year: "2026 - Present",
    tags: ["React Native", "TypeScript", "Mobile App"]
  },
  {
    id: "script-dashboard",
    title: "Automation Script Dashboard & Reporting",
    category: "Full Stack Tooling",
    image: "/Selenium Dashboard/image.webp",
    gallery: [
      "/Selenium Dashboard/image copy.webp",
      "/Selenium Dashboard/image copy 2.webp",
      "/Selenium Dashboard/image copy 3.webp",
      "/Selenium Dashboard/image copy 4.webp",
      "/Selenium Dashboard/image copy 5.webp",
      "/Selenium Dashboard/image copy 6.webp",
      "/Selenium Dashboard/image copy 7.webp",
      "/Selenium Dashboard/image copy 8.webp"
    ],
    description: "Dashboard and script management system using FastAPI (Python) and Next.js.",
    longDescription: "Built a script management dashboard with FastAPI (Python) and Next.js, including per-action Selenium WebDriver logging, API logs, and UI-driven WebDriver configuration.",
    role: "QA Automation Developer",
    client: "Internal QA Tooling",
    year: "2025 - Ongoing",
    tags: ["FastAPI", "Next.js", "Python", "Selenium", "React"]
  },
  {
    id: "gui-selenium",
    title: "GUI + Selenium WebDriver Development",
    category: "QA Automation Tools",
    image: "/GUI Selenium Desktiop APP/image.webp",
    gallery: [
      "/GUI Selenium Desktiop APP/image copy.webp"
    ],
    description: "End-user automation GUI with an in-app multi-tab code editor.",
    longDescription: "Developed an end-user automation GUI with an in-app multi-tab code editor (search/replace, syntax highlighting) and concurrent execution logging.",
    role: "QA Automation Developer",
    client: "Internal Tooling",
    year: "2024 - Ongoing",
    tags: ["Python", "Selenium WebDriver", "GUI Development"]
  },
  {
    id: "api-automation",
    title: "REST API Automation Framework",
    category: "QA Automation",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80",
    description: "Scalable REST API automation framework built with Python and Pytest.",
    longDescription: "Automated 500+ test cases with a scalable Pytest-based REST API framework integrated into Bitbucket CI/CD, with reusable schema and auth-validation utilities.",
    role: "Automation Engineer",
    client: "Internal",
    year: "2025",
    tags: ["Python", "Pytest", "API Testing", "CI/CD", "Bitbucket"]
  },
  {
    id: "web-scraping",
    title: "Web Scraping & Automation at Scale",
    category: "Web Scraping & Automation",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80",
    description: "Stealth automation covering 1,900+ business profiles and 3,000+ requests to WAF-protected sites.",
    longDescription: "Built stealth, anti-bot-resistant automation with Playwright and Selenium (proxy rotation, multiprocessing), covering 1,900+ business profiles across 120+ keywords and 3,000+ requests to WAF-protected sites.",
    role: "Lead Automation Engineer",
    client: "Data Analytics",
    year: "2025",
    tags: ["Playwright", "Web Scraping", "Python", "Selenium"]
  },
  {
    id: "pos-stress-testing",
    title: "PoS Stress Testing & Multi-App QA",
    category: "Performance Testing",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80",
    description: "Docker & Selenium Grid-based stress testing framework with multiprocessing.",
    longDescription: "Built a Docker/Selenium Grid stress testing framework with multiprocessing and per-thread logging; led functional, regression, and integration testing across interconnected Vue.js/Laravel inventory, purchase, and fleet management applications.",
    role: "QA Automation Engineer",
    client: "PoS Vendor",
    year: "2024",
    tags: ["Docker", "Selenium Grid", "Python", "Stress Testing", "Vue.js", "Laravel"]
  }
];

export const EXPERIENCE_DATA: Experience[] = [
  {
    id: "exp-1",
    role: "Test Automation Engineer (Remote | Freelance)",
    company: "Trainero",
    location: "Helsinki, Finland",
    period: "Sep 2025 — Mar 2026",
    description: "Designed and maintained scalable UI and API automation frameworks using Playwright and Pytest for end-to-end testing.",
    bullets: [
      "Designed and maintained scalable UI and API automation frameworks using Playwright and Pytest for end-to-end testing across multiple platforms.",
      "Built parallel, cross-browser test execution infrastructure with Selenium Grid and Docker, isolating environments across Chrome, Firefox, and Edge.",
      "Automated regression, smoke, and functional suites with 100+ scripts, integrated into CI/CD pipelines with detailed reporting and failure analysis.",
      "Developed API automation covering request/response validation, schema checks, and data integrity verification.",
      "Partnered with QA, developers, and product teams on test strategy, defect tracking, and early-stage automation planning."
    ]
  },
  {
    id: "exp-2",
    role: "QA Engineer (Onsite)",
    company: "PT. Teknologi Inovasi Labs",
    location: "Cakung, Jakarta",
    period: "Feb 2025 — Feb 2026",
    description: "Designed 100+ test cases, scenarios, and test plans for end-to-end quality coverage.",
    bullets: [
      "Designed 100+ test cases, scenarios, and test plans for end-to-end quality coverage.",
      "Built a custom GUI-based, API-integrated test result dashboard in Selenium with a Tkinter-based script management system and embedded code editor.",
      "Maintained 100+ automation scripts for regression and functional testing, with robust logging, dynamic element handling, and fallback logic.",
      "Engineered Docker- and Selenium-Grid-based stress testing infrastructure with isolated parallel sessions across browsers.",
      "Owned bug tracking and reporting, and contributed to requirement analysis that helped prevent over 80% of potential bugs through early-stage validation."
    ]
  },
  {
    id: "exp-3",
    role: "QA Engineer (Onsite)",
    company: "PT. Lestari Jaya Raya",
    location: "Cakung, Jakarta",
    period: "Feb 2024 — Jan 2025",
    description: "Gathered and analyzed business requirements for Procurement and HCMS modules.",
    bullets: [
      "Gathered and analyzed business requirements for Procurement and HCMS modules, translating them into technical specifications and scalable solutions.",
      "Configured and implemented Procurement and HCMS modules, including workflow customization and feature enhancements.",
      "Performed functional testing, UAT, and issue validation before deployment, plus post-deployment troubleshooting and root cause analysis.",
      "Created functional documentation, user guides, and process flow diagrams; led end-user training sessions."
    ]
  }
];

export const BIOGRAPHY_PORTRAIT = "/profilePicture.jfif";
export const STUDIO_LOGO = "RAFLI AHMAD FACHREZI";
export const PHILOSOPHY_TAGS = ["Fullstack Development", "API Testing", "CI/CD Integration", "Performance Testing"];
