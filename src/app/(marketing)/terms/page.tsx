import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Terms of Service",
  description:
    "InnerZero Terms of Service: free desktop software, optional paid services, AI output disclaimer, unrestricted mode, commercial use, liability, and governing law.",
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

          {/* Solicitor review notice */}
          <div className="mt-6 rounded-lg border-l-4 border-[#f59e0b] bg-[rgba(245,158,11,0.1)] p-4">
            <p className="text-sm text-[#f59e0b]">
              These terms are pending final solicitor review. They are provided in good faith and are legally substantive, but have not yet received formal legal sign-off.
            </p>
          </div>

          <div className="mt-10 space-y-8 text-text-secondary leading-relaxed text-sm">

            {/* Section 1 */}
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                1. Agreement
              </h2>
              <p>
                By downloading, installing, or using InnerZero, you agree to these Terms of Service in full. If you do not agree to these terms, you must not download, install, or use InnerZero. These terms form a legally binding agreement between you and Summers Solutions Ltd (Company No. 16448945), registered in England and Wales at Mclaren Building, 46 The Priory Queensway, Birmingham, B4 7LR.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                2. What InnerZero Is
              </h2>
              <p>
                InnerZero is free desktop software that provides a local AI assistant. The software runs on your personal computer and processes AI tasks locally using third-party open-source AI models. No subscription, account, or payment is required to use the core software.
              </p>
              <p className="mt-2">
                InnerZero is currently supported on Windows 10 and Windows 11 (64-bit) only. NVIDIA GPUs with CUDA support are recommended for optimal performance; AMD and Intel GPUs are not officially supported and may result in reduced functionality or errors. macOS and Linux are not currently supported.
              </p>
              <p className="mt-2">
                Running InnerZero on unsupported operating systems, hardware configurations, or modified environments is entirely at your own risk. Summers Solutions Ltd accepts no liability for any issues, damage, data loss, or errors arising from unsupported usage.
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                3. Optional Paid Services
              </h2>
              <p>
                InnerZero offers optional paid support and services that are entirely separate from the free desktop software:
              </p>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                <li><strong>Supporter membership:</strong> A voluntary monthly contribution of £4.99/month to support InnerZero development, processed through Ko-fi and PayPal. Includes a supporter badge, extra themes, early access to new features, and a Discord role. Supporter membership does not include cloud AI credits or compute.</li>
                <li><strong>Cloud AI plans:</strong> Optional monthly subscriptions for access to premium cloud AI models (coming soon). Details will be published when available.</li>
                <li><strong>One-off donations:</strong> Optional one-time contributions of any amount via Ko-fi.</li>
              </ul>
              <p className="mt-2">
                InnerZero does not process payments directly. All transactions are handled by Ko-fi and PayPal (for supporter memberships and donations) or Stripe (for future cloud plans). Refund requests for supporter memberships and donations must be directed to Ko-fi or PayPal per their respective refund policies. Summers Solutions Ltd has no ability to issue refunds for transactions processed by third-party payment processors.
              </p>
              <p className="mt-2">
                Paid services auto-renew where applicable unless cancelled before the next billing date. You may cancel at any time.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                4. Licence
              </h2>
              <p>
                InnerZero is licensed, not sold. Summers Solutions Ltd grants you a personal, non-exclusive, non-transferable, revocable licence to install and use InnerZero on any number of personal devices you own or control, subject to these terms.
              </p>
              <p className="mt-2">
                You may not: redistribute, sublicence, sell, or rent the software; reverse-engineer, decompile, disassemble, or attempt to derive the source code of InnerZero; modify, adapt, or create derivative works based on InnerZero; remove or alter any proprietary notices or labels; or use InnerZero in any way not expressly permitted by these terms.
              </p>
              <p className="mt-2">
                This licence does not grant any rights to InnerZero&apos;s source code. Summers Solutions Ltd reserves the right to modify or revoke this licence at any time, including in the event of a breach of these terms.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                5. Commercial Use
              </h2>
              <p>
                InnerZero is free for personal, non-commercial use. No licence fee is required for personal use.
              </p>
              <p className="mt-2">
                &quot;Commercial use&quot; means: use by or on behalf of a business, company, organisation, government body, or any entity engaged in revenue-generating activity; use by employees or contractors in a work capacity; use to provide services to clients or customers; or use in any context where the user or their organisation derives a commercial benefit from the software.
              </p>
              <p className="mt-2">
                Commercial use requires an active InnerZero Business Licence at £50 per user per year. Each individual using InnerZero commercially requires one seat licence. The licence is annual and may be cancelled at any time; no refund is issued for the current licence period.
              </p>
              <p className="mt-2">
                The Business Licence grants permission to use InnerZero in commercial environments. It does not grant additional features beyond the free application.
              </p>
              <p className="mt-2">
                Educational institutions, charities, and non-profit organisations are considered personal use and do not require a Business Licence. Sole traders and freelancers using InnerZero in the course of their business require a Business Licence.
              </p>
              <p className="mt-2">
                Until the Business Licence purchase system is live on innerzero.com, commercial users must contact{" "}
                <a href="mailto:help@innerzero.com" className="text-accent-gold hover:text-accent-gold-hover transition-colors">help@innerzero.com</a>
                {" "}to arrange licensing before using InnerZero commercially.
              </p>
              <p className="mt-2">
                Summers Solutions Ltd reserves the right to change Business Licence pricing with 30 days&apos; written notice. Existing licences are honoured at the price agreed until their renewal date.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                6. AI Output Disclaimer
              </h2>
              <p>
                InnerZero uses third-party open-source AI models to generate responses. AI-generated output is not guaranteed to be accurate, complete, factual, current, or appropriate for any purpose.
              </p>
              <p className="mt-2">
                AI output may include: incorrect mathematical calculations; inaccurate or fabricated factual statements; outdated information; flawed reasoning; biased, offensive, or inappropriate content; dangerous or misleading recommendations; and content that appears credible but is entirely wrong.
              </p>
              <p className="mt-2">
                InnerZero&apos;s built-in tools, including but not limited to the calculator, web search, file operations, URL fetching, and weather, rely on AI interpretation of your request and may produce incorrect, incomplete, or unexpected results. Tool outputs are not verified by Summers Solutions Ltd and must not be relied upon without independent verification.
              </p>
              <p className="mt-2">
                You must not rely on any AI-generated output as a substitute for professional advice, including but not limited to legal advice, medical or clinical advice, financial or investment advice, psychological or therapeutic advice, safety-critical guidance, or engineering or technical advice.
              </p>
              <p className="mt-2">
                You are solely and entirely responsible for evaluating, verifying, and deciding whether to act on any content generated by InnerZero. Summers Solutions Ltd accepts no liability whatsoever for any loss, harm, damage, or consequence arising from reliance on AI-generated output. This disclaimer applies to all AI-directed actions and outputs within InnerZero without exception, including text responses, voice responses, tool execution, file operations, and screen automation actions.
              </p>
              <p className="mt-2">
                InnerZero can set timers, alarms, reminders, and countdowns based on AI interpretation of your requests. The AI may misinterpret times, durations, AM/PM, time zones, or your intent. You are responsible for verifying that any scheduled action is correct. Summers Solutions Ltd accepts no liability for missed, incorrect, late, or unexpected alarms, timers, reminders, or countdowns, including any consequences thereof. You should not rely on InnerZero as your sole alarm, timer, or reminder system for critical or time-sensitive matters including medication, medical appointments, travel, safety procedures, or professional deadlines.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                7. Absolute Prohibitions
              </h2>
              <p>
                The following are absolute prohibitions that apply under all circumstances, regardless of any software mode, setting, configuration, or feature, including Unrestricted Mode. No provision of these terms, no software setting, and no conduct by Summers Solutions Ltd shall be construed as authorising or permitting any of the following:
              </p>
              <p className="mt-3">
                <strong>(a) Child Sexual Abuse Material (CSAM):</strong> You must not use InnerZero to generate, store, distribute, view, access, or facilitate child sexual abuse material, or any content that sexually exploits, depicts, or endangers minors in any way. This prohibition is absolute and unconditional.
              </p>
              <p className="mt-2">
                <strong>(b) Terrorism and Violent Extremism:</strong> You must not use InnerZero to generate, store, distribute, or facilitate content that promotes, glorifies, incites, recruits for, or provides operational support for terrorism, violent extremism, or acts of mass violence. This includes content covered by the Terrorism Act 2000, the Terrorism Act 2006, and the Counter-Terrorism and Border Security Act 2019.
              </p>
              <p className="mt-2">
                <strong>(c) Serious Criminal Content:</strong> You must not use InnerZero to generate or facilitate any content that constitutes a serious criminal offence under UK law or the laws of your jurisdiction, including but not limited to: incitement to murder or serious violence; threats to kill; content designed to facilitate actual violence against specific individuals or groups; or content that facilitates organised crime.
              </p>
              <p className="mt-3">
                These absolute prohibitions survive termination of your licence and your use of InnerZero. Violation of any absolute prohibition may result in immediate licence revocation and civil or criminal proceedings.
              </p>
              <p className="mt-2">
                InnerZero operates entirely on the user&apos;s local machine. Summers Solutions Ltd has no access to, visibility into, or technical ability to monitor any content generated by any user. Summers Solutions Ltd cannot and does not intercept, log, or review local AI outputs.
              </p>
              <p className="mt-2">
                However, if Summers Solutions Ltd receives credible evidence, whether through a user report, law enforcement request, or any other means, that InnerZero has been used to generate CSAM, plan or facilitate terrorism, or plan or facilitate serious harm to persons, Summers Solutions Ltd will cooperate fully with the National Crime Agency (NCA), Counter Terrorism Policing, the Internet Watch Foundation (IWF), and any other relevant law enforcement or regulatory authority, and will provide all information within its possession.
              </p>
              <p className="mt-2">
                To report misuse, contact{" "}
                <a href="mailto:help@innerzero.com" className="text-accent-gold hover:text-accent-gold-hover transition-colors">help@innerzero.com</a>.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                8. Unrestricted Mode
              </h2>
              <p>
                Unrestricted Mode is an optional feature that replaces the standard AI models with third-party uncensored AI models. These uncensored models are not included with InnerZero and are not distributed by Summers Solutions Ltd. They must be downloaded independently by the user directly from Hugging Face (huggingface.co) using Ollama, following instructions provided within the application. By downloading and installing these models, the user enters into a direct relationship with the model providers. Summers Solutions Ltd has no involvement in that download and accepts no liability arising from it.
              </p>
              <p className="mt-2">
                The uncensored models available for use with Unrestricted Mode are modified versions of Qwen3 (Alibaba Cloud) and Gemma3 (Google), adapted by huihui.ai and published publicly on Hugging Face. These models have had safety filtering removed and may generate content that is sensitive, offensive, harmful, explicit, or otherwise inappropriate. They are third-party software not created, trained, or endorsed by Summers Solutions Ltd.
              </p>
              <p className="mt-2">
                Uncensored models may produce factually incorrect, misleading, or dangerous information with false confidence and without any safety warnings. This includes but is not limited to incorrect medical, legal, financial, or safety-critical information. You must not rely on any output from Unrestricted Mode for any decision that could affect your health, safety, finances, legal standing, or the health and safety of others.
              </p>
              <p className="mt-2">
                Unrestricted Mode is disabled by default and requires explicit opt-in within the desktop application, including acknowledgement of a warning dialogue.
              </p>
              <p className="mt-2">
                The absolute prohibitions in Section 7 apply in full in Unrestricted Mode and cannot be overridden, waived, or modified by any software setting. Generating CSAM, terrorism content, or any other content listed in Section 7 is prohibited in Unrestricted Mode exactly as it is in standard mode.
              </p>
              <p className="mt-2">
                By enabling Unrestricted Mode, you make the following representations and accept the following obligations:
              </p>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                <li>You confirm you are 18 years of age or older.</li>
                <li>You confirm that any other person with access to this device and to Unrestricted Mode is also 18 years of age or older.</li>
                <li>You accept full, sole, and unconditional responsibility for all content generated while Unrestricted Mode is enabled.</li>
                <li>You acknowledge that Summers Solutions Ltd has no control over, and accepts no liability whatsoever for, any outputs produced by uncensored models.</li>
                <li>You agree that you will not use Unrestricted Mode to generate any content that violates Section 7 or Section 11 of these terms.</li>
                <li>You agree that if you misrepresent your age to enable Unrestricted Mode, your licence is immediately and automatically revoked without notice, and Summers Solutions Ltd reserves the right to take further action.</li>
              </ul>
              <p className="mt-2">
                Summers Solutions Ltd reserves the right to remove, modify, or restrict Unrestricted Mode at any time without notice.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                9. Cloud Mode and BYO API Keys
              </h2>
              <p>
                InnerZero offers an optional Cloud Mode that routes AI requests to third-party cloud AI providers, including but not limited to DeepSeek, OpenAI, Anthropic, Google AI, and Qwen/DashScope. When Cloud Mode is enabled, your prompts are transmitted to the provider you select and responses are returned to your device.
              </p>
              <p className="mt-2">
                Each cloud AI provider has its own terms of service, acceptable use policy, and privacy policy. You are solely responsible for reviewing, understanding, and complying with those terms before enabling Cloud Mode. Summers Solutions Ltd is not a party to any agreement between you and a third-party AI provider.
              </p>
              <p className="mt-2">
                InnerZero also supports BYO (Bring Your Own) API keys. When using BYO API keys, requests travel directly from your machine to the provider. InnerZero does not proxy, store, log, intercept, or read your prompts, responses, or API keys at any point. Your API keys are encrypted and stored locally on your device only.
              </p>
              <p className="mt-2">
                You are solely responsible for: all API usage and associated costs incurred under your account with each provider; compliance with each provider&apos;s terms of service and acceptable use policy; setting appropriate spending limits directly with the provider; and the security of your API keys.
              </p>
              <p className="mt-2">
                If your use of Cloud Mode or BYO API keys results in unexpected charges, account suspension, or any other consequence imposed by a third-party provider, Summers Solutions Ltd accepts no liability. Use of Cloud Mode and BYO API keys is entirely at your own risk.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                10. Screen Automation
              </h2>
              <p>
                InnerZero includes an optional Screen Automation feature that can read your screen, identify on-screen elements, click, type, scroll, and interact with other applications on your computer. This feature is disabled by default and must be explicitly enabled in Settings.
              </p>
              <p className="mt-2">
                When enabled, InnerZero&apos;s AI interprets your instructions and the on-screen content it reads and directs automated actions accordingly. AI interpretation may be incorrect. Automated actions may produce unintended results, including but not limited to: clicking incorrect buttons, links, or controls; typing in incorrect fields; deleting, modifying, or corrupting files or data; triggering purchases, submissions, or form completions; interacting with applications in unexpected or irreversible ways; or performing actions that cannot be undone.
              </p>
              <p className="mt-2">
                You are solely responsible for supervising all Screen Automation actions at all times. You must not leave Screen Automation running without active human supervision.
              </p>
              <p className="mt-2">
                Summers Solutions Ltd accepts no liability for any damage, data loss, financial loss, reputational harm, or any other consequence arising from the use of Screen Automation, whether or not such consequences result from AI error, misinterpretation, or unexpected behaviour.
              </p>
              <p className="mt-2">
                You must not use Screen Automation to: access systems, accounts, or data you are not authorised to access; automate actions on any platform or application in a manner that violates that platform&apos;s terms of service; perform automated actions on financial, medical, legal, or other safety-critical systems without direct human supervision and verification of each individual action; or circumvent any security, authentication, or access control mechanism.
              </p>
              <p className="mt-2">
                We strongly recommend saving all open work before enabling Screen Automation and using the emergency stop (Escape key) immediately if any action appears incorrect or unintended.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                11. Acceptable Use
              </h2>
              <p>
                You agree to use InnerZero only for lawful purposes and only in accordance with these terms. In addition to the absolute prohibitions in Section 7, you agree not to use InnerZero to:
              </p>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                <li>Generate, store, or distribute content that is illegal under the laws of England and Wales or the laws of your jurisdiction.</li>
                <li>Harass, threaten, stalk, intimidate, defame, or cause harm to any person.</li>
                <li>Infringe any copyright, trademark, trade secret, patent, or other intellectual property right of any person or entity.</li>
                <li>Generate non-consensual intimate imagery or sexual content depicting real individuals without their consent.</li>
                <li>Engage in fraud, deception, phishing, impersonation, or the creation of disinformation intended to deceive others.</li>
                <li>Facilitate unauthorised access to computer systems, networks, databases, or accounts, including through the use of InnerZero&apos;s file operations, URL fetch, or automation tools.</li>
                <li>Scrape, harvest, or extract data from third-party services in a manner that violates those services&apos; terms of service.</li>
                <li>Generate content designed to manipulate, coerce, or exploit vulnerable individuals, including but not limited to content designed to facilitate grooming, financial fraud, or abuse.</li>
                <li>Redistribute InnerZero AI-generated output in a way that misrepresents it as human-authored professional, clinical, legal, or financial advice.</li>
                <li>Attempt to circumvent, disable, or bypass any safety mechanism within InnerZero beyond those explicitly offered as features (such as Unrestricted Mode).</li>
              </ul>
              <p className="mt-2">
                To report misuse, abuse, or harmful content generated using InnerZero, contact{" "}
                <a href="mailto:help@innerzero.com" className="text-accent-gold hover:text-accent-gold-hover transition-colors">help@innerzero.com</a>.
              </p>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                12. Third-Party Software
              </h2>
              <p>
                InnerZero incorporates third-party open-source software and AI models. Each component is subject to its own licence. Key components include:
              </p>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                <li>Qwen3 (Alibaba Cloud, Apache 2.0)</li>
                <li>Gemma3 (Google, Gemma Terms of Use)</li>
                <li>Ollama (MIT)</li>
                <li>Kokoro TTS (Hexgrad, Apache 2.0)</li>
                <li>faster-whisper (SYSTRAN, MIT)</li>
                <li>Silero VAD (MIT)</li>
                <li>PyTorch. BSD-3-Clause</li>
                <li>Unrestricted models (optional, user-installed): huihui.ai, Apache 2.0. These models are not distributed by Summers Solutions Ltd and must be downloaded independently from Hugging Face.</li>
              </ul>
              <p className="mt-2">
                Full attribution and licence details are available within the desktop application under Settings &gt; General &gt; Third-Party Licences &amp; Notices.
              </p>
              <p className="mt-2">
                By using InnerZero with models subject to third-party use restrictions, including but not limited to Google Gemma, you agree to comply with those models&apos; terms of use in addition to these terms. Summers Solutions Ltd does not claim ownership of any third-party software or AI models.
              </p>
              <p className="mt-2">
                InnerZero&apos;s knowledge packs contain content sourced from Wikipedia and other Wikimedia projects, licensed under the Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0). If you redistribute or republish content retrieved from InnerZero&apos;s knowledge packs, you must comply with the CC BY-SA 4.0 licence, including attribution requirements.
              </p>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                13. Age Requirements
              </h2>
              <p>
                You must be at least 13 years of age to use InnerZero. You must be at least 18 years of age to enable Unrestricted Mode.
              </p>
              <p className="mt-2">
                If you are under 18 years of age, you may use InnerZero only with the explicit consent and active supervision of a parent or legal guardian who accepts these terms on your behalf and accepts responsibility for your use of the software.
              </p>
              <p className="mt-2">
                Summers Solutions Ltd does not knowingly permit access to Unrestricted Mode by any person under 18 years of age. If you are under 18 and attempt to access Unrestricted Mode, you are in breach of these terms and your licence is immediately revoked.
              </p>
            </section>

            {/* Section 14 */}
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                14. Intellectual Property
              </h2>
              <p>
                InnerZero, its name, logo, branding, design, and proprietary code are the intellectual property of Summers Solutions Ltd. All rights are reserved. Nothing in these terms grants you any ownership of or rights in InnerZero&apos;s intellectual property beyond the limited licence granted in Section 4.
              </p>
              <p className="mt-2">
                Content you create using InnerZero belongs to you, subject to any applicable third-party AI model licence terms. You are responsible for ensuring that content you create using InnerZero does not infringe the intellectual property rights of any third party.
              </p>
            </section>

            {/* Section 15 */}
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                15. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by applicable law, InnerZero is provided &quot;as is&quot; and &quot;as available&quot; without warranty of any kind, whether express, implied, statutory, or otherwise, including but not limited to any implied warranty of merchantability, fitness for a particular purpose, accuracy, reliability, or non-infringement.
              </p>
              <p className="mt-2">
                Summers Solutions Ltd does not warrant that InnerZero will be uninterrupted, error-free, secure, or free of viruses or other harmful components. Summers Solutions Ltd does not warrant that AI-generated output will be accurate, complete, appropriate, or fit for any purpose.
              </p>
              <p className="mt-2">
                To the maximum extent permitted by applicable law, Summers Solutions Ltd shall not be liable for:
              </p>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                <li>Any indirect, incidental, special, consequential, exemplary, or punitive damages of any kind.</li>
                <li>Any loss of profits, revenue, data, business, goodwill, or anticipated savings.</li>
                <li>Any harm or damage arising from reliance on AI-generated output.</li>
                <li>Any damage to your computer hardware, software, operating system, GPU, or data arising from installing, running, or uninstalling InnerZero, including but not limited to data loss, file corruption, system instability, hardware damage, driver conflicts, or overheating.</li>
                <li>Any loss or damage arising from use of Screen Automation, Cloud Mode, BYO API keys, or Unrestricted Mode.</li>
                <li>Any charges, costs, or consequences imposed by third-party AI providers.</li>
              </ul>
              <p className="mt-2">
                You acknowledge that InnerZero runs AI models locally on your hardware, which may place significant load on your CPU, GPU, and memory. You are solely responsible for ensuring your hardware meets the recommended requirements, is adequately maintained, and is operated within safe thermal and electrical limits.
              </p>
              <p className="mt-2">
                In no event shall the total aggregate liability of Summers Solutions Ltd to you for all claims arising from or related to these terms or your use of InnerZero exceed the greater of: (a) the total amount you have paid to Summers Solutions Ltd in the twelve months immediately preceding the claim; or (b) £50.
              </p>
              <p className="mt-2">
                Nothing in these terms shall limit or exclude liability for death or personal injury caused by negligence, fraud or fraudulent misrepresentation, or any other liability that cannot be excluded or limited under applicable law.
              </p>
              <p className="mt-2">
                Nothing in these terms affects your statutory rights under the Consumer Rights Act 2015 or any other applicable consumer protection legislation.
              </p>
            </section>

            {/* Section 16 */}
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                16. Indemnification
              </h2>
              <p>
                You agree to indemnify, defend, and hold harmless Summers Solutions Ltd and its directors, officers, employees, contractors, and agents from and against any and all claims, demands, actions, damages, losses, liabilities, costs, and expenses (including reasonable legal fees and court costs) arising out of or relating to:
              </p>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                <li>Your use of InnerZero in any manner.</li>
                <li>Your use of Unrestricted Mode and any content generated therein.</li>
                <li>Any content you generate, store, distribute, or act upon using InnerZero.</li>
                <li>Your use of Screen Automation, Cloud Mode, or BYO API keys.</li>
                <li>Your violation of these terms or any applicable law or regulation.</li>
                <li>Your violation of any third-party rights, including intellectual property rights, privacy rights, or contractual rights.</li>
                <li>Any misrepresentation you make, including any misrepresentation regarding your age.</li>
              </ul>
              <p className="mt-2">
                This indemnification obligation survives termination of your licence and your use of InnerZero.
              </p>
            </section>

            {/* Section 17 */}
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                17. Termination
              </h2>
              <p>
                Summers Solutions Ltd may suspend or revoke your access to paid services and your licence to use InnerZero at any time if you breach these terms, with or without prior notice, at Summers Solutions Ltd&apos;s sole discretion.
              </p>
              <p className="mt-2">
                The free desktop software installed on your device will continue to function following licence revocation. However, Summers Solutions Ltd reserves the right to pursue civil or criminal remedies for breach of these terms regardless of whether your software access has been revoked.
              </p>
              <p className="mt-2">
                These terms survive termination in all provisions that by their nature should survive, including but not limited to the absolute prohibitions in Section 7, the AI output disclaimer in Section 6, limitation of liability in Section 15, indemnification in Section 16, and intellectual property in Section 14.
              </p>
              <p className="mt-2">
                You may stop using InnerZero at any time by uninstalling the software. You may delete your account at any time from your account dashboard or by contacting{" "}
                <a href="mailto:help@innerzero.com" className="text-accent-gold hover:text-accent-gold-hover transition-colors">help@innerzero.com</a>.
              </p>
            </section>

            {/* Section 18 */}
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                18. Changes to These Terms
              </h2>
              <p>
                Summers Solutions Ltd may update these terms from time to time. The updated version will always be available at innerzero.com/terms with a revised &quot;Last updated&quot; date.
              </p>
              <p className="mt-2">
                For material changes, Summers Solutions Ltd will make reasonable efforts to notify registered users by email or via an in-app notice. Your continued use of InnerZero after changes take effect constitutes your acceptance of the updated terms. If you do not agree to updated terms, you must stop using InnerZero.
              </p>
            </section>

            {/* Section 19 */}
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                19. Severability
              </h2>
              <p>
                If any provision of these terms is found by a court of competent jurisdiction to be invalid, illegal, or unenforceable, that provision shall be modified to the minimum extent necessary to make it enforceable. If modification is not possible, the provision shall be severed. The remaining provisions shall continue in full force and effect and shall not be affected by the invalid, illegal, or unenforceable provision.
              </p>
            </section>

            {/* Section 20 */}
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                20. Entire Agreement
              </h2>
              <p>
                These terms, together with the Privacy Policy available at innerzero.com/privacy, constitute the entire agreement between you and Summers Solutions Ltd with respect to your use of InnerZero. They supersede all prior and contemporaneous agreements, representations, warranties, and understandings, whether written or oral, relating to InnerZero.
              </p>
            </section>

            {/* Section 21 */}
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                21. No Waiver
              </h2>
              <p>
                Failure by Summers Solutions Ltd to enforce any provision of these terms on any occasion shall not constitute a waiver of that provision or any other provision, nor shall it prevent Summers Solutions Ltd from enforcing that provision on any future occasion. Any waiver of any provision of these terms must be in writing and signed by an authorised representative of Summers Solutions Ltd to be effective.
              </p>
            </section>

            {/* Section 22 */}
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                22. Governing Law and Jurisdiction
              </h2>
              <p>
                These terms are governed by and construed in accordance with the laws of England and Wales. You irrevocably submit to the exclusive jurisdiction of the courts of England and Wales to settle any dispute or claim arising out of or in connection with these terms or their subject matter or formation, including non-contractual disputes or claims.
              </p>
            </section>

            {/* Section 23 */}
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                23. Contact
              </h2>
              <p>
                For questions about these terms, to report misuse, or to arrange a Business Licence, contact:{" "}
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
