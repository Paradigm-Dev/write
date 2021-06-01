import { Extension } from "@tiptap/core";
import "@tiptap/extension-text-style";
export const FontFamily = Extension.create({
  name: "fontFamily",
  defaultOptions: {
    types: ["textStyle"],
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontFamily: {
            default: "Roboto",
            renderHTML: (attributes) => {
              if (!attributes.fontFamily) {
                return {
                  style: "font-family: Roboto",
                };
              } else
                return {
                  style: `font-family: ${attributes.fontFamily}`,
                };
            },
            parseHTML: (element) => ({
              fontFamily: element.style.fontFamily.replace(/['"]+/g, ""),
            }),
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontFamily: (fontFamily) => ({ chain }) => {
        return chain()
          .setMark("textStyle", { fontFamily })
          .run();
      },
      unsetFontFamily: () => ({ chain }) => {
        return chain()
          .setMark("textStyle", { fontFamily: "Roboto" })
          .removeEmptyTextStyle()
          .run();
      },
    };
  },
});
