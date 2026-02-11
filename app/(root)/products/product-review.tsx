// "use client";

// import { Star } from "lucide-react";
// import { useEffect, useState, useMemo } from "react";
// import { useDispatch } from "react-redux";
// import toast from "react-hot-toast";

// import { setReviews } from "@/redux/features/review/reviewSlice";

// import { ReviewType } from "@/types/product";

// import {
//   createReviewAction,
//   updateReviewAction,
// } from "@/lib/server/actions/public/review/reviewActions";
// import Image from "next/image";
// import { useAppSelector } from "@/redux/hooks";
// import { selectAuthHydrated, selectIsAuthenticated } from "@/redux/features/auth/userSlice";
// import { useRouter } from "next/navigation";

// interface ReviewProps {
//   initialReviews: ReviewType[];
//   totalReviews: number;
//   avgRating: number;
//   productSlug: string;
//   currentUserId?: string;
//   onReviewsChange?: (reviews: ReviewType[], avgRating: number) => void; // 🔹
// }

// export default function Review({
//   initialReviews,
//   totalReviews,
//   avgRating,
//   productSlug,
//   currentUserId,
//   onReviewsChange, // 🔹
// }: ReviewProps) {
//   const dispatch = useDispatch();
//   const router = useRouter();

//   const [rating, setRating] = useState(0);
//   const [comment, setComment] = useState("");
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   // 🔹 LOCAL STATE for reviews
//   const [reviewsState, setReviewsState] = useState<ReviewType[]>(initialReviews);
//   const [avgRatingState, setAvgRatingState] = useState<number>(avgRating);

//   const isLoggedIn = useAppSelector(selectIsAuthenticated);
//   const authHydrated = useAppSelector(selectAuthHydrated);

//   // 🔹 Initialize redux state
//   useEffect(() => {
//     dispatch(
//       setReviews({
//         reviews: initialReviews,
//         avgRating,
//         totalReviews,
//       })
//     );
//   }, [dispatch, initialReviews, avgRating, totalReviews]);

//   const myReview = useMemo(
//     () => reviewsState.find((r) => r.user.id === currentUserId),
//     [reviewsState, currentUserId]
//   );

//   const otherReviews = useMemo(
//     () => reviewsState.filter((r) => r.user.id !== currentUserId),
//     [reviewsState, currentUserId]
//   );

//   useEffect(() => {
//     if (myReview) {
//       setEditingId(myReview.id);
//       setRating(myReview.rating);
//       setComment(myReview.comment);
//     } else {
//       setEditingId(null);
//       setRating(0);
//       setComment("");
//     }
//   }, [myReview]);

//   // 🔹 handleReviewUpdate
//   const handleReviewUpdate = (newReviews: ReviewType[], newAvgRating: number) => {


//     setReviewsState(newReviews);       // update local state
//     setAvgRatingState(newAvgRating);   // update avg rating

//     // also notify parent (ProductPageClient)
//     if (onReviewsChange) onReviewsChange(newReviews, newAvgRating);
//   };

//   const handleSubmit = async () => {

//     if (!authHydrated) {
//       toast.loading("Checking login...");
//       return;
//     }
//     if (!isLoggedIn) {
//       toast.error("Please login first!");
//       router.push(`/login?redirect=/products/${productSlug}`);
//       return;
//     }
//     if (!rating || !comment.trim()) {
//       toast.error("Rating and comment are required");
//       return;
//     }
//     setLoading(true);
//     try {
//       const res = editingId
//         ? await updateReviewAction(productSlug, rating, comment)
//         : await createReviewAction(productSlug, rating, comment);

//       if (!res.success) {
//         toast.error(res.message);
//         return;
//       }

//       // 🔹 update state safely
//       handleReviewUpdate(res.reviews!, res.avgRating!);

//       dispatch(
//         setReviews({
//           reviews: res.reviews!,
//           totalReviews: res.totalReviews!,
//           avgRating: res.avgRating!,
//         })
//       );

