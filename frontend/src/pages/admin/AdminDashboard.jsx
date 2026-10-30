import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000";

export default function AdminDashboard() {
const navigate = useNavigate();

const fileInputRef = useRef(null);
const documentInputRef = useRef(null);

// PROJECT STATES
const [projects, setProjects] = useState([]);
const [loading, setLoading] = useState(true);
const [deletingId, setDeletingId] = useState(null);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");

// RESUME STATES
const [resume, setResume] = useState(null);
const [resumeLoading, setResumeLoading] = useState(true);
const [uploadingResume, setUploadingResume] = useState(false);

// DOCUMENT STATES
const [documents, setDocuments] = useState([]);
const [documentsLoading, setDocumentsLoading] = useState(true);
const [uploadingDocument, setUploadingDocument] = useState(false);
const [deletingDocumentId, setDeletingDocumentId] = useState(null);

const [documentTitle, setDocumentTitle] = useState("");
const [documentCategory, setDocumentCategory] = useState("Personal");
const [documentFile, setDocumentFile] = useState(null);

const [documentError, setDocumentError] = useState("");
const [documentSuccess, setDocumentSuccess] = useState("");

// AUTH HELPER
const getToken = () => sessionStorage.getItem("adminToken");

const handleUnauthorized = useCallback(() => {
sessionStorage.removeItem("adminToken");
navigate("/admin/login", { replace: true });
}, [navigate]);

// FETCH PROJECTS
const fetchProjects = useCallback(async () => {
try {
  const response = await axios.get(`${API_URL}/api/projects`);

  const data = response.data;
  const projectList = Array.isArray(data) ? data : data.projects;

  if (!Array.isArray(projectList)) {
    throw new Error("Unexpected projects response.");
  }

  setProjects(projectList);
  setError("");
} catch (err) {
  setError(
    err.response?.data?.message ||
      err.message ||
      "Failed to load projects."
  );
} finally {
  setLoading(false);
}

}, []);

// FETCH RESUME
const fetchResume = useCallback(async () => {
try {
  const response = await axios.get(
    `${API_URL}/api/documents/resume`
  );

  setResume(response.data.resume || null);
} catch (err) {
  if (err.response?.status === 404) {
    setResume(null);
  } else {
    console.error("Resume fetch error:", err);
  }
} finally {
  setResumeLoading(false);
}

}, []);

// FETCH DOCUMENTS
const fetchDocuments = useCallback(async () => {
const token = getToken();

if (!token) {
  handleUnauthorized();
  return;
}

try {
  setDocumentError("");

  const response = await axios.get(
    `${API_URL}/api/documents`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  setDocuments(response.data.documents || []);
} catch (err) {
  if (err.response?.status === 401) {
    handleUnauthorized();
    return;
  }

  setDocumentError(
    err.response?.data?.message ||
      "Failed to load documents."
  );
} finally {
  setDocumentsLoading(false);
}

}, [handleUnauthorized]);

// INITIAL LOAD
useEffect(() => {
const timeoutId = window.setTimeout(() => {
  fetchProjects();
  fetchResume();
  fetchDocuments();
}, 0);

return () => window.clearTimeout(timeoutId);
}, [fetchProjects, fetchResume, fetchDocuments]);

// LOGOUT
const handleLogout = () => {
sessionStorage.removeItem("adminToken");
navigate("/admin/login", { replace: true });
};

// UPLOAD / REPLACE RESUME
const handleResumeUpload = async (event) => {
const file = event.target.files?.[0];

if (!file) return;

setError("");
setSuccess("");

if (file.type !== "application/pdf") {
  setError("Please select a PDF file.");
  event.target.value = "";
  return;
}

if (file.size > 10 * 1024 * 1024) {
  setError("Resume size must not exceed 10 MB.");
  event.target.value = "";
  return;
}

const token = getToken();

if (!token) {
  handleUnauthorized();
  return;
}

const formData = new FormData();
formData.append("document", file);

setUploadingResume(true);

try {
  const response = await axios.post(
    `${API_URL}/api/documents/resume`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  setResume(response.data.resume || null);
  setSuccess(
    response.data.message || "Resume uploaded successfully!"
  );
} catch (err) {
  if (err.response?.status === 401) {
    handleUnauthorized();
    return;
  }

  setError(
    err.response?.data?.message ||
      "Failed to upload resume."
  );
} finally {
  setUploadingResume(false);

  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }

  fetchResume();
}

};

// UPLOAD DOCUMENT
const handleDocumentUpload = async (event) => {
event.preventDefault();

const token = getToken();

if (!token) {
  handleUnauthorized();
  return;
}

if (!documentTitle.trim() || !documentCategory.trim()) {
  setDocumentError("Enter document title and category.");
  return;
}

if (!documentFile) {
  setDocumentError("Please select a PDF or image.");
  return;
}

const allowedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

if (!allowedTypes.includes(documentFile.type)) {
  setDocumentError(
    "Only PDF, JPG, PNG and WEBP files are allowed."
  );
  return;
}

if (documentFile.size > 10 * 1024 * 1024) {
  setDocumentError("File size must not exceed 10 MB.");
  return;
}

const formData = new FormData();

formData.append("title", documentTitle.trim());
formData.append("category", documentCategory.trim());
formData.append("document", documentFile);

setUploadingDocument(true);
setDocumentError("");
setDocumentSuccess("");

try {
  const response = await axios.post(
    `${API_URL}/api/documents`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  setDocumentSuccess(
    response.data.message || "Document uploaded successfully!"
  );

  setDocumentTitle("");
  setDocumentCategory("Personal");
  setDocumentFile(null);

  if (documentInputRef.current) {
    documentInputRef.current.value = "";
  }

  await fetchDocuments();
} catch (err) {
  if (err.response?.status === 401) {
    handleUnauthorized();
    return;
  }

  setDocumentError(
    err.response?.data?.message ||
      "Document upload failed."
  );
} finally {
  setUploadingDocument(false);
}

};

// DELETE DOCUMENT
const handleDocumentDelete = async (document) => {
const confirmed = window.confirm(
`Are you sure you want to delete "${document.title}"?`
);

if (!confirmed) return;

const token = getToken();

if (!token) {
  handleUnauthorized();
  return;
}

setDeletingDocumentId(document._id);
setDocumentError("");
setDocumentSuccess("");

try {
  const response = await axios.delete(
    `${API_URL}/api/documents/${document._id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  setDocuments((current) =>
    current.filter((item) => item._id !== document._id)
  );

  setDocumentSuccess(
    response.data.message || "Document deleted successfully!"
  );
} catch (err) {
  if (err.response?.status === 401) {
    handleUnauthorized();
    return;
  }

  setDocumentError(
    err.response?.data?.message ||
      "Failed to delete document."
  );
} finally {
  setDeletingDocumentId(null);
}

};

// DELETE PROJECT
const handleDelete = async (projectId, projectTitle) => {
const confirmed = window.confirm(
`Are you sure you want to delete "${projectTitle}"?`
);

if (!confirmed) return;

const token = getToken();

if (!token) {
  handleUnauthorized();
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

  setProjects((current) =>
    current.filter((project) => project._id !== projectId)
  );

  setSuccess(`"${projectTitle}" deleted successfully.`);
} catch (err) {
  if (err.response?.status === 401) {
    handleUnauthorized();
    return;
  }

  setError(
    err.response?.data?.message ||
      "Failed to delete project."
  );
} finally {
  setDeletingId(null);
}

};

// HELPERS
const getTechnologies = (technologies) => {
if (Array.isArray(technologies)) return technologies;


if (typeof technologies === "string") {
  return technologies
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

return [];


};

const formatFileSize = (bytes) => {
if (!bytes) return "Unknown size";

return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

};

// EXCLUDE RESUME FROM MY DOCUMENTS
const privateDocuments = documents.filter(
(document) => document.category?.toLowerCase() !== "resume"
);

const cardClass =
"rounded-2xl border border-slate-200 bg-white shadow-sm";

const secondaryButton =
"rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700";

return ( <main className="min-h-screen bg-slate-50 text-slate-900">

  {/* TOP NAVIGATION */}

  <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl">
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">

      <div>
        <Link
          to="/"
          className="text-xs font-medium text-slate-500 transition hover:text-violet-700"
        >
          ← Back to Portfolio
        </Link>

        <div className="mt-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-violet-600 to-indigo-600 text-lg font-bold text-white shadow-md shadow-violet-200">
            J
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Admin Dashboard
            </h1>

            <p className="text-xs text-slate-500">
              Portfolio Management
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setError("");
            setSuccess("");
            setDocumentError("");
            setDocumentSuccess("");
            setLoading(true);
            setResumeLoading(true);
            setDocumentsLoading(true);

            fetchProjects();
            fetchResume();
            fetchDocuments();
          }}
          disabled={loading || resumeLoading || documentsLoading}
          className={secondaryButton}
        >
          ↻ Refresh
        </button>

        <div className="hidden items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 sm:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold text-emerald-700">
            Admin Active
          </span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
        >
          Logout ↗
        </button>
      </div>
    </div>
  </header>

  <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

    {/* WELCOME */}

    <section className="mb-8">
      <p className="text-sm font-semibold text-violet-700">
        OVERVIEW
      </p>

      <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        Welcome Back!
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Manage your portfolio content from one place.
      </p>
    </section>

    {/* GLOBAL NOTIFICATIONS */}

    {error && (
      <div
        role="alert"
        className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        <span>{error}</span>

        <button
          type="button"
          onClick={() => {
            setError("");
            fetchProjects();
          }}
          className="font-semibold underline underline-offset-4"
        >
          Try again
        </button>
      </div>
    )}

    {success && (
      <div
        role="status"
        className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
      >
        ✓ {success}
      </div>
    )}

    {/* STATISTICS */}

    <section className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

      <div className={`${cardClass} p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Total Projects
            </p>

            <p className="mt-3 text-4xl font-bold tracking-tight">
              {loading ? "—" : projects.length}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Projects in your portfolio
            </p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-2xl">
            📁
          </div>
        </div>
      </div>

      <div className={`${cardClass} p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              My Documents
            </p>

            <p className="mt-3 text-4xl font-bold tracking-tight">
              {documentsLoading ? "—" : privateDocuments.length}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Stored PDFs and images
            </p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-2xl">
            📂
          </div>
        </div>
      </div>

      <div className={`${cardClass} p-6 sm:col-span-2 xl:col-span-1`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Admin Status
            </p>

            <p className="mt-3 text-2xl font-bold text-emerald-600">
              Active
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Dashboard session
            </p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
            🔐
          </div>
        </div>
      </div>

    </section>

    {/* RESUME MANAGEMENT */}

    <section className="mb-12">

      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-widest text-violet-700">
          PUBLIC PROFILE
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          Resume Management
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Manage the resume displayed on your public portfolio.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-violet-100 bg-linear-to-br from-violet-50 via-white to-indigo-50 p-6 shadow-sm sm:p-8">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-violet-100 bg-white text-3xl shadow-sm">
              📄
            </div>

            <div className="min-w-0">
              <h3 className="text-lg font-bold">
                Portfolio Resume
              </h3>

              {resumeLoading ? (
                <p className="mt-2 text-sm text-slate-500">
                  Loading resume...
                </p>
              ) : resume ? (
                <>
                  <p className="mt-2 break-all text-sm font-medium text-violet-700">
                    {resume.fileName}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span>PDF Document</span>
                    <span>•</span>
                    <span>{formatFileSize(resume.fileSize)}</span>

                    {resume.updatedAt && (
                      <>
                        <span>•</span>
                        <span>
                          Updated:{" "}
                          {new Date(
                            resume.updatedAt
                          ).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>

                  <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Resume Available
                  </span>
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm text-slate-500">
                    No resume uploaded yet.
                  </p>

                  <span className="mt-3 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    Not Uploaded
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {resume && (
              <>
                <a
                  href={resume.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={secondaryButton}
                >
                  View Resume ↗
                </a>

                <a
                  href={resume.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={secondaryButton}
                >
                  Open PDF ↗
                </a>
              </>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingResume || resumeLoading}
              className="rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploadingResume
                ? "Uploading..."
                : resume
                  ? "↑ Replace Resume"
                  : "↑ Upload Resume"}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleResumeUpload}
              className="hidden"
            />
          </div>

        </div>

        <div className="mt-7 border-t border-violet-100 pt-5">
          <p className="text-xs leading-6 text-slate-500">
            Supported format: PDF only · Maximum size: 10 MB.
            Uploading a new resume replaces the currently published resume.
          </p>
        </div>

      </div>
    </section>

    {/* MY DOCUMENTS */}

    <section className="mb-12">

      <div className="mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-bold">
            My Documents
          </h2>

          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Admin Section
          </span>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          Manage your personal PDFs, certificates and images.
        </p>
      </div>

      {/* UPLOAD FORM */}

      <div className={`${cardClass} mb-8 p-6 sm:p-8`}>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-2xl">
            📤
          </div>

          <div>
            <h3 className="text-lg font-bold">
              Upload New Document
            </h3>

            <p className="text-xs text-slate-500">
              Add a PDF or image to your document collection.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleDocumentUpload}
          className="space-y-5"
        >

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Document Title
              </label>

              <input
                type="text"
                value={documentTitle}
                onChange={(event) =>
                  setDocumentTitle(event.target.value)
                }
                placeholder="Enter document title"
                maxLength={100}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Category
              </label>

              <select
                value={documentCategory}
                onChange={(event) =>
                  setDocumentCategory(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              >
                <option value="Personal">Personal</option>
                <option value="Education">Education</option>
                <option value="Certificates">Certificates</option>
                <option value="Identity">Identity</option>
                <option value="Projects">Projects</option>
                <option value="Other">Other</option>
              </select>
            </div>

          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Select PDF or Image
            </label>

            <input
              ref={documentInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
              onChange={(event) =>
                setDocumentFile(event.target.files?.[0] || null)
              }
              className="block w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-violet-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-violet-700 hover:file:bg-violet-200"
            />

            <p className="mt-2 text-xs text-slate-400">
              PDF, JPG, PNG, WEBP · Maximum size: 10 MB
            </p>

            {documentFile && (
              <p className="mt-2 break-all text-xs font-medium text-violet-700">
                Selected: {documentFile.name}
              </p>
            )}
          </div>

          {documentError && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {documentError}
            </div>
          )}

          {documentSuccess && (
            <div
              role="status"
              className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
            >
              ✓ {documentSuccess}
            </div>
          )}

          <button
            type="submit"
            disabled={uploadingDocument}
            className="rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploadingDocument
              ? "Uploading..."
              : "+ Upload Document"}
          </button>

        </form>
      </div>

      {/* SAVED DOCUMENTS */}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">
            Saved Documents
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            {privateDocuments.length} document(s)
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDocuments}
          disabled={documentsLoading}
          className={secondaryButton}
        >
          {documentsLoading ? "Loading..." : "↻ Refresh"}
        </button>
      </div>

      {documentsLoading && (
        <div className={`${cardClass} flex min-h-48 items-center justify-center`}>
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
        </div>
      )}

      {!documentsLoading &&
        documentError &&
        privateDocuments.length === 0 && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {documentError}

            <button
              type="button"
              onClick={fetchDocuments}
              className="ml-3 font-semibold underline underline-offset-4"
            >
              Retry
            </button>
          </div>
        )}

      {!documentsLoading &&
        !documentError &&
        privateDocuments.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-3xl">
              📂
            </div>

            <h3 className="mt-5 text-lg font-bold">
              No Documents Yet
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Upload your first personal document or image.
            </p>

          </div>
        )}

      {!documentsLoading && privateDocuments.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

          {privateDocuments.map((document) => (
            <article
              key={document._id}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg"
            >

              <div className="flex h-48 items-center justify-center overflow-hidden bg-slate-100">

                {document.fileType === "image" ? (
                  <img
                    src={document.fileUrl}
                    alt={document.title}
                    loading="lazy"
                    className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="text-center">
                    <span className="text-6xl">📄</span>

                    <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                      PDF Document
                    </p>
                  </div>
                )}

              </div>

              <div className="p-5">

                <h4 className="wrap-break-word text-base font-bold text-slate-900">
                  {document.title}
                </h4>

                <p className="mt-2 break-all text-xs text-slate-500">
                  {document.fileName}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-lg border border-violet-100 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                    {document.category}
                  </span>

                  <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {document.fileType?.toUpperCase()}
                  </span>
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  {formatFileSize(document.fileSize)}
                </p>

                <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">

                  <a
                    href={document.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-center text-xs font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                  >
                    Preview ↗
                  </a>

                  <a
                    href={document.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-center text-xs font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                  >
                    Open ↗
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDocumentDelete(document)}
                    disabled={deletingDocumentId === document._id}
                    aria-label={`Delete ${document.title}`}
                    className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    {deletingDocumentId === document._id
                      ? "..."
                      : "🗑️"}
                  </button>

                </div>
              </div>
            </article>
          ))}

        </div>
      )}

    </section>

    {/* PROJECT MANAGEMENT */}

    <section className="mb-10">

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-violet-700">
            PORTFOLIO CONTENT
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Your Projects
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Add, edit and manage your portfolio projects.
          </p>
        </div>

        <Link
          to="/admin/projects/add"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          <span className="text-lg">+</span>
          Add New Project
        </Link>

      </div>

      {/* PROJECT LOADING */}

      {loading && (
        <div className={`${cardClass} flex min-h-64 flex-col items-center justify-center p-8`}>
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />

          <p className="mt-5 text-sm text-slate-500">
            Loading projects...
          </p>
        </div>
      )}

      {/* EMPTY PROJECTS */}

      {!loading && !error && projects.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-3xl">
            📁
          </div>

          <h3 className="mt-5 text-xl font-bold">
            No Projects Found
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Your portfolio project list is empty. Add your first project to get started.
          </p>

          <Link
            to="/admin/projects/add"
            className="mt-6 inline-flex rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            + Add Your First Project
          </Link>

        </div>
      )}

      {/* PROJECT GRID */}

      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

          {projects.map((project) => {
            const technologies = getTechnologies(
              project.technologies
            );

            return (
              <article
                key={project._id}
                className="group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl"
              >

                {/* PROJECT IMAGE */}

                <div className="relative flex h-48 items-center justify-center overflow-hidden bg-linear-to-br from-violet-100 via-slate-100 to-indigo-100">

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
                      <span className="text-5xl">💻</span>

                      <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Project Preview
                      </p>
                    </div>
                  )}

                  <div className="absolute left-4 top-4 rounded-full border border-white/80 bg-white/90 px-3 py-1 text-xs font-semibold text-violet-700 shadow-sm backdrop-blur">
                    Portfolio Project
                  </div>

                </div>

                {/* PROJECT DETAILS */}

                <div className="flex flex-1 flex-col p-5">

                  <h3 className="wrap-break-word text-xl font-bold text-slate-900">
                    {project.title}
                  </h3>

                  <p className="mt-3 line-clamp-3 wrap-break-word text-sm leading-6 text-slate-500">
                    {project.description}
                  </p>

                  {/* TECHNOLOGIES */}

                  <div className="mt-4 flex flex-wrap gap-2">

                    {technologies.length > 0 ? (
                      technologies.map((technology, index) => (
                        <span
                          key={`${technology}-${index}`}
                          className="max-w-full wrap-break-word rounded-lg border border-violet-100 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700"
                        >
                          {technology}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">
                        No technologies listed
                      </span>
                    )}

                  </div>

                  {/* PROJECT LINKS */}

                  <div className="mt-5 flex flex-wrap gap-4 text-sm">

                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-violet-700 transition hover:text-violet-900"
                      >
                        Live Demo ↗
                      </a>
                    )}

                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-slate-600 transition hover:text-slate-900"
                      >
                        GitHub ↗
                      </a>
                    )}

                  </div>

                  {/* PROJECT ACTIONS */}

                  <div className="mt-auto flex gap-3 border-t border-slate-100 pt-5">

                    <Link
                      to={`/admin/projects/edit/${project._id}`}
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                    >
                      ✏️ Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(project._id, project.title)
                      }
                      disabled={deletingId === project._id}
                      className="flex-1 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
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

    {/* FOOTER */}

    <footer className="border-t border-slate-200 py-7 text-center">
      <p className="text-xs font-medium text-slate-500">
        Portfolio Admin Panel
      </p>

      <p className="mt-1 text-xs text-slate-400">
        Manage your projects, resume and documents.
      </p>
    </footer>
  </div>
</main>
);
}
