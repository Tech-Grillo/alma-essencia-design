export type PublicReview = {
  id: string;
  rating: number;
  comment: string | null;
  author_name: string;
  created_at: string;
};

export type ReviewableItem = {
  slug: string;
  name: string;
  review: { rating: number; comment: string | null } | null;
};
