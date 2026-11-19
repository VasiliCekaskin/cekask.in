import Link from "next/link";
import { ConsentSettingsButton } from "@/components/ConsentBanner";
import { Value } from "@/components/LegalPage";
import { legal } from "../legal";

/*
 * English translations of the legal texts in content/de/legal.tsx. The
 * German version is the binding one — keep both in sync when editing.
 * They cover every site in `legal.sites` (cekask.in and diywithai.cekask.in).
 */

function TranslationNote({ germanPath }: { germanPath: string }) {
  return (
    <p>
      <em>
        This is an English translation provided for convenience. Only the{" "}
        <Link href={germanPath} hrefLang="de">
          German version
        </Link>{" "}
        is legally binding.
      </em>
    </p>
  );
}

function SiteList() {
  return (
    <ul>
      {legal.sites.map((site) => (
        <li key={site.domain}>
          <a href={site.url}>{site.domain}</a> ({site.name})
        </li>
      ))}
    </ul>
  );
}

export function ImpressumText() {
  return (
    <>
      <TranslationNote germanPath="/de/impressum" />

      <p>This legal notice applies to the following websites:</p>
      <SiteList />

      <h2>Information pursuant to § 5 DDG (German Digital Services Act)</h2>
      <address>
        {legal.name}
        <br />
        <Value value={legal.street} missing="Street and number" />
        <br />
        <Value value={legal.postalCodeAndCity} missing="Postal code and city" />
        <br />
        Germany
      </address>

      <h2>Contact</h2>
      <p>
        Email:{" "}
        {legal.email ? (
          <a href={`mailto:${legal.email}`}>{legal.email}</a>
        ) : (
          <Value value={null} missing="Email address" />
        )}
        {legal.phone && (
          <>
            <br />
            Phone: {legal.phone}
          </>
        )}
      </p>

      {legal.vatId && (
        <>
          <h2>VAT ID</h2>
          <p>VAT identification number pursuant to § 27a UStG: {legal.vatId}</p>
        </>
      )}

      <h2>Responsible for content pursuant to § 18(2) MStV (German Interstate Media Treaty)</h2>
      <address>
        {legal.name}
        <br />
        <Value value={legal.street} missing="Street and number" />
        <br />
        <Value value={legal.postalCodeAndCity} missing="Postal code and city" />
      </address>

      <h2>Note on the guides at diywithai.cekask.in</h2>
      <p>
        I write the guides and prompts of “DIY with AI” carefully, but I cannot guarantee that they
        are complete, up to date and error-free in every situation. You run the prompts with your
        own AI and in your own accounts (for example at Anthropic, OpenAI, GitHub, Cloudflare or a
        domain provider). Those providers are responsible for their services, terms and costs.
        Texts such as a legal notice or privacy policy that your AI drafts for your website are not
        legal advice and should be checked by you.
      </p>

      <h2>Liability for links</h2>
      <p>
        These websites contain links to external third-party websites whose content I have no
        influence over. The respective provider or operator is always responsible for the content
        of linked pages. If I become aware of any legal violations, I will remove such links
        immediately.
      </p>
    </>
  );
}

