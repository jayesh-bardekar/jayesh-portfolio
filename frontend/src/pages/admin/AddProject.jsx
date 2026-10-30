import { useEffect, useState } from "react";
import API from "../../utils/api";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ImagePlus,
  Video,
  X,
  Plus,
  LoaderCircle,
  ExternalLink,
} from "lucide-react";

const emptyForm = {
  title: "",
  description: "",
  technologies: "",
  liveUrl: "",
  githubUrl: "",
};

function getYouTubeEmbedUrl(value) {
  try {
    const url = new URL(value.trim());

    if (url.hostname === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }

    if (
      url.hostname === "youtube.com" ||
      url.hostname === "www.youtube.com" ||
      url.hostname === "m.youtube.com"
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

export default function AddProject() {
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");

  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const [videoInput, setVideoInput] = useState("");
  const [videos, setVideos] = useState([]);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (coverPreview.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreview);
      }

      galleryPreviews.forEach((preview) => {
        if (preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [coverPreview, galleryPreviews]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCoverChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid cover image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Cover image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    setError("");
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleGalleryChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = "";

    if (!selectedFiles.length) return;

    const validFiles = selectedFiles.filter(
      (file) =>
        file.type.startsWith("image/") &&
        file.size <= 5 * 1024 * 1024
    );

    const remainingSlots = 10 - galleryFiles.length;
    const acceptedFiles = validFiles.slice(0, remainingSlots);

    if (validFiles.length !== selectedFiles.length) {
      setError("Some files were skipped. Choose images up to 5 MB each.");
    } else if (selectedFiles.length > remainingSlots) {
      setError("A maximum of 10 gallery images is allowed.");
    } else {
      setError("");
    }

    if (!acceptedFiles.length) return;

    setGalleryFiles((previous) => [...previous, ...acceptedFiles]);

    setGalleryPreviews((previous) => [
      ...previous,
      ...acceptedFiles.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const removeGalleryImage = (index) => {
    setGalleryFiles((previous) =>
      previous.filter((_, fileIndex) => fileIndex !== index)
    );

    setGalleryPreviews((previous) => {
      const preview = previous[index];

      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }

      return previous.filter((_, previewIndex) => previewIndex !== index);
    });
  };

  const addVideo = () => {
    const embedUrl = getYouTubeEmbedUrl(videoInput);

    if (!embedUrl) {
      setError("Enter a valid YouTube video URL.");
      return;
    }

    if (videos.some((video) => video.url === embedUrl)) {
      setError("This video has already been added.");
      return;
    }

    setVideos((previous) => [
      ...previous,
      {
        type: "video",
        url: embedUrl,
        title: `Demo Video ${previous.length + 1}`,
      },
    ]);

    setVideoInput("");
    setError("");
  };

  const removeVideo = (index) => {
    setVideos((previous) =>
      previous.filter((_, videoIndex) => videoIndex !== index)
    );
  };

  const uploadCover = async (token) => {
    if (!coverFile) {
      return { url: "", publicId: "" };
    }

    const data = new FormData();
    data.append("image", coverFile);

    const response = await API.post(
      `/api/upload`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.image;
  };

  const uploadGallery = async (token) => {
    if (!galleryFiles.length) return [];

    const data = new FormData();

    galleryFiles.forEach((file) => {
      data.append("images", file);
    });

    const response = await API.post(
      `/api/upload/multiple`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.images.map((image, index) => ({
      type: "image",
      url: image.url,
      publicId: image.publicId,
      title: `Project Image ${index + 1}`,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setStatus("");

    if (!form.title.trim() || !form.description.trim()) {
      setError("Project title and description are required.");
      return;
    }

    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      navigate("/admin/login");
      return;
    }

    setLoading(true);

    try {
      setStatus("Uploading cover image...");

      const cover = await uploadCover(token);

      setStatus("Uploading gallery images...");

      const galleryMedia = await uploadGallery(token);

      const media = [...galleryMedia, ...videos];

      setStatus("Saving project...");

      await API.post(
        `/api/projects`,
        {
          title: form.title.trim(),
          description: form.description.trim(),
          technologies: form.technologies
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          liveUrl: form.liveUrl.trim(),
          githubUrl: form.githubUrl.trim(),
          image: cover.url,
          imagePublicId: cover.publicId,
          media,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/admin/dashboard", {
        state: {
          message: "Project created successfully!",
        },
      });
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        sessionStorage.removeItem("adminToken");
        navigate("/admin/login");
        return;
      }

      setError(
        requestError.response?.data?.message ||
          "Unable to create the project. Please try again."
      );
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-violet-400";

  return (
    <div className="min-h-screen bg-[#080812] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/admin/dashboard"
          className="mb-7 inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-violet-400">
            PORTFOLIO MANAGEMENT
          </p>

          <h1 className="text-3xl font-bold sm:text-4xl">
            Add New Project
          </h1>

          <p className="mt-2 text-sm text-white/50">
            Add project details, gallery images and demo videos.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-7 rounded-3xl border border-white/10 bg-white/3 p-5 sm:p-8"
        >
          <section className="space-y-5">
            <h2 className="text-lg font-semibold">Project Information</h2>

            <div>
              <label className="mb-2 block text-sm text-white/70">
                Project Title *
              </label>

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. FinTrack"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/70">
                Description *
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your project..."
                rows={5}
                className={`${inputClass} resize-y`}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/70">
                Technologies
              </label>

              <input
                name="technologies"
                value={form.technologies}
                onChange={handleChange}
                placeholder="React.js, Node.js, MongoDB"
                className={inputClass}
              />

              <p className="mt-2 text-xs text-white/40">
                Separate technologies with commas.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-white/70">
                  Live Demo URL
                </label>

                <input
                  name="liveUrl"
                  type="url"
                  value={form.liveUrl}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/70">
                  GitHub URL
                </label>

                <input
                  name="githubUrl"
                  type="url"
                  value={form.githubUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/..."
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4 border-t border-white/10 pt-7">
            <h2 className="text-lg font-semibold">Cover Image</h2>

            <p className="text-sm text-white/50">
              This image represents the project on the main projects page.
            </p>

            <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/2 p-5 text-center transition hover:border-violet-400/60">
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="max-h-64 w-full rounded-xl object-contain"
                />
              ) : (
                <>
                  <ImagePlus size={30} className="mb-3 text-violet-400" />
                  <span className="text-sm font-medium">
                    Choose Cover Image
                  </span>
                  <span className="mt-1 text-xs text-white/40">
                    JPG, PNG, WEBP or GIF · Max 5 MB
                  </span>
                </>
              )}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleCoverChange}
                className="hidden"
              />
            </label>

            {coverFile && (
              <button
                type="button"
                onClick={() => {
                  setCoverFile(null);
                  setCoverPreview("");
                }}
                className="text-sm text-red-300 hover:text-red-200"
              >
                Remove cover image
              </button>
            )}
          </section>

          <section className="space-y-4 border-t border-white/10 pt-7">
            <div>
              <h2 className="text-lg font-semibold">Project Image Gallery</h2>
              <p className="mt-1 text-sm text-white/50">
                Add up to 10 additional images. Visitors can view them in the
                project gallery.
              </p>
            </div>

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 p-5 text-sm transition hover:border-violet-400/60 hover:bg-white/3">
              <ImagePlus size={19} className="text-violet-400" />
              Select Gallery Images
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleGalleryChange}
                className="hidden"
              />
            </label>

            {galleryPreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {galleryPreviews.map((preview, index) => (
                  <div
                    key={`${preview}-${index}`}
                    className="relative overflow-hidden rounded-xl border border-white/10"
                  >
                    <img
                      src={preview}
                      alt={`Gallery image ${index + 1}`}
                      className="h-36 w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      aria-label={`Remove gallery image ${index + 1}`}
                      className="absolute right-2 top-2 rounded-full bg-black/80 p-1.5 text-white hover:bg-red-500"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-white/40">
              {galleryFiles.length}/10 gallery images selected
            </p>
          </section>

          <section className="space-y-4 border-t border-white/10 pt-7">
            <div>
              <h2 className="text-lg font-semibold">YouTube Demo Videos</h2>
              <p className="mt-1 text-sm text-white/50">
                Add YouTube links to demonstrate how your project works.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="url"
                value={videoInput}
                onChange={(event) => setVideoInput(event.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className={`${inputClass} flex-1`}
              />

              <button
                type="button"
                onClick={addVideo}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold transition hover:bg-violet-400"
              >
                <Plus size={17} />
                Add Video
              </button>
            </div>

            {videos.map((video, index) => (
              <div
                key={video.url}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/3 p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Video className="shrink-0 text-violet-400" size={20} />

                  <div className="min-w-0">
                    <p className="text-sm font-medium">{video.title}</p>
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex max-w-full items-center gap-1 truncate text-xs text-white/50 hover:text-violet-300"
                    >
                      Preview on YouTube
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeVideo(index)}
                  aria-label={`Remove video ${index + 1}`}
                  className="rounded-lg p-2 text-white/50 transition hover:bg-red-500/10 hover:text-red-300"
                >
                  <X size={17} />
                </button>
              </div>
            ))}
          </section>

          {error && (
            <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {status && (
            <div className="rounded-xl border border-violet-400/20 bg-violet-400/10 p-4 text-sm text-violet-200">
              {status}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
            <Link
              to="/admin/dashboard"
              className="rounded-xl border border-white/10 px-5 py-3 text-center text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <LoaderCircle size={17} className="animate-spin" />
              )}

              {loading ? "Saving Project..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}