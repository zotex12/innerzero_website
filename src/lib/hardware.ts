// System-requirements tiers shown on /features. Single source of truth so
// future tiers (e.g. "Power user") or columns (e.g. OS-specific notes) are
// one-line changes here and the table component picks them up without edits.
//
// Values are grounded in the desktop install_profile.py routing thresholds
// and the existing FAQ copy ("modest laptops with 16 GB of RAM"). NPU
// routing is intentionally absent: install_profile.py does not currently
// branch on NPU presence, so claiming NPU support would be marketing-only.

export interface HardwareTier {
  /** Stable slug for anchors and React keys. */
  id: string;
  /** Display name. e.g. "Minimum", "Recommended". */
  name: string;
  /** Short description shown directly under the name. */
  description: string;
  /** Top-level minimum RAM line. */
  ram: string;
  /** CPU summary. */
  cpu: string;
  /** GPU summary. */
  gpu: string;
  /** Free disk space recommendation. */
  storage: string;
  /** Local model families that run comfortably at this tier. */
  modelExamples: string[];
  /** Optional muted small print displayed below the cells. */
  notes?: string;
  /** Optional flag marking the tier the marketing site recommends. */
  recommended?: boolean;
}

export const HARDWARE_TIERS: HardwareTier[] = [
  {
    id: "minimum",
    name: "Minimum",
    description: "Modest laptops and older desktops. Local AI works.",
    ram: "16 GB",
    cpu: "Modern multi-core (4 cores or more)",
    gpu: "Integrated graphics OK",
    storage: "10 GB free",
    modelExamples: ["Gemma 3 1B", "Qwen 3 4B"],
    notes:
      "Smaller models, faster on low-power hardware. Voice and tools all run; expect slower responses on long prompts.",
  },
  {
    id: "recommended",
    name: "Recommended",
    description: "Mid-range to high-end PCs. The full local AI experience.",
    ram: "32 to 64 GB",
    cpu: "Modern multi-core (8 cores or more)",
    gpu: "Dedicated GPU with 8 GB or more VRAM",
    storage: "20 GB free",
    modelExamples: ["Qwen 3 14B", "gpt-oss", "Gemma 3 12B"],
    notes:
      "Larger models, faster generation, longer context windows. NVIDIA CUDA GPUs deliver the best performance today.",
    recommended: true,
  },
];
