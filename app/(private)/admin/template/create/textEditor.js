"use client";
import { cleanTemplateTags } from "@/app/utils/helper";
import { Editor } from "@tinymce/tinymce-react";
import React, { useRef, useState } from "react";
// import "react-quill-new/dist/quill.snow.css";

export const TextEditor = ({
  templateContent,
  handleEditorChange,
  variables = [],
}) => {
  const editorRef = useRef(null);

  const [filteredVars, setFilteredVars] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Keep the exact range when suggestions opened (cloneRange so it lives in editor document)
  const savedRangeRef = useRef(null);

  // Helper to compute match and open suggestions
  const handleKeyUp = (e) => {
    const editor = editorRef.current;
    if (!editor) return;

    const rng = editor.selection.getRng();
    if (!rng) {
      hideSuggestions();
      return;
    }

    // startContainer may be a text node
    const node = rng.startContainer;
    const offset = rng.startOffset;

    // guard
    if (!node || typeof node.textContent !== "string") {
      hideSuggestions();
      return;
    }

    const textBefore = node.textContent.slice(0, offset);
    const match = /{{(\w*)$/.exec(textBefore);

    if (!match) {
      hideSuggestions();
      return;
    }

    const partial = match[1];

    // filter variables
    const filtered = variables.filter((v) =>
      (v.label || "").toLowerCase().includes(partial.toLowerCase())
    );

    if (!filtered.length) {
      hideSuggestions();
      return;
    }

    // Save a clone of the current range so we can precisely replace later.
    savedRangeRef.current = rng.cloneRange();

    // compute caret rect and position suggestion box (use fixed positioning)
    const caretRect = rng.getBoundingClientRect();
    // Using fixed positions tied to viewport coordinates:
    setCursorPosition({ top: caretRect.bottom, left: caretRect.left });

    setFilteredVars(filtered);
    setSelectedIndex(0);
    setShowSuggestions(true);
  };

  const hideSuggestions = () => {
    setShowSuggestions(false);
    setFilteredVars([]);
    setSelectedIndex(0);
    savedRangeRef.current = null;
  };

  // Insert the variable: replace the `{{partial` occurrence with full `{{label}}`
  const insertVariable = (variable) => {
    const editor = editorRef.current;
    if (!editor) return;
    const rng = savedRangeRef.current || editor.selection.getRng();
    if (!rng) return;

    // We must create/modify ranges in the editor's document (its iframe), so use rng.startContainer.ownerDocument
    const doc = rng.startContainer.ownerDocument;
    const node = rng.startContainer;
    const offset = rng.startOffset;
    const textBefore = node.textContent.slice(0, offset);
    const startIdx = textBefore.lastIndexOf("{{");
    if (startIdx === -1) {
      // fallback: just insert at cursor
      editor.selection.setRng(rng);
      editor.insertContent(`{{${variable.label}}}`);
      editor.focus();
      hideSuggestions();
      return;
    }

    // Build a new range that spans from the `{{` up to the cursor
    const replaceRange = doc.createRange();
    replaceRange.setStart(node, startIdx);
    replaceRange.setEnd(node, offset);

    // Perform the replace inside an undo transaction
    editor.undoManager.transact(() => {
      editor.selection.setRng(replaceRange);
      // Insert content (safe API)
      editor.insertContent(`{{${variable.label}}}`);
    });

    editor.focus();
    hideSuggestions();
  };

  // handle arrow navigation + enter + escape
  const handleEditorKeyDown = (e) => {
    if (!showSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filteredVars.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const v = filteredVars[selectedIndex];
      if (v) insertVariable(v);
    } else if (e.key === "Escape") {
      e.preventDefault();
      hideSuggestions();
    }
  };

  // Click handler on suggestion (use mouseDown to prevent editor blur before click)
  const handleSuggestionMouseDown = (e, v) => {
    e.preventDefault(); // prevent editor from stealing focus/selection
    insertVariable(v);
  };

  const quillToInline = (html) => {
    if (!html) return html;

    let converted = html;

    // Alignments
    converted = converted.replace(
      /class="[^"]*ql-align-center[^"]*"/g,
      'style="text-align: center;"'
    );
    converted = converted.replace(
      /class="[^"]*ql-align-right[^"]*"/g,
      'style="text-align: right;"'
    );
    converted = converted.replace(
      /class="[^"]*ql-align-justify[^"]*"/g,
      'style="text-align: justify;"'
    );

    // Bold, italic etc. (optional – TinyMCE already parses <strong>, <em>, etc.)
    converted = converted.replace(
      /class="[^"]*ql-font-serif[^"]*"/g,
      'style="font-family: serif;"'
    );
    converted = converted.replace(
      /class="[^"]*ql-font-monospace[^"]*"/g,
      'style="font-family: monospace;"'
    );

    return converted;
  };

  return (
    <div className="p-4 relative">
      <Editor
        tinymceScriptSrc="/tinymce/tinymce.min.js" // your self-hosted script
        onInit={(evt, editor) => (editorRef.current = editor)}
        value={quillToInline(templateContent)}
        onEditorChange={handleEditorChange}
        init={{
          license_key: "gpl",
          suffix: ".min",
          height: 400,
          menubar: false,
          valid_elements: "*[*]",
          entity_encoding: "raw",
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            // "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "help",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks | fontsize fontfamily bold italic forecolor | " +
            "alignleft aligncenter alignright alignjustify | " +
            "bullist numlist outdent indent |",
          skin: "oxide",
          content_css: [
            "/quill.snow.css", // ✅ Load Quill CSS so old content displays correctly
            "default",
          ],
          setup: (editor) => {
            editor.on("keyup", handleKeyUp);
            editor.on("keydown", handleEditorKeyDown);
            editor.on("blur", () => {
              // small delay so clicks on suggestion (mousedown) still work
              setTimeout(() => hideSuggestions(), 150);
            });
            editor.on("BeforeSetContent", (e) => {
              if (e.content) {
                e.content = e.content.replace(
                  /<div\b[^>]*class=["'][^"']*page-break[^"']*["'][^>]*>\s*<\/div>/gi,
                  "{% pagebreak %}"
                );
                e.content = cleanTemplateTags(e.content);
              }
            });

            // 🔹 Optional: when getting content back, convert {% pagebreak %} -> <div class="page-break"></div>
            editor.on("GetContent", (e) => {
              if (e.content) {
                e.content = e.content.replace(
                  /{%\s*pagebreak\s*%}/gi,
                  '<div class="page-break"></div>'
                );
                e.content = cleanTemplateTags(e.content);
              }
            });
          },
        }}
      />

      {/* suggestion box: position: fixed using caret viewport coords so it follows the caret */}
      {showSuggestions && filteredVars.length > 0 && (
        <ul
          style={{
            position: "absolute",
            top: 500 + cursorPosition.top,
            left: 80 + cursorPosition.left,
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "0",
            listStyle: "none",
            zIndex: 1000,
            minWidth: "220px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
            fontSize: "14px",
          }}
        >
          {filteredVars.map((v, i) => (
            <li
              key={v.value ?? v.label ?? i}
              onMouseDown={(e) => handleSuggestionMouseDown(e, v)}
              style={{
                padding: "6px 10px",
                cursor: "pointer",
                background: selectedIndex === i ? "#f0f6ff" : "transparent",
              }}
            >
              {v.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
