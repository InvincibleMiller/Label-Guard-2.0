import { defineType, defineField } from "sanity";
import { BsBrushFill, BsTvFill } from "react-icons/bs";

export default defineType({
  type: "object",
  name: "hero",
  title: "Hero Section",
  icon: BsTvFill,
  fields: [
    defineField({
      type: "array",
      name: "cta",
      title: "Call to Action",
      rows: 2,
      of: [
        {
          type: "block",
          styles: [],
          lists: [],
          marks: {
            decorators: [
              {
                title: "Highlight",
                value: "high",
                icon: BsBrushFill,
                component: ({ children }) => (
                  <span className="cta-strong">{children}</span>
                ),
              },
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
            ],
            annotations: [],
          },
        },
      ],
    }),
    defineField({
      type: "text",
      name: "subtext",
      title: "Subtext",
      rows: 2,
    }),
  ],
});
