import { motion } from "framer-motion";
import {
  GraduationCap,
  BookOpen,
  School,
  Calendar,
  MapPin,
  Award,
  CheckCircle2,
} from "lucide-react";

const educationData = [
  {
    level: "Bachelor's Degree",
    degree: "B.E. Computer Science and Engineering",
    institution: "Anuradha College of Engineering",
    location: "Maharashtra, India",
    duration: "2022 – 2026",
    icon: GraduationCap,
    description:
      "Studied computer science fundamentals, software development, programming, database management, and web technologies.",
    subjects: [
      "Software Engineering",
      "OOPs",
      "Data Structures And Algorithms",
      "DBMS",
      "Web Development",
    ],
    status: "Completed",
  },
  {
    level: "Higher Secondary",
    degree: "Higher Secondary Certificate (HSC)",
    institution: "Shree Saraswati Junior College",
    location: "Janephal, Maharashtra",
    duration: "2021 – 2022",
    icon: BookOpen,
    description:
      "Completed higher secondary education and developed a foundation in core academic subjects.",
    subjects: [
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "English",
      "Hindi",
      "Marathi",
    ],
    status: "Completed",
  },
  {
    level: "Secondary School",
    degree: "Secondary School Certificate (SSC)",
    institution: "Shree Saraswati Vidyalay",
    location: "Janephal, Maharashtra",
    duration: "2019 – 2020",
    icon: School,
    description:
      "Completed secondary education and built a strong foundation in core academic subjects.",
    subjects: [
      "Mathematics",
      "Science",
      "English",
      "Hindi",
      "Marathi",
      "Social Science",
    ],
    status: "Completed",
  },
];

const certifications = [
  {
    name: "Java Full Stack Development",
    provider: "CJC, Pune",
    year: "2026",
  },
  {
    name: "Delta — Full Stack Web Development (MERN)",
    provider: "Apna College",
    year: "2025",
  },
];

export default function Education() {
  return (
    <main
      id="education"
      className="min-h-auto overflow-hidden bg-[#F8FAFC] px-4 py-12 text-slate-900 sm:px-6 sm:py-14 lg:px-8"
    >
      {" "}
      <div className="mx-auto max-w-6xl">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
          className="mb-9 text-center"
        >
          {" "}
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Education &{" "}
            <span className="bg-linear-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Learning
            </span>
          </h1>
          <div className="mx-auto mt-5 h-1 w-14 rounded-full bg-linear-to-r from-blue-600 to-violet-500" />
        </motion.div>

        {/* Education Timeline */}
        <section
          aria-label="Education history"
          className="relative mx-auto max-w-4xl"
        >
          <div className="absolute bottom-6 left-5 top-6 w-px bg-linear-to-b from-blue-500 via-violet-400 to-slate-200 sm:left-7" />

          <div className="space-y-5">
            {educationData.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.article
                  key={item.degree}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.08,
                  }}
                  className="relative pl-14 sm:pl-16"
                >
                  {/* Timeline Icon */}
                  <div className="absolute left-0 top-5 z-10 flex size-10 items-center justify-center rounded-xl border border-blue-100 bg-white text-blue-600 shadow-sm sm:left-2">
                    <Icon size={20} />
                  </div>

                  {/* Education Card */}
                  <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                        {item.level}
                      </span>

                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 sm:text-sm">
                        <Calendar size={14} className="text-blue-600" />
                        {item.duration}
                      </span>
                    </div>

                    <h2 className="mt-3 text-lg font-bold leading-snug text-slate-900 sm:text-xl">
                      {item.degree}
                    </h2>

                    <h3 className="mt-1.5 text-sm font-semibold text-blue-700 sm:text-base">
                      {item.institution}
                    </h3>

                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 sm:text-sm">
                        <MapPin size={14} />
                        {item.location}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          item.status === "Completed"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {item.status === "Completed" && (
                          <CheckCircle2 size={12} />
                        )}
                        {item.status}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.subjects.map((subject) => (
                        <span
                          key={subject}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>

        {/* Certifications */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.45 }}
          className="mx-auto mt-12 max-w-5xl sm:mt-14"
        >
          <div className="mb-6 text-center">
            <h2 className="mt-2.5 text-2xl font-bold text-slate-900 sm:text-3xl">
              Certifications
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Additional learning to strengthen my development skills.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {certifications.map((cert, index) => (
              <motion.article
                key={cert.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:p-5"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                  <Award size={21} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold leading-6 text-slate-900 sm:text-base">
                    {cert.name}
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">{cert.provider}</p>

                  <span className="mt-2 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {cert.year}
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.section>
      </div>
    </main>
  );
}
