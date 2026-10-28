import { motion, useReducedMotion } from "framer-motion";
import {
  MapPin,
  ArrowUpRight,
  Code2,
  BriefcaseBusiness,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const profile = {
  firstName: "Jayesh",
  lastName: "Bardekar",
  title: "Java Full Stack Developer",
  subtitle: "& MERN Stack Enthusiast",
  location: "Pune, Maharashtra, India",
  description:
    "I build modern web applications using Java, Spring Boot, SQL, React.js, Node.js, Express.js, and MongoDB. I enjoy solving practical problems and creating clean, responsive, and user-friendly digital experiences.",
};

const technologies = [
  {
    name: "Java",
    color:
      "border-orange-200 bg-orange-50 text-orange-700 hover:border-orange-300",
  },
  {
    name: "Spring Boot",
    color: "border-green-200 bg-green-50 text-green-700 hover:border-green-300",
  },
  {
    name: "SQL",
    color:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300",
  },
  {
    name: "React.js",
    color: "border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-300",
  },
  {
    name: "Express.js",
    color: "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300",
  },
  {
    name: "Node.js",
    color: "border-lime-200 bg-lime-50 text-lime-700 hover:border-lime-300",
  },
];

const transition = {
  duration: 0.65,
  ease: "easeOut",
};

export default function Hero() {
  const shouldReduceMotion = useReducedMotion();

  const entrance = (direction = 0, delay = 0) => ({
    initial: shouldReduceMotion
      ? false
      : {
          opacity: 0,
          x: direction,
          y: direction === 0 ? 14 : 0,
        },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
    },
    transition: {
      ...transition,
      delay: shouldReduceMotion ? 0 : delay,
    },
  });

  const scrollToSection = (event, sectionId) => {
    event.preventDefault();

    const section = document.getElementById(sectionId);

    if (!section) return;

    window.history.replaceState(window.history.state, "", `/#${sectionId}`);

    section.scrollIntoView({
      behavior: shouldReduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  const floatingAnimation = (distance, duration, delay = 0) => ({
    animate: shouldReduceMotion ? { y: 0 } : { y: [0, distance, 0] },
    transition: {
      duration,
      delay: shouldReduceMotion ? 0 : delay,
      repeat: shouldReduceMotion ? 0 : Infinity,
      ease: "easeInOut",
    },
  });

  return (
    <section
      id="home"
      className="relative isolate flex scroll-mt-24 items-center overflow-hidden bg-linear-to-br from-white via-indigo-50/50 to-sky-50/70 px-4 pt-4 pb-8 sm:px-6 sm:pt-5 sm:pb-10 lg:min-h-[calc(100svh-72px)] lg:px-8 lg:pt-5 lg:pb-8 xl:px-12"
    >
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-32 top-0 size-64 rounded-full bg-violet-200/35 blur-3xl sm:size-96" />

        <div className="absolute -right-24 top-12 size-72 rounded-full bg-sky-200/45 blur-3xl sm:size-112" />

        <div className="absolute bottom-0 left-1/2 size-64 -translate-x-1/2 rounded-full bg-blue-100/40 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_0.7px,transparent_0.7px)] bg-size-[28px_28px] opacity-20" />

        <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-slate-200/80 to-transparent" />
      </div>

      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 md:grid-cols-[1.08fr_0.92fr] md:gap-8 lg:gap-12 xl:gap-16">
        {/* Left: Introduction */}
        <motion.div
          {...entrance(-22, 0)}
          className="order-2 min-w-0 text-center md:order-1 md:text-left"
        >
          {/* Greeting */}
          <motion.p
            {...entrance(0, 0.15)}
            className="mb-2 text-sm font-bold tracking-wide text-blue-700 sm:text-base"
          >
            Hello, I&apos;m
          </motion.p>

          {/* Name */}
          <motion.h1
            {...entrance(0, 0.2)}
            className="text-4xl font-extrabold leading-[1.08] tracking-[-0.045em] text-slate-950 sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl"
          >
            {profile.firstName}
            <br />

            <span className="bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              {profile.lastName}
            </span>
          </motion.h1>

          {/* Professional title */}
          <motion.div {...entrance(0, 0.28)}>
            <h2 className="mt-5 text-xl font-bold leading-snug tracking-tight text-slate-800 sm:text-2xl lg:text-3xl">
              {profile.title}
            </h2>

            <p className="mt-2 text-base font-semibold text-indigo-600 sm:text-lg">
              {profile.subtitle}
            </p>
          </motion.div>

          {/* Location */}
          <motion.p
            {...entrance(0, 0.34)}
            className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-slate-500 sm:text-base md:justify-start"
          >
            <MapPin
              size={18}
              className="shrink-0 text-blue-600"
              aria-hidden="true"
            />

            <span>{profile.location}</span>
          </motion.p>

          {/* Description */}
          <motion.p
            {...entrance(0, 0.4)}
            className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8 md:mx-0"
          >
            {profile.description}
          </motion.p>

          {/* Technology badges */}
          <div className="mt-6 flex flex-wrap justify-center gap-2 md:justify-start">
            {technologies.map((technology, index) => (
              <motion.span
                key={technology.name}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  ...transition,
                  delay: shouldReduceMotion ? 0 : 0.45 + index * 0.07,
                }}
                whileHover={
                  shouldReduceMotion ? undefined : { y: -3, scale: 1.03 }
                }
                className={`inline-flex items-center rounded-full border px-3.5 py-2 text-xs font-semibold shadow-sm transition-colors duration-200 sm:text-sm ${technology.color}`}
              >
                {technology.name}
              </motion.span>
            ))}
          </div>

          {/* Action buttons */}
          <motion.div
            {...entrance(0, 0.55)}
            className="mt-8 flex flex-col items-stretch justify-center gap-3 min-[420px]:flex-row min-[420px]:items-center md:justify-start"
          >
            <a
              href="/#projects"
              onClick={(event) => scrollToSection(event, "projects")}
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200/70 transition-all duration-300 hover:-translate-y-1 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-200/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
            >
              <Code2 size={18} aria-hidden="true" />

              <span>Explore Projects</span>

              <ArrowUpRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </a>

            <a
              href="/#contact"
              onClick={(event) => scrollToSection(event, "contact")}
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
            >
              <BriefcaseBusiness size={17} aria-hidden="true" />

              <span>Contact Me</span>

              <ArrowUpRight
                size={16}
                className="text-slate-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue-600"
                aria-hidden="true"
              />
            </a>
          </motion.div>
        </motion.div>

        {/* Right: Profile image */}
        <motion.div
          {...entrance(22, 0.15)}
          className="order-1 flex min-w-0 justify-center md:order-2"
        >
          <div className="relative w-full max-w-60 sm:max-w-72 md:max-w-64 lg:max-w-80 xl:max-w-88">
            {/* Animated background glow */}
            <motion.div
              aria-hidden="true"
              animate={
                shouldReduceMotion
                  ? { opacity: 0.6, scale: 1 }
                  : {
                      scale: [1, 1.045, 1],
                      opacity: [0.5, 0.78, 0.5],
                    }
              }
              transition={{
                duration: 5,
                repeat: shouldReduceMotion ? 0 : Infinity,
                ease: "easeInOut",
              }}
              className="absolute -inset-5 rounded-full bg-linear-to-br from-violet-300/60 via-sky-200/60 to-blue-200/50 blur-2xl sm:-inset-7"
            />

            {/* Decorative outer ring */}
            <div
              aria-hidden="true"
              className="absolute -inset-2 rounded-full border border-blue-200/80 sm:-inset-3"
            />

            <div
              aria-hidden="true"
              className="absolute -inset-4 rounded-full border border-dashed border-indigo-200/70 sm:-inset-5"
            />

            {/* Profile image frame */}
            <motion.div
              whileHover={shouldReduceMotion ? undefined : { scale: 1.015 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative aspect-square overflow-hidden rounded-full border-4 border-white bg-linear-to-br from-violet-100 via-white to-sky-100 p-1.5 shadow-2xl shadow-slate-300/60 sm:p-2"
            >
              <img
                src="/images/jayesh-logo.png"
                alt="Jayesh Bardekar, Java Full Stack Developer"
                className="h-full w-full rounded-full object-cover object-[center_25%]"
                fetchPriority="high"
                decoding="async"
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-2 rounded-full border border-white/70"
              />
            </motion.div>

            {/* Floating Java badge */}
            <motion.div
              {...floatingAnimation(-5, 3.5)}
              className="absolute -left-2 top-[13%] rounded-2xl border border-orange-100 bg-white/95 px-3 py-2.5 shadow-lg shadow-orange-100/70 backdrop-blur-xl sm:-left-5 sm:px-4"
            >
              <p className="text-xs font-extrabold text-orange-600 sm:text-sm">
                Java
              </p>

              <p className="mt-0.5 text-[10px] font-medium text-slate-500 sm:text-xs">
                Spring Boot
              </p>
            </motion.div>

            {/* Floating React badge */}
            <motion.div
              {...floatingAnimation(5, 4, 0.4)}
              className="absolute -right-2 bottom-[20%] rounded-2xl border border-sky-100 bg-white/95 px-3 py-2.5 shadow-lg shadow-sky-100/70 backdrop-blur-xl sm:-right-5 sm:px-4"
            >
              <p className="text-xs font-extrabold text-sky-600 sm:text-sm">
                React.js
              </p>

              <p className="mt-0.5 text-[10px] font-medium text-slate-500 sm:text-xs">
                Node.js
              </p>
            </motion.div>

            {/* Floating MongoDB badge */}
            <motion.div
              animate={shouldReduceMotion ? { y: 0 } : { y: [0, -4, 0] }}
              transition={{
                duration: 4,
                delay: 0.6,
                repeat: shouldReduceMotion ? 0 : Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-emerald-100 bg-white/95 px-4 py-2.5 shadow-lg shadow-emerald-100/70 backdrop-blur-xl"
            >
              <p className="text-xs font-bold text-emerald-700 sm:text-sm">
                SQL
              </p>
              <p className="mt-0.5 text-[10px] font-medium text-slate-500 sm:text-xs">
                mongoDB
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
