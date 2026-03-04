import { useState, useRef, DragEvent } from "react";
import { addMessage } from "@/lib/messages";
import { Upload, FileText, X } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["Suggestion", "Concern", "Feedback", "Confession", "Appreciation"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const SubmitCard = () => {
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<{ name: string; type: string; base64: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (f.size > MAX_FILE_SIZE) {
      toast.error("File too large! Maximum 5MB allowed.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      setFile({ name: f.name, type: f.type, base64 });
    };
    reader.readAsDataURL(f);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const submit = () => {
    if (!category) { toast.error("Please choose a message type."); return; }
    if (!message.trim()) { toast.error("Please enter a message."); return; }
    addMessage({
      category,
      message: message.trim(),
      ...(file ? { file_base64: file.base64, file_type: file.type, file_name: file.name } : {}),
    });
    toast.success("Message submitted anonymously! 🎉");
    setCategory("");
    setMessage("");
    setFile(null);
  };

  return (
    <div className="mx-auto w-full max-w-lg rounded-xl bg-card p-6 shadow-xl card-green-border md:p-8">
      <h2 className="mb-1 text-center text-xl font-bold text-primary">📝 Submit a Message</h2>
      <p className="mb-5 text-center text-sm text-muted-foreground">
        Your identity is completely hidden. Help us improve our school better by sharing your honest thoughts, suggestions, and concerns.
      </p>

      <select
        value={category}
        onChange={e => setCategory(e.target.value)}
        className="mb-4 w-full rounded-lg border-2 border-primary/30 bg-card px-4 py-2.5 text-sm font-semibold text-foreground outline-none transition focus:border-primary"
      >
        <option value="">Choose what type of anonymous message</option>
        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Type your message here... 😊"
        rows={5}
        className="mb-4 w-full resize-none rounded-lg border-2 border-primary/30 bg-card px-4 py-3 text-sm outline-none transition focus:border-primary"
      />

      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
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
          onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
        />
      </div>

      {file && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/30 bg-accent/50 p-2 text-sm">
          {file.type.startsWith("image/") ? (
            <img src={`data:${file.type};base64,${file.base64}`} alt="preview" className="h-12 w-12 rounded object-cover" />
          ) : (
            <FileText className="h-8 w-8 text-primary" />
          )}
          <span className="flex-1 truncate font-medium">{file.name}</span>
          <button onClick={(e) => { e.stopPropagation(); setFile(null); }}>
            <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      )}

      <button
        onClick={submit}
        className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground shadow transition hover:opacity-90 active:scale-[0.98]"
      >
        🔒 Submit Anonymously
      </button>
    </div>
  );
};

export default SubmitCard;
