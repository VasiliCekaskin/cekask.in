import { ConsentSettingsButton } from "@/components/ConsentBanner";
import { Value } from "@/components/LegalPage";
import { legal } from "../legal";

/*
 * Rechtstexte auf Deutsch. Die deutsche Fassung ist maßgeblich; die englische
 * in content/en/legal.tsx ist eine Übersetzung.
 *
 * Sie gelten für alle Websites in `legal.sites` (cekask.in und
 * diywithai.cekask.in). Die Subdomain hat kein eigenes Impressum und keine
 * eigene Datenschutzerklärung, sondern verlinkt hierher.
 */

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
      <p>Dieses Impressum gilt für folgende Websites:</p>
      <SiteList />

      <h2>Angaben gemäß § 5 DDG</h2>
      <address>
        {legal.name}
        <br />
        <Value value={legal.street} missing="Straße und Hausnummer" />
        <br />
        <Value value={legal.postalCodeAndCity} missing="PLZ und Ort" />
        <br />
        Deutschland
      </address>

      <h2>Kontakt</h2>
      <p>
        E-Mail:{" "}
        {legal.email ? (
          <a href={`mailto:${legal.email}`}>{legal.email}</a>
        ) : (
          <Value value={null} missing="E-Mail-Adresse" />
        )}
        {legal.phone && (
          <>
            <br />
            Telefon: {legal.phone}
          </>
        )}
      </p>

      {legal.vatId && (
        <>
          <h2>Umsatzsteuer-ID</h2>
          <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: {legal.vatId}</p>
        </>
      )}

      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <address>
        {legal.name}
        <br />
        <Value value={legal.street} missing="Straße und Hausnummer" />
        <br />
        <Value value={legal.postalCodeAndCity} missing="PLZ und Ort" />
      </address>

      <h2>Hinweis zu den Anleitungen auf diywithai.cekask.in</h2>
      <p>
        Die Anleitungen und Prompts von „DIY with AI“ erstelle ich sorgfältig, kann aber nicht
        garantieren, dass sie in jeder Situation vollständig, aktuell und fehlerfrei sind. Die
        Prompts führen Sie mit Ihrer eigenen KI und in Ihren eigenen Konten aus (zum Beispiel bei
        Anthropic, OpenAI, GitHub, Cloudflare oder einem Domain-Anbieter). Für diese Dienste, ihre
        Bedingungen und Kosten sind die jeweiligen Anbieter verantwortlich. Texte wie ein Impressum
        oder eine Datenschutzerklärung, die Ihre KI für Ihre Website entwirft, sind keine
        Rechtsberatung und sollten von Ihnen geprüft werden.
      </p>

      <h2>Haftung für Links</h2>
      <p>
        Diese Websites enthalten Links zu externen Websites Dritter, auf deren Inhalte ich keinen
        Einfluss habe. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder
        Betreiber verantwortlich. Bei Bekanntwerden von Rechtsverletzungen werde ich derartige Links
        umgehend entfernen.
      </p>
    </>
  );
}