export function DatenschutzText() {
  const { hosting } = legal;

  return (
    <>
      <TranslationNote germanPath="/de/datenschutz" />

      <p>Protecting your data matters to me. This privacy policy applies to the following websites:</p>
      <SiteList />
      <p>
        Neither website sets cookies, and both work without tracking, analytics tools, contact forms
        or advertising. I do not collect any personal data through these websites myself. The
        following explains which data is processed technically by the hosting provider, what is
        stored in your browser, and why.
      </p>

      <h2>1. Controller</h2>
      <address>
        {legal.name}
        <br />
        <Value value={legal.street} missing="Street and number" />
        <br />
        <Value value={legal.postalCodeAndCity} missing="Postal code and city" />
        <br />
        Email: <Value value={legal.email} missing="Email address" />
      </address>

      <h2>2. Hosting and server log files</h2>
      <p>
        Both websites are hosted by <Value value={hosting.provider} missing="Hosting provider" />
        {hosting.address && <> ({hosting.address})</>}. When you open a page, the hosting provider
        processes technically necessary data, in particular:
      </p>
      <ul>
        <li>IP address of the requesting device</li>
        <li>Date and time of access</li>
        <li>Page or file requested</li>
        <li>Referrer URL (the previously visited page)</li>
        <li>Browser and operating system used</li>
      </ul>
      <p>
        This data is processed exclusively by the hosting provider in order to deliver the websites
        and protect them against misuse. I do not analyze it or combine it with other data. The
        legal basis is Art. 6(1)(f) GDPR. My legitimate interest lies in delivering the websites
        securely and without errors.
      </p>
      <p>
        Personal data may be transferred to the USA in the process. This transfer is based on the
        European Commission&apos;s adequacy decision for the EU-US Data Privacy Framework and,
        additionally, on the EU Standard Contractual Clauses. How long log data is retained is
        determined by the hosting provider.
        {hosting.privacyPolicyUrl && (
          <>
            {" "}
            For more information, see the{" "}
            <a href={hosting.privacyPolicyUrl} target="_blank" rel="noopener noreferrer">
              hosting provider&apos;s privacy policy
            </a>
            .
          </>
        )}
      </p>

      <h2>3. Storage in your browser (cookie settings)</h2>
      <p>
        No cookies are set. Some information is, however, stored in your browser&apos;s local storage
        (localStorage). This data stays on your device and is not sent to me or to anyone else. You
        can delete it at any time by clearing the site data in your browser.
      </p>
      <p>
        <strong>Your choice in the cookie notice (cekask.in).</strong> So the notice doesn&apos;t
        appear on every visit, your decision and its time are stored. This is strictly necessary
        (§ 25(2) no. 2 TDDDG). The legal basis is Art. 6(1)(c) GDPR in conjunction with Art. 7(1)
        GDPR (proof of consent).
      </p>
      <p>
        <strong>Game progress (cekask.in), only with consent.</strong> If you agree, the website
        remembers your best score in the “Whack-a-Vasili” mini game and the easter eggs found in the
        office. Without consent, these values are only kept until you close the page. The legal
        basis is your consent (§ 25(1) TDDDG, Art. 6(1)(a) GDPR). You can withdraw it at any time
        with effect for the future; the stored progress is then deleted:{" "}
        <ConsentSettingsButton label="Open cookie settings" />
      </p>
      <p>
        <strong>Progress in the guide (diywithai.cekask.in).</strong> So you can continue the guide
        later, the website stores your start answers (which computer, which AI, whether it&apos;s
        installed, whether you have a domain) and which steps you have completed. This is necessary
        for the function you are using (§ 25(2) no. 2 TDDDG). The legal basis is Art. 6(1)(f) GDPR.
        You can delete this information at any time with “Start over” in the guide. You don&apos;t
        enter any details about your business on this website; prompts are only copied to your
        clipboard.
      </p>

      <h2>4. Fonts</h2>
      <p>
        All fonts are embedded locally or provided by your device. No connection is made to servers
        operated by Google or any other font provider.
      </p>

      <h2>5. Contact by email</h2>
      <p>
        If you send me an email, I process the information you provide in order to answer your
        request. The legal basis is Art. 6(1)(b) GDPR where it concerns a possible employment or
        contractual relationship, and Art. 6(1)(f) GDPR otherwise. The data is deleted as soon as it
        is no longer needed and no statutory retention obligations apply.
      </p>

      <h2>6. AI services and accounts with “DIY with AI”</h2>
      <p>
        The guides at diywithai.cekask.in explain how to get tasks done with your own AI (for
        example Claude Code by Anthropic or Codex by OpenAI), such as building a website, and how to
        use accounts with services such as GitHub, Cloudflare or a domain provider for it. This website does not connect to any
        of these services and receives no data from them. Whatever you enter into your AI and
        whichever accounts you create are processed by the respective providers under their own
        responsibility and privacy policies. I have no access to these accounts.
      </p>

      <h2>7. Links to other websites</h2>
      <p>
        The websites link to external services, for example GitHub, LinkedIn, Anthropic, OpenAI,
        Cloudflare and the Chrome Web Store. Data is only transmitted to the respective provider
        once you click such a link. No third-party content is embedded.
      </p>

      <h2>8. Your rights</h2>
      <p>Within the scope of the law, you have the right at any time to:</p>
      <ul>
        <li>access the data stored about you (Art. 15 GDPR)</li>
        <li>rectification of inaccurate data (Art. 16 GDPR)</li>
        <li>erasure (Art. 17 GDPR)</li>
        <li>restriction of processing (Art. 18 GDPR)</li>
        <li>data portability (Art. 20 GDPR)</li>
        <li>object to processing (Art. 21 GDPR)</li>
        <li>withdraw consent with effect for the future (Art. 7(3) GDPR)</li>
      </ul>
      <p>
        You also have the right to lodge a complaint with a data protection supervisory authority
        (Art. 77 GDPR), for example the{" "}
        <a href={legal.supervisoryAuthority.url} target="_blank" rel="noopener noreferrer">
          {legal.supervisoryAuthority.name}
        </a>{" "}
        (State Commissioner for Data Protection and Freedom of Information of North
        Rhine-Westphalia).
      </p>

      <p>
        Last updated: <Value value={legal.lastUpdated} missing="Date" />
      </p>
    </>
  );
}
