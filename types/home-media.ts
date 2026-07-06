export type HomeBottomTile = {
  id: string;
  placement: "home_bottom_tiles";
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  ctaText: string;
  altText: string;
  sortOrder: number;
  isActive: boolean;
  publicId?: string;
};

export type HomeBottomTileInput = {
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl: string;
  ctaText?: string;
  altText?: string;
  sortOrder: number;
  isActive: boolean;
  publicId?: string;
};
