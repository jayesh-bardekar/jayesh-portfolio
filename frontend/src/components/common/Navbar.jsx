import {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

import { Link, useLocation } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import {
  Home,
  UserRound,
  Code2,
  FolderKanban,
  GraduationCap,
  Mail,
  ShieldCheck,
  ArrowUpRight,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

gsap.registerPlugin(useGSAP);

// ------------------------------------------
// NAVIGATION LINKS
// ------------------------------------------

const navLinks = [
  { name: "Home", id: "home", icon: Home },
  { name: "About", id: "about", icon: UserRound },
  { name: "Skills", id: "skills", icon: Code2 },
  { name: "Projects", id: "projects", icon: FolderKanban },
  { name: "Education", id: "education", icon: GraduationCap },
  { name: "Contact", id: "contact", icon: Mail },
];

const getValidSection = (hash) => {
  const sectionId = hash.replace(/^#/, "");

  return navLinks.some((link) => link.id === sectionId)
    ? sectionId
    : "home";
};

export default function Navbar() {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  // Refs
  const headerRef = useRef(null);
  const brandRef = useRef(null);
  const navRef = useRef(null);
  const adminRef = useRef(null);

  const [menuState, setMenuState] = useState({
    open: false,
    locationKey: "",
  });

  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);

  const isAdminPage = location.pathname.startsWith("/admin");

  const locationKey = `${location.pathname}${location.hash}`;

  const menuOpen =
    menuState.open && menuState.locationKey === locationKey;

  // ------------------------------------------
  // GSAP NAVBAR ENTRANCE ANIMATION
  // ------------------------------------------

  useGSAP(
    () => {
      if (shouldReduceMotion) return;

      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      timeline.fromTo(
        headerRef.current,
        {
          y: -25,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
        }
      );

      if (brandRef.current) {
        timeline.fromTo(
          brandRef.current,
          {
            x: -18,
            opacity: 0,
          },
          {
            x: 0,
            opacity: 1,
            duration: 0.45,
          },
          "-=0.35"
        );
      }

      const navItems =
        navRef.current?.querySelectorAll(".nav-item");

      if (navItems?.length) {
        timeline.fromTo(
          navItems,
          {
            y: -10,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.35,
            stagger: 0.07,
          },
          "-=0.25"
        );
      }

      if (adminRef.current) {
        timeline.fromTo(
          adminRef.current,
          {
            x: 12,
            opacity: 0,
          },
          {
            x: 0,
            opacity: 1,
            duration: 0.35,
          },
          "-=0.2"
        );
      }
    },
    {
      scope: headerRef,
      dependencies: [shouldReduceMotion],
      revertOnUpdate: true,
    }
  );

  // ------------------------------------------
  // CLOSE MOBILE MENU
  // ------------------------------------------

  const closeMenu = useCallback(() => {
    setMenuState((previous) => ({
      ...previous,
      open: false,
    }));
  }, []);

  // ------------------------------------------
  // GET NAVBAR HEIGHT
  // ------------------------------------------

  const getHeaderHeight = useCallback(() => {
    return headerRef.current?.offsetHeight || 72;
  }, []);

  // ------------------------------------------
  // SCROLL TO SECTION
  // ------------------------------------------

  const scrollToSection = useCallback(
    (sectionId, behavior = "auto") => {
      const section = document.getElementById(sectionId);

      if (!section) return;

      const headerHeight = getHeaderHeight();

      const sectionTop =
        section.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top: Math.max(0, sectionTop - headerHeight),
        behavior,
      });
    },
    [getHeaderHeight]
  );

  // ------------------------------------------
  // INITIAL PAGE / HASH HANDLING
  // ------------------------------------------

  useEffect(() => {
    if (isAdminPage || location.pathname !== "/") return;

    if (!location.hash) {
      window.scrollTo({
        top: 0,
        behavior: "auto",
      });

      requestAnimationFrame(() => setActiveSection("home"));
      return;
    }

    const sectionId = getValidSection(location.hash);

    requestAnimationFrame(() => {
      scrollToSection(sectionId, "auto");
      setActiveSection(sectionId);
    });
  }, [
    isAdminPage,
    location.pathname,
    location.hash,
    scrollToSection,
  ]);

  // ------------------------------------------
  // ACTIVE SECTION TRACKING
  // ------------------------------------------

  useEffect(() => {
    if (isAdminPage || location.pathname !== "/") return;

    let frameId = null;

    const updateActiveSection = () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(() => {
        const scrollY = window.scrollY;

        const viewportHeight = window.innerHeight;

        const documentHeight =
          document.documentElement.scrollHeight;

        setScrolled(scrollY > 12);

        // At the bottom of the page, activate Contact.
        if (
          scrollY + viewportHeight >=
          documentHeight - 60
        ) {
          setActiveSection("contact");
          return;
        }

        // Calculate the actual sticky navbar height.
        const headerHeight = getHeaderHeight();

        // Small tolerance below the navbar.
        const activationPoint = headerHeight + 30;

        let currentSection = "home";

        for (const { id } of navLinks) {
          const section = document.getElementById(id);

          if (!section) continue;

          const sectionTop =
            section.getBoundingClientRect().top;

          if (sectionTop <= activationPoint) {
            currentSection = id;
          }
        }

        setActiveSection((previous) =>
          previous === currentSection
            ? previous
            : currentSection
        );
      });
    };

    updateActiveSection();

    window.addEventListener("scroll", updateActiveSection, {
      passive: true,
    });

    window.addEventListener("resize", updateActiveSection);

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }

      window.removeEventListener(
        "scroll",
        updateActiveSection
      );

      window.removeEventListener(
        "resize",
        updateActiveSection
      );
    };
  }, [
    isAdminPage,
    location.pathname,
    getHeaderHeight,
  ]);

  // ------------------------------------------
  // MOBILE MENU SCROLL LOCK
  // ------------------------------------------

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [menuOpen, closeMenu]);

  if (isAdminPage) return null;

  // ------------------------------------------
  // SINGLE CLICK NAVIGATION
  // ------------------------------------------

  const handleSectionClick = (event, sectionId) => {
    closeMenu();

    // Allow React Router navigation from other pages.
    if (location.pathname !== "/") return;

    const section = document.getElementById(sectionId);

    if (!section) return;

    event.preventDefault();

    // Activate the clicked section immediately.
    setActiveSection(sectionId);

    // Update URL without refreshing.
    window.history.replaceState(
      window.history.state,
      "",
      `/#${sectionId}`
    );

    // Scroll to the exact section position.
    scrollToSection(sectionId, "auto");
  };

  // ------------------------------------------
  // BRAND CLICK - HOME
  // ------------------------------------------

  const handleBrandClick = (event) => {
    closeMenu();

    if (location.pathname !== "/") return;

    event.preventDefault();

    setActiveSection("home");

    window.history.replaceState(
      window.history.state,
      "",
      "/"
    );

    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  };

  // ------------------------------------------
  // RENDER
  // ------------------------------------------

  return (
    <>
      {/* DESKTOP HEADER */}

      <header
        ref={headerRef}
        className={`sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-2xl transition-[box-shadow,background-color] duration-300 ${
          scrolled
            ? "shadow-lg shadow-slate-900/5"
            : "shadow-sm shadow-slate-900/2"
        }`}
      >
        <nav
          className="mx-auto flex min-h-18 max-w-360 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 xl:px-12"
          aria-label="Main navigation"
        >
          {/* BRAND */}

          <Link
            ref={brandRef}
            to="/"
            onClick={handleBrandClick}
            className="group flex min-w-0 shrink-0 items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4"
            aria-label="Jayesh Bardekar - Home"
          >
            <span className="relative grid size-11 shrink-0 place-items-center sm:size-12">
              <span className="absolute inset-0 rounded-2xl bg-linear-to-br from-blue-500/25 via-indigo-500/15 to-violet-500/25 blur-md" />

              <span className="relative grid size-11 place-items-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 group-hover:-rotate-2 sm:size-12">
                <img
                  src="/images/jayesh-logo.png"
                  alt="Jayesh Bardekar logo"
                  className="size-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              </span>
            </span>

            <span className="min-w-0">
              <span className="block truncate text-sm font-extrabold tracking-tight text-slate-900 sm:text-base">
                Jayesh Bardekar
              </span>

              <span className="mt-0.5 hidden text-[11px] font-medium tracking-wide text-slate-500 sm:block sm:text-xs">
                Java Full Stack Developer
              </span>
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}

          <div
            ref={navRef}
            className="hidden items-center gap-0.5 xl:flex"
          >
            {navLinks.map(({ name, id, icon: Icon }) => {
              const isActive = activeSection === id;

              return (
                <a
                  key={id}
                  href={`/#${id}`}
                  onClick={(event) =>
                    handleSectionClick(event, id)
                  }
                  aria-current={
                    isActive ? "location" : undefined
                  }
                  className={`nav-item group relative flex items-center gap-1.5 rounded-xl px-3 py-3 text-[13px] font-semibold transition-colors duration-200 2xl:px-3.5 ${
                    isActive
                      ? "text-blue-700"
                      : "text-slate-600 hover:text-slate-950"
                  }`}
                >
                  <Icon
                    size={15}
                    strokeWidth={isActive ? 2.3 : 1.9}
                    className={`transition-colors duration-200 ${
                      isActive
                        ? "text-blue-600"
                        : "text-slate-400 group-hover:text-blue-600"
                    }`}
                  />

                  <span>{name}</span>

                  {/* INSTANT ACTIVE UNDERLINE */}

                  {isActive && (
                    <span className="absolute inset-x-3 bottom-1 h-0.75 rounded-full bg-linear-to-r from-blue-600 to-indigo-600" />
                  )}
                </a>
              );
            })}
          </div>

          {/* DESKTOP ADMIN */}

          <div
            ref={adminRef}
            className="hidden shrink-0 xl:block"
          >
            <Link
              to="/admin/login"
              className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <ShieldCheck
                size={16}
                className="text-slate-400 group-hover:text-blue-600"
              />

              <span>Admin</span>

              <ArrowUpRight size={14} />
            </Link>
          </div>

          {/* MOBILE MENU BUTTON */}

          <button
            type="button"
            onClick={() =>
              setMenuState((previous) => {
                const isOpenAtCurrentLocation =
                  previous.open &&
                  previous.locationKey === locationKey;

                return {
                  open: !isOpenAtCurrentLocation,
                  locationKey,
                };
              })
            }
            className="grid size-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 xl:hidden"
            aria-label={
              menuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            <AnimatePresence mode="wait" initial={false}>
              {menuOpen ? (
                <motion.span
                  key="close"
                  initial={
                    shouldReduceMotion
                      ? false
                      : { rotate: -90, opacity: 0 }
                  }
                  animate={{
                    rotate: 0,
                    opacity: 1,
                  }}
                  exit={
                    shouldReduceMotion
                      ? undefined
                      : { rotate: 90, opacity: 0 }
                  }
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.16,
                  }}
                  className="flex"
                >
                  <X size={21} />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={
                    shouldReduceMotion
                      ? false
                      : { rotate: 90, opacity: 0 }
                  }
                  animate={{
                    rotate: 0,
                    opacity: 1,
                  }}
                  exit={
                    shouldReduceMotion
                      ? undefined
                      : { rotate: -90, opacity: 0 }
                  }
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.16,
                  }}
                  className="flex"
                >
                  <Menu size={21} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </nav>
      </header>

      {/* MOBILE NAVIGATION */}

      <AnimatePresence>
        {menuOpen && (
          <>
            {/* BACKDROP */}

            <motion.button
              type="button"
              aria-label="Close navigation menu backdrop"
              className="fixed inset-0 z-40 cursor-default bg-slate-950/25 backdrop-blur-[2px] xl:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.2,
              }}
              onClick={closeMenu}
            />

            {/* MOBILE MENU */}

            <motion.div
              id="mobile-navigation"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              className="fixed inset-x-3 top-20 z-50 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-3xl border border-slate-200/90 bg-white p-3 shadow-2xl shadow-slate-900/15 sm:inset-x-6 sm:top-22 sm:p-4 xl:hidden"
              initial={
                shouldReduceMotion
                  ? false
                  : { opacity: 0, y: -10, scale: 0.98 }
              }
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: -8, scale: 0.98 }
              }
              transition={{
                duration: shouldReduceMotion ? 0 : 0.2,
                ease: "easeOut",
              }}
            >
              {/* MENU HEADER */}

              <div className="mb-3 flex items-center justify-between border-b border-slate-100 px-2 pb-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Explore Portfolio
                  </p>
                </div>

                <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  Menu
                </span>
              </div>

              {/* MOBILE LINKS */}

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {navLinks.map(
                  ({ name, id, icon: Icon }, index) => {
                    const isActive = activeSection === id;

                    return (
                      <motion.a
                        key={id}
                        href={`/#${id}`}
                        onClick={(event) =>
                          handleSectionClick(event, id)
                        }
                        aria-current={
                          isActive ? "location" : undefined
                        }
                        initial={
                          shouldReduceMotion
                            ? false
                            : { opacity: 0, y: 8 }
                        }
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.18,
                          delay: shouldReduceMotion
                            ? 0
                            : index * 0.035,
                        }}
                        className={`group flex min-h-20 flex-col items-start justify-between rounded-2xl border p-3 text-left transition-all duration-200 sm:min-h-22 sm:p-4 ${
                          isActive
                            ? "border-blue-200 bg-linear-to-br from-blue-50 to-indigo-50 text-blue-700 shadow-sm"
                            : "border-slate-100 bg-slate-50/70 text-slate-700 hover:border-blue-100 hover:bg-blue-50/60"
                        }`}
                      >
                        <span
                          className={`grid size-8 place-items-center rounded-xl ${
                            isActive
                              ? "bg-white text-blue-600 shadow-sm"
                              : "bg-white text-slate-500 group-hover:text-blue-600"
                          }`}
                        >
                          <Icon size={17} strokeWidth={2} />
                        </span>

                        <span className="flex w-full items-center justify-between gap-1 text-sm font-semibold">
                          {name}

                          <ChevronRight
                            size={14}
                            className={`transition-transform ${
                              isActive
                                ? "translate-x-0.5 text-blue-600"
                                : "text-slate-400 group-hover:translate-x-0.5 group-hover:text-blue-600"
                            }`}
                          />
                        </span>

                        {/* MOBILE ACTIVE INDICATOR */}

                        {isActive && (
                          <span className="mt-2 h-0.75 w-full rounded-full bg-linear-to-r from-blue-600 to-indigo-600" />
                        )}
                      </motion.a>
                    );
                  }
                )}
              </div>

              {/* MOBILE ADMIN LOGIN */}

              <div className="mt-3 border-t border-slate-100 pt-3">
                <Link
                  to="/admin/login"
                  onClick={closeMenu}
                  className="group flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  <span className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-white group-hover:text-blue-600">
                      <ShieldCheck size={17} />
                    </span>

                    <span>
                      Admin Login

                      <span className="mt-0.5 block text-xs font-normal text-slate-500">
                        Manage portfolio content
                      </span>
                    </span>
                  </span>

                  <ArrowUpRight
                    size={17}
                    className="text-slate-400 group-hover:text-blue-600"
                  />
                </Link>
              </div>

              {/* FOOTER */}

              <p className="mt-3 text-center text-[11px] text-slate-400">
                Jayesh Bardekar · Portfolio
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
