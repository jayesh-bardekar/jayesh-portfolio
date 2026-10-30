import API from "../../utils/api";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  FileText,
  Download,
  ArrowUpRight,
  GraduationCap,
  Code2,
  MapPin,
  Layers3,
  Target,
  LoaderCircle,
} from "lucide-react";

const highlights = [
  {
    icon: Code2,
    title: "Full Stack Development",
    description:
      "Building responsive interfaces and reliable backend functionality.",
  },
  {
    icon: Layers3,
    title: "Modern Technologies",
    description:
      "Working with Java, Spring Boot, React.js, Node.js, and databases.",
  },
  {
    icon: Target,
    title: "Continuous Learning",
    description:
      "Improving development skills through practical projects and hands-on learning.",
  },
];

export default function About() {
  const shouldReduceMotion = useReducedMotion();

  const [resume, setResume] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(true);
  const [resumeError, setResumeError] = useState("");

  // Fetch latest resume from backend
  useEffect(() => {
    let active = true;

    const fetchResume = async () => {
      try {
        setResumeLoading(true);
        setResumeError("");

        const response = await API.get("/api/documents/resume");
        const data = response.data;

        if (!data.success || !data.resume) {
          throw new Error(data.message || "Resume not available.");
        }

        if (active) {
          setResume(data.resume);
        }
      } catch (error) {
        console.error("Resume loading failed:", error);

        if (active) {
          setResumeError(
            error.response?.data?.message || "Resume is currently unavailable.",
          );
        }
      } finally {
        if (active) {
          setResumeLoading(false);
        }
      }
    };

    fetchResume();

    return () => {
      active = false;
    };
  }, []);

  const entrance = (delay = 0) => ({
    initial: shouldReduceMotion ? false : { opacity: 0, y: 14 },
    whileInView: {
      opacity: 1,
      y: 0,
    },
    viewport: {
      once: true,
      amount: 0.12,
    },
    transition: {
      duration: shouldReduceMotion ? 0 : 0.45,
      delay: shouldReduceMotion ? 0 : delay,
      ease: "easeOut",
    },
  });

  return (
    <main
      id="about"
      className="relative isolate scroll-mt-24 overflow-hidden bg-linear-to-br from-white via-slate-50 to-blue-50/50 px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6"
    >
      {/* Background decoration */}{" "}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {" "}
        <div className="absolute -left-24 top-12 size-56 rounded-full bg-blue-100/50 blur-3xl sm:size-72" />
        <div className="absolute -right-20 bottom-8 size-64 rounded-full bg-violet-100/45 blur-3xl sm:size-80" />
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_0.65px,transparent_0.65px)] bg-size-[28px_28px] opacity-15" />
      </div>
      <div className="mx-auto w-full max-w-6xl">
        {/* Section heading */}
        <motion.div
          {...entrance(0)}
          className="mx-auto mb-4 max-w-2xl text-center sm:mb-5"
        >
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            About{" "}
            <span className="bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Me
            </span>
          </h1>

          <div className="mx-auto mt-2 h-1 w-14 rounded-full bg-linear-to-r from-blue-600 to-violet-500" />
        </motion.div>

        {/* Main profile card */}
        <motion.section
          {...entrance(0.05)}
          aria-labelledby="about-profile-heading"
          className="mx-auto w-full rounded-3xl border border-slate-200/80 bg-white/95 p-3.5 shadow-xl shadow-slate-200/50 backdrop-blur-xl sm:p-5 lg:p-6"
        >
          {/* Profile introduction */}
          <div className="flex flex-col gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:gap-4 sm:pb-4">
            <div className="relative mx-auto shrink-0 sm:mx-0">
              <div
                aria-hidden="true"
                className="absolute -inset-1 rounded-2xl bg-linear-to-br from-blue-500 to-violet-500 opacity-20 blur-sm"
              />

              <div className="relative grid size-12 place-items-center rounded-2xl border border-blue-100 bg-linear-to-br from-blue-50 to-indigo-100 text-blue-700 sm:size-14">
                <Code2 size={25} strokeWidth={1.8} aria-hidden="true" />
              </div>
            </div>

            <div className="min-w-0 text-center sm:text-left">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600 sm:text-xs">
                Professional Introduction
              </span>

              <h2
                id="about-profile-heading"
                className="mt-1 text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl lg:text-2xl"
              >
                Java Full Stack Developer
              </h2>

              <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-500 sm:justify-start sm:text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap
                    size={16}
                    className="shrink-0 text-blue-600"
                    aria-hidden="true"
                  />
                  Computer Science & Engineering
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <MapPin
                    size={14}
                    className="shrink-0 text-blue-600"
                    aria-hidden="true"
                  />
                  Pune, Maharashtra
                </span>
              </div>
            </div>
          </div>

          {/* About content */}
          <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:gap-6">
            {/* Personal introduction */}
            <div className="min-w-0">
              <h3 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                My Development Journey
              </h3>

              <div className="mt-2 space-y-2 text-sm leading-6 text-slate-600 sm:leading-7">
                <p>
                  I&apos;m{" "}
                  <span className="font-bold text-slate-900">
                    Jayesh Bardekar
                  </span>
                  , a Computer Science and Engineering graduate with a strong
                  interest in full-stack web development. I enjoy transforming
                  ideas into practical, user-friendly applications and
                  continuously improving my technical knowledge through hands-on
                  development.
                </p>

                <p>
                  My technical skills include Java, Spring Boot, JavaScript,
                  React.js, Node.js, Express.js, MySQL, and MongoDB. I&apos;m
                  interested in developing RESTful APIs, implementing backend
                  functionality, managing databases, and creating responsive
                  user interfaces.
                </p>

                <p>
                  I&apos;m eager to begin my professional career in software
                  development, contribute to meaningful projects, collaborate
                  with experienced developers, and continue learning industry
                  best practices while delivering reliable software solutions.
                </p>
              </div>
            </div>

            {/* Highlights panel */}
            <div className="min-w-0">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 sm:p-3.5">
                <h3 className="text-base font-bold text-slate-900">
                  What I Focus On
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                  My approach to learning and development.
                </p>

                <div className="mt-2 space-y-1">
                  {highlights.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <motion.div
                        key={item.title}
                        initial={
                          shouldReduceMotion ? false : { opacity: 0, x: 10 }
                        }
                        whileInView={{
                          opacity: 1,
                          x: 0,
                        }}
                        viewport={{
                          once: true,
                          amount: 0.15,
                        }}
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.35,
                          delay: shouldReduceMotion ? 0 : index * 0.06,
                        }}
                        className="group flex gap-2.5 rounded-xl border border-transparent p-1.5 transition-colors duration-200 hover:border-blue-100 hover:bg-white"
                      >
                        <div className="grid size-9 shrink-0 place-items-center rounded-xl border border-blue-100 bg-white text-blue-600 shadow-sm transition-colors duration-200 group-hover:bg-blue-600 group-hover:text-white">
                          <Icon size={17} aria-hidden="true" />
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-800">
                            {item.title}
                          </h4>

                          <p className="mt-0.5 text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                            {item.description}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Resume actions */}
          <div className="mt-4 flex flex-col gap-2.5 border-t border-slate-100 pt-3 sm:mt-5 sm:flex-row sm:flex-wrap sm:pt-4">
            {resumeLoading ? (
              <div className="inline-flex min-h-10 items-center justify-center gap-2 text-sm font-semibold text-slate-500">
                <LoaderCircle size={17} className="animate-spin" />
                Loading Resume...
              </div>
            ) : resume ? (
              <>
                <a
                  href={resume.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-linear-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-blue-200/60 transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
                >
                  <FileText size={17} aria-hidden="true" />
                  View Resume
                  <ArrowUpRight
                    size={15}
                    className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </a>

                <a
                  href={resume.fileUrl}
                  download={resume.fileName}
                  className="group inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
                >
                  <Download size={17} aria-hidden="true" />
                  Download Resume
                  <ArrowUpRight
                    size={14}
                    className="text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue-600"
                    aria-hidden="true"
                  />
                </a>
              </>
            ) : (
              <p className="text-sm font-medium text-slate-500">
                {resumeError || "Resume is currently unavailable."}
              </p>
            )}
          </div>
        </motion.section>
      </div>
    </main>
  );
}
