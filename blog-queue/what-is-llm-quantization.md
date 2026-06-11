<!--
QUICK-EDIT CHECKLIST (before publish day):
- [ ] Verify no factual claims are stale (quant naming, K-quant method names, typical file sizes)
- [ ] Re-check the llama.cpp quantize docs link and current quant type list (Q4_K_M, Q5_K_M, Q8_0 still standard)
- [ ] Confirm Hugging Face GGUF / quantization docs URLs still resolve
- [ ] Confirm InnerZero hardware tier auto-detection description still matches what ships
- [ ] Update VRAM/RAM example figures if model families (Qwen3, Gemma3, gpt-oss) change typical sizes
-->
---
title: "What Is LLM Quantization? Q4, Q8, and Picking a Local Model"
description: "LLM quantization explained in plain terms: what Q4_K_M and Q8 labels mean, the size, speed, and quality tradeoffs, and how to pick a quant for your VRAM or RAM."
date: "2026-10-02"
author: "Louie"
authorRole: "Founder"
slug: "what-is-llm-quantization"
tags: ["local ai", "guide", "features"]
readingTime: "9 min read"
featured: false
---

If you have ever downloaded a local AI model and seen filenames like `Qwen3-8B-Q4_K_M.gguf` sitting next to `Qwen3-8B-Q8_0.gguf`, you have run straight into quantization. This is LLM quantization explained without the maths degree: it is the technique that shrinks a model so it fits on your hardware, trading a little quality for a lot less memory.

This post covers what those Q4 and Q8 labels mean, what the `_K_M` suffix is telling you, the real size and speed tradeoffs, and a simple way to choose a quant for the [hardware you actually have](/blog/hardware-for-local-ai).

> **Quick summary**
> - Quantization stores a model's weights at lower numerical precision (4-bit, 5-bit, 8-bit) instead of the original 16-bit, which cuts the file size and memory use by roughly half or more.
> - Q4 quants are the common sweet spot: about a quarter the size of the full model with quality loss most people never notice in daily use.
> - Q8 keeps almost all of the original quality and is worth it if you have spare memory; Q2 and Q3 save the most space but degrade output noticeably.
> - The `K_M` style suffix (as in Q4_K_M) marks llama.cpp's "K-quant" method at Medium size, which gives better quality per bit than older quant types.
> - Pick the largest quant of the largest model that fits your VRAM (GPU) or RAM (CPU) with a few GB to spare for context.

## What is LLM quantization in plain terms?

Quantization reduces the numerical precision used to store a model's weights. A model is billions of numbers; in its original form each number is typically a 16-bit value. Quantization rounds those numbers to fewer bits, so a 4-bit quant stores each weight in a quarter of the space.

Think of it like saving a photo as a JPEG instead of a raw file: it throws away detail you mostly cannot see and ends up far smaller. A 4-bit quant of a language model works the same way: most of the model's behaviour survives, the file gets dramatically smaller, and it now fits in memory it could not fit in before. The Hugging Face [documentation on quantization](https://huggingface.co/docs/transformers/main/en/quantization/concept_guide) describes it as mapping high-precision values to a lower-precision format to reduce memory and speed up inference.

The practical payoff is that quantization is what lets a model designed on data-centre GPUs run on a laptop or a mid-range desktop. Without it, most [open-source models](/blog/open-source-ai-models-explained) would simply be too large to load on consumer hardware.

## What do Q4, Q8, and the _K_M suffix actually mean?

The number after the Q is the bits per weight: Q4 is roughly 4-bit, Q8 is roughly 8-bit. Lower number means smaller file and lower memory use, at the cost of some accuracy. The letters after it describe the method and the size variant within that method.

In the GGUF format used by llama.cpp (the engine under Ollama, LM Studio, and many local apps), the modern quants use a "K-quant" scheme. That is the `K` in `Q4_K_M`. The trailing letter is the size tier: `S` for small, `M` for medium, `L` for large. So `Q4_K_M` reads as "4-bit K-quant, medium variant". The llama.cpp project's [quantize tool documentation](https://github.com/ggml-org/llama.cpp/tree/master/tools/quantize) lists the full set of available types.

Here is how the common labels line up:

| Label | Bits per weight (approx) | Relative size | Typical use |
|---|---|---|---|
| Q2_K | ~2.6 | Smallest | Last resort on very tight memory; quality drops noticeably |
| Q3_K_M | ~3.9 | Very small | Squeezing a bigger model onto limited hardware |
| Q4_K_M | ~4.8 | Small | The common default; best balance for most machines |
| Q5_K_M | ~5.7 | Medium | A step up in quality when you have spare memory |
| Q6_K | ~6.6 | Larger | Near-original quality, larger footprint |
| Q8_0 | ~8.5 | Large | Almost lossless; use when memory is not the constraint |

The older `_0` and `_1` quants (like Q4_0 or Q8_0) are simpler, legacy methods. Q8_0 is still common because at 8-bit the simpler method is already near-lossless, so there is little to gain from the K-quant treatment. At 4-bit and below, the K-quant variants (`_K_S`, `_K_M`, `_K_L`) give meaningfully better quality for the same bit budget, which is why `Q4_K_M` has become the go-to recommendation.