//       toast.success(editingId ? "Review updated" : "Review submitted");
//     } catch (err) {
//       console.error(err);
//       toast.error("Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };






//   return (
//     <>
//       {/* Header */}
//       <section id="reviews" className="mb-10 ">
//         <h2 className="text-2xl font-semibold text-gray-900">Customer Reviews</h2>
//         <p className="text-gray-600 mt-1">
//           {reviewsState.length} review{reviewsState.length !== 1 ? "s" : ""}, average rating{" "}
//           <span className="font-medium text-yellow-500">⭐ {avgRatingState.toFixed(1)}</span>
//         </p>
//       </section>

//       <section className="grid md:grid-cols-[400px_1fr] gap-8 items-start">
//         {/* LEFT: Review Form */}
//         <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 flex-shrink-0">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
//             {editingId ? "Your Review" : "Write a Review"}
//           </h2>

//           {/* Star Rating */}
//           <div className="flex justify-center gap-2 mb-4">
//             {[...Array(5)].map((_, i) => (
//               <button
//                 key={i}
//                 type="button"
//                 onClick={() => setRating(i + 1)}
//                 disabled={loading}
//                 className="transition-transform hover:scale-110"
//               >
//                 <Star
//                   className={`h-7 w-7 ${i < rating
//                       ? "fill-yellow-500 text-yellow-500"
//                       : "text-gray-300 hover:text-yellow-500"
//                     }`}
//                 />
//               </button>
//             ))}
//           </div>

//           {/* Comment */}
//           <textarea
//             value={comment}
//             onChange={(e) => setComment(e.target.value)}
//             rows={5}
//             placeholder="Share your experience…"
//             className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-primary focus:outline-none resize-none shadow-sm mb-4"
//             disabled={loading}
//           />

//           {/* Submit button */}
//           <div className="flex justify-center">
//             <button
//               onClick={handleSubmit}
//               disabled={loading || !rating || !comment.trim()}
//               className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-all font-semibold"
//             >
//               {loading
//                 ? editingId
//                   ? "Updating..."
//                   : "Submitting..."
//                 : editingId
//                   ? "Update Review"
//                   : "Submit Review"}
//             </button>
//           </div>
//         </div>

//         {/* RIGHT: Reviews List */}
//         <div className="flex flex-col space-y-4">
//           {otherReviews.length === 0 ? (

//             <p className="text-center text-gray-400">No reviews yet</p>
//           ) : (
//             <div className="space-y-4">
//               {reviewsState.map((review) => (


//                 <div
//                   key={review.id}
//                   className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all space-y-2"
//                 >
//                   {/* User avatar */}
//                   <div className="flex-shrink-0">
//                     <Image
//                       width={1000}
//                       height={1000}
//                       src={review.user.image || "/images/default-avatar.png"}
//                       alt={review.user.name}
//                       className="h-10 w-10 rounded-full object-cover border border-gray-200"
//                     />
//                   </div>
//                   <div className="flex justify-between items-center mb-1">
//                     <span className="font-medium text-gray-900">{review.user.name}</span>
//                     <div className="flex gap-1">
//                       {[...Array(5)].map((_, i) => (
//                         <Star
//                           key={i}
//                           className={`h-4 w-4 ${i < review.rating
//                               ? "fill-primary fill-yellow-500 text-yellow-500"
//                               : "text-gray-300"
//                             }`}
//                         />
//                       ))}
//                     </div>
//                   </div>
//                   <p className="text-gray-700 text-sm">{review.comment}</p>
//                   <p className="text-gray-400 text-xs">
//                     {review.updatedAt && review.updatedAt !== review.createdAt
//                       ? `Edited at: ${new Date(review.updatedAt).toLocaleString()}`
//                       : `Reviewed at: ${new Date(review.createdAt).toLocaleString()}`}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </section>
//     </>
//   );
// }


"use client";

