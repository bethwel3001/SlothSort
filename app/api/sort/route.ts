import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import * as Sentry from "@sentry/nextjs";
import { categorizeFilename } from "@/lib/agent";

export const dynamic = "force-dynamic";

const TARGET_DIR = path.join(process.cwd(), "target_folder");

function getFileType(filename: string): "doc" | "image" | "sheet" | "other" {
  const ext = path.extname(filename).toLowerCase();
  if ([".pdf", ".txt", ".doc", ".docx", ".md"].includes(ext)) {
    return "doc";
  }
  if ([".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp", ".fig"].includes(ext)) {
    return "image";
  }
  if ([".csv", ".xlsx", ".xls"].includes(ext)) {
    return "sheet";
  }
  return "other";
}

export async function POST() {
  try {
    if (!fs.existsSync(TARGET_DIR)) {
      fs.mkdirSync(TARGET_DIR, { recursive: true });
    }

    const entries = fs.readdirSync(TARGET_DIR, { withFileTypes: true });

    // Filter only top-level files, excluding directories and hidden files
    const filesToSort = entries.filter(
      (dirent) => dirent.isFile() && !dirent.name.startsWith(".")
    );

    if (filesToSort.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No files awaiting sort",
        count: 0,
        sorted: [],
      });
    }

    const sortedResults = [];

    for (const dirent of filesToSort) {
      const filename = dirent.name;
      const sourcePath = path.join(TARGET_DIR, filename);

      // Custom Sentry span to trace local LLM inference duration with Mastra & Gemma
      const category = await Sentry.startSpan(
        {
          name: "gemma-local-inference",
          op: "ai.inference",
          attributes: {
            model: "gemma:2b",
            framework: "mastra",
            filename,
          },
        },
        async (span) => {
          span?.setAttribute("model", "gemma:2b");
          span?.setAttribute("framework", "mastra");
          span?.setAttribute("filename", filename);

          Sentry.setTag("model", "gemma:2b");
          Sentry.setTag("framework", "mastra");

          const result = await categorizeFilename(filename);
          span?.setAttribute("category", result);
          Sentry.setTag("category", result);
          return result;
        }
      );

      // Create category directory if it doesn't exist
      const categoryDir = path.join(TARGET_DIR, category);
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
      }

      // Move file into category folder
      const destPath = path.join(categoryDir, filename);

      try {
        fs.renameSync(sourcePath, destPath);
      } catch (moveErr) {
        // Fallback for cross-device or permission edge cases
        fs.copyFileSync(sourcePath, destPath);
        fs.unlinkSync(sourcePath);
      }

      sortedResults.push({
        id: `${filename}-${Date.now()}`,
        name: filename,
        category,
        folder: `/${category}`,
        time: "Just now",
        type: getFileType(filename),
      });
    }

    return NextResponse.json({
      success: true,
      count: sortedResults.length,
      sorted: sortedResults,
    });
  } catch (error) {
    console.error("Error during sorting in /api/sort:", error);
    Sentry.captureException(error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to sort files",
      },
      { status: 500 }
    );
  }
}
