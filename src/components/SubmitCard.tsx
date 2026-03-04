import { useState, useRef, DragEvent } from "react";
import { supabase } from "@/lib/supabase"; // Make sure this file exists as previously instructed
import { Upload, FileText, X } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["Suggestion", "Concern", "Feedback", "Confession", "Appreciation"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const SubmitCard = () => {
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // for instant preview
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("File too large! Maximum 5MB allowed.");
      return;
    }
    setFile(selectedFile);
    // Create preview URL for immediate display
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    // Clean up old preview URL when component unmounts or new file selected
    return () => URL.revokeObjectURL(url);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!category) {
      toast.error("Please choose a message type.");
      return;
    }
    if (!message.trim()) {
      toast.error("Please enter a message.");
      return;
    }

    setIsSubmitting(true);

    try {
      let fileUrl: string | null = null;
      let fileType: string | null = null;

      if (file) {
        const fileExt = file.name.split('.').pop() || '';
        const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`File upload failed: ${uploadError.message}`);
        }

        // Public URL (make sure the 'attachments' bucket is public in Supabase)
        fileUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/attachments/${filePath}`;
        fileType = file.type;
      }

      const { error: insertError } = await supabase
        .from('anonymous_messages')
        .insert({
          category,
          message: message.trim(),
          file_url: fileUrl,
          file_type: fileType,
          status: 'pending',
        });

      if (insertError) {
        throw new Error(`Submission failed: ${insertError.message}`);
      }

      toast.success("Message submitted anonymously! 🎉");

      // Reset form
      setCategory("");
      setMessage("");
      setFile(null);
      setPreviewUrl(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg rounded-xl bg-card p-6 shadow-xl card-green-border md:p-8">
      <h2 className="mb-1 text-center text-xl font-bold text-primary">📝 Submit a Message</h2>
      <p className="mb-5 text-center text-sm text-muted-foreground">
        Your identity is completely hidden. Help us improve our school better by sharing your honest thoughts, suggestions, and concerns.
      </p>

      <label className="mb-1.5 block text-sm font-semibold text-foreground">
        Choose what type of anonymous message
      </label>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="mb-4 w-full rounded-lg border-2 border-primary/30 bg-card px-4 py-2.5 text-sm font-semibold text-foreground outline-none transition focus:border-primary"
      >
        <option value="">— Select —</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here... 😊"
        rows={5}
        className="mb-4 w-full resize-none rounded-lg border-2 border-primary/30 bg-card px-4 py-3 text-sm outline-none transition focus:border-primary"
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`mb-4 flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-4 text-center transition ${
          dragOver ? "border-primary bg-accent" : "border-primary/30 hover:border-primary/60"
        }`}
      >
        <Upload className="h-6 w-6 text-primary" />
        <p className="text-xs text-muted-foreground">
          Attach file (optional – image, pdf, document) · Max 5MB
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
          }}
        />
      </div>

      {file && previewUrl && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/30 bg-accent/50 p-2 text-sm">
          {file.type.startsWith("image/") ? (
            <img
              src={previewUrl}
              alt="preview"
              className="h-12 w-12 rounded object-cover"
            />
          ) : (
            <FileText className="h-8 w-8 text-primary" />
          )}
          <span className="flex-1 truncate font-medium">{file.name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFile(null);
              setPreviewUrl(null);
            }}
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`w-full rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground shadow transition hover:opacity-90 active:scale-[0.98] ${
          isSubmitting ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {isSubmitting ? "Submitting..." : "🔒 Submit Anonymously"}
      </button>
    </div>
  );
};

export default SubmitCard;