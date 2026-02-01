"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Box, Typography } from "@mui/material";

export default function ProductSpecEditor({
  projectId,
  editable,
}: {
  projectId: string;
  editable: boolean;
}) {
  const [saving, setSaving] = useState(false);
  const [initialContent, setInitialContent] = useState<any>(null);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    editable,
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing product specifications here…",
      }),
    ],
    content: "" , // ✅ NEVER null
  });

  /* ---------------- LOAD CONTENT ---------------- */
  useEffect(() => {
    if (!editor) return;

    async function load() {
      const res = await fetch(`/api/projects/${projectId}/specs`);
      const json = await res.json();

      if (json?.data?.content && editor) {
        setInitialContent(json.data.content);
        editor.commands.setContent(json.data.content);
      }
    }

    load();
  }, [editor, projectId]);

  /* ---------------- AUTOSAVE (OWNER ONLY) ---------------- */
  useEffect(() => {
    if (!editor || !editable) return;

    const handler = () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    

      saveTimeout.current = setTimeout(async () => {
        setSaving(true);

        await fetch(`/api/projects/${projectId}/specs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: editor.getJSON(),
          }),
        });

        setSaving(false);
      }, 1200);
    };

    editor.on("update", handler);

    return () => {
      editor.off("update", handler);
    };
  }, [editor, editable, projectId]);

  if (!editor) return null;

  /* ---------------- UI ---------------- */
  return (
    <Box mt={3}>
      <Typography variant="h6" mb={1}>
        Product Specification
      </Typography>

      <Box
        sx={{
          border: "1px solid #ddd",
          borderRadius: 2,
          padding: 2,
          minHeight: 400,
          backgroundColor: editable ? "#fff" : "#fafafa",
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      {editable && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          {saving ? "Saving…" : "All changes saved"}
        </Typography>
      )}
    </Box>
  );
}