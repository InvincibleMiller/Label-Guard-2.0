import { defineField, defineType } from "sanity";

export default defineType({
  name: "navlink",
  title: "Navbar Link",
  type: "object",
  fields: [
    defineField({
      type: "string",
      name: "navtext",
      title: "Navlink Text",
      validation: (rule) => rule.required(),
    }),
    defineField({
      type: "url",
      name: "link",
      title: "Navlink URL",
      validation: (rule) => rule.required(),
    }),
  ],
});
