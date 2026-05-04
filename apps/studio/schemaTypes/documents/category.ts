import { TagIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

import { cleanSlug } from "@/utils/slug-validation";

export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  icon: TagIcon,
  description:
    "A category used to organize and filter blog posts. Categories help readers find related content.",
  fields: [
    {
      name: "title",
      type: "string",
      title: "Title",
      description:
        "The name of this category (e.g. 'Sanity', 'Next.js', 'How-to')",
      validation: (Rule) => Rule.required().error("A category title is required"),
    },
    defineField({
      name: "slug",
      type: "slug",
      title: "Slug",
      description:
        "A short, URL-friendly identifier for this category (auto-generated from title)",
      options: {
        source: "title",
        slugify: (input: string) => cleanSlug(input),
      },
      validation: (Rule) =>
        Rule.required().error("A category slug is required"),
    }),
  ],
  preview: {
    select: {
      title: "title",
      slug: "slug.current",
    },
    prepare: ({ title, slug }) => ({
      title: title || "Untitled Category",
      subtitle: slug ? `🔗 ${slug}` : "No slug",
    }),
  },
});
