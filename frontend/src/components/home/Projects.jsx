import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Video,
  Globe,
  LoaderCircle,
  FolderOpen,
  Code2,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";

const API_URL = "http://localhost:5000";

function getYouTubeEmbedUrl(value) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();

    if (hostname === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }

    if (
      ["youtube.com", "www.youtube.com", "m.youtube.com"].includes(hostname)
    ) {
      if (url.pathname === "/watch") {
        const id = url.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : "";
      }

      if (url.pathname.startsWith("/embed/")) {
        return url.href;
      }

      if (url.pathname.startsWith("/shorts/")) {
        const id = url.pathname.split("/")[2];
        return id ? `https://www.youtube.com/embed/${id}` : "";
      }
    }
  } catch {
    return "";
  }

  return "";
}

function ProjectGallery({ project, onClose }) {
  const galleryItems = [
    ...(project.image
      ? [{ type: "image", url: project.image, title: "Project Cover" }]
      : []),
    ...(Array.isArray(project.media) ? project.media : []),
  ].filter(
    (item) =>
      item?.url &&
      ["image", "video"].includes(item.type) &&
      (item.type !== "video" || getYouTubeEmbedUrl(item.url)),
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = galleryItems[activeIndex];
  const galleryItemCount = galleryItems.length;

  const imagesCount = galleryItems.filter(
    (item) => item.type === "image",
  ).length;

  const videosCount = galleryItems.filter(
    (item) => item.type === "video",
  ).length;

  const goToPrevious = useCallback(() => {
    setActiveIndex(
      (index) => (index - 1 + galleryItemCount) % galleryItemCount,
    );
  }, [galleryItemCount, setActiveIndex]);

  const goToNext = useCallback(() => {
    setActiveIndex((index) => (index + 1) % galleryItemCount);
  }, [galleryItemCount, setActiveIndex]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") goToNext();
      if (event.key === "ArrowLeft") goToPrevious();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, goToNext, goToPrevious]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!activeItem) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        {" "}
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-2xl">
          {" "}
          <ImageIcon size={36} className="mx-auto mb-3 text-blue-600" />{" "}
          <h3 className="text-lg font-bold text-slate-900">
            Gallery coming soon{" "}
          </h3>{" "}
          <p className="mt-2 text-sm text-slate-500">
            No images or supported videos have been added yet.{" "}
          </p>{" "}
          <button
            type="button"
            onClick={onClose}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Close{" "}
          </button>{" "}
        </div>{" "}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/65 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.2 }}
        role="dialog"
        aria-modal="true"
        aria-label={`${project.title} gallery`}
        className="my-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl sm:rounded-3xl"
      >
        {" "}
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3.5 sm:px-6">
          {" "}
          <div className="min-w-0">
            {" "}
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              Project Gallery{" "}
            </p>{" "}
            <h2 className="mt-1 truncate text-lg font-bold sm:text-xl">
              {project.title}{" "}
            </h2>{" "}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close gallery"
            className="shrink-0 rounded-full border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={19} />
          </button>
        </div>
        <div className="relative flex min-h-56 items-center justify-center bg-slate-50 sm:min-h-96">
          {activeItem.type === "image" ? (
            <img
              src={activeItem.url}
              alt={activeItem.title || `${project.title} gallery image`}
              className="max-h-[60vh] w-full object-contain"
            />
          ) : (
            <div className="aspect-video w-full">
              <iframe
                src={getYouTubeEmbedUrl(activeItem.url)}
                title={activeItem.title || `${project.title} demo video`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          )}

          {galleryItems.length > 1 && (
            <>
              <button
                type="button"
                onClick={goToPrevious}
                aria-label="Previous gallery item"
                className="absolute left-3 rounded-full border border-slate-200 bg-white/95 p-2.5 text-slate-700 shadow-md transition hover:bg-blue-600 hover:text-white sm:left-5"
              >
                <ChevronLeft size={21} />
              </button>

              <button
                type="button"
                onClick={goToNext}
                aria-label="Next gallery item"
                className="absolute right-3 rounded-full border border-slate-200 bg-white/95 p-2.5 text-slate-700 shadow-md transition hover:bg-blue-600 hover:text-white sm:right-5"
              >
                <ChevronRight size={21} />
              </button>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <ImageIcon size={14} className="text-blue-600" />
              {imagesCount} images
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Video size={14} className="text-violet-600" />
              {videosCount} videos
            </span>
          </div>

          <span className="text-xs font-medium text-slate-500">
            {activeIndex + 1} / {galleryItems.length}
          </span>
        </div>
        {galleryItems.length > 1 && (
          <div className="flex gap-3 overflow-x-auto p-4 sm:p-5">
            {galleryItems.map((item, index) => (
              <button
                type="button"
                key={`${item.type}-${item.url}-${index}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Show gallery item ${index + 1}`}
                aria-pressed={activeIndex === index}
                className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-20 sm:w-32 ${
                  activeIndex === index
                    ? "border-blue-600"
                    : "border-slate-200 opacity-70 hover:opacity-100"
                }`}
              >
                {item.type === "image" ? (
                  <img
                    src={item.url}
                    alt={item.title || `Gallery thumbnail ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-violet-50 text-violet-600">
                    <Video size={20} />
                    <span className="text-[10px] font-semibold">VIDEO</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API_URL}/api/projects`);
        const data = response.data;

        const list = Array.isArray(data)
          ? data
          : data.projects || data.data || [];

        if (isMounted) {
          setProjects(Array.isArray(list) ? list : []);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load projects. Please check your connection and try again.",
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, [retryCount]);

  const retryLoading = () => setRetryCount((count) => count + 1);

  return (
    <section
      id="projects"
      className="min-h-auto bg-[#F8FAFC] px-4 py-12 text-slate-900 sm:px-6 sm:py-14 lg:px-8"
    >
      {" "}
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45 }}
          className="mb-8 text-center sm:mb-10"
        >
          {" "}
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            My <span className="text-blue-600">Projects</span>
          </h1>
          <div className="mx-auto mt-5 h-1 w-14 rounded-full bg-linear-to-r from-blue-600 to-violet-500" />
        </motion.div>

        {loading && (
          <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-slate-500">
            <LoaderCircle size={30} className="animate-spin text-blue-600" />
            <p className="text-sm font-medium">Loading projects...</p>
          </div>
        )}

        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm"
          >
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <FolderOpen size={23} />
            </div>

            <h2 className="font-semibold text-slate-900">
              Projects couldn't load
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>

            <button
              type="button"
              onClick={retryLoading}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <RefreshCw size={15} />
              Try Again
            </button>
          </motion.div>
        )}

        {!loading && !error && projects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm"
          >
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <FolderOpen size={27} />
            </div>

            <h2 className="text-lg font-bold text-slate-900">
              Projects coming soon
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              New projects will appear here soon.
            </p>
          </motion.div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => {
              const media = Array.isArray(project.media) ? project.media : [];

              const galleryCount =
                (project.image ? 1 : 0) +
                media.filter(
                  (item) =>
                    item?.url &&
                    ["image", "video"].includes(item.type) &&
                    (item.type !== "video" || getYouTubeEmbedUrl(item.url)),
                ).length;

              return (
                <motion.article
                  key={project._id || project.id || index}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.12 }}
                  transition={{
                    duration: 0.4,
                    delay: Math.min(index * 0.07, 0.28),
                  }}
                  whileHover={{ y: -5 }}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-shadow duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60"
                >
                  <div className="relative flex h-48 items-center justify-center overflow-hidden bg-linear-to-br from-blue-50 via-slate-50 to-violet-50">
                    {project.image ? (
                      <img
                        src={project.image}
                        alt={`${project.title} preview`}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex size-16 items-center justify-center rounded-2xl border border-white bg-white/80 text-blue-600 shadow-sm">
                        <FolderOpen size={30} />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/30 via-transparent to-transparent opacity-50" />

                    <span className="absolute left-3 top-3 rounded-full border border-white/80 bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur">
                      Project {String(index + 1).padStart(2, "0")}
                    </span>

                    {galleryCount > 0 && (
                      <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
                        <ImageIcon size={13} className="text-blue-600" />
                        {galleryCount} media
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <h2 className="text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-700">
                      {project.title || "Untitled Project"}
                    </h2>

                    <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-slate-600">
                      {project.description || "Project details coming soon."}
                    </p>

                    {Array.isArray(project.technologies) &&
                      project.technologies.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {project.technologies.map((technology, techIndex) => (
                            <span
                              key={`${technology}-${techIndex}`}
                              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            >
                              {technology}
                            </span>
                          ))}
                        </div>
                      )}

                    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() => setSelectedProject(project)}
                        className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      >
                        <ImageIcon size={15} />
                        Gallery
                      </button>

                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${project.title} live demo`}
                          title="Live Demo"
                          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Globe size={16} />
                          <span className="hidden xl:inline">Live</span>
                          <ArrowUpRight size={14} />
                        </a>
                      )}

                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${project.title} GitHub repository`}
                          title="GitHub Repository"
                          className="inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
                        >
                          <Code2 size={17} />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
      <AnimatePresence>
        {selectedProject && (
          <ProjectGallery
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