## How much quality do you lose with Q4 versus Q8?

Less than most people expect. Going from the full 16-bit model down to Q4_K_M typically produces output that is hard to tell apart in everyday chat, writing help, and general questions. The quality loss becomes easier to notice at Q3 and below, and on the hardest reasoning, maths, and long-coding tasks where small errors compound.

The reason Q4 holds up so well is that K-quants do not treat every weight equally. They keep certain important parts of the model at higher precision and compress the rest more aggressively, so the bits go where they matter most. This is why a 4-bit K-quant beats an older flat 4-bit method at the same size.

A useful rule of thumb when you have to trade size against capability: a larger model at a smaller quant usually beats a smaller model at a larger quant. A 14B model at Q4_K_M will generally outperform an 8B model at Q8_0 of similar size, because parameter count tends to matter more than the last bit or two of precision. If you want a deeper look at which families InnerZero ships and why, see [what models InnerZero uses](/blog/what-models-does-innerzero-use).

## How do I pick a quant for my VRAM or RAM?

Match the quantized file size to your available memory, leaving headroom. If the model runs on your GPU, the file needs to fit in VRAM; if it runs on CPU, it needs to fit in system RAM. In both cases, leave a few GB free on top of the file size, because the context window (the conversation and any documents you load) also consumes memory while the model runs.

A practical sequence:

1. Find your usable memory. On a GPU, that is your VRAM (for example 8GB on an RTX 4060, 12GB on an RTX 4070). On CPU-only, that is your system RAM minus what the operating system needs.
2. Subtract roughly 2 to 3GB for context and overhead.
3. Pick the largest model whose Q4_K_M file fits under that number. Q4_K_M is the safest starting point.
4. If it fits with room to spare, step up to Q5_K_M or Q6_K for a quality bump. If it does not fit, step down to a smaller model rather than dropping below Q4 on the same one.

Rough guidance for where common quants land:

| Your memory | Reasonable target |
|---|---|
| 8GB VRAM or RAM | A 7B to 8B model at Q4_K_M |
| 12GB | A 8B model at Q5_K_M or Q6_K, or a 14B at Q4_K_M |
| 16GB | A 14B model at Q4_K_M to Q5_K_M comfortably |
| 24GB+ | A 14B at Q8_0, or a larger model at Q4_K_M |

These are starting points, not hard limits. Exact fit depends on the model family, the context length you set, and whether some layers are offloaded between GPU and CPU. The [Ollama documentation](https://docs.ollama.com/) and a model's Hugging Face card list the actual quantized file sizes so you can check before downloading.

## Do I need to understand quantization to use InnerZero?

No. InnerZero detects your hardware tier on first run and picks a sensible model and quant for your machine automatically, so you can use it without ever choosing a Q-level yourself. The whole point is that the defaults work out of the box.

The detail in this post matters when you want manual control: load a specific model you found on Hugging Face, push to a larger quant because you have memory to spare, or run a bigger model at a smaller quant on tight hardware. Because InnerZero runs on top of Ollama and LM Studio (and supports [llama.cpp directly](/blog/use-llama-cpp-with-innerzero)), any GGUF quant those engines can load, InnerZero can use. You get the automatic path by default and the manual path when you want it. This is the same local-first approach behind everything in [local AI](/what-is-local-ai): your model, your hardware, your choice of how much to tune.

## Frequently asked questions

### Is a higher Q number always better?

A higher Q number means more precision and higher quality, but only up to the point where the difference stops being noticeable. Q8 is near-lossless, so going beyond it (to the full 16-bit model) rarely changes output in practice while doubling the memory cost. For most people Q4_K_M to Q6_K is the useful range; Q8 is for when memory is not a concern.

### What does GGUF have to do with quantization?

GGUF is the file format that packages a quantized model for llama.cpp and the apps built on it, including Ollama and LM Studio. The quant type (Q4_K_M, Q8_0, and so on) is baked into the GGUF file when it is created, which is why it usually appears in the filename. When you download a `.gguf` file, the quant level is part of what you are choosing.

### Does quantization make the model faster?

Often yes, especially on memory-bound hardware. A smaller quantized model moves less data through memory per token, and a model that fits entirely in VRAM runs far faster than one that spills over to CPU. The speed gain is not the main goal of quantization (fitting the model in memory is), but it is a common side benefit.

### Can I change the quant later without reinstalling everything?

Yes. The quant lives in the model file, so switching is a matter of downloading a different quantized version of the same model and pointing your app at it. Your conversations, settings, and memory are separate from the model file, so swapping a Q4 model for a Q5 or Q8 version does not disturb anything else in InnerZero.

### Why not always use the smallest quant to save space?

Below Q4, quality drops fast enough that the savings stop being worth it for daily use. Q2 and Q3 quants can produce shakier reasoning, more mistakes on structured tasks, and weaker long-form writing. They are best kept as a way to run a model that otherwise would not fit at all.

Quantization is the quiet piece of technology that makes local AI practical on normal computers. If you would rather skip the choice entirely, [download InnerZero](/download) and let it pick for your hardware, then tune the quant yourself whenever you want more control.