import { Star } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { setReviews } from "@/redux/features/review/reviewSlice";
import { ReviewType } from "@/types/product";
import {
  createReviewAction,
  updateReviewAction,
} from "@/lib/server/actions/public/review/reviewActions";
import {
  useAppSelector,
} from "@/redux/hooks";
import {
  selectAuthHydrated,
  selectIsAuthenticated,
} from "@/redux/features/auth/userSlice";

interface ReviewProps {
  initialReviews: ReviewType[];
  totalReviews: number;
  avgRating: number;
  productSlug: string;
  currentUserId?: string;
  onReviewsChange?: (reviews: ReviewType[], avgRating: number) => void;
}

export default function Review({
  initialReviews,
  totalReviews,
  avgRating,
  productSlug,
  currentUserId,
  onReviewsChange,
}: ReviewProps) {
  const dispatch = useDispatch();
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ NEW: validation errors
  const [errors, setErrors] = useState<{
    rating?: string;
    comment?: string;
  }>({});

  // Review state
  const [reviewsState, setReviewsState] =
    useState<ReviewType[]>(initialReviews);
  const [avgRatingState, setAvgRatingState] =
    useState<number>(avgRating);

  const isLoggedIn = useAppSelector(selectIsAuthenticated);
  const authHydrated = useAppSelector(selectAuthHydrated);

  useEffect(() => {
    dispatch(
      setReviews({
        reviews: initialReviews,
        avgRating,
        totalReviews,
      })
    );
  }, [dispatch, initialReviews, avgRating, totalReviews]);

  const myReview = useMemo(
    () => reviewsState.find((r) => r.user.id === currentUserId),
    [reviewsState, currentUserId]
  );

  const otherReviews = useMemo(
    () => reviewsState.filter((r) => r.user.id !== currentUserId),
    [reviewsState, currentUserId]
  );

  // ✅ View vs Edit mode
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (myReview) {
      setEditingId(myReview.id);
      setRating(myReview.rating);
      setComment(myReview.comment);
    }
  }, [myReview]);

  const handleReviewUpdate = (
    newReviews: ReviewType[],
    newAvgRating: number
  ) => {
    setReviewsState(newReviews);
    setAvgRatingState(newAvgRating);
    onReviewsChange?.(newReviews, newAvgRating);
  };

  // ✅ VALIDATION
  const validate = () => {
    const newErrors: typeof errors = {};

    if (!rating) newErrors.rating = "Please select a rating";
    if (!comment.trim())
      newErrors.comment = "You must fill this field";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!authHydrated) return;

    if (!isLoggedIn) {
      toast.error("Please login first!");
      router.push(`/login?redirect=/products/${productSlug}`);
      return;
    }

    if (!validate()) return;

    setLoading(true);

    try {
      const res = editingId
        ? await updateReviewAction(productSlug, rating, comment)
        : await createReviewAction(productSlug, rating, comment);

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      handleReviewUpdate(res.reviews!, res.avgRating!);

      dispatch(
        setReviews({
          reviews: res.reviews!,
          totalReviews: res.totalReviews!,
          avgRating: res.avgRating!,
        })
      );

      toast.success(
        editingId ? "Review updated" : "Review submitted"
      );

      // ✅ RESET after submit (only new review)
      if (!editingId) {
        setRating(0);
        setComment("");
      }

      setIsEditing(false);
      setErrors({});
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* HEADER */}
      <section id="reviews" className="mb-10">
        <h2 className="text-2xl font-semibold">
          Customer Reviews
        </h2>
        <p className="text-gray-600 mt-1">
          {reviewsState.length} review{reviewsState.length !==1 ? "s" : ""}, average ⭐{" "}
          {avgRatingState.toFixed(1)}
        </p>
      </section>

      <section className="grid md:grid-cols-[400px_1fr] gap-8">

        {/* =========================
            LEFT: USER REVIEW
        ========================== */}

        <div className="bg-white rounded-xl shadow border p-6">

          {/* ✅ VIEW MODE */}
          {myReview && !isEditing ? (
            <div className="space-y-4 text-center">

              <h3 className="font-semibold text-lg">
                Your Review
              </h3>

              {/* Stars */}
              <div className="flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 ${
                      i < myReview.rating
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              <p className="text-gray-700">
                {myReview.comment}
              </p>
            <div className="text-xs text-gray-400 space-y-1">

  <p>
    Reviewed at:{" "}
    {new Date(
      myReview.createdAt
    ).toLocaleString()}
  </p>

  {myReview.updatedAt &&
    myReview.updatedAt !== myReview.createdAt && (
      <p>
        Edited at:{" "}
        {new Date(
          myReview.updatedAt
        ).toLocaleString()}
      </p>
    )}

</div>




              <button
                onClick={() => setIsEditing(true)}
                className="text-primary font-medium hover:underline"
              >
                Edit Review
              </button>
            </div>

          ) : (

            /* ✅ FORM MODE */
            <>
              <h3 className="font-semibold mb-4 text-center">
                {editingId ? "Edit Review" : "Write a Review"}
              </h3>

              {/* Stars */}
              <div className="flex justify-center gap-2 mb-1">
                {[...Array(5)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setRating(i + 1);
                      setErrors((e) => ({ ...e, rating: "" }));
                    }}
                    type="button"
                  >
                    <Star
                      className={`h-7 w-7 ${
                        i < rating
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* ⭐ Rating error */}
              {errors.rating && (
                <p className="text-red-500 text-sm mb-2 text-center">
                  {errors.rating}
                </p>
              )}

              {/* Comment */}
              <textarea
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  setErrors((er) => ({
                    ...er,
                    comment: "",
                  }));
                }}
                rows={5}
                placeholder="Share your experience…"
                className={`w-full border rounded-lg p-3 mb-1 ${
                  errors.comment
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />

              {/* Comment error */}
              {errors.comment && (
                <p className="text-red-500 text-sm mb-3">
                  {errors.comment}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-primary text-white py-2 rounded-lg"
              >
                {loading
                  ? "Submitting..."
                  : editingId
                  ? "Update Review"
                  : "Submit Review"}
              </button>
            </>
          )}
        </div>

        {/* =========================
            RIGHT: ALL REVIEWS
        ========================== */}

        <div className="space-y-4">
          {otherReviews.length === 0 ? (
            <p className="text-gray-400">
              No reviews yet
            </p>
          ) : (
            otherReviews.map((review) => (
           <div
  key={review.id}
  className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition"
>
  {/* Top row */}
  <div className="flex gap-3 items-start justify-between">

    {/* User info */}
    <div className="flex gap-3 items-center">
      <Image
        src={
          review.user.image ||
          "/images/default-avatar.png"
        }
        alt={review.user.name}
        width={40}
        height={40}
        className="rounded-full border"
      />

      <div>
        <p className="font-medium text-gray-900">
          {review.user.name}
        </p>

        {/* Stars */}
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < review.rating
                  ? "fill-yellow-500 text-yellow-500"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  </div>

  {/* Comment */}
  <p className="text-sm text-gray-700 mt-3">
    {review.comment}
  </p>

  {/* Date section */}
  {/* Date section */}
<div className="text-xs text-gray-400 mt-2 space-y-1">

  {/* Reviewed date (always shown) */}
  <p>
    📝 Reviewed at:{" "}
    {new Date(
      review.createdAt
    ).toLocaleString()}
  </p>

  {/* Edited date (only if edited) */}
  {review.updatedAt &&
    review.updatedAt !== review.createdAt && (
      <p>
        ✏️ Edited at:{" "}
        {new Date(
          review.updatedAt
        ).toLocaleString()}
      </p>
    )}

</div>

</div>

            ))
          )}
        </div>
      </section>
    </>
  );
}
