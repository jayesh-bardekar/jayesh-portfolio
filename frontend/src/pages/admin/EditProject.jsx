import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_GALLERY_IMAGES = 10;

const inputClass =
  "w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-violet-400";

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

function getYouTubeEmbedUrl(value) {
  try {
    const url = new URL(value.trim());
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

export default function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const coverInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    technologies: "",
    liveUrl: "",
    githubUrl: "",
    image: "",
    imagePublicId: "",
  });

  const [selectedCover, setSelectedCover] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");

  const [existingMedia, setExistingMedia] = useState([]);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const [videoUrl, setVideoUrl] = useState("");
  const [videos, setVideos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    let active = true;

    const fetchProject = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/projects/${id}`);

        const project =
          response.data.project || response.data.data || response.data;

        if (!active) return;

        setForm({
          title: project.title || "",
          description: project.description || "",
          technologies: (project.technologies || []).join(", "),
          liveUrl: project.liveUrl || "",
          githubUrl: project.githubUrl || "",
          image: project.image || "",
          imagePublicId: project.imagePublicId || "",
        });

        setCoverPreview(project.image || "");

        const media = Array.isArray(project.media) ? project.media : [];

        setExistingMedia(
          media.filter(
            (item) =>
              item &&
              ["image", "video"].includes(item.type) &&
              typeof item.url === "string" &&
              item.url
          )
        );
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message || "Unable to load project."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProject();

    return () => {
      active = false;
    };
  }, [id]);

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

  // COVER IMAGE

  const handleCoverChange = (event) => {
    const file = event.target.files?.[0];

    setError("");

    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      setError("Select a JPG, PNG, WEBP or GIF image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Cover image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    setSelectedCover(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const cancelCoverChange = () => {
    setSelectedCover(null);
    setCoverPreview(form.image || "");

    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  };

  // GALLERY IMAGES

  const handleGalleryChange = (event) => {
    const files = Array.from(event.target.files || []);

    event.target.value = "";
    setError("");

    if (!files.length) return;

    const currentImageCount =
      existingMedia.filter((item) => item.type === "image").length +
      galleryFiles.length;

    const remainingSlots = MAX_GALLERY_IMAGES - currentImageCount;

    if (remainingSlots <= 0) {
      setError("You can add a maximum of 10 gallery images.");
      return;
    }

    const validFiles = files.filter(
      (file) =>
        allowedTypes.includes(file.type) &&
        file.size <= MAX_FILE_SIZE
    );

    if (validFiles.length !== files.length) {
      setError(
        "Some files were skipped. Use JPG, PNG, WEBP or GIF images up to 5 MB."
      );
    }

    const acceptedFiles = validFiles.slice(0, remainingSlots);

    if (validFiles.length > remainingSlots) {
      setError("Only enough images to reach the 10-image limit were added.");
    }

    if (!acceptedFiles.length) return;

    setGalleryFiles((previous) => [...previous, ...acceptedFiles]);

    setGalleryPreviews((previous) => [
      ...previous,
      ...acceptedFiles.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const removeExistingMedia = (index) => {
    setExistingMedia((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const removeNewGalleryImage = (index) => {
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

  // YOUTUBE VIDEOS

  const addVideo = () => {
    setError("");

    const embedUrl = getYouTubeEmbedUrl(videoUrl);

    if (!embedUrl) {
      setError("Enter a valid YouTube video URL.");
      return;
    }

    const alreadyExists =
      existingMedia.some(
        (item) => item.type === "video" && item.url === embedUrl
      ) || videos.some((item) => item.url === embedUrl);

    if (alreadyExists) {
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

    setVideoUrl("");
  };

  const removeNewVideo = (index) => {
    setVideos((previous) =>
      previous.filter((_, videoIndex) => videoIndex !== index)
    );
  };

  // UPLOAD COVER IMAGE

  const uploadCover = async (token) => {
    if (!selectedCover) {
      return {
        url: form.image,
        publicId: form.imagePublicId,
      };
    }

    const data = new FormData();
    data.append("image", selectedCover);

    const response = await axios.post(
      `${API_URL}/api/upload`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const image = response.data.image;

    if (!image?.url || !image?.publicId) {
      throw new Error("Cover image upload failed.");
    }

    return image;
  };

  // UPLOAD NEW GALLERY IMAGES

  const uploadGallery = async (token) => {
    if (!galleryFiles.length) return [];

    const data = new FormData();

    galleryFiles.forEach((file) => {
      data.append("images", file);
    });

    const response = await axios.post(
      `${API_URL}/api/upload/multiple`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!Array.isArray(response.data.images)) {
      throw new Error("Gallery upload returned an invalid response.");
    }

    return response.data.images.map((image, index) => ({
      type: "image",
      url: image.url,
      publicId: image.publicId,
      title: `Project Image ${index + 1}`,
    }));
  };

  // SAVE PROJECT

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
      navigate("/admin/login", { replace: true });
      return;
    }

    setSaving(true);

    try {
      setStatus("Uploading cover image...");

      const cover = await uploadCover(token);

      setStatus("Uploading gallery images...");

      const uploadedGallery = await uploadGallery(token);

      const updatedMedia = [
        ...existingMedia,
        ...uploadedGallery,
        ...videos,
      ];

      const payload = {
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
        media: updatedMedia,
      };

      setStatus("Saving project changes...");

      await axios.put(
        `${API_URL}/api/projects/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/admin/dashboard", {
        state: {
          message: "Project updated successfully!",
        },
      });
    } catch (err) {
      if (err.response?.status === 401) {
        sessionStorage.removeItem("adminToken");
        navigate("/admin/login", { replace: true });
        return;
      }

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to update project."
      );
    } finally {
      setSaving(false);
      setStatus("");
    }
  };

  const galleryImageCount =
    existingMedia.filter((item) => item.type === "image").length +
    galleryFiles.length;

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Loading project...
      </main>
    );
  }

  if (error && !form.title) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        <p role="alert" className="text-red-300">
          {error}
        </p>

        <Link
          to="/admin/dashboard"
          className="mt-4 inline-block text-violet-300"
        >
          Back to Dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/admin/dashboard"
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Back to Dashboard
        </Link>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/3 p-5 shadow-2xl sm:p-8">
          <div className="mb-8">
            <p className="text-sm font-medium text-violet-400">
              PORTFOLIO ADMIN
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Edit Project
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Update project details, gallery images and demo videos.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          {status && (
            <div className="mb-6 rounded-xl border border-violet-400/20 bg-violet-400/10 p-4 text-sm text-violet-200">
              {status}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* PROJECT DETAILS */}

            <section className="space-y-5">
              <h2 className="text-lg font-semibold">
                Project Information
              </h2>

              <div>
                <label htmlFor="title" className="mb-2 block text-sm">
                  Project Title *
                </label>

                <input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="mb-2 block text-sm">
                  Project Description *
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  className={`${inputClass} resize-y`}
                  required
                />
              </div>

              <div>
                <label htmlFor="technologies" className="mb-2 block text-sm">
                  Technologies
                </label>

                <input
                  id="technologies"
                  name="technologies"
                  value={form.technologies}
                  onChange={handleChange}
                  placeholder="React.js, Node.js, MongoDB"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="liveUrl" className="mb-2 block text-sm">
                  Live Demo URL
                </label>

                <input
                  id="liveUrl"
                  name="liveUrl"
                  type="url"
                  value={form.liveUrl}
                  onChange={handleChange}
                  placeholder="https://your-project.vercel.app"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="githubUrl" className="mb-2 block text-sm">
                  GitHub Repository URL
                </label>

                <input
                  id="githubUrl"
                  name="githubUrl"
                  type="url"
                  value={form.githubUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/username/project"
                  className={inputClass}
                />
              </div>
            </section>

            {/* COVER IMAGE */}

            <section className="space-y-4 border-t border-white/10 pt-7">
              <h2 className="text-lg font-semibold">
                Cover Image
              </h2>

              <div className="rounded-2xl border border-dashed border-white/20 bg-slate-900/60 p-4 sm:p-5">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Project cover preview"
                    className="max-h-72 w-full rounded-xl object-contain"
                  />
                ) : (
                  <p className="py-10 text-center text-sm text-slate-500">
                    No cover image selected.
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
                  >
                    Change Cover
                  </button>

                  {selectedCover && (
                    <button
                      type="button"
                      onClick={cancelCoverChange}
                      className="rounded-xl border border-red-400/20 px-4 py-2 text-sm text-red-300 hover:bg-red-400/10"
                    >
                      Cancel Change
                    </button>
                  )}
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  JPG, PNG, WEBP or GIF · Maximum 5 MB
                </p>

                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </div>
            </section>

            {/* EXISTING GALLERY MEDIA */}

            <section className="space-y-4 border-t border-white/10 pt-7">
              <div>
                <h2 className="text-lg font-semibold">
                  Gallery Images and Videos
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Remove unwanted items, add more images or add YouTube
                  demonstrations.
                </p>
              </div>

              {existingMedia.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {existingMedia.map((item, index) => (
                    <div
                      key={`${item.type}-${item.url}-${index}`}
                      className="overflow-hidden rounded-xl border border-white/10 bg-slate-900"
                    >
                      {item.type === "image" ? (
                        <img
                          src={item.url}
                          alt={item.title || `Gallery image ${index + 1}`}
                          className="h-32 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-32 flex-col items-center justify-center gap-2 bg-violet-500/10">
                          <span className="text-2xl">▶</span>
                          <span className="text-xs text-violet-300">
                            YouTube Video
                          </span>
                        </div>
                      )}

                      <div className="p-3">
                        <p className="truncate text-xs text-slate-400">
                          {item.title ||
                            (item.type === "image"
                              ? "Gallery Image"
                              : "Demo Video")}
                        </p>

                        <button
                          type="button"
                          onClick={() => removeExistingMedia(index)}
                          className="mt-3 w-full rounded-lg border border-red-400/20 px-3 py-2 text-xs text-red-300 hover:bg-red-400/10"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">
                  No gallery images or videos have been added yet.
                </div>
              )}
            </section>

            {/* ADD GALLERY IMAGES */}

            <section className="space-y-4">
              <h3 className="font-medium">Add Gallery Images</h3>

              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="w-full rounded-xl border border-dashed border-white/20 px-4 py-5 text-sm text-slate-300 transition hover:border-violet-400 hover:bg-white/5"
              >
                + Select Multiple Images
              </button>

              <input
                ref={galleryInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleGalleryChange}
                className="hidden"
              />

              {galleryPreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {galleryPreviews.map((preview, index) => (
                    <div
                      key={`${preview}-${index}`}
                      className="relative overflow-hidden rounded-xl border border-violet-400/30"
                    >
                      <img
                        src={preview}
                        alt={`New gallery image ${index + 1}`}
                        className="h-32 w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => removeNewGalleryImage(index)}
                        className="w-full bg-red-500/10 px-3 py-2 text-xs text-red-300 hover:bg-red-500/20"
                      >
                        Remove Image
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-slate-500">
                {galleryImageCount}/{MAX_GALLERY_IMAGES} gallery images ·
                Maximum 5 MB per image.
              </p>
            </section>

            {/* ADD YOUTUBE VIDEOS */}

            <section className="space-y-4 border-t border-white/10 pt-7">
              <h3 className="font-medium">Add YouTube Demo Video</h3>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(event) => setVideoUrl(event.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className={`${inputClass} flex-1`}
                />

                <button
                  type="button"
                  onClick={addVideo}
                  className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500"
                >
                  Add Video
                </button>
              </div>

              {videos.map((video, index) => (
                <div
                  key={video.url}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-900 p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{video.title}</p>
                    <p className="truncate text-xs text-slate-500">
                      {video.url}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeNewVideo(index)}
                    className="shrink-0 rounded-lg border border-red-400/20 px-3 py-2 text-xs text-red-300 hover:bg-red-400/10"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </section>

            {/* SAVE */}

            <div className="border-t border-white/10 pt-6">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 px-5 py-3.5 font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? status || "Saving Changes..." : "Save Changes"}
              </button>

              <Link
                to="/admin/dashboard"
                className="mt-3 block rounded-xl border border-white/10 px-5 py-3 text-center text-sm text-slate-300 hover:bg-white/5"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}