export function DatenschutzText() {
  const { hosting } = legal;

  return (
    <>
      <p>
        Der Schutz Ihrer Daten ist mir wichtig. Diese Datenschutzerklärung gilt für folgende
        Websites:
      </p>
      <SiteList />
      <p>
        Beide Websites setzen keine Cookies und kommen ohne Tracking, Analyse-Tools,
        Kontaktformulare und Werbung aus. Ich selbst erhebe über diese Websites keine
        personenbezogenen Daten. Im Folgenden steht, welche Daten beim Hosting technisch anfallen,
        was in Ihrem Browser gespeichert wird und warum.
      </p>

      <h2>1. Verantwortlicher</h2>
      <address>
        {legal.name}
        <br />
        <Value value={legal.street} missing="Straße und Hausnummer" />
        <br />
        <Value value={legal.postalCodeAndCity} missing="PLZ und Ort" />
        <br />
        E-Mail: <Value value={legal.email} missing="E-Mail-Adresse" />
      </address>

      <h2>2. Hosting und Server-Logfiles</h2>
      <p>
        Beide Websites werden bei <Value value={hosting.provider} missing="Hosting-Anbieter" />
        {hosting.address && <> ({hosting.address})</>} gehostet. Beim Aufruf einer Seite verarbeitet
        der Hosting-Anbieter technisch notwendige Daten, insbesondere:
      </p>
      <ul>
        <li>IP-Adresse des anfragenden Geräts</li>
        <li>Datum und Uhrzeit des Zugriffs</li>
        <li>aufgerufene Seite bzw. Datei</li>
        <li>Referrer-URL (die zuvor besuchte Seite)</li>
        <li>verwendeter Browser und Betriebssystem</li>
      </ul>
      <p>
        Diese Daten werden ausschließlich vom Hosting-Anbieter verarbeitet, um die Websites
        auszuliefern und vor Missbrauch zu schützen. Ich werte sie nicht aus und führe sie nicht mit
        anderen Daten zusammen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Mein berechtigtes
        Interesse liegt in der sicheren und fehlerfreien Auslieferung der Websites.
      </p>
      <p>
        Dabei kann eine Übermittlung personenbezogener Daten in die USA stattfinden. Diese stützt
        sich auf den Angemessenheitsbeschluss der EU-Kommission zum EU-US Data Privacy Framework
        sowie ergänzend auf die EU-Standardvertragsklauseln. Die Speicherdauer der Logdaten richtet
        sich nach den Vorgaben des Hosting-Anbieters.
        {hosting.privacyPolicyUrl && (
          <>
            {" "}
            Weitere Informationen finden Sie in der{" "}
            <a href={hosting.privacyPolicyUrl} target="_blank" rel="noopener noreferrer">
              Datenschutzerklärung des Hosting-Anbieters
            </a>
            .
          </>
        )}
      </p>

      <h2>3. Speicherung in Ihrem Browser (Cookie-Einstellungen)</h2>
      <p>
        Cookies werden nicht gesetzt. Einige Angaben speichern die Websites aber im lokalen Speicher
        Ihres Browsers (localStorage). Diese Daten bleiben auf Ihrem Gerät und werden weder an mich
        noch an Dritte übertragen. Sie können sie jederzeit löschen, indem Sie die Websitedaten in
        Ihrem Browser löschen.
      </p>
      <p>
        <strong>Ihre Auswahl im Cookie-Hinweis (cekask.in).</strong> Damit der Hinweis nicht bei
        jedem Besuch erscheint, wird Ihre Entscheidung samt Zeitpunkt gespeichert. Das ist
        unbedingt erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG). Rechtsgrundlage ist Art. 6 Abs. 1 lit. c
        DSGVO in Verbindung mit Art. 7 Abs. 1 DSGVO (Nachweis der Einwilligung).
      </p>
      <p>
        <strong>Spielstände (cekask.in), nur mit Einwilligung.</strong> Wenn Sie zustimmen, merkt
        sich die Website Ihren Bestwert im Minispiel „Whack-a-Vasili“ und die im Büro gefundenen
        Easter Eggs. Ohne Einwilligung bleiben diese Werte nur bis zum Schließen der Seite erhalten.
        Rechtsgrundlage ist Ihre Einwilligung (§ 25 Abs. 1 TDDDG, Art. 6 Abs. 1 lit. a DSGVO). Sie
        können sie jederzeit mit Wirkung für die Zukunft widerrufen; die gespeicherten Spielstände
        werden dann gelöscht: <ConsentSettingsButton label="Cookie-Einstellungen öffnen" />
      </p>
      <p>
        <strong>Fortschritt in den Anleitungen (diywithai.cekask.in).</strong> Damit Sie eine
        Anleitung später fortsetzen können, speichert die Website je Anleitung Ihre Antworten zum
        Start (z. B. welcher Computer, welche KI, ob sie schon installiert ist, ob Sie eine Domain
        haben, womit Ihre Website gebaut ist) und welche Schritte Sie erledigt haben. Die
        Google-Anleitung übernimmt dabei Ihre Antworten aus der Website-Anleitung, damit Sie sie
        nicht zweimal eingeben müssen. Das ist für die von Ihnen genutzte Funktion erforderlich (§ 25
        Abs. 2 Nr. 2 TDDDG). Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Über „Neu anfangen“ in
        der Anleitung löschen Sie diese Angaben jederzeit. Angaben zu Ihrem Unternehmen geben Sie auf
        dieser Website nicht ein; die Prompts werden nur in Ihre Zwischenablage kopiert.
      </p>

      <h2>4. Schriftarten</h2>
      <p>
        Alle Schriftarten sind lokal eingebunden oder werden von Ihrem Gerät bereitgestellt. Es
        findet keine Verbindung zu Servern von Google oder anderen Schriftanbietern statt.
      </p>

      <h2>5. Kontakt per E-Mail</h2>
      <p>
        Wenn Sie mir eine E-Mail schreiben, verarbeite ich Ihre Angaben, um Ihre Anfrage zu
        beantworten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, sofern es um ein mögliches
        Arbeits- oder Vertragsverhältnis geht, und ansonsten Art. 6 Abs. 1 lit. f DSGVO. Die Daten
        werden gelöscht, sobald sie nicht mehr benötigt werden und keine gesetzlichen
        Aufbewahrungspflichten bestehen.
      </p>

      <h2>6. KI-Dienste und Konten bei „DIY with AI“</h2>
      <p>
        Die Anleitungen auf diywithai.cekask.in erklären, wie Sie mit Ihrer eigenen KI (zum Beispiel
        Claude Code von Anthropic oder Codex von OpenAI) Aufgaben erledigen, etwa eine Website bauen,
        und dafür Konten bei Diensten wie GitHub, Cloudflare, Google (Search Console, Unternehmensprofil) oder einem Domain-Anbieter nutzen. Diese Website verbindet
        sich mit keinem dieser Dienste und erhält keine Daten von ihnen. Was Sie in Ihre KI eingeben
        und welche Konten Sie anlegen, verarbeiten die jeweiligen Anbieter in eigener Verantwortung
        nach ihren eigenen Datenschutzbestimmungen. Ich habe keinen Zugriff auf diese Konten.
      </p>

      <h2>7. Links zu anderen Websites</h2>
      <p>
        Die Websites verlinken auf externe Angebote, zum Beispiel GitHub, LinkedIn, Anthropic,
        OpenAI, Cloudflare und den Chrome Web Store. Daten werden erst dann an den jeweiligen
        Anbieter übertragen, wenn Sie einen Link anklicken. Es sind keine Inhalte Dritter
        eingebettet.
      </p>

      <h2>8. Ihre Rechte</h2>
      <p>Sie haben im Rahmen der gesetzlichen Vorgaben jederzeit das Recht auf:</p>
      <ul>
        <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
        <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
        <li>Löschung (Art. 17 DSGVO)</li>
        <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
        <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
        <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
        <li>Widerruf einer Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)</li>
      </ul>
      <p>
        Außerdem können Sie sich bei einer Datenschutz-Aufsichtsbehörde beschweren (Art. 77 DSGVO),
        zum Beispiel bei der{" "}
        <a href={legal.supervisoryAuthority.url} target="_blank" rel="noopener noreferrer">
          {legal.supervisoryAuthority.name}
        </a>
        .
      </p>

      <p>
        Stand: <Value value={legal.lastUpdated} missing="Datum" />
      </p>
    </>
  );
}
