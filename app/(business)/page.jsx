import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import { map, keyBy } from "lodash";

import { Hero, Features, PriceSection } from "@/components/SSR/PageComponents";

export default async function Home() {
  const revalidationTime = 1800;
  // get the newest "home" page document from Sanity
  const home = await client.fetch(
    groq`*[_type == "page" && slug.current == "hero"] | order(_createdAt desc) [0]`,
    {
      next: {
        revalidate: revalidationTime, // look for updates to revalidate cache every hour
      },
    }
  );

  // simply getting the url by dereferencing images
  const { content: featureListsCollection } = await client.fetch(
    groq`
    *[_id == "${home._id}"][0] {
      content[_type == "featureList"] {
        features[] {
          "thumbnail": thumbnail.asset->url,
          description,
          header,
        },
        _key
      }
    }`,
    {
      next: {
        revalidate: revalidationTime, // look for updates to revalidate cache every hour
      },
    }
  );

  // key the featureLists to make it easier to access later
  const featureLists = keyBy(featureListsCollection, ({ _key }) => _key);

  return (
    <>
      {map(home.content, (section, i) => {
        switch (section._type) {
          case "hero":
            return <Hero {...section} />;
          case "featureList":
            return <Features {...featureLists[section._key]} />;
          case "priceSection":
            return <PriceSection {...section} />;
        }

        return <p key={i}>{JSON.stringify(section)}</p>;
      })}
    </>
  );
}
