import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase"; // ← your Supabase client
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, CheckCircle, XCircle, Wrench, AlertTriangle, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { toast } from "sonner";

const categoryColor: Record<string, string> = {
  Suggestion: "bg-blue-100 text-blue-800",
  Concern: "bg-yellow-100 text-yellow-800",
  Feedback: "bg-purple-100 text-purple-800",
  Confession: "bg-pink-100 text-pink-800",
  Appreciation: "bg-green-100 text-green-800",
};

const PREVIEW_COUNT = 3;

interface AaisMessage {
  id: string; // uuid from Supabase
  category: string;
  message: string;
  file_url?: string | null;
  file_type?: string | null;
  status: string;
  created_at: string;
  processed_at?: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [pendingMessages, setPendingMessages] = useState<AaisMessage[]>([]);
  const [approvedSolved, setApprovedSolved] = useState<AaisMessage[]>([]);
  const [rejectedUnsolved, setRejectedUnsolved] = useState<AaisMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllPending, setShowAllPending] = useState(false);
  const [showAllApproved, setShowAllApproved] = useState(false);
  const [showAllRejected, setShowAllRejected] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('anonymous_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load messages");
    } else if (data) {
      const pending = data.filter(m => m.status === 'pending');
      const processed = data.filter(m => m.status !== 'pending');

      setPendingMessages(pending);
      setApprovedSolved(processed.filter(m => m.status === 'approved' || m.status === 'solved'));
      setRejectedUnsolved(processed.filter(m => m.status === 'rejected' || m.status === 'unsolved'));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (sessionStorage.getItem("isAdmin") !== "true") {
      navigate("/admin");
      return;
    }

    fetchMessages();

    // Real-time subscription for live updates
    const channel = supabase
      .channel('anonymous_messages_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'anonymous_messages' },
        () => {
          fetchMessages(); // refresh on insert/update/delete
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const handleAction = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('anonymous_messages')
      .update({
        status: newStatus,
        processed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error("Update error:", error);
      toast.error("Failed to update status");
    } else {
      toast.success(`Message marked as ${newStatus}`);
      // fetchMessages() called via real-time, but can call manually too
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('anonymous_messages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete message");
    } else {
      toast.success("Message deleted from history.");
    }
  };

  const isSolvable = (cat: string) => cat === "Suggestion" || cat === "Concern";

  const FilePreview = ({ msg }: { msg: AaisMessage }) => {
    if (!msg.file_url) return null;

    if (msg.file_type?.startsWith("image/")) {
      return (
        <img
          src={msg.file_url}
          alt="attachment"
          className="mt-3 max-h-48 rounded-lg border border-primary/20 object-contain"
        />
      );
    }

    return (
      <a
        href={msg.file_url}
        target="_blank"
        rel="noopener noreferrer"
        download
        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-primary hover:underline"
      >
        <FileText className="h-5 w-5" />
        View/Download File
        <Download className="h-4 w-4" />
      </a>
    );
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { cls: string; label: string }> = {
      approved: { cls: "bg-green-100 text-green-800", label: "✅ Approved" },
      rejected: { cls: "bg-red-100 text-red-800", label: "❌ Rejected" },
      solved: { cls: "bg-green-100 text-green-800", label: "✅ Solved" },
      unsolved: { cls: "bg-red-100 text-red-800", label: "⚠️ Unsolved" },
      pending: { cls: "bg-orange-100 text-orange-800", label: "⏳ Pending" },
    };
    const s = map[status] || { cls: "bg-gray-100 text-gray-800", label: status };
    return <span className={`rounded-full px-3 py-1 text-xs font-bold ${s.cls}`}>{s.label}</span>;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("en-US");
  };

  const renderShowMore = (
    total: number,
    isExpanded: boolean,
    toggle: () => void
  ) => {
    const remaining = total - PREVIEW_COUNT;
    if (remaining <= 0) return null;
    return (
      <button
        onClick={toggle}
        className="mx-auto mt-2 mb-4 flex items-center gap-1.5 rounded-lg border border-primary/30 bg-accent/50 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-accent"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="h-4 w-4" /> Show Less
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4" /> +{remaining} more — Show All
          </>
        )}
      </button>
    );
  };

  const HistoryCard = ({ msg }: { msg: AaisMessage }) => (
    <div className="mb-3 rounded-lg bg-card p-4 shadow-sm card-green-border">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${categoryColor[msg.category] || ""}`}>
          {msg.category}
        </span>
        <StatusBadge status={msg.status} />
        <span className="text-xs text-muted-foreground">Submitted: {formatDate(msg.created_at)}</span>
        {msg.processed_at && (
          <span className="text-xs text-muted-foreground">· Processed: {formatDate(msg.processed_at)}</span>
        )}
        <button
          onClick={() => handleDelete(msg.id)}
          className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-destructive transition hover:bg-destructive/10"
          title="Delete from history"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
      </div>
      <p className="mt-2 text-sm leading-relaxed">{msg.message}</p>
      <FilePreview msg={msg} />
    </div>
  );

  const visiblePending = showAllPending ? pendingMessages : pendingMessages.slice(0, PREVIEW_COUNT);
  const visibleApproved = showAllApproved ? approvedSolved : approvedSolved.slice(0, PREVIEW_COUNT);
  const visibleRejected = showAllRejected ? rejectedUnsolved : rejectedUnsolved.slice(0, PREVIEW_COUNT);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <p className="text-lg text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 px-4 py-8">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-extrabold text-primary md:text-3xl">📊 Dashboard</h2>
            <p className="text-sm text-muted-foreground">Manage incoming feedback and concerns</p>
          </div>

          {pendingMessages.length > 0 && (
            <div className="mb-6 flex justify-center">
              <span className="rounded-full bg-orange/20 px-4 py-1.5 text-sm font-bold text-orange">
                <AlertTriangle className="mr-1 inline h-4 w-4" />
                {pendingMessages.length} Pending
              </span>
            </div>
          )}

          <h3 className="mb-3 text-lg font-bold text-primary">📩 Submitted Anonymous Messages</h3>
          <AnimatePresence>
            {pendingMessages.length === 0 && (
              <p className="mb-6 text-center text-sm text-muted-foreground">No pending messages.</p>
            )}
            {visiblePending.map((msg) => (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -200 }}
                transition={{ duration: 0.35 }}
                className="mb-4 rounded-xl bg-card p-5 shadow-md card-green-border"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${categoryColor[msg.category] || "bg-gray-100 text-gray-800"}`}>
                    {msg.category}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDate(msg.created_at)}</span>
                </div>
                <p className="mb-2 text-sm leading-relaxed">{msg.message}</p>
                <FilePreview msg={msg} />
                <div className="mt-4 flex gap-2">
                  {isSolvable(msg.category) ? (
                    <>
                      <button
                        onClick={() => handleAction(msg.id, "solved")}
                        className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:opacity-90"
                      >
                        <Wrench className="h-3.5 w-3.5" /> Solve
                      </button>
                      <button
                        onClick={() => handleAction(msg.id, "unsolved")}
                        className="flex items-center gap-1 rounded-lg bg-destructive/80 px-4 py-2 text-xs font-bold text-destructive-foreground transition hover:opacity-90"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Unsolved
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleAction(msg.id, "approved")}
                        className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:opacity-90"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleAction(msg.id, "rejected")}
                        className="flex items-center gap-1 rounded-lg bg-destructive/80 px-4 py-2 text-xs font-bold text-destructive-foreground transition hover:opacity-90"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {renderShowMore(pendingMessages.length, showAllPending, () => setShowAllPending(!showAllPending))}

          <h3 className="mb-3 mt-8 text-lg font-bold text-primary">📜 History</h3>
          <p className="mb-4 text-sm text-muted-foreground">Recently processed items</p>

          {approvedSolved.length > 0 && (
            <>
              <h4 className="mb-2 text-sm font-bold text-green-700">✅ Approved / Solved</h4>
              <div className={showAllApproved ? "max-h-[500px] overflow-y-auto rounded-lg pr-1" : ""}>
                {visibleApproved.map((msg) => (
                  <HistoryCard key={msg.id} msg={msg} />
                ))}
              </div>
              {renderShowMore(approvedSolved.length, showAllApproved, () => setShowAllApproved(!showAllApproved))}
            </>
          )}

          {rejectedUnsolved.length > 0 && (
            <>
              <h4 className="mb-2 mt-4 text-sm font-bold text-red-700">❌ Rejected / Unsolved</h4>
              <div className={showAllRejected ? "max-h-[500px] overflow-y-auto rounded-lg pr-1" : ""}>
                {visibleRejected.map((msg) => (
                  <HistoryCard key={msg.id} msg={msg} />
                ))}
              </div>
              {renderShowMore(rejectedUnsolved.length, showAllRejected, () => setShowAllRejected(!showAllRejected))}
            </>
          )}

          {approvedSolved.length === 0 && rejectedUnsolved.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">No processed items yet.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;