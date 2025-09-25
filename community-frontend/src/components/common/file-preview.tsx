import React, { useMemo, useRef } from "react";
import type { CommunitySessionType } from "@/api/community-sessions";

import {
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileAlt,
  FaFileAudio,
} from "react-icons/fa";
import { motion } from "framer-motion";

interface FilePreviewProps {
  src?: string; // remote or local URL
  filename?: string; // helpful for extension detection when using src
  className?: string;
  // Optional explicit content type to control rendering (preferred over extension inference)
  type?: CommunitySessionType;
  // When true and type is video, render a normal video player with controls and audio
  controls?: boolean;
  // For hover autoplay behavior on cards (ignored if controls is true)
  hoverAutoplay?: boolean;
}

const FilePreview: React.FC<FilePreviewProps> = ({ src, filename, className, type, controls = false, hoverAutoplay = true }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
 
  const ext = useMemo(() => {
    const name = filename || src || "";
    const fromQuery = name.split("?")[0];
    const parts = fromQuery.split(".");
    return parts.length > 1 ? parts.pop()!.toLowerCase() : undefined;
  }, [filename, src]);

  // Prefer explicit type prop; fallback to extension-based inference
  const resolvedType: CommunitySessionType | undefined = useMemo(() => {
    if (type) return type;
    if (!ext) return undefined;
    if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return "image";
    if (["mp4", "webm", "ogg"].includes(ext)) return "video";
    if (["mp3", "wav", "ogg"].includes(ext)) return "audio";
    return "document";
  }, [type, ext]);

  // 🖼️ Image preview
  if (resolvedType === "image") {
    return (
      <img
        src={src || "/images/image_icon.png"}
        alt={ filename || "image"}
        className={`w-full h-48 object-cover rounded border border-gray-200 dark:border-gray-700 ${className}`}
      />
    );
  }

  // 🎥 Video preview
  if (resolvedType === "video") {
    // Full player with controls (detail page)
    if (controls) {
      if (!src) {
        // fallback visual if no video src
        return (
          <img src={"/images/video_icon.png"} alt={filename || 'video'} className={`w-full h-48 object-contain rounded border border-gray-200 dark:border-gray-700 ${className}`} />
        );
      }
      return (
        <video
          src={src}
          controls
          className={`w-full h-48 rounded border border-gray-200 dark:border-gray-700 object-contain bg-black ${className}`}
        />
      );
    }

    // Card preview with hover autoplay (muted)
    return (
      <motion.video
        ref={videoRef}
        src={src || "/images/video_icon.png"}
        controls={false}
        muted
        onMouseEnter={() => {
          if (!hoverAutoplay) return;
          const v = videoRef.current;
          if (v) {
            v.muted = true;
            v.play().catch(() => {});
          }
        }}
        onMouseLeave={() => {
          const v = videoRef.current;
          if (v) {
            v.pause();
            v.currentTime = 0;
          }
        }}
        className={`w-full h-48 rounded border border-gray-200 dark:border-gray-700 object-cover ${className}`}
      />
    );
  }

  // 🎵 Audio icon only
  if (resolvedType === "audio") {
    return (
      <div className={`flex flex-col items-center justify-center w-full h-48 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 ${className}`}>
        <FaFileAudio size={50} className="text-blue-500 mb-2" />
        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{filename || 'audio'}</p>
      </div>
    );
  }

  // 📄 PDF
  if (resolvedType === "document" && ext === "pdf") {
    return (
      <div className={`flex flex-col items-center justify-center w-full h-48 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 ${className}`}>
        <FaFilePdf size={50} className="text-red-600 mb-2" />
        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{filename || 'document.pdf'}</p>
      </div>
    );
  }

  // 📝 Word
  if (resolvedType === "document" && ext && ["doc", "docx"].includes(ext)) {
    return (
      <div className={`flex flex-col items-center justify-center w-full h-48 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 ${className}`}>
        <FaFileWord size={50} className="text-blue-600 mb-2" />
        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{ filename || 'document'}</p>
      </div>
    );
  }

  // 📊 Excel
  if (resolvedType === "document" && ext && ["xls", "xlsx"].includes(ext)) {
    return (
      <div className={`flex flex-col items-center justify-center w-full h-48 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 ${className}`}>
        <FaFileExcel size={50} className="text-green-600 mb-2" />
        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{ filename || 'spreadsheet'}</p>
      </div>
    );
  }

  // 📦 Fallback
  return (
    <div className={`flex flex-col items-center justify-center w-full h-48 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 ${className}`}>
      <FaFileAlt size={50} className="text-gray-500 mb-2" />
      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{ filename || 'file'}</p>
    </div>
  );
};

export default FilePreview;