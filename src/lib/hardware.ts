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
    description: "Modest laptops and older desktops. Local AI works, on the CPU.",
    ram: "8 GB",
    cpu: "Modern 64-bit, 4 cores or more",
    gpu: "Not required",
    storage: "10 GB free",
    modelExamples: ["Qwen 3 4B"],
    notes:
      "Runs on the CPU with no graphics card at all. Expect slower responses on long prompts. Voice needs a dedicated GPU, so it is off at this level. There is a smaller profile again for machines with 4 GB to 7 GB of RAM, and if a machine cannot run a local model at all InnerZero still works fully on a cloud plan.",
  },
  {
    id: "recommended",
    name: "Recommended",
    description: "A dedicated GPU. The full local experience, voice included.",
    ram: "16 GB or more",
    cpu: "Modern multi-core, 8 cores or more",
    gpu: "Dedicated GPU with 8 GB or more VRAM",
    storage: "20 GB free",
    modelExamples: ["Qwen 3 4B on GPU", "Gemma 3 1B for voice"],
    notes:
      "Voice is enabled from this level up. More RAM and VRAM moves you onto larger models: 32 GB with 16 GB of VRAM runs Qwen 3 8B, and it keeps going from there. NVIDIA CUDA GPUs deliver the best performance today.",
    recommended: true,
  },
];
