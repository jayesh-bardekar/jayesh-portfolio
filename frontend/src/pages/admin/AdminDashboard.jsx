import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ========================================
  // Fetch Projects from MongoDB API
  // ========================================
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${API_URL}/api/projects`);

      const data = response.data;

      // Support either an array or { projects: [...] } response.
      const projectList = Array.isArray(data)
        ? data
        : data.projects;

      if (!Array.isArray(projectList)) {
        throw new Error("Unexpected response received from the server.");
      }

      setProjects(projectList);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load projects. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // ========================================
  // Logout
  // ========================================
  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    navigate("/admin/login", { replace: true });
  };

  // ========================================
  // Delete Project
  // ========================================
  const handleDelete = async (projectId, projectTitle) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${projectTitle}"?`
    );

    if (!confirmed) return;

    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }

    setDeletingId(projectId);
    setError("");
    setSuccess("");

    try {
      await axios.delete(
        `${API_URL}/api/projects/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProjects((currentProjects) =>
        currentProjects.filter(
          (project) => project._id !== projectId
        )
      );

      setSuccess(`"${projectTitle}" deleted successfully.`);
    } catch (err) {
      if (err.response?.status === 401) {
        sessionStorage.removeItem("adminToken");
        navigate("/admin/login", { replace: true });
        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to delete project. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ========================================
  // Format Technologies
  // ========================================
  const getTechnologies = (technologies) => {
    if (Array.isArray(technologies)) {
      return technologies;
    }

    if (typeof technologies === "string") {
      return technologies
        .split(",")
        .map((technology) => technology.trim())
        .filter(Boolean);
    }

    return [];
  };

  // ========================================
  // Dashboard UI
  // ========================================
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* ================================== */}
        {/* Header */}
        {/* ================================== */}

        <header className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/"
              className="mb-5 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
            >
              <span aria-hidden="true">←</span>
              Back to Portfolio
            </Link>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">
              Administration
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Manage your portfolio projects from one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSuccess("");
                fetchProjects();
              }}
              disabled={loading}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "↻ Refresh"}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
            >
              Logout
            </button>
          </div>
        </header>

        {/* ================================== */}
        {/* Notifications */}
        {/* ================================== */}

        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200 sm:flex-row sm:items-center sm:justify-between"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={fetchProjects}
              className="shrink-0 font-semibold text-red-100 underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
          >
            ✓ {success}
          </div>
        )}

        {/* ================================== */}
        {/* Statistics Cards */}
        {/* ================================== */}

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Total Projects
              </p>

              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-xl">
                📁
              </span>
            </div>

            <p className="mt-4 text-4xl font-bold">
              {projects.length}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Projects returned by the API
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Database
              </p>

              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-xl">
                🗄️
              </span>
            </div>

            <p className="mt-4 text-2xl font-bold">
              MongoDB
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Project storage through your backend API
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Admin Status
              </p>

              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-xl">
                🔐
              </span>
            </div>

            <p className="mt-4 text-2xl font-bold text-emerald-300">
              Dashboard
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Project management panel
            </p>
          </div>
        </section>

        {/* ================================== */}
        {/* Projects Section Header */}
        {/* ================================== */}

        <section>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                Your Projects
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Add, edit, or remove portfolio projects.
              </p>
            </div>

            <Link
              to="/admin/projects/add"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:-translate-y-0.5 hover:from-violet-500 hover:to-indigo-500"
            >
              <span className="text-lg" aria-hidden="true">
                +
              </span>
              Add New Project
            </Link>
          </div>

          {/* ================================== */}
          {/* Loading State */}
          {/* ================================== */}

          {loading && (
            <div
              role="status"
              className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-8"
            >
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-400/20 border-t-violet-400" />

              <p className="mt-5 text-sm text-slate-400">
                Loading projects...
              </p>
            </div>
          )}

          {/* ================================== */}
          {/* Empty State */}
          {/* ================================== */}

          {!loading && !error && projects.length === 0 && (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/2 px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-3xl">
                📂
              </div>

              <h3 className="mt-5 text-xl font-bold">
                No projects found
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
                Your portfolio project list is empty. Add your
                first project to get started.
              </p>

              <Link
                to="/admin/projects/add"
                className="mt-6 inline-flex rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
              >
                + Add Your First Project
              </Link>
            </div>
          )}

          {/* ================================== */}
          {/* Projects Grid */}
          {/* ================================== */}

          {!loading && projects.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => {
                const technologies = getTechnologies(
                  project.technologies
                );

                return (
                  <article
                    key={project._id}
                    className="group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/3 transition duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:bg-white/5"
                  >
                    {/* Project Image */}

                    <div className="relative flex h-48 items-center justify-center overflow-hidden bg-linear-to-br from-violet-950 via-slate-900 to-indigo-950">
                      {project.image ? (
                        <img
                          src={project.image}
                          alt={`${project.title} preview`}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="text-center">
                          <span className="text-5xl" aria-hidden="true">
                            💻
                          </span>

                          <p className="mt-3 text-xs font-medium uppercase tracking-widest text-slate-400">
                            Project Preview
                          </p>
                        </div>
                      )}

                      <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-xs font-medium text-slate-300 backdrop-blur">
                        Portfolio Project
                      </div>
                    </div>

                    {/* Project Details */}

                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="wrap-break-word text-xl font-bold">
                        {project.title}
                      </h3>

                      <p className="mt-3 line-clamp-3 wrap-break-word text-sm leading-6 text-slate-400">
                        {project.description}
                      </p>

                      {/* Technologies */}

                      <div className="mt-4 flex flex-wrap gap-2">
                        {technologies.length > 0 ? (
                          technologies.map((technology, index) => (
                            <span
                              key={`${technology}-${index}`}
                              className="max-w-full wrap-break-word rounded-lg border border-violet-400/15 bg-violet-500/10 px-2.5 py-1 text-xs text-violet-200"
                            >
                              {technology}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500">
                            No technologies listed
                          </span>
                        )}
                      </div>

                      {/* External Links */}

                      <div className="mt-5 flex flex-wrap gap-4 text-sm">
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-violet-300 transition hover:text-violet-200"
                          >
                            Live Demo ↗
                          </a>
                        )}

                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-300 transition hover:text-white"
                          >
                            GitHub ↗
                          </a>
                        )}
                      </div>

                      {/* Actions */}

                      <div className="mt-auto flex gap-3 border-t border-white/10 pt-5">
                        <Link
                          to={`/admin/projects/edit/${project._id}`}
                          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-center text-sm font-semibold text-slate-200 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white"
                        >
                          ✏️ Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(project._id, project.title)
                          }
                          disabled={deletingId === project._id}
                          className="flex-1 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === project._id
                            ? "Deleting..."
                            : "🗑️ Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ================================== */}
        {/* Footer */}
        {/* ================================== */}

        <footer className="mt-12 border-t border-white/10 py-6 text-center text-xs text-slate-500">
          Portfolio Admin Panel · Manage your projects securely.
        </footer>
      </div>
    </main>
  );
}