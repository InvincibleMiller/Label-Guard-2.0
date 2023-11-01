import { defineField, defineType } from "sanity";
import { BsCreditCardFill } from "react-icons/bs";

export default defineType({
  name: "priceSection",
  title: "Price Section",
  type: "object",
  icon: BsCreditCardFill,
  fields: [
    defineField({
      type: "string",
      name: "packageName",
      title: "Package Name",
    }),
    defineField({
      type: "number",
      name: "price",
      title: "Price",
    }),
    defineField({
      type: "string",
      name: "period",
      title: "Payment Period",
    }),
    defineField({
      type: "text",
      name: "description",
      title: "Description",
    }),
  ],
});
