import { Link } from 'react-router-dom'
import './styles/legal.css'

function Privacy() {
  return (
    <div className="legal-page">
      <header className="legal-nav">
        <Link to="/" className="legal-home">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H4C3.45 21 3 20.55 3 20V10.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
            <path d="M9 21V14H15V21" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
          </svg>
          Back to home
        </Link>
        <Link to="/" className="legal-brand">
          <span className="brand-biashara">Biashara</span>
          <span className="brand-pulse">Pulse</span>
        </Link>
      </header>

      <main className="legal-main">
        <div className="legal-heading">
          <span className="legal-eyebrow">LEGAL / PRIVACY</span>
          <h1>Privacy Policy</h1>
          <p>
            How Biashara Pulse collects, uses, stores, and protects
            information when you use our business management platform.
          </p>
          <span className="legal-updated">Effective date: 12 October 2026</span>
        </div>

        <div className="legal-content">
          <section>
            <h2>01. Introduction</h2>
            <p>
              Your privacy matters. This Privacy Policy explains how
              Biashara Pulse handles personal information and business
              information in connection with our website, application,
              and related services.
            </p>
            <p>
              We aim to handle personal data lawfully, fairly, transparently,
              and only for legitimate purposes, in accordance with
              applicable data protection laws, including Kenya's
              Data Protection Act, 2019.
            </p>
          </section>

          <section>
            <h2>02. Information we collect</h2>
            <p>The information we process may include:</p>
            <ul>
              <li>
                <strong>Account information:</strong> first name, last name,
                email address, business name, and account credentials.
              </li>
              <li>
                <strong>Business records:</strong> products, stock quantities,
                prices, costs, sales, orders, expenses, and transaction
                records you enter into the platform.
              </li>
              <li>
                <strong>Usage and technical information:</strong> information
                such as browser details, device information, access logs,
                and diagnostic data where collected by the application or
                its hosting services.
              </li>
              <li>
                <strong>Support communications:</strong> information you
                provide when contacting us for help.
              </li>
              <li>
                <strong>Subscription information:</strong> plan and billing
                status and related records where paid plans are available.
                Payment details may be handled by a payment provider if
                one is used.
              </li>
            </ul>
            <p>
              The specific information collected depends on the features
              you use and how the application is configured.
            </p>
          </section>

          <section>
            <h2>03. How we use information</h2>
            <p>We may use information to:</p>
            <ul>
              <li>Create and administer your account.</li>
              <li>Provide inventory, sales, expense, order, and reporting features.</li>
              <li>Calculate business metrics from the records you enter.</li>
              <li>Send operational messages and reports you request or that are necessary to provide the service.</li>
              <li>Respond to support requests and troubleshoot technical issues.</li>
              <li>Maintain platform security, prevent misuse, and investigate suspicious activity.</li>
              <li>Manage subscriptions and payments where applicable.</li>
              <li>Meet legal obligations and protect our legitimate rights.</li>
            </ul>
          </section>

          <section>
            <h2>04. How we handle business records</h2>
            <p>
              Biashara Pulse processes business records so that you can
              manage your operations and understand business performance.
              This may include sales, expenses, inventory, product
              performance, and order history.
            </p>
            <p>
              We do not sell your personal information to advertisers.
              We do not use your business records for unrelated purposes
              unless permitted by applicable law or otherwise appropriately
              authorised.
            </p>
            <p>
              You are responsible for ensuring that you have a lawful basis
              and any required permissions to enter personal information
              about your customers, employees, suppliers, or other people.
            </p>
          </section>

          <section>
            <h2>05. Legal basis for processing</h2>
            <p>
              Where required by applicable law, we process personal data
              on an appropriate legal basis. Depending on the circumstances,
              this may include performing our agreement with you, complying
              with legal obligations, pursuing legitimate interests that
              do not override your rights, or obtaining consent where
              consent is required.
            </p>
            <p>
              Where processing relies on consent, you may withdraw that
              consent, subject to applicable law. Withdrawal does not
              invalidate processing that lawfully occurred before it.
            </p>
          </section>

          <section>
            <h2>06. Sharing information</h2>
            <p>
              We may share information only where reasonably necessary
              for purposes such as:
            </p>
            <ul>
              <li>
                <strong>Service providers:</strong> hosting, infrastructure,
                email delivery, security, analytics, and other providers
                used to operate the platform.
              </li>
              <li>
                <strong>Your instructions:</strong> where you request a
                report, export, or other action that involves sharing
                information.
              </li>
              <li>
                <strong>Legal requirements:</strong> where disclosure is
                required by law or a valid legal process.
              </li>
              <li>
                <strong>Security and rights:</strong> where necessary to
                investigate abuse, protect users, or safeguard legal rights.
              </li>
            </ul>
            <p>
              Service providers should receive only the information
              reasonably necessary for their assigned purpose and should
              be subject to appropriate obligations where required by law.
            </p>
          </section>

          <section>
            <h2>07. Data security</h2>
            <p>
              We aim to use appropriate technical and organisational
              measures to protect information against unauthorised access,
              loss, alteration, and disclosure.
            </p>
            <p>
              No online service or method of electronic storage can be
              guaranteed completely secure. You should use a strong,
              unique password, protect your devices, and avoid sharing
              your login credentials.
            </p>
          </section>

          <section>
            <h2>08. Data retention and deletion</h2>
            <p>
              We retain information for as long as reasonably necessary
              to provide the service, maintain business and security
              records, resolve disputes, and comply with applicable legal
              obligations.
            </p>
            <p>
              When information is no longer required, we aim to delete
              it or otherwise handle it in accordance with applicable
              law. Some information may need to be retained for a lawful
              reason or remain temporarily in backups before being
              removed through the applicable retention process.
            </p>
            <p>
              You may contact us to request account closure or ask about
              the deletion of your information, subject to applicable
              legal requirements and any valid grounds for retention.
            </p>
          </section>

          <section>
            <h2>09. Your privacy rights</h2>
            <p>
              Subject to applicable law, you may have the right to:
            </p>
            <ul>
              <li>Be informed about how your personal data is used.</li>
              <li>Request access to your personal data.</li>
              <li>Request correction of inaccurate or misleading information.</li>
              <li>Request deletion of personal data where legally applicable.</li>
              <li>Object to certain processing or request restriction where applicable.</li>
              <li>Withdraw consent where processing is based on consent.</li>
              <li>Raise a complaint with the relevant data protection authority.</li>
            </ul>
            <p>
              To exercise a right, contact us through our official contact
              channel. We may need to verify your identity before acting
              on a request.
            </p>
          </section>

          <section>
            <h2>10. Cookies and technical data</h2>
            <p>
              The website or application may use essential browser storage,
              cookies, or similar technologies to support functions such
              as authentication, security, and user preferences.
            </p>
            <p>
              Any non-essential analytics or tracking technologies should
              be disclosed and managed in accordance with applicable
              consent requirements. You can also manage cookies through
              your browser settings, although disabling certain technologies
              may affect how the service works.
            </p>
          </section>

          <section>
            <h2>11. International processing</h2>
            <p>
              Some infrastructure or service providers may process
              information outside Kenya. Where personal data is transferred
              across borders, we will take the measures required by
              applicable data protection law, including any necessary
              safeguards or authorisation.
            </p>
          </section>

          <section>
            <h2>12. Children's information</h2>
            <p>
              Biashara Pulse is designed for business use and is not
              intended to be used by children to create business accounts
              without appropriate authority. If you believe personal
              information has been submitted inappropriately, contact
              us so that we can assess the request and take any action
              required by law.
            </p>
          </section>

          <section>
            <h2>13. Changes to this policy</h2>
            <p>
              We may update this Privacy Policy as our services,
              data-handling practices, or legal obligations change.
              The revised version will be published on this page with
              an updated effective date. Where required, we will provide
              additional notice or obtain consent.
            </p>
          </section>

          <section>
            <h2>14. Contact and complaints</h2>
            <p>
              For privacy questions, access requests, correction requests,
              or deletion requests, contact the Biashara Pulse team
              through the official contact channel published on our website.
            </p>
            <p>
              You may also contact Kenya's Office of the Data Protection
              Commissioner if you believe your personal data rights
              have been violated.
            </p>
            <a
              className="legal-external-link"
              href="https://www.odpc.go.ke/"
              target="_blank"
              rel="noreferrer"
            >
              Office of the Data Protection Commissioner
              <span aria-hidden="true"> ↗</span>
            </a>
          </section>
        </div>

        <div className="legal-bottom">
          <span>Biashara Pulse</span>
          <div>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/">Home</Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Privacy