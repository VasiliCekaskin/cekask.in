import Link from "next/link";
import { Value } from "@/components/LegalPage";
import { legal } from "../legal";

/*
 * English translations of the legal texts in content/de/legal.tsx. The
 * German version is the binding one — keep both in sync when editing.
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

export function ImpressumText() {
  return (
    <>
      <TranslationNote germanPath="/de/impressum" />

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

      <h2>Liability for links</h2>
      <p>
        This website contains links to external third-party websites whose content I have no
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

      <p>
        Protecting your data matters to me. This website works without cookies, tracking, analytics
        tools, contact forms, or advertising. I do not collect or store any personal data through
        this website myself. The following explains which data is still processed technically by
        the hosting provider, and why.
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
        This website is hosted by <Value value={hosting.provider} missing="Hosting provider" />
        {hosting.address && <> ({hosting.address})</>}. When you visit the website, the hosting
        provider processes technically necessary data, in particular:
      </p>
      <ul>
        <li>IP address of the requesting device</li>
        <li>Date and time of access</li>
        <li>Page or file requested</li>
        <li>Referrer URL (the previously visited page)</li>
        <li>Browser and operating system used</li>
      </ul>
      <p>
        This data is processed exclusively by the hosting provider in order to deliver the website
        and protect it against misuse. I do not analyze it or combine it with other data. The legal
        basis is Art. 6(1)(f) GDPR. My legitimate interest lies in delivering the website securely
        and without errors.
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

      <h2>3. Fonts</h2>
      <p>
        All fonts are embedded locally in this website and delivered together with it. No
        connection is made to servers operated by Google or any other font provider.
      </p>

      <h2>4. Contact by email</h2>
      <p>
        If you send me an email, I process the information you provide in order to answer your
        request. The legal basis is Art. 6(1)(b) GDPR where it concerns a possible employment or
        contractual relationship, and Art. 6(1)(f) GDPR otherwise. The data is deleted as soon as it
        is no longer needed and no statutory retention obligations apply.
      </p>

      <h2>5. Links to other websites</h2>
      <p>
        This website links to external services such as GitHub or LinkedIn. Data is only
        transmitted to the respective provider once you click such a link. No third-party content is
        embedded.
      </p>

      <h2>6. Your rights</h2>
      <p>Within the scope of the law, you have the right at any time to:</p>
      <ul>
        <li>access the data stored about you (Art. 15 GDPR)</li>
        <li>rectification of inaccurate data (Art. 16 GDPR)</li>
        <li>erasure (Art. 17 GDPR)</li>
        <li>restriction of processing (Art. 18 GDPR)</li>
        <li>data portability (Art. 20 GDPR)</li>
        <li>object to processing (Art. 21 GDPR)</li>
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
