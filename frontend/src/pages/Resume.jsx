import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Download,
  ExternalLink,
  FileText,
  ArrowLeft,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import API from "../utils/api";

export default function Resume() {
  const shouldReduceMotion = useReducedMotion();

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadResume = async () => {
    try {
      const response = await API.get("/api/documents/resume");
      const data = response.data;

      if (!data.success || !data.resume) {
        throw new Error(data.message || "Unable to load resume.");
      }

      return data.resume;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || err.message || "Something went wrong.",
        { cause: err },
      );
    }
  };

  const fetchResume = () => {
    setLoading(true);
    setError("");
    loadResume()
      .then(setResume)
      .catch((err) => setError(err.message || "Something went wrong."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;

    loadResume()
      .then((data) => {
        if (active) setResume(data);
      })
      .catch((err) => {
        if (active) setError(err.message || "Something went wrong.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-16 pt-28 text-slate-900 sm:px-6 lg:px-8">
      {" "}
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.45 }}
        >
          {/* Heading */}{" "}
          <div className="mb-8 text-center">
            {" "}
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-700">
              {" "}
              <FileText size={15} />
              My Resume{" "}
            </span>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Professional{" "}
              <span className="bg-linear-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                Resume
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
              Explore my professional background, technical skills, education,
              and project experience.
            </p>
          </div>
          {/* Loading State */}
          {loading && (
            <div className="flex min-h-80 flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white shadow-lg">
              <LoaderCircle size={36} className="animate-spin text-blue-600" />
              <p className="text-sm font-semibold text-slate-600">
                Loading latest resume...
              </p>
            </div>
          )}
          {/* Error State */}
          {!loading && error && (
            <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-red-100 bg-white px-6 text-center shadow-lg">
              <FileText size={42} className="text-red-500" />

              <h2 className="mt-4 text-xl font-bold text-slate-900">
                Resume Unavailable
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                {error}
              </p>

              <button
                onClick={fetchResume}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          )}
          {/* Resume Content */}
          {!loading && !error && resume && (
            <>
              {/* Action Buttons */}
              <div className="mb-5 flex flex-col justify-center gap-3 sm:flex-row">
                <a
                  href={resume.fileUrl}
                  download={resume.fileName}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200/60 transition hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  <Download size={17} />
                  Download Resume
                </a>

                <a
                  href={resume.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  <ExternalLink size={17} />
                  Open in New Tab
                </a>
              </div>

              {/* PDF Viewer */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
                <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-4 sm:px-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FileText size={20} />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      {resume.title}
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">PDF Document</p>
                  </div>
                </div>

                <div className="bg-slate-200/60 p-2 sm:p-4">
                  <iframe
                    src={`${resume.fileUrl}#toolbar=1&navpanes=0`}
                    title="Jayesh Bardekar Resume PDF"
                    className="h-162.5 w-full rounded-xl bg-white sm:h-212.5"
                  />
                </div>
              </div>
            </>
          )}
          {/* Back Button */}
          <div className="mt-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
            >
              <ArrowLeft size={16} />
              Back to Portfolio
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
