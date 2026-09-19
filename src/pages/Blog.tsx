"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ArrowRight,
  CalendarDays,
  User,
  FileText,
  Image as ImageIcon,
  X,
  AlertTriangle,
} from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

interface Blog {
  _id: string;
  title: string;
  image: string;
  subtittle: string;
  content: string;
  author?: string;
  createdAt?: string;
}

interface BlogFormData {
  title: string;
  image: string;
  subtittle: string;
  content: string;
  author: string;
}

const cleanContent = (content = "") => {
  return content
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<\/div>/gi, " ")
    .replace(/<\/h[1-6]>/gi, " ")
    .replace(/<[^>]*>/gi, "")
    .replace(/<+/g, "")
    .replace(/>+/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
};

const Blogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewBlog, setViewBlog] = useState<Blog | null>(null);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [deleteBlogId, setDeleteBlogId] = useState<string | null>(null);
  const [deleteBlogTitle, setDeleteBlogTitle] = useState("");

  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    image: "",
    subtittle: "",
    content: "",
    author: "Admin",
  });

  const fetchBlogs = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get("/blog");
      const result = response?.data?.result;

      if (Array.isArray(result)) {
        setBlogs(result);
      } else if (Array.isArray(result?.data)) {
        setBlogs(result.data);
      } else if (Array.isArray(response?.data?.data)) {
        setBlogs(response.data.data);
      } else {
        setBlogs([]);
      }
    } catch (error) {
      console.error("Fetch blogs error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      image: "",
      subtittle: "",
      content: "",
      author: "Admin",
    });

    setSelectedImage(null);
    setEditingBlog(null);
  };

  const handleAddBlog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);

    setFormData({
      title: blog.title || "",
      image: blog.image || "",
      subtittle: blog.subtittle || "",
      content: cleanContent(blog.content || ""),
      author: blog.author || "Admin",
    });

    setSelectedImage(null);
    setIsDialogOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (file) {
      setSelectedImage(file);
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) {
      return formData.image;
    }

    try {
      setImageUploading(true);

      const data = new FormData();

      // Backend route uses upload.single("image")
      data.append("image", selectedImage);

      // Backend route: POST /upload/blog
      const response = await axiosInstance.post(
        "/upload/blog",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const image =
        response?.data?.result?.image ||
        response?.data?.result?.url ||
        response?.data?.result?.path ||
        response?.data?.image ||
        response?.data?.url;

      if (!image) {
        throw new Error("Image upload failed");
      }

      return image;
    } catch (error) {
      console.error("Image upload error:", error);
      throw error;
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const cleanedContent = cleanContent(formData.content);

    if (!formData.title.trim()) {
      alert("Please enter blog title");
      return;
    }

    if (!formData.subtittle.trim()) {
      alert("Please enter blog subtitle");
      return;
    }

    if (!cleanedContent) {
      alert("Please enter blog content");
      return;
    }

    try {
      setSubmitting(true);

      const image = await uploadImage();

      if (!image) {
        alert("Please select an image");
        return;
      }

      const payload = {
        title: formData.title.trim(),
        image,
        subtittle: formData.subtittle.trim(),
        content: cleanedContent,
        author: formData.author.trim() || "Admin",
      };

      if (editingBlog) {
        await axiosInstance.put(
          `/blog/${editingBlog._id}`,
          payload
        );
      } else {
        await axiosInstance.post("/blog", payload);
      }

      setIsDialogOpen(false);
      resetForm();

      await fetchBlogs();
    } catch (error) {
      console.error("Blog submit error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteBlogId) return;

    try {
      await axiosInstance.delete(`/blog/${deleteBlogId}`);

      setDeleteBlogId(null);
      setDeleteBlogTitle("");

      await fetchBlogs();
    } catch (error) {
      console.error("Delete blog error:", error);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#f7f7f8] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-7">

        {/* HEADER */}
        <div className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#9b0000] text-white shadow-sm">
              <FileText className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Blog Management
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Create, manage and publish your property blogs
              </p>
            </div>
          </div>

          <Button
            onClick={handleAddBlog}
            className="h-11 rounded-xl bg-[#9b0000] px-5 font-semibold text-white shadow-sm transition-all hover:bg-[#7f0000] hover:shadow-md"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Blog
          </Button>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-gray-200 bg-white">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff1f1]">
                <Loader2 className="h-6 w-6 animate-spin text-[#9b0000]" />
              </div>

              <p className="text-sm text-gray-500">
                Loading blogs...
              </p>
            </div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white">
            <div className="flex max-w-sm flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff1f1]">
                <FileText className="h-7 w-7 text-[#9b0000]" />
              </div>

              <h3 className="text-lg font-semibold text-gray-900">
                No blogs found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Start creating your first blog to display it here.
              </p>

              <Button
                onClick={handleAddBlog}
                className="mt-5 rounded-xl bg-[#9b0000] hover:bg-[#7f0000]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Blog
              </Button>
            </div>
          </div>
        ) : (
          /* BLOG CARDS */
          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {blogs.map((blog) => {
              const contentText = cleanContent(blog.content);

              return (
                <Card
                  key={blog._id}
                  className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white py-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg"
                >
                  {/* SMALL TOP RIGHT ACTIONS */}
                  <div className="absolute right-3 top-3 z-20 flex items-center gap-0.5 rounded-lg bg-white/95 p-0.5 shadow-md backdrop-blur-sm">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-md text-gray-500 hover:bg-[#fff1f1] hover:text-[#9b0000]"
                      onClick={() => handleEdit(blog)}
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => {
                        setDeleteBlogId(blog._id);
                        setDeleteBlogTitle(blog.title);
                      }}
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* IMAGE */}
                  <div className="relative h-52 w-full overflow-hidden bg-gray-100">
                    {blog.image ? (
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImageIcon className="h-10 w-10 text-gray-300" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

                    <div className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold tracking-wider text-[#9b0000] shadow-sm">
                      PROPERTY BLOG
                    </div>
                  </div>

                  {/* CARD CONTENT */}
                  <CardHeader className="space-y-3 px-5 pb-2 pt-5">
                    <CardTitle className="line-clamp-2 min-h-[52px] text-lg font-bold leading-6 text-gray-900 transition-colors group-hover:text-[#9b0000]">
                      {blog.title}
                    </CardTitle>

                    <p className="line-clamp-1 text-sm font-medium text-gray-500">
                      {blog.subtittle}
                    </p>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col px-5 pb-5">
                    {/* PREVIEW */}
                    <div className="min-h-[78px]">
                      {contentText && (
                        <>
                          <p className="line-clamp-2 text-sm leading-6 text-gray-500">
                            {contentText}
                          </p>

                          <button
                            type="button"
                            onClick={() => setViewBlog(blog)}
                            className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#9b0000] transition-all hover:gap-2 hover:underline"
                          >
                            More
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* COMPACT AUTHOR / DATE */}
                    <div className="mt-4 flex items-center gap-2.5 border-t border-gray-100 pt-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fff1f1]">
                        <User className="h-3.5 w-3.5 text-[#9b0000]" />
                      </div>

                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <p className="truncate text-xs font-semibold text-gray-700">
                          {blog.author || "Admin"}
                        </p>

                        {blog.createdAt && (
                          <>
                            <span className="text-gray-300">•</span>

                            <div className="flex shrink-0 items-center gap-1 text-[10px] text-gray-400">
                              <CalendarDays className="h-3 w-3" />
                              {formatDate(blog.createdAt)}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* CREATE / EDIT DIALOG */}
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);

            if (!open) {
              resetForm();
            }
          }}
        >
          <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl border-0 p-0 shadow-2xl sm:max-w-3xl">
            <div className="border-b border-gray-100 bg-white px-6 py-5">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  {editingBlog ? "Edit Blog" : "Create New Blog"}
                </DialogTitle>

                <p className="mt-1 text-sm text-gray-500">
                  {editingBlog
                    ? "Update the blog details below."
                    : "Add a new property blog to your dashboard."}
                </p>
              </DialogHeader>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 bg-[#fafafa] px-6 py-6"
            >
              {/* TITLE */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-800">
                  Blog Title
                </label>

                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter blog title"
                  className="h-11 rounded-xl border-gray-200 bg-white px-4 shadow-sm focus-visible:border-[#9b0000] focus-visible:ring-[#9b0000]/20"
                />
              </div>

              {/* SUBTITLE */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-800">
                  Subtitle
                </label>

                <Input
                  name="subtittle"
                  value={formData.subtittle}
                  onChange={handleInputChange}
                  placeholder="Enter blog subtitle"
                  className="h-11 rounded-xl border-gray-200 bg-white px-4 shadow-sm focus-visible:border-[#9b0000] focus-visible:ring-[#9b0000]/20"
                />
              </div>

              {/* AUTHOR */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-800">
                  Author
                </label>

                <Input
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  placeholder="Enter author name"
                  className="h-11 rounded-xl border-gray-200 bg-white px-4 shadow-sm focus-visible:border-[#9b0000] focus-visible:ring-[#9b0000]/20"
                />
              </div>

              {/* IMAGE */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-800">
                  Blog Image
                </label>

                <div className="rounded-xl border border-dashed border-gray-300 bg-white p-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer rounded-lg border-gray-200"
                  />

                  {selectedImage && (
                    <div className="mt-3 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <ImageIcon className="h-4 w-4 shrink-0 text-[#9b0000]" />

                        <p className="truncate text-xs font-medium text-gray-600">
                          {selectedImage.name}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedImage(null)}
                        className="ml-2 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {formData.image && !selectedImage && (
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <img
                      src={formData.image}
                      alt="Current blog"
                      className="h-48 w-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* CONTENT */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-800">
                  Blog Content
                </label>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm blog-editor">
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        content: value,
                      }))
                    }
                    placeholder="Write your blog content..."
                  />
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                  className="h-11 rounded-xl border-gray-200 bg-white px-6"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={submitting || imageUploading}
                  className="h-11 rounded-xl bg-[#9b0000] px-6 font-semibold text-white hover:bg-[#7f0000]"
                >
                  {(submitting || imageUploading) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}

                  {editingBlog ? "Update Blog" : "Create Blog"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* READ MORE / FULL DETAILS */}
        <Dialog
          open={!!viewBlog}
          onOpenChange={(open) => {
            if (!open) {
              setViewBlog(null);
            }
          }}
        >
          <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl border-0 p-0 shadow-2xl sm:max-w-3xl">
            {viewBlog && (
              <>
                <div className="relative h-64 w-full overflow-hidden bg-gray-100 sm:h-80">
                  {viewBlog.image ? (
                    <img
                      src={viewBlog.image}
                      alt={viewBlog.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-300" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                  <div className="absolute bottom-5 left-5 right-5">
                    <span className="mb-3 inline-block rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold tracking-wider text-[#9b0000]">
                      PROPERTY BLOG
                    </span>

                    <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
                      {viewBlog.title}
                    </h2>
                  </div>
                </div>

                <div className="space-y-5 px-6 py-6 sm:px-8">
                  <DialogHeader>
                    <DialogTitle className="sr-only">
                      {viewBlog.title}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="flex flex-wrap items-center gap-4 border-b border-gray-100 pb-5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff1f1]">
                        <User className="h-4 w-4 text-[#9b0000]" />
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-400">
                          Author
                        </p>

                        <p className="text-sm font-semibold text-gray-800">
                          {viewBlog.author || "Admin"}
                        </p>
                      </div>
                    </div>

                    {viewBlog.createdAt && (
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                          <CalendarDays className="h-4 w-4 text-gray-600" />
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-gray-400">
                            Published
                          </p>

                          <p className="text-sm font-semibold text-gray-800">
                            {formatDate(viewBlog.createdAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-base font-semibold leading-7 text-gray-800">
                    {viewBlog.subtittle}
                  </p>

                  <div className="h-px bg-gray-100" />

                  <p className="whitespace-pre-wrap text-[15px] leading-8 text-gray-600">
                    {cleanContent(viewBlog.content)}
                  </p>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* DELETE CONFIRMATION DIALOG */}
        <AlertDialog
          open={!!deleteBlogId}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteBlogId(null);
              setDeleteBlogTitle("");
            }
          }}
        >
          <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 shadow-2xl">
            <AlertDialogHeader className="px-6 pb-0 pt-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>

                <div className="min-w-0">
                  <AlertDialogTitle className="text-lg font-bold text-gray-900">
                    Delete Blog?
                  </AlertDialogTitle>

                  <AlertDialogDescription className="mt-1.5 text-sm leading-6 text-gray-500">
                    This action will remove the blog from the listing.
                    Are you sure you want to continue?
                  </AlertDialogDescription>
                </div>
              </div>

              {deleteBlogTitle && (
                <div className="mt-5 rounded-xl border border-red-100 bg-red-50/60 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-red-400">
                    Selected Blog
                  </p>

                  <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-gray-800">
                    {deleteBlogTitle}
                  </p>
                </div>
              )}
            </AlertDialogHeader>

            <AlertDialogFooter className="mt-6 gap-2 border-t border-gray-100 bg-gray-50/70 px-6 py-4 sm:justify-end">
              <AlertDialogCancel
                className="h-10 rounded-lg border-gray-200 bg-white px-5 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </AlertDialogCancel>

              <AlertDialogAction
                onClick={handleDelete}
                className="h-10 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Blog
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* REACT QUILL STYLING */}
      <style>{`
        .blog-editor .ql-toolbar.ql-snow {
          border: 0;
          border-bottom: 1px solid #e5e7eb;
          padding: 12px;
          background: #fafafa;
        }

        .blog-editor .ql-container.ql-snow {
          border: 0;
          min-height: 220px;
          font-size: 14px;
        }

        .blog-editor .ql-editor {
          min-height: 220px;
          padding: 16px;
          color: #374151;
          line-height: 1.7;
        }

        .blog-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }

        .blog-editor .ql-toolbar button:hover,
        .blog-editor .ql-toolbar button.ql-active,
        .blog-editor .ql-toolbar .ql-picker-label:hover {
          color: #9b0000;
        }

        .blog-editor .ql-toolbar button:hover .ql-stroke,
        .blog-editor .ql-toolbar button.ql-active .ql-stroke {
          stroke: #9b0000;
        }

        .blog-editor .ql-toolbar button:hover .ql-fill,
        .blog-editor .ql-toolbar button.ql-active .ql-fill {
          fill: #9b0000;
        }

        .blog-editor .ql-snow .ql-picker-options {
          border-color: #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
        }

        .blog-editor .ql-editor p {
          margin-bottom: 8px;
        }

        .blog-editor .ql-editor h1,
        .blog-editor .ql-editor h2,
        .blog-editor .ql-editor h3 {
          margin-bottom: 10px;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};

export default Blogs;