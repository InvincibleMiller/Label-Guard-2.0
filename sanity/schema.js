import Navlink from "./schema/objects/Navlink";
import { FeatureList, Feature } from "./schema/objects/FeatureList";
import Page from "./schema/documents/Page";
import HeroSection from "./schema/objects/HeroSection";

export const schema = {
  types: [
    // objects
    Page,
    // types
    Navlink,
    Feature,
    FeatureList,
    HeroSection,
  ],
};
