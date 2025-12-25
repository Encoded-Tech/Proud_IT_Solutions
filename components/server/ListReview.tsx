// // components/ListReviews.tsx
// import Review from "@/app/(root)/products/product-review";
// import { getReviewsAction } from "@/lib/server/fetchers/fetchReview";


// export const dynamic = "force-dynamic";
// export const fetchCache = "no-store";

// interface ListReviewsProps {
//   slug: string;
// }

// const ListReviews = async ({ slug }: ListReviewsProps) => {
//   const { reviews, totalReviews, avgRating } =
//     await getReviewsAction(slug);

//     console.log(reviews);
//     console.log()

//   return (
//     <Review
//       initialReviews={reviews}
//       totalReviews={totalReviews}
//       avgRating={avgRating}
//       productSlug={slug}
//     />
//   );
// };

// export default ListReviews;
