"use client";

import { useEffect } from "react";

interface AutoDownloadProps {
  assetUrl: string;
}

// Tiny client island. On mount, programmatically clicks an anchor
// element pointing at the resolved asset URL so the browser kicks
// off a download dialog without taking the user away from the
// thank-you page. ~500ms delay lets the page paint first so the
// community prompts are visible before the OS dialog appears.
//
// Plain anchor click (rather than window.location.href) keeps the
// current page in the tab; users land back on the thank-you screen
// after the download dialog dismisses.
export function AutoDownload({ assetUrl }: AutoDownloadProps) {
  useEffect(() => {
    if (!assetUrl) return;
    const timer = setTimeout(() => {
      const link = document.createElement("a");
      link.href = assetUrl;
      // rel attrs for safety on the dynamic anchor; target left
      // unset so the browser handles it as a same-tab download.
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 500);
    return () => clearTimeout(timer);
  }, [assetUrl]);

  return null;
}
