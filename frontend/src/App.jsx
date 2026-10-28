import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Link,
} from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUp, Home as HomeIcon, Compass } from "lucide-react";

// Common Components
import Navbar from "./components/common/Navbar";
import AdminRoute from "./components/common/AdminRoute";

// Portfolio Sections
import Hero from "./components/home/Hero";
import About from "./components/home/About";
import Skills from "./components/home/Skills";
import Projects from "./components/home/Projects";
import Education from "./components/home/Education";
import Contact from "./components/home/Contact";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AddProject from "./pages/admin/AddProject";
import EditProject from "./pages/admin/EditProject";

/* =========================================
Shared Helpers
========================================= */

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* =========================================
Scroll Manager
Supports direct section links and routes.
========================================= */

function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    let frameId;

    const scrollToTarget = () => {
      if (cancelled) return;

      if (hash) {
        const sectionId = decodeURIComponent(hash.slice(1));
        const target = document.getElementById(sectionId);

        if (target) {
          target.scrollIntoView({
            behavior: prefersReducedMotion() ? "auto" : "smooth",
            block: "start",
          });
          return;
        }

        // Give React time to mount the requested section.
        if (attempts < 20) {
          attempts += 1;
          frameId = requestAnimationFrame(scrollToTarget);
        }

        return;
      }

      window.scrollTo({
        top: 0,
        behavior: "instant",
      });
    };

    frameId = requestAnimationFrame(scrollToTarget);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
    };
  }, [pathname, hash]);

  return null;
}

/* =========================================
Animated Section Wrapper
========================================= */

function RevealSection({ children, id, className = "" }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      id={id}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{
        once: true,
        amount: 0.04,
      }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`scroll-mt-24 ${className}`}
    >
      {children}
    </motion.section>
  );
}

/* =========================================
Portfolio Footer
========================================= */

function Footer() {
  const year = new Date().getFullYear();

  const scrollToTop = (event) => {
    event.preventDefault();

    if (window.location.pathname !== "/") {
      window.location.href = "/#home";
      return;
    }

    window.history.replaceState(null, "", "/#home");

    document.getElementById("home")?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <footer className="relative overflow-hidden border-t border-slate-200/80 bg-white">
      {/* Subtle top accent */}{" "}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-blue-300/70 to-transparent"
      />
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 py-7 text-center sm:px-8 md:flex-row md:text-left lg:px-10">
        <div>
          <Link
            to="/#home"
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 text-base font-extrabold tracking-tight text-slate-900 transition-colors hover:text-blue-600"
          >
            Jayesh Bardekar
          </Link>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Java Full Stack &amp; MERN Stack Developer.
          </p>

          <p className="mt-1 text-xs text-slate-400">
            © {year} All rights reserved.
          </p>
        </div>

        <a
          href="/#home"
          onClick={scrollToTop}
          className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md hover:shadow-blue-100/70"
        >
          Back to top
          <ArrowUp
            size={16}
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:-translate-y-0.5"
          />
        </a>
      </div>
    </footer>
  );
}

/* =========================================
Main Portfolio Page
========================================= */

function Home() {
  return (
    <main className="min-h-screen overflow-x-clip bg-slate-50 text-slate-900">
      {/* Hero */}{" "}
      <div>
        <Hero />
      </div>
      {/* About */}
      <RevealSection
        id="about"
        className="border-t border-slate-200/60 bg-white"
      >
        <About />
      </RevealSection>
      {/* Skills */}
      <RevealSection
        id="skills"
        className="border-t border-slate-200/60 bg-slate-50"
      >
        <Skills />
      </RevealSection>
      {/* Projects */}
      <RevealSection
        id="projects"
        className="border-t border-slate-200/60 bg-white"
      >
        <Projects />
      </RevealSection>
      {/* Education */}
      <RevealSection
        id="education"
        className="border-t border-slate-200/60 bg-slate-50"
      >
        <Education />
      </RevealSection>
      {/* Contact */}
      <RevealSection
        id="contact"
        className="border-t border-slate-200/60 bg-white"
      >
        <Contact />
      </RevealSection>
      <Footer />
    </main>
  );
}

/* =========================================
Modern 404 Page
========================================= */

function NotFound() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <main className="relative isolate flex min-h-[calc(100svh-76px)] items-center justify-center overflow-hidden bg-slate-50 px-5 py-16 text-slate-900 sm:px-8">
      {/* Background decorations */}{" "}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full bg-blue-200/35 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-0 -z-10 h-80 w-80 rounded-full bg-violet-200/30 blur-3xl"
      />
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.45,
          ease: "easeOut",
        }}
        className="w-full max-w-lg text-center"
      >
        <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-100 bg-white text-blue-600 shadow-lg shadow-blue-100/50 sm:h-20 sm:w-20">
          <Compass size={32} strokeWidth={1.7} aria-hidden="true" />
        </div>

        <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-blue-600 sm:text-sm">
          Page Not Found
        </p>

        <h1 className="bg-linear-to-r from-slate-900 via-blue-800 to-violet-700 bg-clip-text text-7xl font-black tracking-tight text-transparent sm:text-8xl">
          404
        </h1>

        <h2 className="mt-5 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Looks like you took a wrong turn.
        </h2>

        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-slate-600 sm:text-base">
          The page you are looking for does not exist or may have been moved.
          Let's get you back to the portfolio.
        </p>

        <Link
          to="/"
          className="group mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200/70 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
        >
          <HomeIcon size={17} aria-hidden="true" />
          Back to Portfolio
          <ArrowRight
            size={16}
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>
      </motion.div>
    </main>
  );
}

/* =========================================
Legacy Section Redirects
========================================= */

function SectionRedirect({ section }) {
  useEffect(() => {
    window.location.replace(`/#${section}`);
  }, [section]);

  return (
    <main className="flex min-h-[50vh] items-center justify-center bg-slate-50 px-5">
      {" "}
      <div className="text-center">
        {" "}
        <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600 motion-reduce:animate-none" />
        <p className="text-sm font-medium text-slate-500">
          Opening portfolio section...
        </p>
      </div>
    </main>
  );
}

/* =========================================
Application Routes
========================================= */

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {" "}
      <ScrollManager />
      {!isAdminRoute && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Main Portfolio */}
          <Route path="/" element={<Home />} />

          {/* Legacy Section URLs */}
          <Route path="/about" element={<SectionRedirect section="about" />} />

          <Route
            path="/skills"
            element={<SectionRedirect section="skills" />}
          />

          <Route
            path="/projects"
            element={<SectionRedirect section="projects" />}
          />

          <Route
            path="/education"
            element={<SectionRedirect section="education" />}
          />

          <Route
            path="/contact"
            element={<SectionRedirect section="contact" />}
          />

          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            <Route path="/admin/projects/add" element={<AddProject />} />

            <Route path="/admin/projects/edit/:id" element={<EditProject />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

/* =========================================
Root Application
========================================= */

export default function App() {
  return (
    <BrowserRouter>
      {" "}
      <AppContent />{" "}
    </BrowserRouter>
  );
}
