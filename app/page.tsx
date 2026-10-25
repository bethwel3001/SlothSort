"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ArrowRight,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  File as FileGeneric,
  Folder,
  Sparkles,
  RefreshCw,
  AlertCircle,
  HardDrive,
  Check,
  CheckCircle2,
  PlusCircle,
} from "lucide-react";

interface LocalFile {
  id: string;
  name: string;
  extension: string;
  type: "doc" | "image" | "sheet" | "other";
  size: number;
  formattedSize: string;
  updatedAt: string;
}

interface SortedItem {
  id: string;
  name: string;
  category: string;
  folder: string;
  time: string;
  type: "doc" | "image" | "sheet" | "other";
}

export default function SlothSortDashboard() {
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isSorting, setIsSorting] = useState<boolean>(false);
  const [activity, setActivity] = useState<SortedItem[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    setError(null);

    try {
      const res = await fetch("/api/files", { cache: "no-store" });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to load files");
      setFiles(data.files || []);
    } catch (err) {
      console.error("Failed to fetch local files:", err);
      setError(err instanceof Error ? err.message : "Error reading files");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleSort = async () => {
    if (files.length === 0 || isSorting) return;

    setIsSorting(true);
    setError(null);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/sort", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error(`Sorting API returned status ${res.status}`);
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to sort files");
      }

      if (data.sorted && Array.isArray(data.sorted)) {
        setActivity((prev) => [...data.sorted, ...prev]);
        setStatusMessage(`Successfully organized ${data.count} file${data.count === 1 ? "" : "s"}`);
      }

      await fetchFiles();
    } catch (err) {
      console.error("Error running sort:", err);
      setError(err instanceof Error ? err.message : "Failed to run sort");
    } finally {
      setIsSorting(false);
    }
  };

  const handleReseed = async () => {
    try {
      setRefreshing(true);
      await fetch("/api/files", { cache: "no-store" });
      await fetchFiles();
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const getFileIcon = (type: LocalFile["type"]) => {
    switch (type) {
      case "sheet":
        return <FileSpreadsheet className="w-4 h-4 text-neutral-500 stroke-[1.75]" />;
      case "image":
        return <ImageIcon className="w-4 h-4 text-neutral-500 stroke-[1.75]" />;
      case "doc":
        return <FileText className="w-4 h-4 text-neutral-500 stroke-[1.75]" />;
      default:
        return <FileGeneric className="w-4 h-4 text-neutral-500 stroke-[1.75]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 selection:bg-neutral-900 selection:text-white flex flex-col justify-between py-10 px-4 sm:px-6 md:px-8 font-sans">
      <div className="w-full max-w-xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl select-none" role="img" aria-label="Sloth">
              🦥
            </span>
            <span className="text-xl font-bold tracking-tight text-black">
              SlothSort
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchFiles(true)}
              title="Refresh files"
              className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-200/60 font-mono">
              <HardDrive className="w-3 h-3 text-neutral-400" />
              ./target_folder
            </span>
          </div>
        </header>

        {/* Hero Card */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-8 sm:p-10 transition-all">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Queue Status
              </p>
              <h2 className="mt-1 text-sm font-medium text-neutral-500">
                Files Awaiting Sort
              </h2>
              <div className="mt-3 flex items-baseline gap-3">
                {loading ? (
                  <span className="inline-block w-20 h-14 bg-neutral-100 rounded-xl animate-pulse" />
                ) : (
                  <span className="text-6xl sm:text-7xl font-bold tracking-tight text-neutral-950 font-mono">
                    {files.length}
                  </span>
                )}
                {!loading && files.length > 0 && (
                  <span className="text-xs font-medium text-neutral-400">
                    in ./target_folder
                  </span>
                )}
                {!loading && files.length === 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-neutral-700" />
                    All sorted
                  </span>
                )}
              </div>
            </div>

            {/* Error or status notifications */}
            {error && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 text-red-600 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {statusMessage && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-100 text-neutral-800 text-xs">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Main Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSort}
                disabled={files.length === 0 || isSorting}
                className={`w-full py-4 px-6 rounded-2xl font-medium text-base transition-all duration-150 flex items-center justify-center gap-2.5 ${
                  files.length === 0 || isSorting
                    ? "bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200/50"
                    : "bg-black text-white hover:bg-neutral-800 active:scale-[0.99] cursor-pointer shadow-sm"
                }`}
              >
                {isSorting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sorting with Mastra & Gemma...</span>
                  </>
                ) : files.length === 0 ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Everything Organized</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-white" />
                    <span>Do The Work For Me</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Current Files Awaiting Sort List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Awaiting Sort ({files.length})
              </h3>
              <span className="text-xs text-neutral-400 font-mono">
                root target_folder
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200/80 p-3 sm:p-4">
              <ul className="divide-y-0 space-y-1">
                {files.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-neutral-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                        {getFileIcon(file.type)}
                      </div>
                      <span className="text-sm font-medium text-neutral-900 truncate tracking-tight">
                        {file.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-neutral-400 font-mono">
                        {file.formattedSize}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Recent Activity Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Recent Activity
            </h3>
            <span className="text-xs text-neutral-400 font-medium">
              {activity.length} sorted
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200/80 p-3 sm:p-4">
            {activity.length === 0 ? (
              <div className="py-6 text-center text-xs text-neutral-400">
                No files sorted yet. Click &ldquo;Do The Work For Me&rdquo; to categorize your queue.
              </div>
            ) : (
              <ul className="divide-y-0 space-y-1">
                {activity.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-neutral-50 transition-colors group"
                  >
                    {/* File name & Icon */}
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                        {getFileIcon(item.type)}
                      </div>
                      <span className="text-sm font-medium text-neutral-900 truncate tracking-tight">
                        {item.name}
                      </span>
                    </div>

                    {/* Arrow & Destination Folder */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                        <div className="flex items-center gap-1 bg-neutral-100/90 text-neutral-700 px-2 py-0.5 rounded-md text-xs font-mono font-medium">
                          <Folder className="w-3 h-3 text-neutral-400" />
                          <span>{item.folder}</span>
                        </div>
                      </div>
                      <span className="text-xs text-neutral-400 hidden sm:inline-block w-14 text-right">
                        {item.time}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Footer minimal signature */}
      <footer className="w-full max-w-xl mx-auto pt-10 text-center">
        <p className="text-xs text-neutral-400">
          SlothSort &bull; Relax while your files organize themselves
        </p>
      </footer>
    </div>
  );
}
