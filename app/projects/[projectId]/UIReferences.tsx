"use client";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  TextField,
  Select,
  MenuItem,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

type UIReference = {
  id: string;
  title: string;
  imageUrl: string;
  source: "FIGMA" | "SCREENSHOT" | "OTHER";
  description?: string | null;
};

export default function UIReferences({
  scopeId,
  scopeType = "project",
  canEdit,
}: {
  scopeId: string;
  scopeType?: "project" | "module";
  canEdit: boolean;
}) {
  const [refs, setRefs] = useState<UIReference[]>([]);
  const [form, setForm] = useState({
    title: "",
    imageUrl: "",
    source: "SCREENSHOT",
    description: "",
  });
  const [showForm, setShowForm] = useState(false);

  // modal state for viewing a reference
  const [selectedRef, setSelectedRef] = useState<UIReference | null>(null);
  const [openRefModal, setOpenRefModal] = useState(false);

  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  function openModal(ref: UIReference) {
    setSelectedRef(ref);
    setOpenRefModal(true);
  }
  function closeModal() {
    setSelectedRef(null);
    setOpenRefModal(false);
  }

  async function handleDeleteReference() {
    if (!selectedRef) return;

    setDeleting(selectedRef.id);
    setDeleteModalOpen(false);

    try {
      const res = await fetch(
        `/api/${scopeType === "project" ? "projects" : "modules"}/${scopeId}/ui-references/${selectedRef.id}`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        alert("Failed to delete reference");
        return;
      }

      // Remove from local state instead of reload
      setRefs((prev) => prev.filter((r) => r.id !== selectedRef.id));

      closeModal();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete reference");
    } finally {
      setDeleting(null);
    }
  }

  useEffect(() => {
    fetch(`/api/${scopeType === "project" ? "projects" : "modules"}/${scopeId}/ui-references`)
      .then((r) => r.json())
      .then((json) => setRefs(json.data || []));
  }, [scopeId, scopeType]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () =>
      setForm((prev) => ({ ...prev, imageUrl: reader.result as string }));
    reader.readAsDataURL(file);
  }

  async function addReference() {
    const res = await fetch(`/api/${scopeType === "project" ? "projects" : "modules"}/${scopeId}/ui-references`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const json = await res.json();
    setRefs((prev) => [json.data, ...prev]);
    setForm({
      title: "",
      imageUrl: "",
      source: "SCREENSHOT",
      description: "",
    });
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600}>
          🎨 UI References
        </Typography>

        {canEdit && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowForm(!showForm)}
            sx={{ mb: 2 }}
          >
            {showForm ? "Close Form" : "Show Reference"}
          </Button>
        )}

        {showForm && canEdit && (
          <Stack spacing={2} mt={2}>
            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <Select
              value={form.source}
              onChange={(e) =>
                setForm({
                  ...form,
                  source: e.target.value as UIReference["source"],
                  // clear imageUrl when changing type to avoid stale data
                  imageUrl: "",
                })
              }
              size="small"
            >
              <MenuItem value="SCREENSHOT">Screenshot</MenuItem>
              <MenuItem value="FIGMA">Figma</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </Select>

            {form.source === "FIGMA" ? (
              <TextField
                label="Figma URL"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://www.figma.com/..."
                fullWidth
              />
            ) : (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />

                {form.imageUrl && (
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: 300,
                      marginTop: 8,
                    }}
                  >
                    <Image
                      src={form.imageUrl}
                      alt="preview"
                      fill
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                )}
              </>
            )}

            <TextField
              label="Description"
              multiline
              minRows={2}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <Button variant="contained" onClick={addReference}>
              Add Reference
            </Button>
          </Stack>
        )}

        {refs.length === 0 && (
          <Typography color="text.secondary" mt={2}>
            {canEdit
              ? "No UI references yet. Add screenshots or links to guide testing."
              : "No UI references yet. Ask an owner to add screenshots or design links."}
          </Typography>
        )}

        <Grid container spacing={2} mt={2}>
          {refs.map((ref) => (
            <Grid item xs={12} md={6} key={ref.id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography fontWeight={600}>{ref.title}</Typography>

                  <Chip label={ref.source} size="small" sx={{ mt: 1 }} />

                  <Typography variant="body2" color="text.secondary" mt={1}>
                    {ref.description}
                  </Typography>

                  <Button onClick={() => openModal(ref)} sx={{ mt: 1 }}>
                    View Reference
                  </Button>
                  <Dialog
                    open={openRefModal}
                    onClose={closeModal}
                    fullWidth
                    maxWidth="md"
                  >
                    <DialogTitle>
                      {selectedRef?.title}
                      <IconButton
                        aria-label="close"
                        onClick={closeModal}
                        sx={{ position: "absolute", right: 8, top: 8 }}
                        size="small"
                      >
                        <CloseIcon />
                      </IconButton>
                    </DialogTitle>
                    <DialogContent dividers>
                      <Chip
                        label={selectedRef?.source}
                        size="small"
                        sx={{ mb: 2 }}
                      />
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {selectedRef?.description}
                      </Typography>

                      {selectedRef?.source === "FIGMA" ? (
                        <Button href={selectedRef.imageUrl} target="_blank">
                          Open in Figma
                        </Button>
                      ) : (
                        selectedRef?.imageUrl && (
                          <div
                            style={{
                              position: "relative",
                              width: "100%",
                              height: 400,
                            }}
                          >
                            <Image
                              src={selectedRef.imageUrl}
                              alt={selectedRef.title}
                              fill
                              style={{ objectFit: "contain" }}
                            />
                          </div>
                        )
                      )}
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={closeModal}>Close</Button>

                      {canEdit && (
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => setDeleteModalOpen(true)}
                          disabled={deleting === selectedRef?.id}
                        >
                          {deleting === selectedRef?.id
                            ? "Deleting..."
                            : "Delete Reference"}
                        </Button>
                      )}
                    </DialogActions>
                  </Dialog>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        {selectedRef && (
          <DeleteConfirmationModal
            open={deleteModalOpen}
            title="Confirm Delete"
            message={`Are you sure you want to delete the reference "${selectedRef.title}"? This action cannot be undone.`}
            onConfirm={handleDeleteReference}
            onCancel={() => setDeleteModalOpen(false)}
          />
        )}
      </CardContent>
    </Card>
  );
}
