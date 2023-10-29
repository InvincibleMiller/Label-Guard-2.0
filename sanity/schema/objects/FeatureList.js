import { defineField, defineType } from "sanity";
import { BsCardList, BsStarFill } from "react-icons/bs";

export const Feature = defineType({
  type: "object",
  name: "feature",
  title: "Feature",
  icon: BsStarFill,
  fields: [
    defineField({
      type: "image",
      name: "thumbnail",
      title: "Thumbnail",
      validation: (rule) => rule.required(),
    }),
    defineField({
      type: "string",
      name: "header",
      title: "Header",
      validation: (rule) => rule.required(),
    }),
    defineField({
      type: "text",
      name: "description",
      title: "Description",
      validation: (rule) => rule.required(),
    }),
  ],
});

export const FeatureList = defineType({
  type: "object",
  name: "featureList",
  title: "Feature List",
  icon: BsCardList,
  fields: [
    defineField({
      type: "array",
      name: "features",
      title: "Features",
      of: [{ type: "feature" }],
    }),
  ],
});
