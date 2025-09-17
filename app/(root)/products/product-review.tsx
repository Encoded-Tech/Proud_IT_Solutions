"use client";
import { Star } from "lucide-react";
import { useState } from "react";

const Review = () => {
  const [formData, setFormData] = useState({
    comment: "",
    rating: 0,
    productId: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleRating = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rating: index + 1,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { id, value } = e.target;

    {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_API}/review/add-review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            comment: formData.comment,
            rating: formData.rating,
            productId: formData.productId,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        console.error(data.message || data.error);
        return;
      }

      setFormData({
        comment: "",
        rating: 0,
        productId: "",
      });
    } catch (error) {
      console.error("Failed To add Review", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="grid md:grid-cols-2  gap-6  min-h-[50vh]">
      {/* Review Form */}
      <div className=" bg-zinc-100/50 md:p-6 p-4 rounded-md border border-zinc-200 md:order-1 order-2">
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
          Drop Your Review
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Review Text */}
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium">
              Your Review
            </label>
            <textarea
              id="comment"
              rows={6}
              maxLength={400}
              required
              onChange={handleChange}
              value={formData.comment}
              className="w-full bg-white border border-zinc-100 px-4 py-3 rounded-lg resize-none focus:ring-1 focus:ring-primary focus:outline-none "
              placeholder="Share your thoughts..."
            ></textarea>
          </div>

          {/* Star Rating */}
          <div>
            <label htmlFor="fullName" className="text-sm font-medium">
              Rating
            </label>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleRating(i)}
                  className="text-gray-300 hover:text-yellow-500"
                >
                  <Star
                    className={`h-6 w-6 ${
                      i < formData.rating
                        ? "fill-yellow-500 text-yellow-500"
                        : ""
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 text-md  bg-primary hover:bg-primary text-white rounded-lg hover:brightness-110 transition duration-200 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>

      {/* Review Display */}
      <div className="space-y-6 md:order-2 order-1">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
          Customer Reviews
        </h2>{" "}
        <p className="text-gray-500 text-sm text-center">
          No reviews yet. Be the first to review!
        </p>
      </div>
    </section>
  );
};

export default Review;
