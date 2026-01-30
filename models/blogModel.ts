import { Schema, model, models, Types } from "mongoose";

export type BlogStatus = "draft" | "published" | "archived";

const BlogSchema = new Schema(
    {
        /** Core Info */
        title: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        excerpt: {
            type: String,
            required: true,
            maxlength: 300,
        },

        /** Media */
        coverImage: {
            type: String, // Cloudinary / CDN URL
        },

        /** Categorization */
        tags: {
            type: [String],
            default: [],
            index: true,
        },

        /** Author */
        authorId: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },


        /** Content control */
        status: {
            type: String,
            enum: ["draft", "published", "archived"],
            default: "draft",
            index: true,
        },

        mdxContent: {
            type: String,
            required: true,
        },

        /** SEO */
        seo: {
            metaTitle: { type: String },
            metaDescription: { type: String },
            ogImage: { type: String },
            keywords: { type: [String], default: [] },
        },

        /** Metrics */
        readingTime: {
            type: Number,
            default: 0,
        },

        views: {
            type: Number,
            default: 0,
        },

        /** Publishing */
        publishedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

export const Blog = models.Blog || model("Blog", BlogSchema);
