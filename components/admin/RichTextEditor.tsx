"use client";

import { useCallback, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";

import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CharacterCount from "@tiptap/extension-character-count";

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";
import { common } from "lowlight";


import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table as TableIcon,
  Link as LinkIcon,
  Code,
  Code2,
  Strikethrough,
  Quote,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  ListTodo,
  Minus,
  ChevronDown,
  Palette,
  Type,
  Columns,
  Trash2,
  RowsIcon,
  LayoutGrid,
  Eraser,
  Copy,
  Scissors,
  Hash,
} from "lucide-react";

const lowlight = createLowlight(common);

interface Props {
  value?: string;
  onChange?: (value: string) => void;
}

const FONT_FAMILIES = [
  { label: "Default", value: "" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Mono", value: "ui-monospace, monospace" },
  { label: "Sans", value: "ui-sans-serif, sans-serif" },
  { label: "Cursive", value: "cursive" },
];

const TEXT_COLORS = [
  "#000000", "#374151", "#6B7280", "#EF4444", "#F97316",
  "#EAB308", "#22C55E", "#3B82F6", "#8B5CF6", "#EC4899",
  "#06B6D4", "#10B981",
];

const HIGHLIGHT_COLORS = [
  "#FEF08A", "#BBF7D0", "#BFDBFE", "#DDD6FE",
  "#FBCFE8", "#FED7AA", "#E5E7EB", "#ffffff",
];

type TableMenuState = {
  open: boolean;
  rows: number;
  cols: number;
};

export default function RichTextEditor({ value = "", onChange }: Props) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [tableMenu, setTableMenu] = useState<TableMenuState>({ open: false, rows: 3, cols: 3 });
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false, link: false, underline: false }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      FontFamily,
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({ nested: true }),
      CharacterCount,
      CodeBlockLowlight.configure({ lowlight }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: "Start writing amazing description…" }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
    }
    setLinkUrl("");
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  const insertTable = (rows: number, cols: number) => {
    editor?.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setTableMenu({ open: false, rows: 3, cols: 3 });
  };

  if (!editor) return null;

  const charCount = editor.storage.characterCount?.characters() ?? 0;
  const wordCount = editor.storage.characterCount?.words() ?? 0;

  // ─── Toolbar Button ───────────────────────────────────────
  const Btn = ({
    onClick, active, title, disabled, children,
  }: {
    onClick: () => void; active?: boolean; title?: string;
    disabled?: boolean; children: React.ReactNode;
  }) => (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`
        relative flex items-center justify-center w-8 h-8 rounded-md text-sm
        transition-all duration-150 select-none
        ${active
          ? "bg-indigo-600 text-white shadow-inner shadow-indigo-800"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}
        ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {children}
    </button>
  );

  // ─── Divider ──────────────────────────────────────────────
  const Sep = () => <div className="w-px h-6 bg-slate-200 mx-1 self-center shrink-0" />;

  // ─── Section Label ────────────────────────────────────────
  const SectionLabel = ({ label }: { label: string }) => (
    <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase px-1 self-center select-none">
      {label}
    </span>
  );

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white"
      style={{ fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif" }}
    >
      {/* ── TOP BAR: Format group labels ── */}
      <div className="flex items-center gap-1 px-3 py-1 bg-slate-50 border-b border-slate-100 text-xs text-slate-400 select-none overflow-x-auto">
        {["Text", "Headings", "Lists", "Align", "Insert", "Table", "Actions"].map((s) => (
  <button
    key={s}
    onClick={() => setActiveSection(activeSection === s ? null : s)}
    className="px-2 py-0.5"
  >
    <SectionLabel label={s} />
  </button>
))}
        <div className="ml-auto flex items-center gap-3 text-[11px]">
          <span>{wordCount} words</span>
          <span>{charCount} chars</span>
        </div>
      </div>

      {/* ── MAIN TOOLBAR ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 bg-white border-b border-slate-200">

        {/* Text Formatting */}
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (⌘B)"><Bold size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (⌘I)"><Italic size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (⌘U)"><UnderlineIcon size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough"><Strikethrough size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline Code"><Code size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive("subscript")} title="Subscript"><SubscriptIcon size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive("superscript")} title="Superscript"><SuperscriptIcon size={14} /></Btn>

        <Sep />

        {/* Color */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setShowColorPicker(!showColorPicker); setShowHighlightPicker(false); setShowFontMenu(false); }}
            title="Text Color"
            className="flex items-center gap-0.5 px-2 h-8 rounded-md text-slate-600 hover:bg-slate-100 transition-colors text-sm"
          >
            <Palette size={14} />
            <span className="w-3 h-1.5 rounded-sm" style={{ background: editor.getAttributes("textStyle").color || "#000" }} />
          </button>
          {showColorPicker && (
            <div className="absolute top-10 left-0 z-50 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 w-52">
              <p className="text-[10px] font-semibold text-slate-400 uppercase mb-2">Text Color</p>
              <div className="grid grid-cols-6 gap-1.5">
                {TEXT_COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => { editor.chain().focus().setColor(c).run(); setShowColorPicker(false); }}
                    className="w-6 h-6 rounded-md border-2 border-transparent hover:border-slate-400 transition-all"
                    style={{ background: c }} title={c} />
                ))}
              </div>
              <button type="button" onClick={() => { editor.chain().focus().unsetColor().run(); setShowColorPicker(false); }}
                className="mt-2 text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1">
                <Eraser size={11} /> Reset
              </button>
            </div>
          )}
        </div>

        {/* Highlight */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setShowHighlightPicker(!showHighlightPicker); setShowColorPicker(false); setShowFontMenu(false); }}
            title="Highlight"
            className="flex items-center gap-0.5 px-2 h-8 rounded-md text-slate-600 hover:bg-slate-100 transition-colors text-sm"
          >
            <Highlighter size={14} />
          </button>
          {showHighlightPicker && (
            <div className="absolute top-10 left-0 z-50 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 w-48">
              <p className="text-[10px] font-semibold text-slate-400 uppercase mb-2">Highlight</p>
              <div className="grid grid-cols-4 gap-1.5">
                {HIGHLIGHT_COLORS.map((c) => (
                  <button key={c} type="button"
                    onClick={() => { editor.chain().focus().toggleHighlight({ color: c }).run(); setShowHighlightPicker(false); }}
                    className="w-7 h-7 rounded-md border-2 border-transparent hover:border-slate-400 transition-all"
                    style={{ background: c, boxShadow: c === "#ffffff" ? "inset 0 0 0 1px #e2e8f0" : undefined }} />
                ))}
              </div>
              <button type="button" onClick={() => { editor.chain().focus().unsetHighlight().run(); setShowHighlightPicker(false); }}
                className="mt-2 text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1">
                <Eraser size={11} /> Remove
              </button>
            </div>
          )}
        </div>

        {/* Font Family */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setShowFontMenu(!showFontMenu); setShowColorPicker(false); setShowHighlightPicker(false); }}
            className="flex items-center gap-1 px-2 h-8 rounded-md text-slate-600 hover:bg-slate-100 transition-colors text-xs font-medium"
            title="Font Family"
          >
            <Type size={13} />
            <ChevronDown size={11} />
          </button>
          {showFontMenu && (
            <div className="absolute top-10 left-0 z-50 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 w-40">
              {FONT_FAMILIES.map((f) => (
                <button
  key={f.value}
  type="button"
  onClick={() => {
    if (f.value) {
      editor.chain().focus().setFontFamily(f.value).run();
    } else {
      editor.chain().focus().unsetFontFamily().run();
    }
    setShowFontMenu(false);
  }}
  className="w-full text-left px-3 py-1.5 text-sm hover:bg-slate-50 transition-colors"
  style={{ fontFamily: f.value || "inherit" }}
>
  {f.label}
</button>
              ))}
            </div>
          )}
        </div>

        <Sep />

        {/* Headings */}
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1"><Heading1 size={15} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2"><Heading2 size={15} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3"><Heading3 size={15} /></Btn>
        <Btn onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive("paragraph")} title="Paragraph"><Hash size={14} /></Btn>

        <Sep />

        {/* Lists */}
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List"><List size={15} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered List"><ListOrdered size={15} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive("taskList")} title="Task List"><ListTodo size={15} /></Btn>

        <Sep />

        {/* Alignment */}
        <Btn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left"><AlignLeft size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align Center"><AlignCenter size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align Right"><AlignRight size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justify"><AlignJustify size={14} /></Btn>

        <Sep />

        {/* Insert */}
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote"><Quote size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block"><Code2 size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule"><Minus size={14} /></Btn>

        {/* Link */}
        <div className="relative">
          <Btn
            onClick={() => { setShowLinkInput(!showLinkInput); setShowColorPicker(false); setShowHighlightPicker(false); }}
            active={editor.isActive("link")}
            title="Insert Link"
          >
            <LinkIcon size={14} />
          </Btn>
          {showLinkInput && (
            <div className="absolute top-10 left-0 z-50 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 w-72">
              <p className="text-[10px] font-semibold text-slate-400 uppercase mb-2">Insert Link</p>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && setLink()}
                  placeholder="https://example.com"
                  className="flex-1 text-sm px-2 py-1.5 rounded-lg border border-slate-200 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
                <button type="button" onClick={setLink}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                  Set
                </button>
              </div>
              {editor.isActive("link") && (
                <button type="button" onClick={() => { editor.chain().focus().unsetLink().run(); setShowLinkInput(false); }}
                  className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                  <Trash2 size={11} /> Remove link
                </button>
              )}
            </div>
          )}
        </div>

        <Sep />

        {/* Table */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setTableMenu({ ...tableMenu, open: !tableMenu.open })}
            title="Insert Table"
            className={`flex items-center gap-0.5 px-2 h-8 rounded-md transition-colors text-sm
              ${editor.isActive("table") ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            <TableIcon size={14} />
            <ChevronDown size={11} />
          </button>
          {tableMenu.open && !editor.isActive("table") && (
            <div className="absolute top-10 left-0 z-50 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 w-56">
              <p className="text-[10px] font-semibold text-slate-400 uppercase mb-3">Insert Table</p>
              <div className="flex gap-3 mb-3">
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500">Rows</span>
                  <input type="number" min={1} max={10} value={tableMenu.rows}
                    onChange={(e) => setTableMenu({ ...tableMenu, rows: +e.target.value })}
                    className="w-16 text-sm px-2 py-1 rounded border border-slate-200 outline-none focus:border-indigo-400" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500">Cols</span>
                  <input type="number" min={1} max={10} value={tableMenu.cols}
                    onChange={(e) => setTableMenu({ ...tableMenu, cols: +e.target.value })}
                    className="w-16 text-sm px-2 py-1 rounded border border-slate-200 outline-none focus:border-indigo-400" />
                </label>
              </div>
              <button type="button" onClick={() => insertTable(tableMenu.rows, tableMenu.cols)}
                className="w-full py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                Insert {tableMenu.rows}×{tableMenu.cols} Table
              </button>
            </div>
          )}
          {/* Table operations when inside a table */}
          {editor.isActive("table") && tableMenu.open && (
            <div className="absolute top-10 left-0 z-50 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 w-52">
              <p className="text-[10px] font-semibold text-slate-400 uppercase mb-2">Table Operations</p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: "Add Row After", icon: <RowsIcon size={12} />, fn: () => editor.chain().focus().addRowAfter().run() },
                  { label: "Add Row Before", icon: <RowsIcon size={12} />, fn: () => editor.chain().focus().addRowBefore().run() },
                  { label: "Add Col After", icon: <Columns size={12} />, fn: () => editor.chain().focus().addColumnAfter().run() },
                  { label: "Add Col Before", icon: <Columns size={12} />, fn: () => editor.chain().focus().addColumnBefore().run() },
                  { label: "Delete Row", icon: <Trash2 size={12} />, fn: () => editor.chain().focus().deleteRow().run() },
                  { label: "Delete Col", icon: <Trash2 size={12} />, fn: () => editor.chain().focus().deleteColumn().run() },
                  { label: "Merge Cells", icon: <LayoutGrid size={12} />, fn: () => editor.chain().focus().mergeCells().run() },
                  { label: "Split Cell", icon: <LayoutGrid size={12} />, fn: () => editor.chain().focus().splitCell().run() },
                  { label: "Toggle Header", icon: <Hash size={12} />, fn: () => editor.chain().focus().toggleHeaderRow().run() },
                  { label: "Delete Table", icon: <Trash2 size={12} />, fn: () => { editor.chain().focus().deleteTable().run(); setTableMenu({ ...tableMenu, open: false }); } },
                ].map(({ label, icon, fn }) => (
                  <button key={label} type="button" onClick={() => { fn(); }}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left">
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Sep />

        {/* Undo / Redo */}
        <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (⌘Z)"><Undo size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (⌘⇧Z)"><Redo size={14} /></Btn>

        {/* Clear formatting */}
        <Btn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear Formatting"><Eraser size={14} /></Btn>
      </div>

      {/* ── BUBBLE MENU (appears on selection) ── */}
     
      <BubbleMenu
  editor={editor}
  className="flex items-center gap-0.5 bg-slate-900 text-white rounded-xl shadow-2xl p-1.5 border border-slate-700"
>
        {[
          { icon: <Bold size={13} />, fn: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold"), title: "Bold" },
          { icon: <Italic size={13} />, fn: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic"), title: "Italic" },
          { icon: <UnderlineIcon size={13} />, fn: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive("underline"), title: "Underline" },
          { icon: <Strikethrough size={13} />, fn: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive("strike"), title: "Strike" },
          { icon: <Code size={13} />, fn: () => editor.chain().focus().toggleCode().run(), active: editor.isActive("code"), title: "Code" },
          { icon: <LinkIcon size={13} />, fn: () => setShowLinkInput(true), active: editor.isActive("link"), title: "Link" },
          { icon: <Highlighter size={13} />, fn: () => editor.chain().focus().toggleHighlight({ color: "#FEF08A" }).run(), active: editor.isActive("highlight"), title: "Highlight" },
        ].map(({ icon, fn, active, title }, i) => (
          <button key={i} type="button" onClick={fn} title={title}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors
              ${active ? "bg-indigo-500 text-white" : "hover:bg-slate-700 text-slate-300"}`}>
            {icon}
          </button>
        ))}
        <div className="w-px h-5 bg-slate-600 mx-0.5" />
        <button type="button" title="Copy" onClick={() => document.execCommand("copy")}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-700 text-slate-300">
          <Copy size={13} />
        </button>
        <button type="button" title="Cut" onClick={() => document.execCommand("cut")}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-700 text-slate-300">
          <Scissors size={13} />
        </button>
      </BubbleMenu>

      {/* ── EDITOR CONTENT ── */}
      <div
        className="flex-1 p-6 min-h-[380px] overflow-y-auto bg-white"
        onClick={() => { setShowColorPicker(false); setShowHighlightPicker(false); setShowFontMenu(false); setTableMenu({ ...tableMenu, open: false }); }}
      >
        <style>{`
          .ProseMirror {
            outline: none;
            min-height: 340px;
            font-size: 15px;
            line-height: 1.75;
            color: #1e293b;
          }
          .ProseMirror p.is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            color: #94a3b8;
            pointer-events: none;
            float: left;
            height: 0;
          }
          .ProseMirror h1 { font-size: 2rem; font-weight: 800; margin: 1.2em 0 0.4em; line-height: 1.2; color: #0f172a; }
          .ProseMirror h2 { font-size: 1.5rem; font-weight: 700; margin: 1em 0 0.4em; line-height: 1.3; color: #1e293b; }
          .ProseMirror h3 { font-size: 1.2rem; font-weight: 600; margin: 0.8em 0 0.3em; line-height: 1.4; color: #334155; }
          .ProseMirror blockquote {
            border-left: 4px solid #6366f1;
            margin: 1.2em 0;
            padding: 0.5em 1.2em;
            background: #f5f3ff;
            border-radius: 0 8px 8px 0;
            color: #4338ca;
            font-style: italic;
          }
          .ProseMirror pre {
            background: #1e293b;
            color: #e2e8f0;
            padding: 1em 1.4em;
            border-radius: 12px;
            font-family: ui-monospace, monospace;
            font-size: 13px;
            overflow-x: auto;
            margin: 1em 0;
          }
          .ProseMirror code {
            background: #f1f5f9;
            color: #6366f1;
            padding: 0.15em 0.4em;
            border-radius: 5px;
            font-size: 0.88em;
            font-family: ui-monospace, monospace;
          }
          .ProseMirror pre code { background: transparent; color: inherit; padding: 0; }
          .ProseMirror mark { border-radius: 3px; padding: 0.1em 0.15em; }
          .ProseMirror hr { border: none; border-top: 2px solid #e2e8f0; margin: 1.5em 0; }
          .ProseMirror ul, .ProseMirror ol { padding-left: 1.8em; margin: 0.5em 0; }
          .ProseMirror li { margin: 0.2em 0; }
          .ProseMirror ul[data-type="taskList"] { list-style: none; padding-left: 0.5em; }
          .ProseMirror ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 0.5em; }
          .ProseMirror ul[data-type="taskList"] li > label { margin-top: 3px; }
          .ProseMirror ul[data-type="taskList"] input[type="checkbox"] {
            width: 16px; height: 16px; accent-color: #6366f1; cursor: pointer;
          }
          .ProseMirror a { color: #6366f1; text-decoration: underline; text-underline-offset: 3px; }
          .ProseMirror a:hover { color: #4f46e5; }
          /* Tables */
          .ProseMirror table {
            border-collapse: collapse;
            width: 100%;
            margin: 1.2em 0;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
          }
          .ProseMirror td, .ProseMirror th {
            border: 1px solid #e2e8f0;
            padding: 8px 14px;
            min-width: 100px;
            vertical-align: top;
            position: relative;
          }
          .ProseMirror th {
            background: #f8fafc;
            font-weight: 600;
            font-size: 13px;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }
          .ProseMirror tr:hover td { background: #fafafa; }
          .ProseMirror .selectedCell::after {
            background: rgba(99, 102, 241, 0.15);
            content: "";
            left: 0; right: 0; top: 0; bottom: 0;
            pointer-events: none;
            position: absolute;
          }
          .ProseMirror .column-resize-handle {
            background-color: #6366f1;
            bottom: 0; right: -2px;
            pointer-events: none;
            position: absolute;
            top: 0;
            width: 4px;
          }
          .ProseMirror p { margin: 0.4em 0; }
          sub { font-size: 0.75em; vertical-align: sub; }
          sup { font-size: 0.75em; vertical-align: super; }
        `}</style>
        <EditorContent editor={editor} />
      </div>

      {/* ── STATUS BAR ── */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 select-none">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Ready
          </span>
          {editor.isActive("table") && (
            <span className="flex items-center gap-1 text-indigo-500 font-medium">
              <TableIcon size={11} /> Inside table — use toolbar for operations
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span>{wordCount} words · {charCount} characters</span>
        </div>
      </div>
    </div>
  );
}
