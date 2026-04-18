"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Monitor, Apple, Terminal } from "lucide-react";

const VERSION = "0.1.4";

const PLATFORMS = [
  {
    id: "windows",
    label: "Windows 10/11",
    icon: Monitor,
    file: `InnerZero-Setup-${VERSION}.exe`,
    size: "239 MB",
    url: `https://github.com/zotex12/innerzero-releases/releases/latest/download/InnerZero-Setup-${VERSION}.exe`,
    reqs: "64-bit, 8 GB+ RAM",
    note: 'Windows may show a SmartScreen warning on first install. Click "More info" then "Run anyway". The installer is signed by Summers Solutions Ltd.',
    cli: `curl -L -o InnerZero-Setup.exe https://github.com/zotex12/innerzero-releases/releases/latest/download/InnerZero-Setup-${VERSION}.exe && start InnerZero-Setup.exe`,
  },
  {
    id: "macos",
    label: "macOS 12+",
    icon: Apple,
    file: `InnerZero-Setup-${VERSION}-mac.dmg`,
    size: "490 MB",
    url: `https://github.com/zotex12/innerzero-releases/releases/latest/download/InnerZero-Setup-${VERSION}-mac.dmg`,
    reqs: "Intel or Apple Silicon, 8 GB+ RAM",
    note: 'macOS may block the app. Right-click the app, select "Open", then click "Open" again. This is because the app is not yet notarised.',
    cli: `curl -L -o InnerZero.dmg https://github.com/zotex12/innerzero-releases/releases/latest/download/InnerZero-Setup-${VERSION}-mac.dmg && open InnerZero.dmg`,
  },
  {
    id: "linux",
    label: "Linux x86_64",
    icon: Terminal,
    file: `InnerZero-${VERSION}-x86_64.AppImage`,
    size: "356 MB",
    url: `https://github.com/zotex12/innerzero-releases/releases/latest/download/InnerZero-${VERSION}-x86_64.AppImage`,
    reqs: "x86_64, glibc 2.31+, 8 GB+ RAM",
    note: "Install system dependencies first: sudo apt install espeak-ng portaudio19-dev xclip",
    cli: `wget https://github.com/zotex12/innerzero-releases/releases/latest/download/InnerZero-${VERSION}-x86_64.AppImage && chmod +x InnerZero-${VERSION}-x86_64.AppImage && ./InnerZero-${VERSION}-x86_64.AppImage`,
  },
];

function detectPlatform(): string {
  if (typeof navigator === "undefined") return "windows";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("mac")) return "macos";
  if (ua.includes("linux")) return "linux";
  return "windows";
}

export function DownloadCards() {
  const [userPlatform, setUserPlatform] = useState("windows");
  const [openCli, setOpenCli] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setUserPlatform(detectPlatform());
  }, []);

  const sorted = [...PLATFORMS].sort((a, b) => {
    if (a.id === userPlatform) return -1;
    if (b.id === userPlatform) return 1;
    return 0;
  });

  function copyCmd(id: string, cmd: string) {
    navigator.clipboard.writeText(cmd).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  return (
    <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-3">
      {sorted.map((p) => {
        const isPrimary = p.id === userPlatform;
        const Icon = p.icon;
        return (
          <div
            key={p.id}
            className={`rounded-xl border p-5 transition-all ${
              isPrimary
                ? "border-accent-gold bg-bg-card shadow-[0_0_24px_rgba(212,168,67,0.06)]"
                : "border-border-default bg-bg-card"
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Icon className="h-5 w-5 text-accent-teal" />
              <h3 className="text-sm font-semibold text-text-primary">
                {p.label}
              </h3>
              {isPrimary && (
                <span className="ml-auto text-[10px] font-medium text-accent-gold">
                  Your OS
                </span>
              )}
            </div>

            <a
              href={p.url}
              className={`block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition-colors ${
                isPrimary
                  ? "bg-accent-gold text-[#111] hover:bg-accent-gold/90"
                  : "border border-border-default text-text-primary hover:border-accent-gold hover:text-accent-gold"
              }`}
            >
              Download
            </a>

            <p className="mt-2 text-[11px] text-text-muted">
              v{VERSION} · {p.size} · {p.reqs}
            </p>

            <p className="mt-2 text-[11px] text-text-muted leading-relaxed">
              {p.note}
            </p>

            {/* CLI collapsible */}
            <button
              onClick={() => setOpenCli(openCli === p.id ? null : p.id)}
              className="mt-3 flex items-center gap-1 text-[11px] text-text-muted hover:text-accent-gold transition-colors"
            >
              <ChevronDown
                className={`h-3 w-3 transition-transform ${
                  openCli === p.id ? "rotate-180" : ""
                }`}
              />
              Download via command line
            </button>

            {openCli === p.id && (
              <div className="mt-2 relative">
                <pre className="overflow-x-auto rounded-md bg-bg-primary p-3 text-[11px] text-text-secondary leading-relaxed">
                  {p.cli}
                </pre>
                <button
                  onClick={() => copyCmd(p.id, p.cli)}
                  className="absolute top-1.5 right-1.5 rounded px-2 py-0.5 text-[10px] text-text-muted hover:text-text-primary bg-bg-card border border-border-default transition-colors"
                >
                  {copied === p.id ? "Copied" : "Copy"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
