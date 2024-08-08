const { registerTransforms } = require("@tokens-studio/sd-transforms");
const StyleDictionary = require("style-dictionary");

registerTransforms(StyleDictionary, {
  excludeParentKeys: true,
});

const sd = StyleDictionary.extend({
  source: ["core.json"],
  platforms: {
    css: {
      transforms: [
        "attribute/cti",
        "ts/descriptionToComment",
        "ts/size/px",
        "ts/opacity",
        "ts/size/lineheight",
        "ts/type/fontWeight",
        "ts/resolveMath",
        "ts/size/css/letterspacing",
        "ts/typography/css/shorthand",
        "ts/border/css/shorthand",
        "ts/shadow/css/shorthand",
        "ts/color/css/hexrgba",
        "ts/color/modifiers",
        "name/cti/kebab",
        "size/rem",
      ],
      buildPath: "build/css/",
      files: [
        {
          destination: "global.css",
          format: "css/variables",
        },
      ],
    },
  },
});

sd.cleanAllPlatforms();
sd.buildAllPlatforms();
