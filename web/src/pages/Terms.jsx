import { Link } from 'react-router-dom'
import './styles/legal.css'

function Terms() {
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
          <span className="legal-eyebrow">LEGAL / TERMS</span>
          <h1>Terms of Service</h1>
          <p>
            The terms governing your use of Biashara Pulse and the tools
            we provide to help you manage your business.
          </p>
          <span className="legal-updated">Effective date: 12 October 2026</span>
        </div>

        <div className="legal-content">
          <section>
            <h2>01. Introduction</h2>
            <p>
              Welcome to Biashara Pulse. These Terms of Service govern your
              access to and use of the Biashara Pulse website, application,
              and related services.
            </p>
            <p>
              By creating an account or using our services, you agree to
              these terms. If you do not agree, you should not use the
              service.
            </p>
          </section>

          <section>
            <h2>02. About the service</h2>
            <p>
              Biashara Pulse is a business management platform designed
              primarily for small and medium-sized businesses. Depending
              on your plan, features may include:
            </p>
            <ul>
              <li>Product and inventory management.</li>
              <li>Sales, orders, and expense recording.</li>
              <li>Point-of-sale tools and QR code scanning.</li>
              <li>Stock movement and low-stock monitoring.</li>
              <li>Sales, product performance, and profit insights.</li>
              <li>Email reports and multi-branch management.</li>
            </ul>
            <p>
              Available features, usage limits, and account capacity depend
              on your subscription plan and may change as the service evolves.
            </p>
          </section>

          <section>
            <h2>03. Account registration</h2>
            <p>
              You must provide accurate information when creating an account
              and keep your account details reasonably up to date.
            </p>
            <p>You are responsible for:</p>
            <ul>
              <li>Maintaining the confidentiality of your login credentials.</li>
              <li>Activities performed through your account.</li>
              <li>Restricting unauthorised access to your devices and account.</li>
              <li>Notifying us if you suspect your account has been compromised.</li>
            </ul>
            <p>
              Do not impersonate another person, create accounts using
              misleading information, or access another business's records
              without authorisation.
            </p>
          </section>

          <section>
            <h2>04. Your business records</h2>
            <p>
              You remain responsible for the accuracy and legality of the
              information you enter into Biashara Pulse, including product
              details, stock quantities, sales, expenses, prices, and other
              business records.
            </p>
            <p>
              The reports and calculations provided by the platform depend
              on the information recorded in your account. Incorrect,
              incomplete, or delayed entries may affect the results.
            </p>
            <p>
              Biashara Pulse provides management and reporting tools. Its
              calculations and reports are not a substitute for independent
              accounting, tax, legal, or financial advice.
            </p>
          </section>

          <section>
            <h2>05. Acceptable use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the service for unlawful or fraudulent activities.</li>
              <li>Attempt to access other users' accounts or business data.</li>
              <li>Interfere with the operation, security, or availability of the platform.</li>
              <li>Introduce malicious software or exploit system vulnerabilities.</li>
              <li>Copy, resell, or misuse the service in ways that violate applicable law or our rights.</li>
              <li>Use the platform to upload information you have no right to use.</li>
            </ul>
          </section>

          <section>
            <h2>06. Free and paid plans</h2>
            <p>
              Biashara Pulse may offer a free plan and paid subscription
              plans. Each plan may have different limits, features, branch
              allowances, user allowances, and reporting capabilities.
            </p>
            <p>
              The applicable plan description will explain its published
              limits. If you exceed a limit, certain activities or features
              may become unavailable until you reduce usage or upgrade,
              where an upgrade is offered.
            </p>
            <p>
              Paid plan prices, billing periods, applicable taxes, payment
              methods, and renewal terms will be presented when a purchase
              is offered. Any changes to subscription prices will be
              communicated as required by applicable law.
            </p>
          </section>

          <section>
            <h2>07. Payments and cancellations</h2>
            <p>
              Where paid subscriptions are available, you agree to pay the
              charges shown at the time of purchase. Any applicable
              cancellation, renewal, refund, and payment-failure rules
              will be communicated through the relevant subscription or
              checkout process.
            </p>
            <p>
              Nothing in these terms removes consumer rights that cannot
              lawfully be excluded or restricted.
            </p>
          </section>

          <section>
            <h2>08. Your data and privacy</h2>
            <p>
              Your business information remains yours. You authorise
              Biashara Pulse to process the information you submit only
              as reasonably necessary to provide, maintain, secure, and
              improve the service, in accordance with our Privacy Policy
              and applicable law.
            </p>
            <p>
              Our handling of personal information is explained in our
              <Link to="/privacy"> Privacy Policy</Link>.
            </p>
            <p>
              You are responsible for ensuring you have the appropriate
              authority to enter personal information about employees,
              customers, suppliers, or other individuals into the platform.
            </p>
          </section>

          <section>
            <h2>09. Service availability</h2>
            <p>
              We aim to keep Biashara Pulse useful and available, but we
              cannot guarantee uninterrupted access at all times. Access
              may be affected by maintenance, technical failures, internet
              connectivity, third-party services, or circumstances outside
              our reasonable control.
            </p>
            <p>
              Features may be updated, changed, suspended, or discontinued
              as the product develops. Where appropriate, we will endeavour
              to communicate material changes in advance.
            </p>
          </section>

          <section>
            <h2>10. Suspension and account closure</h2>
            <p>
              We may restrict or suspend access where reasonably necessary
              to address suspected fraud, security threats, unlawful
              activity, serious violations of these terms, or risks to
              other users or the service.
            </p>
            <p>
              You may stop using the service and request account closure
              through the support channel we make available. Account
              closure and deletion of associated information are subject
              to applicable legal obligations, legitimate retention
              requirements, and our Privacy Policy.
            </p>
          </section>

          <section>
            <h2>11. Intellectual property</h2>
            <p>
              The Biashara Pulse name, branding, interface, software,
              and other original platform materials are owned by or
              licensed to their respective rights holders and are
              protected by applicable intellectual property laws.
            </p>
            <p>
              These terms grant you permission to use the service for
              its intended purpose. They do not transfer ownership of
              the platform or its intellectual property to you.
            </p>
          </section>

          <section>
            <h2>12. Disclaimers and liability</h2>
            <p>
              To the extent permitted by applicable law, Biashara Pulse
              is provided on an as-available basis. We do not guarantee
              that the platform will be error-free, that every calculation
              will reflect incomplete or incorrect entries accurately,
              or that using the service will produce a particular
              business outcome.
            </p>
            <p>
              You should maintain appropriate records and backups of
              important business information. Nothing in these terms
              excludes liability or rights that cannot lawfully be
              excluded or limited.
            </p>
          </section>

          <section>
            <h2>13. Changes to these terms</h2>
            <p>
              We may update these terms to reflect changes to the service,
              business operations, or applicable law. We will update the
              effective date when revisions are made and provide additional
              notice where required.
            </p>
              Continued use after revised terms take effect will be
              subject to applicable law and any consent requirements.
          </section>

          <section>
            <h2>14. Governing law</h2>
            <p>
              These terms are intended to operate consistently with the
              laws of Kenya and other applicable laws. Any dispute will
              be handled by the courts or other dispute-resolution
              mechanisms with appropriate jurisdiction.
            </p>
          </section>

          <section>
            <h2>15. Contact</h2>
            <p>
              If you have questions about these terms, contact the
              Biashara Pulse team through the official contact channel
              published on our website.
            </p>
          </section>
        </div>

        <div className="legal-bottom">
          <span>Biashara Pulse</span>
          <div>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/">Home</Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Terms