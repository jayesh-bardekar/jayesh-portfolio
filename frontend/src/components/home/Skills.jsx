import { motion, useReducedMotion } from "framer-motion";
import {
  Code2,
  Monitor,
  Server,
  Database,
  Wrench,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import {
  FaJava,
  FaJs,
  FaHtml5,
  FaCss3Alt,
  FaReact,
  FaNodeJs,
  FaGitAlt,
  FaGithub,
  FaLeaf,
} from "react-icons/fa";
import {
  SiMysql,
  SiMongodb,
  SiTailwindcss,
  SiExpress,
  SiPostman,
} from "react-icons/si";

const skillCategories = [
  {
    title: "Programming Languages",
    description: "Core languages for application development",
    icon: Code2,
    color: "from-violet-500 to-purple-600",
    iconColor: "text-violet-600",
    skills: [
      { name: "Java", icon: FaJava, color: "text-orange-600" },
      { name: "JavaScript", icon: FaJs, color: "text-yellow-500" },
      { name: "SQL", icon: Database, color: "text-blue-600" },
    ],
  },
  {
    title: "Frontend Development",
    description: "Building responsive user interfaces",
    icon: Monitor,
    color: "from-blue-500 to-cyan-500",
    iconColor: "text-blue-600",
    skills: [
      { name: "HTML5", icon: FaHtml5, color: "text-orange-600" },
      { name: "CSS3", icon: FaCss3Alt, color: "text-blue-600" },
      { name: "React.js", icon: FaReact, color: "text-cyan-500" },
      { name: "Tailwind CSS", icon: SiTailwindcss, color: "text-cyan-600" },
    ],
  },
  {
    title: "Backend Development",
    description: "Developing server-side applications and APIs",
    icon: Server,
    color: "from-emerald-500 to-green-600",
    iconColor: "text-emerald-600",
    skills: [
      { name: "Spring Boot", icon: FaLeaf, color: "text-green-600" },
      { name: "Node.js", icon: FaNodeJs, color: "text-green-600" },
      { name: "Express.js", icon: SiExpress, color: "text-slate-700" },
      { name: "REST APIs", icon: Code2, color: "text-indigo-600" },
    ],
  },
  {
    title: "Databases",
    description: "Storing and managing application data",
    icon: Database,
    color: "from-orange-500 to-amber-500",
    iconColor: "text-orange-600",
    skills: [
      { name: "MySQL", icon: SiMysql, color: "text-blue-600" },
      { name: "MongoDB", icon: SiMongodb, color: "text-green-600" },
    ],
  },
  {
    title: "Tools & Technologies",
    description: "Tools for development and API testing",
    icon: Wrench,
    color: "from-pink-500 to-rose-500",
    iconColor: "text-pink-600",
    skills: [
      { name: "Git", icon: FaGitAlt, color: "text-orange-600" },
      { name: "GitHub", icon: FaGithub, color: "text-slate-800" },
      { name: "Postman", icon: SiPostman, color: "text-orange-500" },
    ],
  },
];

export default function Skills() {
  const shouldReduceMotion = useReducedMotion();

  const entrance = (delay = 0) => ({
    initial: shouldReduceMotion ? false : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.12 },
    transition: {
      duration: shouldReduceMotion ? 0 : 0.4,
      delay: shouldReduceMotion ? 0 : delay,
      ease: "easeOut",
    },
  });

  return (
    <section
      id="skills"
      className="relative isolate scroll-mt-24 overflow-hidden bg-linear-to-br from-white via-slate-50 to-blue-50/50 px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8"
    >
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-24 top-16 size-56 rounded-full bg-violet-100/60 blur-3xl sm:size-72" />
        <div className="absolute -right-20 bottom-8 size-56 rounded-full bg-blue-100/60 blur-3xl sm:size-72" />
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_0.65px,transparent_0.65px)] bg-size-[28px_28px] opacity-15" />
      </div>

      <div className="mx-auto w-full max-w-6xl">
        {/* Section heading */}
        <motion.div
          {...entrance()}
          className="mx-auto mb-5 max-w-2xl text-center sm:mb-6"
        >
          <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            My{" "}
            <span className="bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Skills
            </span>
          </h2>
          <div className="mx-auto mt-2.5 h-1 w-14 rounded-full bg-linear-to-r from-blue-600 to-violet-500" />
        </motion.div>

        {/* Skills grid */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {skillCategories.map((category, index) => {
            const CategoryIcon = category.icon;

            return (
              <motion.article
                key={category.title}
                {...entrance(index * 0.06)}
                whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm shadow-slate-200/40 transition-shadow duration-300 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50 sm:p-5"
              >
                {/* Subtle hover glow */}
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-linear-to-br ${category.color} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-15`}
                />

                {/* Category heading */}
                <div className="relative flex items-center gap-3">
                  <div
                    className={`grid size-11 shrink-0 place-items-center rounded-xl bg-linear-to-br ${category.color} text-white shadow-md sm:size-12`}
                  >
                    <CategoryIcon
                      size={21}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
                      CATEGORY {String(index + 1).padStart(2, "0")}
                    </p>

                    <h3 className="mt-0.5 text-sm font-bold leading-5 text-slate-900 sm:text-base">
                      {category.title}
                    </h3>
                  </div>

                  <ArrowUpRight
                    size={16}
                    aria-hidden="true"
                    className="shrink-0 text-slate-300 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-600"
                  />
                </div>

                <p className="relative mt-3 text-xs leading-5 text-slate-500">
                  {category.description}
                </p>

                {/* Individual skills */}
                <div className="relative mt-3 flex flex-wrap gap-2">
                  {category.skills.map((skill, skillIndex) => {
                    const SkillIcon = skill.icon;

                    return (
                      <motion.div
                        key={skill.name}
                        initial={
                          shouldReduceMotion
                            ? false
                            : { opacity: 0, scale: 0.94 }
                        }
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.25,
                          delay: shouldReduceMotion
                            ? 0
                            : index * 0.04 + skillIndex * 0.04,
                        }}
                        whileHover={
                          shouldReduceMotion
                            ? undefined
                            : { y: -2, scale: 1.025 }
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-2.5 py-2 text-xs font-semibold text-slate-700 transition-colors duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 sm:text-sm"
                      >
                        <SkillIcon
                          size={16}
                          aria-hidden="true"
                          className={`shrink-0 ${skill.color}`}
                        />

                        <span>{skill.name}</span>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Bottom accent */}
                <div
                  aria-hidden="true"
                  className={`absolute bottom-0 left-0 h-0.5 w-0 bg-linear-to-r ${category.color} transition-all duration-300 group-hover:w-full`}
                />
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
