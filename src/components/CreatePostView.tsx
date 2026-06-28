import React, { useState } from "react";
import { PlusCircle, Loader2, Check, AlertCircle, ShoppingBag, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { motion } from "motion/react";

interface CreatePostViewProps {
  onNavigate: (path: string) => void;
  onPostCreated: () => void;
}

export function CreatePostView({ onNavigate, onPostCreated }: CreatePostViewProps) {
  const [title, setTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [rating, setRating] = useState("4.5");
  const [reviewCount, setReviewCount] = useState("100");
  const [shopUrl, setShopUrl] = useState("");
  const [about, setAbout] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // Auto-generated slug preview from title
  const generatedSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    if (!title || !metaDescription || !imageUrl || !about || !rating || !reviewCount || !shopUrl) {
      setErrorMessage("Please fill out all fields.");
      setLoading(false);
      return;
    }

    if (title.length > 100) {
      setErrorMessage("Title cannot exceed 100 characters.");
      setLoading(false);
      return;
    }

    if (metaDescription.length > 160) {
      setErrorMessage("Meta description cannot exceed 160 characters.");
      setLoading(false);
      return;
    }

    if (about.length > 1000) {
      setErrorMessage("Curation review text cannot exceed 1000 characters.");
      setLoading(false);
      return;
    }

    const parsedRating = parseFloat(rating);
    if (isNaN(parsedRating) || parsedRating < 1.0 || parsedRating > 5.0) {
      setErrorMessage("Rating must be a decimal value between 1.0 and 5.0.");
      setLoading(false);
      return;
    }

    const parsedReviewCount = parseInt(reviewCount);
    if (isNaN(parsedReviewCount) || parsedReviewCount < 0) {
      setErrorMessage("Review count must be a non-negative number.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          meta_description: metaDescription,
          image_url: imageUrl,
          rating: parsedRating,
          review_count: parsedReviewCount,
          shop_url: shopUrl,
          about
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onPostCreated();
        }, 1500);
      } else {
        setErrorMessage(data.error || "Failed to create curation review.");
      }
    } catch {
      setErrorMessage("Server error during post creation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* Back button */}
      <button
        onClick={() => onNavigate("/")}
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1A1A1A] hover:text-[#CC0000] transition bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm"
      >
        <ArrowLeft size={14} />
        <span>Back to Feed</span>
      </button>

      {/* Main Creation Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
        <div className="space-y-1 border-b border-gray-100 pb-5">
          <h2 className="text-2xl md:text-3xl font-black text-[#1A1A1A] tracking-tight uppercase">
            Create <span className="text-[#CC0000]">New Curation</span>
          </h2>
          <p className="text-xs text-gray-500 font-medium font-sans">
            Post an affiliate, review, or custom recommended product directly on your store's feed.
          </p>
        </div>

        {success ? (
          <div className="text-center py-16 space-y-4">
            <div className="bg-green-50 text-green-500 p-4 rounded-full w-fit mx-auto shadow-sm">
              <Check size={32} className="animate-bounce" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#1A1A1A]">CURATION LIVE!</h3>
              <p className="text-xs text-gray-500 font-sans mt-1">
                Your post is saved and live. Redirecting you to your store profile feed...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
            {/* Left inputs */}
            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide flex justify-between">
                  <span>Product Title</span>
                  <span className="font-mono font-medium text-gray-400 text-[10px] lowercase">
                    {title.length}/100 max
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mechanical Keyboard Pro"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200/80 focus:border-[#CC0000] focus:bg-white rounded-xl text-xs font-bold text-[#1A1A1A] transition focus:outline-none"
                  required
                />
                {generatedSlug && (
                  <p className="text-[10px] font-mono text-gray-400">
                    Auto-generated URL slug: <span className="text-[#CC0000] font-bold">/{generatedSlug}</span>
                  </p>
                )}
              </div>

              {/* Meta Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide flex justify-between">
                  <span>Meta Description</span>
                  <span className={`font-mono text-[10px] font-bold ${metaDescription.length > 160 ? "text-red-500" : "text-gray-400"}`}>
                    {metaDescription.length}/160 characters
                  </span>
                </label>
                <textarea
                  placeholder="Describe your review in one catchy sentence. Used for SEO and summaries."
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value.slice(0, 160))}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200/80 focus:border-[#CC0000] focus:bg-white rounded-xl text-xs font-medium text-[#1A1A1A] transition focus:outline-none min-h-[70px] resize-none"
                  required
                />
              </div>

              {/* Curation Description (About) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide flex justify-between">
                  <span>Curation Review (About)</span>
                  <span className={`font-mono text-[10px] font-bold ${about.length > 1000 ? "text-red-500" : "text-gray-400"}`}>
                    {about.length}/1000 characters
                  </span>
                </label>
                <textarea
                  placeholder="Share your detailed personal experience. Why do you recommend it? What are the pros and cons?"
                  value={about}
                  onChange={(e) => setAbout(e.target.value.slice(0, 1000))}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200/80 focus:border-[#CC0000] focus:bg-white rounded-xl text-xs font-medium text-[#1A1A1A] transition focus:outline-none min-h-[140px] resize-y"
                  required
                />
              </div>

              {/* Ratings and Reviews count */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide">
                    Rating (1.0 - 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200/80 focus:border-[#CC0000] focus:bg-white rounded-xl text-xs font-bold text-[#1A1A1A] transition focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide">
                    Review Count Log
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={reviewCount}
                    onChange={(e) => setReviewCount(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200/80 focus:border-[#CC0000] focus:bg-white rounded-xl text-xs font-bold text-[#1A1A1A] transition focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Right inputs & image preview */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Image URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide">
                    Product Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... or similar"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200/80 focus:border-[#CC0000] focus:bg-white rounded-xl text-xs font-bold text-[#1A1A1A] transition focus:outline-none"
                    required
                  />
                </div>

                {/* Live Image Preview Area */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide block">
                    Live Banner Preview
                  </span>
                  <div className="h-[180px] w-full rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 relative">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Live preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "";
                          // trigger error fallback
                        }}
                      />
                    ) : (
                      <div className="text-center text-gray-400 space-y-1">
                        <ImageIcon size={28} className="mx-auto" />
                        <span className="text-[10px] font-mono font-bold block">No image provided</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shop Link URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide">
                    Shop / Affiliate URL link
                  </label>
                  <input
                    type="url"
                    placeholder="https://amazon.com/... or custom redirect URL"
                    value={shopUrl}
                    onChange={(e) => setShopUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200/80 focus:border-[#CC0000] focus:bg-white rounded-xl text-xs font-bold text-[#1A1A1A] transition focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Error messages & submits */}
              <div className="space-y-3 pt-6 border-t border-gray-100">
                {errorMessage && (
                  <div className="p-3 bg-red-50 text-[#CC0000] text-xs font-bold rounded-xl flex items-center gap-1.5 border border-red-100">
                    <AlertCircle size={16} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#CC0000] hover:bg-[#E60000] disabled:bg-gray-400 text-white font-black text-xs uppercase tracking-widest rounded-xl transition shadow-lg shadow-red-900/15 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Publishing Curation...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle size={16} />
                      <span>Publish Curation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
export default CreatePostView;
