import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Terms of Service",
  description:
    "InnerZero Terms of Service — free desktop software, optional paid services, AI output disclaimer, unrestricted mode, liability, and governing law.",
  openGraph: {
    title: "Terms of Service | InnerZero",
    description: "InnerZero Terms of Service.",
    url: "https://innerzero.com/terms",
  },
});

export default function TermsPage() {
  return (
    <div className="pt-28 pb-12 md:pt-36 md:pb-20">
      <Container>
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold text-text-primary md:text-[2.5rem] md:leading-[1.2]">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-text-muted">Last updated: April 2026</p>

          <div className="mt-10 space-y-8 text-text-secondary leading-relaxed text-sm">
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                1. Agreement
              </h2>
              <p>
                By downloading, installing, or using InnerZero, you agree to these terms. If you do not agree, do not use the software. InnerZero is provided by Summers Solutions Ltd (Company No. 16448945), registered in England and Wales.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                2. What InnerZero Is
              </h2>
              <p>
                InnerZero is free desktop software that provides a local AI assistant. The software runs on your personal computer and processes AI tasks locally using third-party open-source AI models. No subscription, account, or payment is required to use the core software. InnerZero is currently supported on Windows 10 and Windows 11 (64-bit) only. NVIDIA GPUs with CUDA support are recommended for optimal performance; AMD and Intel GPUs are not officially supported and may result in reduced functionality or errors. macOS and Linux are not currently supported. Running InnerZero on unsupported operating systems, hardware configurations, or modified environments is entirely at your own risk, and Summers Solutions Ltd accepts no liability for any issues arising from unsupported usage.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                3. Optional Paid Services
              </h2>
              <p>
                InnerZero offers optional paid support and services separate from the free desktop software:
              </p>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                <li><strong>Supporter membership:</strong> A voluntary monthly contribution (£4.99/month) to support InnerZero development, processed through Ko-fi and PayPal. Includes perks such as a supporter badge, extra themes, early access to new features, and a Discord role. Supporter membership does not include cloud AI credits or compute.</li>
                <li><strong>Cloud AI plans:</strong> Optional monthly subscriptions for access to premium cloud AI models (coming soon). Details will be published when available.</li>
                <li><strong>One-off donations:</strong> Optional one-time contributions of any amount via Ko-fi to help fund development.</li>
              </ul>
              <p className="mt-2">
                InnerZero does not process payments directly. All transactions are handled by Ko-fi and PayPal (for supporter and donations) or Stripe (for future cloud plans). Refund requests for supporter memberships and donations should be directed to Ko-fi or PayPal per their respective refund policies.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                4. Licence
              </h2>
              <p>
                InnerZero is licensed, not sold. You are granted a personal, non-exclusive, non-transferable, revocable licence to use InnerZero on any number of personal devices. You may not redistribute, sublicence, reverse-engineer, decompile, or modify the InnerZero software. This licence does not grant any rights to InnerZero source code. Summers Solutions Ltd reserves the right to modify or revoke this licence at any time.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                5. Commercial Use
              </h2>
              <p>
                InnerZero is free for personal, non-commercial use with no licence fee required. &quot;Commercial use&quot; means: use by or on behalf of a business, company, organisation, government body, or any entity engaged in revenue-generating activity; use by employees or contractors in a work capacity; use to provide services to clients or customers; or use in any context where the user or their organisation derives commercial benefit.
              </p>
              <p className="mt-2">
                Commercial use requires an active InnerZero Business Licence (£50/year per seat). Each individual who uses InnerZero commercially requires one seat. The licence is annual, billed yearly, and may be cancelled at any time with no refund for the current period.
              </p>
              <p className="mt-2">
                The Business Licence grants permission to use InnerZero in commercial environments — it does not grant additional features beyond the free app. Educational and non-profit use is considered personal use and does not require a licence. Sole traders and freelancers using InnerZero for business purposes require a licence.
              </p>
              <p className="mt-2">
                Summers Solutions Ltd reserves the right to change pricing with 30 days&apos; notice. Existing licences are honoured until their renewal date.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                6. AI Output Disclaimer
              </h2>
              <p>
                InnerZero uses third-party open-source AI models to generate responses. AI-generated output is not guaranteed to be accurate, complete, factual, or appropriate. This includes but is not limited to: incorrect mathematical calculations, inaccurate factual statements, fabricated information, outdated data, flawed reasoning, inappropriate recommendations, and misleading or incomplete answers. InnerZero&apos;s built-in tools (such as the calculator, web search, file operations, and weather) rely on AI interpretation of your request and may return incorrect or unexpected results. You must not rely on AI output as professional, legal, medical, financial, or safety-critical advice. You are solely responsible for evaluating, verifying, and deciding how to use any content generated by InnerZero. Summers Solutions Ltd accepts no liability whatsoever for AI-generated output, including any loss, damage, or harm arising from reliance on such output. This disclaimer applies equally to all AI-directed actions within InnerZero, including but not limited to text responses, voice responses, tool execution, file operations, and screen automation actions.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                7. Unrestricted Mode
              </h2>
              <p>
                InnerZero includes an optional Unrestricted Mode that replaces the standard AI models with third-party uncensored versions. These uncensored models (modified by huihui.ai, based on Qwen3 by Alibaba Cloud and Gemma3 by Google) have had safety filtering removed and may generate sensitive, offensive, harmful, illegal, or otherwise inappropriate content. The uncensored models are third-party software not created, trained, or endorsed by Summers Solutions Ltd.
              </p>
              <p className="mt-2">
                In addition to generating offensive or inappropriate content, uncensored models may also produce factually incorrect, misleading, or dangerous information without the safety checks present in standard models. This includes but is not limited to incorrect medical, legal, financial, or safety-critical information presented with false confidence. You must not rely on any output from Unrestricted Mode for decisions that could affect your health, safety, finances, or legal standing.
              </p>
              <p className="mt-2">
                Unrestricted Mode is disabled by default and requires explicit opt-in within the desktop application, including acknowledgement of a warning dialogue. By enabling Unrestricted Mode, you:
              </p>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                <li>Confirm you are 18 years of age or older.</li>
                <li>Accept full and sole responsibility for all content generated while Unrestricted Mode is enabled.</li>
                <li>Acknowledge that Summers Solutions Ltd has no control over and accepts no liability for outputs produced by uncensored models.</li>
                <li>Agree not to use Unrestricted Mode to generate content that violates any applicable law, including but not limited to content that is illegal, threatening, defamatory, harassing, or that infringes the rights of others.</li>
              </ul>
              <p className="mt-2">
                Summers Solutions Ltd reserves the right to remove or modify Unrestricted Mode at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                8. Cloud Mode and BYO API Keys
              </h2>
              <p>
                InnerZero offers an optional Cloud Mode that routes AI requests to third-party cloud providers (such as DeepSeek, OpenAI, Anthropic, Google AI, or Qwen/DashScope). When Cloud Mode is enabled, your prompts are sent to the selected provider and responses are returned. Each provider has its own terms of service and privacy policy, which you are responsible for reviewing and accepting.
              </p>
              <p className="mt-2">
                InnerZero also supports BYO (Bring Your Own) API keys, allowing you to use your own accounts with supported providers. When using BYO API keys, requests go directly from your machine to the provider. InnerZero does not proxy, store, log, or read your prompts, responses, or API keys. Your API keys are encrypted and stored locally on your device.
              </p>
              <p className="mt-2">
                You are solely responsible for managing your API key usage, costs, and billing with each provider. InnerZero does not monitor, limit, or control your API consumption. If your usage of a third-party provider results in unexpected charges, Summers Solutions Ltd accepts no liability. We recommend setting spending limits directly with your provider.
              </p>
              <p className="mt-2">
                Summers Solutions Ltd is not responsible for any charges, data handling, or terms imposed by third-party AI providers. Use of Cloud Mode and BYO API keys is entirely at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                9. Screen Automation
              </h2>
              <p>
                InnerZero includes an optional Screen Automation feature that can read your screen, click elements, type text, and scroll within other applications on your computer. This feature is disabled by default and must be explicitly enabled in Settings. When enabled, InnerZero&apos;s AI directs these actions based on its interpretation of your requests and the on-screen content it reads. AI interpretation may be incorrect, and automated actions may produce unintended results, including but not limited to: clicking wrong buttons or links, typing in wrong fields, deleting or modifying files or data, triggering purchases or submissions, interacting with applications in unexpected ways, or performing irreversible actions. You are solely responsible for supervising all automated screen actions. Summers Solutions Ltd accepts no liability for any damage, data loss, financial loss, or unintended consequences arising from the use of Screen Automation. We strongly recommend saving your work before using this feature and using the emergency stop (Escape key) if any action appears incorrect.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                10. Acceptable Use
              </h2>
              <p>
                You agree not to use InnerZero to: generate content that is illegal under the laws of England and Wales or your local jurisdiction; harass, threaten, defame, or harm any person; generate child sexual abuse material or any content that exploits minors; infringe any third-party intellectual property rights; attempt to circumvent any safety mechanisms in the software beyond those explicitly offered (such as Unrestricted Mode); or redistribute InnerZero or any AI-generated output in a way that misrepresents it as human-authored professional advice. You agree not to use Screen Automation to: access systems or accounts you are not authorised to use; automate actions that violate any third-party application&apos;s terms of service; or perform automated actions on financial, medical, or other safety-critical systems without direct human supervision of each action.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                11. Third-Party Software
              </h2>
              <p>
                InnerZero incorporates third-party open-source software and AI models, each subject to its own licence. Key components include: Qwen3 (Alibaba Cloud, Apache 2.0), Gemma3 (Google, Gemma Terms of Use), Ollama (MIT), Kokoro TTS (Hexgrad, Apache 2.0), faster-whisper (SYSTRAN, MIT), Silero VAD (MIT), PyTorch (BSD-3-Clause), and others. Unrestricted models are provided by huihui.ai under Apache 2.0. Full attribution and licence details are available within the desktop application under Settings &gt; General &gt; Third-Party Licences &amp; Notices. Summers Solutions Ltd does not claim ownership of any third-party software or models.
              </p>
              <p className="mt-2">
                InnerZero&apos;s knowledge packs contain content sourced from Wikipedia and other Wikimedia projects, licensed under the Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0). If you redistribute content retrieved from knowledge packs, you must comply with the CC BY-SA 4.0 licence terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                12. Age Requirement
              </h2>
              <p>
                You must be at least 13 years old to use InnerZero. You must be at least 18 years old to enable Unrestricted Mode. If you are under 18, you may use InnerZero only with the consent of a parent or legal guardian.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                13. Intellectual Property
              </h2>
              <p>
                InnerZero and all related trademarks, logos, branding, and proprietary code are the property of Summers Solutions Ltd. Content you create using InnerZero belongs to you, subject to any applicable third-party model licence terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                14. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by law, InnerZero is provided &quot;as is&quot; and &quot;as available&quot; without warranty of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement. Summers Solutions Ltd shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, data, or goodwill, arising from or related to your use of InnerZero, regardless of the cause of action. In no event shall the total liability of Summers Solutions Ltd exceed the amount you have paid to Summers Solutions Ltd in the twelve months preceding the claim, or £50, whichever is greater.
              </p>
              <p className="mt-2">
                Without limiting the foregoing, Summers Solutions Ltd shall not be liable for any damage to your computer hardware, software, operating system, or data arising from the installation, use, or uninstallation of InnerZero. This includes but is not limited to data loss, file corruption, system instability, GPU or hardware damage, driver conflicts, or any interaction between InnerZero and other software on your system. You acknowledge that InnerZero runs AI models locally on your hardware, which may place significant load on your CPU, GPU, and memory. You are responsible for ensuring your system meets the recommended requirements and is adequately maintained.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                15. Indemnification
              </h2>
              <p>
                You agree to indemnify, defend, and hold harmless Summers Solutions Ltd, its directors, officers, and employees from and against any claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising from: your use of InnerZero; your use of Unrestricted Mode; content you generate using InnerZero; your violation of these terms; or your violation of any applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                16. Termination
              </h2>
              <p>
                We may revoke access to paid services in cases of abuse or violation of these terms. The free desktop software will continue to function regardless. You may stop using InnerZero at any time by uninstalling the software. These terms survive termination where applicable (including sections on liability, indemnification, and intellectual property).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                17. Changes to Terms
              </h2>
              <p>
                We may update these terms from time to time. Material changes will be noted on this page with an updated date. Continued use of InnerZero after changes constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                18. Severability
              </h2>
              <p>
                If any provision of these terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                19. Entire Agreement
              </h2>
              <p>
                These terms, together with the Privacy Policy, constitute the entire agreement between you and Summers Solutions Ltd regarding your use of InnerZero. They supersede any prior agreements, communications, or understandings.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                20. No Waiver
              </h2>
              <p>
                Failure by Summers Solutions Ltd to enforce any provision of these terms shall not constitute a waiver of that provision or any other provision. Any waiver must be in writing and signed by Summers Solutions Ltd.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                21. Governing Law
              </h2>
              <p>
                These terms are governed by and construed in accordance with the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                22. Contact
              </h2>
              <p>
                For questions about these terms, contact us at{" "}
                <a
                  href="mailto:help@innerzero.com"
                  className="text-accent-gold hover:text-accent-gold-hover transition-colors"
                >
                  help@innerzero.com
                </a>.
              </p>
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
}
