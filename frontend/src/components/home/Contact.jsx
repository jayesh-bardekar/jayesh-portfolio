import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  MapPin,
  Send,
  User,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  ArrowUpRight,
  BriefcaseBusiness,
} from "lucide-react";

import { FaGithub, FaLinkedin } from "react-icons/fa";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const contactDetails = [
  {
    icon: Mail,
    label: "Email",
    value:
      "[jayeshbardekar2710@gmail.com](mailto:jayeshbardekar2710@gmail.com)",
    href: "mailto:jayeshbardekar2710@gmail.com",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Pune, Maharashtra, India",
    href: null,
  },
];

const socialLinks = [
  {
    name: "GitHub",
    username: "@jayesh-bardekar",
    href: "https://github.com/jayesh-bardekar",
    icon: FaGithub,
  },
  {
    name: "LinkedIn",
    username: "Connect professionally",
    href: "https://www.linkedin.com/in/jayesh-bardekar",
    icon: FaLinkedin,
  },
];

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({
    type: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (status.message) {
      setStatus({ type: "", message: "" });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    setStatus({ type: "", message: "" });
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.saved) {
          setStatus({
            type: "warning",
            message:
              "Your message was saved, but the email notification failed. Please avoid resubmitting it.",
          });
          return;
        }

        throw new Error(
          data.message || "Unable to send your message. Please try again.",
        );
      }

      setStatus({
        type: "success",
        message: data.message || "Your message has been sent successfully!",
      });

      setForm(initialForm);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.message ||
          "Unable to connect to the server. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

  return (
    <section
      id="contact"
      className="relative min-h-auto overflow-hidden bg-[#F8FAFC] px-4 py-12 text-slate-900 sm:px-6 sm:py-14 lg:px-8"
    >
      {" "}
      <div className="pointer-events-none absolute -left-32 top-24 size-64 rounded-full bg-blue-200/30 blur-3xl" />{" "}
      <div className="pointer-events-none absolute -right-32 bottom-20 size-64 rounded-full bg-violet-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
          className="mx-auto mb-8 max-w-2xl text-center sm:mb-10"
        >
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Let's Build Something{" "}
            <span className="bg-linear-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Amazing
            </span>
          </h1>

          <div className="mx-auto mt-5 h-1 w-14 rounded-full bg-linear-to-r from-blue-600 to-violet-500" />
        </motion.div>

        <div className="grid items-start gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.45 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <h2 className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">
              Let's start a conversation.
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              I'm interested in Java Full Stack and MERN Stack opportunities,
              collaborative projects, and connecting with fellow developers.
            </p>

            <div className="mt-6 space-y-3">
              {contactDetails.map((item) => {
                const Icon = item.icon;

                const content = (
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 transition hover:border-blue-200 hover:bg-blue-50/60">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-white text-blue-600">
                      <Icon size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <p className="mt-1 break-all text-sm font-medium text-slate-800">
                        {item.value}
                      </p>
                    </div>

                    {item.href && (
                      <ArrowUpRight
                        size={16}
                        className="shrink-0 text-slate-400"
                      />
                    )}
                  </div>
                );

                return item.href ? (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    {content}
                  </a>
                ) : (
                  <div key={item.label}>{content}</div>
                );
              })}
            </div>

            <div className="my-6 h-px bg-slate-100" />

            <h3 className="text-sm font-semibold text-slate-800">
              Find me online
            </h3>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {socialLinks.map((social) => {
                const Icon = social.icon;

                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/40"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition group-hover:border-blue-100 group-hover:bg-blue-50 group-hover:text-blue-700">
                      <Icon size={19} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800">
                        {social.name}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {social.username}
                      </p>
                    </div>

                    <ArrowUpRight
                      size={15}
                      className="shrink-0 text-slate-400 transition group-hover:text-blue-600"
                    />
                  </a>
                );
              })}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Send Me a Message
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Fill out the form below, and I'll get back to you.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Full Name <span className="text-blue-600">*</span>
                  </label>

                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Your name"
                      value={form.name}
                      onChange={handleChange}
                      maxLength={100}
                      required
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Email Address <span className="text-blue-600">*</span>
                  </label>

                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                      maxLength={150}
                      required
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Subject <span className="text-blue-600">*</span>
                </label>

                <input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="What would you like to discuss?"
                  value={form.subject}
                  onChange={handleChange}
                  maxLength={200}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Message <span className="text-blue-600">*</span>
                </label>

                <div className="relative">
                  <MessageSquare
                    size={16}
                    className="absolute left-3.5 top-3.5 text-slate-400"
                  />

                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    placeholder="Tell me about your project or opportunity..."
                    value={form.message}
                    onChange={handleChange}
                    maxLength={3000}
                    required
                    className={`${inputClass} resize-y pl-10`}
                  />
                </div>

                <p className="mt-1.5 text-right text-xs text-slate-400">
                  {form.message.length}/3000 characters
                </p>
              </div>

              {status.message && (
                <div
                  role="status"
                  aria-live="polite"
                  className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-sm ${
                    status.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : status.type === "warning"
                        ? "border-amber-200 bg-amber-50 text-amber-800"
                        : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {status.type === "success" ? (
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  )}

                  <p>{status.message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-linear-to-r from-blue-600 to-blue-700 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-violet-700 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Sending Message...
                  </>
                ) : (
                  <>
                    <Send
                      size={17}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
