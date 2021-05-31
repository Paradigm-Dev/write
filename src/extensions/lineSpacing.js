import { Extension } from "@tiptap/core";
import "@tiptap/extension-text-style";
export const LineSpacing = Extension.create({
  name: "lineSpacing",
  defaultOptions: {
    types: ["textStyle"],
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineSpacing: {
            default: "25px",
            renderHTML: (attributes) => {
              if (!attributes.lineSpacing) {
                return {};
              }
              return {
                style: `line-height: ${attributes.lineSpacing}`,
              };
            },
            parseHTML: (element) => ({
              lineHeight: element.style.lineHeight.replace(/['"]+/g, ""),
            }),
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setLineSpacing: (lineSpacing) => ({ chain }) => {
        return chain()
          .setMark("textStyle", { lineSpacing })
          .run();
      },
      unsetLineSpacing: () => ({ chain }) => {
        return chain()
          .setMark("textStyle", { lineSpacing: null })
          .removeEmptyTextStyle()
          .run();
      },
    };
  },
});
