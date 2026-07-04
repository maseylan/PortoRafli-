import { Project, Experience } from "./types";

export const PROJECT_DATA: Project[] = [
  {
    id: "api-automation",
    title: "REST API Automation Framework",
    category: "QA Automation",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80",
    description: "Scalable REST API automation framework built with Python and Pytest.",
    longDescription: "Automated over 500+ test cases. Designed, built, and maintained a scalable REST API automation framework using Python (Pytest). Implemented data-driven testing and parameterized test scenarios for better coverage and reusability. Integrated with CI/CD pipeline (Bitbucket) to enable automated test execution on code commits. Developed custom utilities for request/response validation, schema validation, and authentication handling.",
    role: "Automation Engineer",
    client: "Internal / Client",
    year: "2025",
    tags: ["Python", "Pytest", "API Testing", "CI/CD", "Bitbucket"]
  },
  {
    id: "real-estate-automation",
    title: "Real Estate Agent Web Automation",
    category: "Web Scraping & Automation",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80",
    description: "Automated requests to WAF-protected real estate agent websites using undetected Playwright.",
    longDescription: "Automated over 3,000+ requests to WAF-protected (Cloudflare) real estate agent websites. Implemented proxy rotation to prevent blocking and detection. Optimized performance using multiprocessing for faster runtime. Developed undetected browser automation via Playwright with human-like interactions. Captured detailed network responses and messages for each request.",
    role: "Lead Automation Engineer",
    client: "Real Estate Data",
    year: "2025",
    tags: ["Playwright", "Web Scraping", "Python", "Proxy Rotation", "Multiprocessing"]
  },
  {
    id: "company-scraping",
    title: "Certified Platform Company Data Scraping",
    category: "Web Scraping",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80",
    description: "Scraped 1,900+ business profiles from search results for 120+ keywords.",
    longDescription: "Scraped all companies from search results for 120+ keywords, totaling 1,900+ business profiles. Bypassed anti-bot platforms. Built scalable automation scripts using Selenium WebDriver with stealth configuration. Exported structured datasets to Excel using Pandas. Ensured bot detection avoidance by simulating ordinary browser behavior.",
    role: "Lead Automation Engineer",
    client: "Data Analytics",
    year: "2025",
    tags: ["Selenium", "Python", "Pandas", "Data Extraction"]
  },
  {
    id: "script-dashboard",
    title: "Automation Script Dashboard & Reporting",
    category: "Full Stack Tooling",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80",
    description: "Dashboard and script management system using FastAPI (Python) and Next.js.",
    longDescription: "Created a simple dashboard and script management system using FastAPI (Python) and Next.js. Implemented logging for every action/interact element in Selenium WebDriver (Clear Log, Import Log), plus API logging. Configured Selenium WebDriver via a UI built in Next.js.",
    role: "QA Automation Developer",
    client: "Internal QA Tooling",
    year: "2025",
    tags: ["FastAPI", "Next.js", "Python", "Selenium", "React"]
  },
  {
    id: "pos-stress-testing",
    title: "PoS Product Stress Testing",
    category: "Performance Testing",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80",
    description: "Docker & Selenium Grid-based stress testing framework for PoS products.",
    longDescription: "Built a Docker & Selenium Grid-based stress testing framework for PoS products. Used multiprocessing & multithreading to execute diverse test cases concurrently. Implemented per-thread logging for parallel executions. Designed a Tkinter-based GUI for stress test execution and monitoring. Integrated the GUI with Selenium WebDriver for direct test control.",
    role: "QA Automation Engineer",
    client: "PoS Vendor",
    year: "2024",
    tags: ["Docker", "Selenium Grid", "Python", "Tkinter", "Stress Testing"]
  }
];

export const EXPERIENCE_DATA: Experience[] = [
  {
    id: "exp-1",
    role: "Test Automation Engineer (Freelance)",
    company: "Trainero",
    location: "Helsinki, Finland (Remote)",
    period: "Sep 2025 — Mar 2026",
    description: "Designed, developed, and maintained scalable UI and API automation frameworks using Playwright and Pytest to support end-to-end testing across multiple platforms.",
    bullets: [
      "Implemented robust automation practices including explicit waits, dynamic element handling, retry mechanisms, fallback logic, and exception handling.",
      "Automated regression, smoke, and functional test suites with 100+ automation scripts.",
      "Integrated automated test execution into CI/CD pipelines.",
      "Engineered parallel test execution using Selenium Grid and Docker on Chrome, Firefox, and Edge.",
      "Developed and maintained API automation tests, including schema checks and data integrity validation."
    ]
  },
  {
    id: "exp-2",
    role: "QA Engineer",
    company: "PT. Teknologi Inovasi Labs",
    location: "Cakung, Jakarta (Onsite)",
    period: "Feb 2025 — Feb 2026",
    description: "Designed and developed 100+ comprehensive test cases, test scenarios, and test plans to ensure end-to-end quality coverage.",
    bullets: [
      "Built a custom GUI-based and API-integrated test result dashboard using Selenium and Tkinter.",
      "Enhanced Selenium test execution by implementing robust logging and automated exception raising.",
      "Engineered stress testing infrastructure using Selenium Grid and Docker.",
      "Managed bug tracking and reporting lifecycle.",
      "Prevented over 80% of potential bugs through early-stage validation."
    ]
  },
  {
    id: "exp-3",
    role: "QA Engineer",
    company: "PT. Lestari Jaya Raya",
    location: "Cakung, Jakarta (Onsite)",
    period: "Feb 2024 — Jan 2025",
    description: "Gathered and analyzed business requirements for Procurement and Human Capital Management System (HCMS) modules to align system functionality with operational needs.",
    bullets: [
      "Designed, configured, and implemented Procurement and HCMS modules.",
      "Performed functional testing, User Acceptance Testing (UAT), and issue validation.",
      "Provided troubleshooting, root cause analysis, and post-deployment support.",
      "Created functional documentation, user guides, and process flow diagrams.",
      "Conducted end-user training sessions and provided system support."
    ]
  }
];

export const BIOGRAPHY_PORTRAIT = "/profilePicture.jfif";
export const LIGHT_BEAM_HERO_BG = "https://lh3.googleusercontent.com/aida-public/AB6AXuA6VV1H2UD1AEd3Q5ipm0nItQAw8Ri-A4TaJxojhh5P6BMBvUUejBRf99ayhSvvcyER-arCkBAicI_16zHSCBqkvbkPzbnJADT06Onpc8tbTFPU7Q7s9dONKmxQi9UYbdNPZK4TEEtyCxvGT-51vpo4WpdJhnF0aoRFJodeIXmgv4hQMudCMxFWWFHa0OjCef1BV-OrweR4gYuyoEtTnR7n3bWw_lLrDllRapevE3yL4LuCkS1e0aAXmT0Evm15dthPckE";
export const STUDIO_LOGO = "RAFLI AHMAD FACHREZI";
export const PHILOSOPHY_TAGS = ["Fullstack Development", "API Testing", "CI/CD Integration", "Performance Testing"];
