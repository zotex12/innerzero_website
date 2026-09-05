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
    description: "Older laptops and low-spec desktops. Local AI still runs.",
    ram: "4 GB",
    cpu: "Modern 64-bit",
    gpu: "Not required",
    storage: "2 GB free, plus the model",
    modelExamples: ["Qwen 3 1.7B"],
    notes:
      "The app's own floor. It runs the smallest model on the CPU, and responses are slow at this level. Voice needs a dedicated GPU, so it is off here. If a machine cannot run a local model at all, No Local Model is a supported choice: InnerZero works on a cloud plan, your own API key, or an Ollama server on your network, with voice when you choose a voice-capable model that server has.",
  },
  {
    id: "recommended",
    name: "Recommended",
    description: "A dedicated GPU. The full local experience, voice included.",
    ram: "16 GB or more",
    cpu: "Modern multi-core, 8 cores or more",
    gpu: "Dedicated GPU with 8 GB or more VRAM, or Apple Silicon",
    storage: "20 GB free",
    modelExamples: ["Qwen 3 4B on GPU", "Gemma 3 1B for voice"],
    notes:
      "Voice is enabled from this level up. More RAM and VRAM moves you onto larger models: 32 GB with 16 GB of VRAM runs Qwen 3 8B, and the ladder continues past that. NVIDIA CUDA GPUs deliver the best performance today.",
    recommended: true,
  },
];
