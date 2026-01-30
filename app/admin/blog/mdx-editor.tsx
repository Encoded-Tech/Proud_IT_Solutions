"use client";
// At the top of your component or in layout.tsx

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import { CharacterCount } from "@tiptap/extension-character-count";

import {  useState } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
  Minus,
  Code,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Palette,
} from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function BlogRichTextEditor({
  value,
  onChange,
  placeholder = "Start writing your blog post...",
}: Props) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  const colors = [
    "#000000", "#ef4444", "#f97316", "#eab308",
    "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899",
  ];

  const highlightColors = [
    "#fef08a", "#fed7aa", "#fecaca",
    "#ddd6fe", "#bfdbfe", "#bbf7d0",
  ];

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline cursor-pointer hover:text-blue-800",
        },
      }),
      Image.configure({
        HTMLAttributes: { class: "max-w-full h-auto rounded-lg" },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ["heading", "paragraph", "blockquote"],
      }),
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: 10000 }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[400px] px-6 py-4",
      },
    },
immediatelyRender: false,
  });

  // Sync external value changes



  if (!editor) {
    return (
      <div className="border rounded-xl bg-white shadow-sm animate-pulse">
        <div className="h-12 bg-gray-100 rounded-t-xl" />
        <div className="h-96 bg-gray-50" />
      </div>
    );
  }

  const buttonClass = (active: boolean) =>
    `p-2 rounded-lg transition-all ${
      active
        ? "bg-blue-100 text-blue-700 shadow-sm"
        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
        {/* Undo/Redo */}
        <div className="flex gap-1 pr-2 border-r border-gray-300">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className={buttonClass(false) + " disabled:opacity-30 disabled:cursor-not-allowed"}
            title="Undo"
          >
            <Undo size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className={buttonClass(false) + " disabled:opacity-30 disabled:cursor-not-allowed"}
            title="Redo"
          >
            <Redo size={18} />
          </button>
        </div>

        {/* Text Formatting */}
        <div className="flex gap-1 pr-2 border-r border-gray-300">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={buttonClass(editor.isActive("bold"))}
            title="Bold"
          >
            <Bold size={18} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={buttonClass(editor.isActive("italic"))}
            title="Italic"
          >
            <Italic size={18} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={buttonClass(editor.isActive("underline"))}
            title="Underline"
          >
            <UnderlineIcon size={18} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={buttonClass(editor.isActive("strike"))}
            title="Strikethrough"
          >
            <Strikethrough size={18} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={buttonClass(editor.isActive("code"))}
            title="Inline Code"
          >
            <Code size={18} />
          </button>
        </div>

        {/* Headings */}
        <div className="flex gap-1 pr-2 border-r border-gray-300">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={buttonClass(editor.isActive("heading", { level: 1 }))}
            title="Heading 1"
          >
            <Heading1 size={18} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={buttonClass(editor.isActive("heading", { level: 2 }))}
            title="Heading 2"
          >
            <Heading2 size={18} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={buttonClass(editor.isActive("heading", { level: 3 }))}
            title="Heading 3"
          >
            <Heading3 size={18} />
          </button>
        </div>

        {/* Lists & Blockquote */}
        <div className="flex gap-1 pr-2 border-r border-gray-300">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={buttonClass(editor.isActive("bulletList"))}
            title="Bullet List"
          >
            <List size={18} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={buttonClass(editor.isActive("orderedList"))}
            title="Numbered List"
          >
            <ListOrdered size={18} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={buttonClass(editor.isActive("blockquote"))}
            title="Quote"
          >
            <Quote size={18} />
          </button>
        </div>

        {/* Alignment */}
        <div className="flex gap-1 pr-2 border-r border-gray-300">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={buttonClass(editor.isActive({ textAlign: "left" }))}
            title="Align Left"
          >
            <AlignLeft size={18} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={buttonClass(editor.isActive({ textAlign: "center" }))}
            title="Align Center"
          >
            <AlignCenter size={18} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={buttonClass(editor.isActive({ textAlign: "right" }))}
            title="Align Right"
          >
            <AlignRight size={18} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={buttonClass(editor.isActive({ textAlign: "justify" }))}
            title="Justify"
          >
            <AlignJustify size={18} />
          </button>
        </div>

        {/* Colors & Highlight */}
        <div className="flex gap-1 pr-2 border-r border-gray-300 relative">
          <button
            type="button"
            onClick={() => { setShowColorPicker(!showColorPicker); setShowHighlightPicker(false); }}
            className={buttonClass(showColorPicker)}
            title="Text Color"
          >
            <Palette size={18} />
          </button>

          {showColorPicker && (
            <div className="absolute top-12 left-0 z-10 bg-white border border-gray-300 rounded-lg shadow-xl p-2 flex gap-1">
              {colors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => { editor.chain().focus().setColor(color).run(); setShowColorPicker(false); }}
                  className="w-7 h-7 rounded-md border-2 border-gray-300 hover:border-gray-500 transition-all"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              <button
                type="button"
                onClick={() => { editor.chain().focus().unsetColor().run(); setShowColorPicker(false); }}
                className="w-7 h-7 rounded-md border-2 border-gray-300 hover:border-gray-500 bg-white flex items-center justify-center"
                title="Reset color"
              >✕</button>
            </div>
          )}

          <button
            type="button"
            onClick={() => { setShowHighlightPicker(!showHighlightPicker); setShowColorPicker(false); }}
            className={buttonClass(editor.isActive("highlight"))}
            title="Highlight"
          >
            <Highlighter size={18} />
          </button>

          {showHighlightPicker && (
            <div className="absolute top-12 left-0 z-10 bg-white border border-gray-300 rounded-lg shadow-xl p-2 flex gap-1">
              {highlightColors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => { editor.chain().focus().setHighlight({ color }).run(); setShowHighlightPicker(false); }}
                  className="w-7 h-7 rounded-md border-2 border-gray-300 hover:border-gray-500 transition-all"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              <button
                type="button"
                onClick={() => { editor.chain().focus().unsetHighlight().run(); setShowHighlightPicker(false); }}
                className="w-7 h-7 rounded-md border-2 border-gray-300 hover:border-gray-500 bg-white flex items-center justify-center"
                title="Remove highlight"
              >✕</button>
            </div>
          )}
        </div>

        {/* Media & Other */}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => {
              const url = prompt("Enter image URL:");
              if (url) editor.chain().focus().setImage({ src: url }).run();
            }}
            className={buttonClass(false)}
            title="Insert Image"
          >
            <ImageIcon size={18} />
          </button>

          <button
            type="button"
            onClick={() => {
              const previousUrl = editor.getAttributes("link").href;
              const url = prompt("Enter link URL:", previousUrl);
              if (url === null) return;
              if (url === "") {
                editor.chain().focus().extendMarkRange("link").unsetLink().run();
                return;
              }
              editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
            }}
            className={buttonClass(editor.isActive("link"))}
            title="Insert/Edit Link"
          >
            <LinkIcon size={18} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className={buttonClass(false)}
            title="Horizontal Line"
          >
            <Minus size={18} />
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm("Are you sure you want to clear all content?")) {
                editor.chain().focus().clearContent().run();
              }
            }}
            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all"
            title="Clear All"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>

      {/* Character Count Footer */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-t text-xs text-gray-500">
        <span>{editor.storage.characterCount.characters() || 0} characters</span>
        <span>{editor.storage.characterCount.words() || 0} words</span>
      </div>
    </div>
  );
}
