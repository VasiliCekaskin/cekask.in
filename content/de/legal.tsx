import { Value } from "@/components/LegalPage";
import { legal } from "../legal";

/*
 * Rechtstexte auf Deutsch. Die deutsche Fassung ist maßgeblich; die englische
 * in content/en/legal.tsx ist eine Übersetzung.
 */

export function ImpressumText() {
  return (
    <>
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

      <h2>Haftung für Links</h2>
      <p>
        Diese Website enthält Links zu externen Websites Dritter, auf deren Inhalte ich keinen
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
        Der Schutz Ihrer Daten ist mir wichtig. Diese Website kommt ohne Cookies, Tracking,
        Analyse-Tools, Kontaktformulare und Werbung aus. Ich selbst erhebe und speichere über diese
        Website keine personenbezogenen Daten. Im Folgenden steht, welche Daten beim Hosting
        dennoch technisch anfallen und warum.
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
        Diese Website wird bei <Value value={hosting.provider} missing="Hosting-Anbieter" />
        {hosting.address && <> ({hosting.address})</>} gehostet. Beim Aufruf der Website verarbeitet
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
        Diese Daten werden ausschließlich vom Hosting-Anbieter verarbeitet, um die Website
        auszuliefern und vor Missbrauch zu schützen. Ich werte sie nicht aus und führe sie nicht mit
        anderen Daten zusammen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Mein berechtigtes
        Interesse liegt in der sicheren und fehlerfreien Auslieferung der Website.
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

      <h2>3. Schriftarten</h2>
      <p>
        Alle Schriftarten sind lokal in diese Website eingebunden und werden zusammen mit ihr
        ausgeliefert. Es findet keine Verbindung zu Servern von Google oder anderen Schriftanbietern
        statt.
      </p>

      <h2>4. Kontakt per E-Mail</h2>
      <p>
        Wenn Sie mir eine E-Mail schreiben, verarbeite ich Ihre Angaben, um Ihre Anfrage zu
        beantworten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, sofern es um ein mögliches
        Arbeits- oder Vertragsverhältnis geht, und ansonsten Art. 6 Abs. 1 lit. f DSGVO. Die Daten
        werden gelöscht, sobald sie nicht mehr benötigt werden und keine gesetzlichen
        Aufbewahrungspflichten bestehen.
      </p>

      <h2>5. Links zu anderen Websites</h2>
      <p>
        Diese Website verlinkt auf externe Angebote wie GitHub oder LinkedIn. Dabei werden erst dann
        Daten an den jeweiligen Anbieter übertragen, wenn Sie einen Link anklicken. Es sind keine
        Inhalte Dritter eingebettet.
      </p>

      <h2>6. Ihre Rechte</h2>
      <p>Sie haben im Rahmen der gesetzlichen Vorgaben jederzeit das Recht auf:</p>
      <ul>
        <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
        <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
        <li>Löschung (Art. 17 DSGVO)</li>
        <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
        <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
        <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
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
