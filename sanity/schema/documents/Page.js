import { defineField, defineArrayMember } from "sanity";
import { BsFillImageFill } from "react-icons/bs";

export default {
  name: "page",
  type: "document",
  title: "Page",
  fields: [
    defineField({
      type: "string",
      name: "title",
      title: "Title",
      validation: (rule) => rule.required(),
    }),
    defineField({
      type: "slug",
      name: "slug",
      title: "Slug",
      options: {
        source: "title",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      type: "array",
      name: "navlinks",
      title: "Navbar Links",
      of: [defineArrayMember({ type: "navlink" })],
    }),
    defineField({
      name: "content",
      type: "array",
      title: "Content",
      of: [
        defineArrayMember({ type: "block" }),
        defineField({
          type: "image",
          name: "image",
          title: "Image",
          icon: BsFillImageFill,
        }),
        defineArrayMember({ type: "featureList" }),
        defineArrayMember({ type: "hero" }),
      ],
    }),
  ],
};
