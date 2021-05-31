import { Node, nodeInputRule, mergeAttributes } from "@tiptap/core";
export const inputRegex = /!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/;
export const Image = Node.create({
  name: "image",
  defaultOptions: {
    inline: false,
    HTMLAttributes: {
      style: "max-width: 732px",
    },
  },
  inline() {
    return this.options.inline;
  },
  group() {
    return this.options.inline ? "inline" : "block";
  },
  draggable: true,
  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: "img[src]",
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "img",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    ];
  },
  addCommands() {
    return {
      setImage: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
    };
  },
  addInputRules() {
    return [
      nodeInputRule(inputRegex, this.type, (match) => {
        const [, alt, src, title] = match;
        return { src, alt, title };
      }),
    ];
  },
});
