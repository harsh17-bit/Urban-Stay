/**
 * @file RentalAgreement.jsx
 * @description A 3-step wizard modal that generates a printable rental agreement
 *  @prop {Object} property – full property object from PropertyDetails state
 *  @prop {Object} user     – logged-in user object from AuthContext
 *  @prop {Function} onClose – callback to unmount the modal
 */

import { useState, useRef } from "react";
import {
  FiX,
  FiPrinter,
  FiFileText,
  FiCheckCircle,
  FiChevronRight,
  FiChevronLeft,
} from "react-icons/fi";
import "./RentalAgreement.css";
const TEMPLATES = [
  {
    id: "standard",
    name: "Standard Residential",
    tag: "Basic",
    description:
      "A concise, legally-sound agreement ideal for individual tenants renting apartments, flats, or houses.",
    features: [
      "Basic clauses",
      "Maintenance terms",
      "Utility responsibilities",
      "Termination policy",
    ],
  },
  {
    id: "premium",
    name: "Premium Residential",
    tag: "Recommended",
    description:
      "A comprehensive agreement with detailed clauses covering sub-letting, pets, alterations, and dispute resolution.",
    features: [
      "All Standard clauses",
      "Pet & sub-letting policy",
      "Interior alteration terms",
      "Dispute resolution clause",
      "Force majeure clause",
    ],
  },
  {
    id: "commercial",
    name: "Corporate / Commercial",
    tag: "Commercial",
    description:
      "Designed for offices, shops, and commercial spaces. Includes GST details, business use clauses, and signage rights.",
    features: [
      "Commercial use clause",
      "GST & taxation terms",
      "Signage & branding rights",
      "Business hours policy",
      "Fit-out & restoration terms",
    ],
  },
];

const DURATIONS = [
  { label: "1 Month", months: 1 },
  { label: "3 Months", months: 3 },
  { label: "6 Months", months: 6 },
];
function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

function fmt(date) {
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function inr(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

function StandardAgreement({ p, user, startDate, endDate, deposit, refNo }) {
  const monthlyRent = inr(p.price);
  const secDeposit = inr(deposit);

  return (
    <div className="agreement-body">
      <div className="agreement-header-block">
        <div className="agreement-logo">
          <svg
            fill="#000"
            width="800"
            height="800"
            viewBox="144 144 512 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g>
              <path d="m525.93 201.35c-.83594-1.7578-2.6055-2.8711-4.5508-2.8711h-242.76c-1.9453.0-3.7148 1.1172-4.5508 2.875l-40.305 84.754c-.74219 1.5586-.63281 3.3945.29297 4.8555.92187 1.4609 2.5273 2.3477 4.2578 2.3477h19.332v303.18c0 2.7852 2.2539 5.0391 5.0391 5.0391h274.64c2.7812.0 5.0391-2.2539 5.0391-5.0391l-.003906-303.18h19.332c1.7305.0 3.3359-.88672 4.2578-2.3477.92578-1.4609 1.0312-3.2969.29297-4.8555zm-100.94 390.1h-49.984l.003906-61.789c0-13.781 11.211-24.988 24.992-24.988s24.988 11.207 24.988 24.988zm107.29.0h-97.211v-61.789c0-19.336-15.73-35.066-35.066-35.066s-35.066 15.73-35.066 35.066l-.003906 61.789h-97.211V293.31h264.56zM246.29 283.23l35.512-74.676h236.4l35.512 74.676z" />
              <path d="m299.98 467.64h45.848c2.7812.0 5.0391-2.2539 5.0391-5.0391l-.003907-52.531c0-2.7852-2.2539-5.0391-5.0391-5.0391h-45.848c-2.7812.0-5.0391 2.2539-5.0391 5.0391v52.531c.003906 2.7852 2.2578 5.0391 5.043 5.0391zm5.0391-52.531h35.77v42.453h-35.77z" />
              <path d="m299.98 570.92h38.785c2.7812.0 5.0391-2.2539 5.0391-5.0391v-46.855c0-13.473-10.961-24.434-24.434-24.434s-24.43 10.961-24.43 24.434v46.859c0 2.7852 2.2539 5.0352 5.0391 5.0352zm5.0391-51.895c0-7.918 6.4414-14.355 14.355-14.355 7.918.0 14.355 6.4414 14.355 14.355v41.82h-28.711z" />
              <path d="m480.62 494.59c-13.473.0-24.434 10.961-24.434 24.434v46.859c0 2.7852 2.2539 5.0391 5.0391 5.0391h38.785c2.7812.0 5.0391-2.2539 5.0391-5.0391v-46.859c0-13.473-10.957-24.434-24.43-24.434zm14.355 66.254h-28.711v-41.82c0-7.918 6.4414-14.355 14.355-14.355s14.355 6.4414 14.355 14.355z" />
              <path d="m377.07 467.64h45.844c2.7812.0 5.0391-2.2539 5.0391-5.0391v-52.531c0-2.7852-2.2539-5.0391-5.0391-5.0391H377.07c-2.7812.0-5.0391 2.2539-5.0391 5.0391v52.531c.003906 2.7852 2.2578 5.0391 5.0391 5.0391zm5.0391-52.531h35.77v42.453h-35.77z" />
              <path d="m454.17 467.64h45.848c2.7812.0 5.0391-2.2539 5.0391-5.0391l-.003906-52.531c0-2.7852-2.2539-5.0391-5.0391-5.0391h-45.848c-2.7812.0-5.0391 2.2539-5.0391 5.0391v52.531c.003906 2.7852 2.2578 5.0391 5.043 5.0391zm5.0352-52.531h35.77v42.453h-35.77z" />
              <path d="m299.98 382.99h45.848c2.7812.0 5.0391-2.2539 5.0391-5.0391l-.003907-52.527c0-2.7852-2.2539-5.0391-5.0391-5.0391h-45.848c-2.7812.0-5.0391 2.2539-5.0391 5.0391v52.531c.003906 2.7852 2.2578 5.0352 5.043 5.0352zm5.0391-52.527h35.77v42.453h-35.77z" />
              <path d="m377.07 382.99h45.844c2.7812.0 5.0391-2.2539 5.0391-5.0391v-52.527c0-2.7852-2.2539-5.0391-5.0391-5.0391H377.07c-2.7812.0-5.0391 2.2539-5.0391 5.0391v52.531c.003906 2.7852 2.2578 5.0352 5.0391 5.0352zm5.0391-52.527h35.77v42.453h-35.77z" />
              <path d="m454.17 382.99h45.848c2.7812.0 5.0391-2.2539 5.0391-5.0391l-.003906-52.527c0-2.7852-2.2539-5.0391-5.0391-5.0391h-45.848c-2.7812.0-5.0391 2.2539-5.0391 5.0391v52.531c.003906 2.7852 2.2578 5.0352 5.043 5.0352zm5.0352-52.527h35.77v42.453h-35.77z" />
            </g>
          </svg>
        </div>
        <h1 className="agreement-title">RENTAL AGREEMENT</h1>
        <p className="agreement-subtitle">Standard Residential Tenancy</p>
      </div>

      <div className="agreement-meta">
        <span>Date: {fmt(startDate)}</span>
        <span>Agreement No: RA-{refNo}</span>x
      </div>

      <section className="agreement-section">
        <h2>1. PARTIES</h2>
        <p>
          This Rental Agreement ("Agreement") is entered into on{" "}
          <strong>{fmt(startDate)}</strong> between:
        </p>
        <div className="party-block">
          <strong>LANDLORD (Owner):</strong>
          <p>Name: {p.owner?.name || "Property Owner"}</p>
          <p>
            Contact: {p.owner?.phone || "—"} | {p.owner?.email || "—"}
          </p>
        </div>
        <div className="party-block">
          <strong>TENANT:</strong>
          <p>Name: {user?.name || "Tenant Name"}</p>
          <p>
            Contact: {user?.phone || "—"} | {user?.email || "—"}
          </p>
        </div>
      </section>

      <section className="agreement-section">
        <h2>2. PROPERTY</h2>
        <p>The Landlord agrees to rent the following property to the Tenant:</p>
        <div className="property-block">
          <p>
            <strong>Title:</strong> {p.title}
          </p>
          <p>
            <strong>Type:</strong> {p.propertyType} ({p.listingType})
          </p>
          <p>
            <strong>Address:</strong> {p.location?.address}, {p.location?.city},{" "}
            {p.location?.state} – {p.location?.pincode}
          </p>
          {p.area && (
            <p>
              <strong>Area:</strong> {p.area} sq.ft.
            </p>
          )}
          {p.bedrooms && (
            <p>
              <strong>Bedrooms:</strong> {p.bedrooms}
            </p>
          )}
          {p.bathrooms && (
            <p>
              <strong>Bathrooms:</strong> {p.bathrooms}
            </p>
          )}
        </div>
      </section>

      <section className="agreement-section">
        <h2>3. TERM OF TENANCY</h2>
        <p>
          The tenancy shall commence on <strong>{fmt(startDate)}</strong> and
          end on <strong>{fmt(endDate)}</strong>, unless earlier terminated in
          accordance with this Agreement.
        </p>
      </section>

      <section className="agreement-section">
        <h2>4. RENT & DEPOSIT</h2>
        <table className="agreement-table">
          <tbody>
            <tr>
              <td>Monthly Rent</td>
              <td>{monthlyRent}</td>
            </tr>
            <tr>
              <td>Security Deposit</td>
              <td>{secDeposit}</td>
            </tr>
            <tr>
              <td>Payment Due Date</td>
              <td>1st of every month</td>
            </tr>
            <tr>
              <td>Payment Mode</td>
              <td>Bank Transfer / UPI / Cheque</td>
            </tr>
          </tbody>
        </table>
        <p>
          A late fee of <strong>₹500 per day</strong> shall apply for payments
          delayed beyond the 5th of the month.
        </p>
      </section>

      <section className="agreement-section">
        <h2>5. MAINTENANCE & UTILITIES</h2>
        <ul>
          <li>
            Electricity, water, internet and cooking gas bills shall be borne by
            the Tenant.
          </li>
          <li>
            Society maintenance charges shall be borne by the{" "}
            <strong>Landlord</strong>.
          </li>
          <li>
            Minor repairs (up to ₹1,000) shall be the Tenant's responsibility.
          </li>
          <li>
            Major structural repairs shall be the Landlord's responsibility.
          </li>
        </ul>
      </section>

      <section className="agreement-section">
        <h2>6. RULES & CONDUCT</h2>
        <ul>
          <li>
            The Tenant shall use the premises solely for residential purposes.
          </li>
          <li>No illegal activities shall be conducted on the premises.</li>
          <li>The Tenant shall not cause nuisance to neighbours.</li>
          <li>
            Visitors may stay for a maximum of 3 consecutive nights without
            prior consent.
          </li>
        </ul>
      </section>

      <section className="agreement-section">
        <h2>7. TERMINATION</h2>
        <p>
          Either party may terminate this Agreement by providing{" "}
          <strong>30 days' written notice</strong>. The Tenant shall vacate the
          property and return keys on or before the last day. The Security
          Deposit shall be refunded within 7 working days of vacating, after
          deducting any due amounts.
        </p>
      </section>

      <div className="signature-block">
        <div className="sig-col">
          <p>Landlord Signature</p>
          <div className="sig-line" />
          <p className="sig-name">{p.owner?.name || "Landlord"}</p>
          <p className="sig-date">Date: ___________</p>
        </div>
        <div className="sig-col">
          <p>Tenant Signature</p>
          <div className="sig-line" />
          <p className="sig-name">{user?.name || "Tenant"}</p>
          <p className="sig-date">Date: ___________</p>
        </div>
        <div className="sig-col">
          <p>Witness Signature</p>
          <div className="sig-line" />
          <p className="sig-name">Witness Name</p>
          <p className="sig-date">Date: ___________</p>
        </div>
      </div>

      <p className="agreement-footnote">
        This agreement is governed by the applicable Rent Control Act of the
        respective state and the Transfer of Property Act, 1882 of India.
      </p>
    </div>
  );
}

function PremiumAgreement({ p, user, startDate, endDate, deposit, refNo }) {
  const monthlyRent = inr(p.price);
  const secDeposit = inr(deposit);

  return (
    <div className="agreement-body">
      <div className="agreement-header-block premium">
        <div className="agreement-logo">🏡</div>
        <h1 className="agreement-title">
          PREMIUM RESIDENTIAL TENANCY AGREEMENT
        </h1>
        <p className="agreement-subtitle">Comprehensive Residential Lease</p>
      </div>

      <div className="agreement-meta">
        <span>Execution Date: {fmt(startDate)}</span>
        <span>Reference No: PRA-{refNo}</span>
      </div>

      <section className="agreement-section">
        <h2>1. PARTIES TO THE AGREEMENT</h2>
        <div className="party-block">
          <strong>LESSOR (Landlord):</strong>
          <p>Name: {p.owner?.name || "Property Owner"}</p>
          <p>
            Phone: {p.owner?.phone || "—"} | Email: {p.owner?.email || "—"}
          </p>
          <p>Company: {p.owner?.companyName || "Individual Owner"}</p>
        </div>
        <div className="party-block">
          <strong>LESSEE (Tenant):</strong>
          <p>Name: {user?.name || "Tenant Name"}</p>
          <p>
            Phone: {user?.phone || "—"} | Email: {user?.email || "—"}
          </p>
          <p>
            ID Proof: (Aadhaar / PAN / Passport – to be provided at signing)
          </p>
        </div>
      </section>

      <section className="agreement-section">
        <h2>2. DEMISED PREMISES</h2>
        <div className="property-block">
          <p>
            <strong>Property:</strong> {p.title}
          </p>
          <p>
            <strong>Category:</strong> {p.propertyType} | Listing:{" "}
            {p.listingType}
          </p>
          <p>
            <strong>Full Address:</strong> {p.location?.address},{" "}
            {p.location?.city}, {p.location?.state} – {p.location?.pincode}
          </p>
          {p.area && (
            <p>
              <strong>Carpet Area:</strong> {p.area} sq.ft.
            </p>
          )}
          <p>
            <strong>Furnishing:</strong> {p.furnishing || "As-Is"}
          </p>
          <p>
            <strong>Floor:</strong> {p.floor || "—"}
          </p>
        </div>
      </section>

      <section className="agreement-section">
        <h2>3. LEASE TERM</h2>
        <p>
          Lease commences: <strong>{fmt(startDate)}</strong>
          <br />
          Lease expires: <strong>{fmt(endDate)}</strong>
          <br />
          Lock-in period: <strong>1 month</strong> from commencement date.
        </p>
        <p>
          Upon mutual written consent, the lease may be renewed for a further
          term at revised rent.
        </p>
      </section>

      <section className="agreement-section">
        <h2>4. FINANCIAL TERMS</h2>
        <table className="agreement-table">
          <tbody>
            <tr>
              <td>Monthly Rent</td>
              <td>{monthlyRent}</td>
            </tr>
            <tr>
              <td>Security Deposit (Refundable)</td>
              <td>{secDeposit}</td>
            </tr>
            <tr>
              <td>Token Advance</td>
              <td>{inr(Math.round(p.price * 0.1))}</td>
            </tr>
            <tr>
              <td>Rent Escalation</td>
              <td>5% per annum after first year</td>
            </tr>
            <tr>
              <td>Due Date</td>
              <td>1st of month (grace: 5 days)</td>
            </tr>
            <tr>
              <td>Late Fee</td>
              <td>₹500/day after grace period</td>
            </tr>
            <tr>
              <td>Accepted Modes</td>
              <td>NEFT / IMPS / UPI / Account Payee Cheque</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="agreement-section">
        <h2>5. UTILITIES & MAINTENANCE</h2>
        <ul>
          <li>
            Electricity, piped gas, internet and DTH charges are payable by the
            Tenant.
          </li>
          <li>
            Society maintenance, property tax and major structural costs are the
            Landlord's responsibility.
          </li>
          <li>
            Minor day-to-day repairs up to ₹1,500/instance are the Tenant's
            responsibility.
          </li>
          <li>
            The Tenant shall maintain appliances and fixtures in good working
            condition.
          </li>
          <li>
            Any damage beyond normal wear-and-tear shall be deducted from the
            Security Deposit.
          </li>
        </ul>
      </section>

      <section className="agreement-section">
        <h2>6. PERMITTED USE & RESTRICTIONS</h2>
        <ul>
          <li>
            The premises shall be used for{" "}
            <strong>residential purposes only</strong>.
          </li>
          <li>
            <strong>Sub-letting</strong> is strictly prohibited without prior
            written consent.
          </li>
          <li>
            <strong>Pets</strong> are allowed only with prior written approval
            from the Landlord.
          </li>
          <li>
            No structural alterations, painting or drilling permitted without
            written consent.
          </li>
          <li>
            The Tenant shall not operate any commercial or business activity
            from the premises.
          </li>
        </ul>
      </section>

      <section className="agreement-section">
        <h2>7. LOCK-IN & TERMINATION</h2>
        <ul>
          <li>
            During the lock-in period (1 month), premature termination requires
            forfeiture of 1 month's rent.
          </li>
          <li>
            After lock-in, 30 days' written notice is required from either
            party.
          </li>
          <li>
            Upon vacating, the Tenant shall restore the premises to its original
            condition.
          </li>
          <li>
            Security Deposit refund (with deductions) within 7 working days of
            handing back keys.
          </li>
        </ul>
      </section>

      <section className="agreement-section">
        <h2>8. FORCE MAJEURE</h2>
        <p>
          Neither party shall be held liable for delays or non-performance
          caused by circumstances beyond their reasonable control, including
          natural disasters, government orders, pandemic restrictions, or acts
          of God.
        </p>
      </section>

      <section className="agreement-section">
        <h2>9. DISPUTE RESOLUTION</h2>
        <p>
          Any dispute arising under this Agreement shall first be resolved via
          mutual discussion. If unresolved within 30 days, the parties shall
          submit to mediation before a mutually agreed mediator in{" "}
          <strong>{p.location?.city}</strong>. Failing mediation, disputes shall
          be settled by courts of competent jurisdiction in {p.location?.city}.
        </p>
      </section>

      <div className="signature-block">
        <div className="sig-col">
          <p>Landlord</p>
          <div className="sig-line" />
          <p className="sig-name">{p.owner?.name || "Landlord"}</p>
          <p className="sig-date">Date: ___________</p>
        </div>
        <div className="sig-col">
          <p>Tenant</p>
          <div className="sig-line" />
          <p className="sig-name">{user?.name || "Tenant"}</p>
          <p className="sig-date">Date: ___________</p>
        </div>
        <div className="sig-col">
          <p>Witness 1</p>
          <div className="sig-line" />
          <p className="sig-name">Name: ___________</p>
          <p className="sig-date">Date: ___________</p>
        </div>
      </div>

      <p className="agreement-footnote">
        Execution of this agreement constitutes acceptance of all clauses
        herein. Governed by the Transfer of Property Act, 1882 and applicable
        Rent Control Act of {p.location?.state}.
      </p>
    </div>
  );
}

function CommercialAgreement({ p, user, startDate, endDate, deposit, refNo }) {
  const monthlyRent = inr(p.price);
  const secDeposit = inr(deposit);

  return (
    <div className="agreement-body">
      <div className="agreement-header-block commercial">
        <div className="agreement-logo">🏢</div>
        <h1 className="agreement-title">COMMERCIAL LEASE AGREEMENT</h1>
        <p className="agreement-subtitle">Corporate / Business Tenancy</p>
      </div>

      <div className="agreement-meta">
        <span>Date of Execution: {fmt(startDate)}</span>
        <span>Lease Ref: CLA-{refNo}</span>
      </div>

      <section className="agreement-section">
        <h2>1. CONTRACTING PARTIES</h2>
        <div className="party-block">
          <strong>LICENSOR (Owner):</strong>
          <p>Name / Company: {p.owner?.name || "Owner"}</p>
          <p>PAN / GSTIN: _______________</p>
          <p>
            Phone: {p.owner?.phone || "—"} | Email: {p.owner?.email || "—"}
          </p>
        </div>
        <div className="party-block">
          <strong>LICENSEE (Business / Tenant):</strong>
          <p>Name: {user?.name || "Business Name"}</p>
          <p>Company Registration No.: _______________</p>
          <p>GSTIN: _______________</p>
          <p>
            Phone: {user?.phone || "—"} | Email: {user?.email || "—"}
          </p>
        </div>
      </section>

      <section className="agreement-section">
        <h2>2. LICENSED PREMISES</h2>
        <div className="property-block">
          <p>
            <strong>Property:</strong> {p.title}
          </p>
          <p>
            <strong>Type:</strong> {p.propertyType}
          </p>
          <p>
            <strong>Address:</strong> {p.location?.address}, {p.location?.city},{" "}
            {p.location?.state} – {p.location?.pincode}
          </p>
          {p.area && (
            <p>
              <strong>Super Built-up Area:</strong> {p.area} sq.ft.
            </p>
          )}
          <p>
            <strong>Permitted Use:</strong> Commercial / Office / Retail
            activities only
          </p>
        </div>
      </section>

      <section className="agreement-section">
        <h2>3. LICENSE TERM</h2>
        <p>
          Commencement: <strong>{fmt(startDate)}</strong>
          <br />
          Expiry: <strong>{fmt(endDate)}</strong>
          <br />
          Lock-in Period: <strong>1 month</strong> from commencement.
        </p>
        <p>
          Upon expiry, the term may be renewed by mutual written consent with
          rental revision as agreed.
        </p>
      </section>

      <section className="agreement-section">
        <h2>4. LICENSE FEE & DEPOSIT</h2>
        <table className="agreement-table">
          <tbody>
            <tr>
              <td>Monthly License Fee</td>
              <td>{monthlyRent}</td>
            </tr>
            <tr>
              <td>GST on License Fee (@18%)</td>
              <td>{inr(Math.round(p.price * 0.18))}</td>
            </tr>
            <tr>
              <td>Total Monthly Payable</td>
              <td>{inr(Math.round(p.price * 1.18))}</td>
            </tr>
            <tr>
              <td>Refundable Security Deposit</td>
              <td>{secDeposit}</td>
            </tr>
            <tr>
              <td>Payment Due</td>
              <td>1st of each month</td>
            </tr>
            <tr>
              <td>Late Payment Charge</td>
              <td>2% per month on overdue amount</td>
            </tr>
          </tbody>
        </table>
        <p>
          All payments shall be made via NEFT/RTGS/IMPS to the Licensor's
          designated bank account.
        </p>
      </section>

      <section className="agreement-section">
        <h2>5. USE OF PREMISES</h2>
        <ul>
          <li>
            Premises shall be used exclusively for{" "}
            <strong>lawful commercial / business activities</strong>.
          </li>
          <li>
            The Licensee shall obtain all necessary government licenses,
            permits, and NOCs before commencing operations.
          </li>
          <li>
            No residential use, storage of hazardous materials or illegal goods
            is permitted.
          </li>
          <li>Sub-licensing is strictly prohibited without written consent.</li>
        </ul>
      </section>

      <section className="agreement-section">
        <h2>6. FIT-OUT, SIGNAGE & ALTERATIONS</h2>
        <ul>
          <li>
            Fit-out and interior work requires prior written approval from the
            Licensor.
          </li>
          <li>
            Signage may be installed subject to building management regulations
            and Licensor approval.
          </li>
          <li>
            All fit-out must comply with local municipal and fire safety
            regulations.
          </li>
          <li>
            Upon vacation, the Licensee must restore the premises to its
            original condition at their cost.
          </li>
        </ul>
      </section>

      <section className="agreement-section">
        <h2>7. UTILITIES & OUTGOINGS</h2>
        <ul>
          <li>
            Electricity, internet, water and other utilities are payable by the
            Licensee.
          </li>
          <li>
            Common area maintenance (CAM) charges as applicable shall be paid by
            the Licensee.
          </li>
          <li>
            Property tax and structural repair costs are the Licensor's
            responsibility.
          </li>
        </ul>
      </section>

      <section className="agreement-section">
        <h2>8. TERMINATION</h2>
        <ul>
          <li>
            After the lock-in period, either party may terminate with{" "}
            <strong>30 days' written notice</strong>.
          </li>
          <li>
            The Licensor may terminate immediately upon breach of any clause
            herein.
          </li>
          <li>
            Security deposit shall be refunded within 15 working days of
            vacating, net of deductions.
          </li>
        </ul>
      </section>

      <section className="agreement-section">
        <h2>9. TAX & COMPLIANCE</h2>
        <p>
          The Licensee is responsible for payment of all applicable taxes (GST,
          professional tax, etc.) on its business activities. TDS on rent, if
          applicable, shall be deducted at source by the Licensee as per Income
          Tax Act provisions and a TDS certificate shall be issued to the
          Licensor.
        </p>
      </section>

      <section className="agreement-section">
        <h2>10. GOVERNING LAW & DISPUTES</h2>
        <p>
          This Agreement is governed by the laws of India. Any dispute shall be
          resolved by arbitration under the Arbitration and Conciliation Act,
          1996, with a sole arbitrator mutually appointed, seated at{" "}
          <strong>{p.location?.city}</strong>.
        </p>
      </section>

      <div className="signature-block">
        <div className="sig-col">
          <p>Licensor</p>
          <div className="sig-line" />
          <p className="sig-name">{p.owner?.name || "Owner"}</p>
          <p className="sig-date">Seal & Date: ___________</p>
        </div>
        <div className="sig-col">
          <p>Licensee / Authorised Signatory</p>
          <div className="sig-line" />
          <p className="sig-name">{user?.name || "Business"}</p>
          <p className="sig-date">Seal & Date: ___________</p>
        </div>
        <div className="sig-col">
          <p>Witness</p>
          <div className="sig-line" />
          <p className="sig-name">Name: ___________</p>
          <p className="sig-date">Date: ___________</p>
        </div>
      </div>

      <p className="agreement-footnote">
        This Commercial Lease Agreement constitutes the entire agreement between
        the parties. All prior negotiations, representations, and understandings
        are superseded by this document.
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const RentalAgreement = ({ property, user, onClose }) => {
  const [step, setStep] = useState(1); // 1: template, 2: duration, 3: preview
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const printRef = useRef();
  const [refNo] = useState(() => Date.now().toString().slice(-8));
  const [startDate] = useState(() => new Date());

  const endDate = selectedDuration
    ? addMonths(startDate, selectedDuration.months)
    : null;
  const deposit = property?.price ? property.price * 2 : 0;

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank");
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rental Agreement – ${property?.title || "Property"}</title>
          <style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body { font-family:Arial,sans-serif; color:#000; padding:30px; font-size:11px; line-height:1.5; }
            h1 { font-size:14px; text-align:center; margin-bottom:4px; text-transform:uppercase; }
            h2 { font-size:11px; font-weight:bold; border-bottom:1px solid #000; padding-bottom:3px; margin:12px 0 6px; text-transform:uppercase; }
            .agreement-header-block { text-align:center; border:2px solid #000; padding:10px; margin-bottom:14px; }
            .agreement-header-block svg { display:none; }
            .agreement-logo { font-size:24px; margin-bottom:4px; }
            .agreement-title { font-size:14px; font-weight:bold; margin:0; }
            .agreement-subtitle { font-size:10px; margin:2px 0 0; }
            .agreement-meta { display:flex; justify-content:space-between; font-size:10px; margin-bottom:14px; padding:5px 8px; background:#f5f5f5; border:1px solid #ccc; }
            .agreement-section { margin-bottom:12px; border:1px solid #ccc; padding:8px; }
            .agreement-section h2 { margin:0 0 6px; padding-bottom:3px; }
            .agreement-section p { margin:3px 0; font-size:10px; }
            .agreement-section ul,.agreement-section ol { margin:4px 0 4px 16px; font-size:10px; }
            .agreement-section li { margin:2px 0; }
            .party-block,.property-block { border:1px solid #ccc; padding:6px 8px; margin:5px 0; background:#fafafa; }
            .party-block p,.property-block p { margin:2px 0; font-size:10px; }
            table { width:100%; border-collapse:collapse; margin:6px 0; }
            td { padding:5px 6px; border:1px solid #000; font-size:10px; }
            td:first-child { font-weight:bold; background:#f0f0f0; width:40%; }
            .signature-block { display:flex; justify-content:space-between; margin-top:24px; padding-top:12px; border-top:2px solid #000; gap:10px; }
            .sig-col { flex:1; text-align:center; font-size:9px; }
            .sig-col p:first-child { font-weight:bold; margin-bottom:3px; }
            .sig-line { border-top:1px solid #000; margin:35px 6px 4px; }
            .sig-name { font-size:9px; margin:2px 0; }
            .sig-date { font-size:8px; color:#555; }
            .agreement-footnote { font-size:8px; color:#666; text-align:center; margin-top:16px; padding-top:6px; border-top:1px solid #ccc; }
            @media print { body { padding:15px; } }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  const renderAgreementContent = () => {
    const props = { p: property, user, startDate, endDate, deposit, refNo };
    if (selectedTemplate?.id === "premium")
      return <PremiumAgreement {...props} />;
    if (selectedTemplate?.id === "commercial")
      return <CommercialAgreement {...props} />;
    return <StandardAgreement {...props} />;
  };

  const canGoNext =
    (step === 1 && selectedTemplate) || (step === 2 && selectedDuration);

  return (
    <div className="ra-overlay">
      <div className="ra-modal">
        {/* Header */}
        <div className="ra-header">
          <div className="ra-header-left">
            <FiFileText className="ra-header-icon" />
            <div>
              <h2>Rental Agreement</h2>
              <p>{property?.title}</p>
            </div>
          </div>
          <button className="ra-close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="ra-steps">
          {["Choose Template", "Select Duration", "Preview & Print"].map(
            (label, i) => {
              const idx = i + 1;
              const done = step > idx;
              const active = step === idx;
              return (
                <div
                  key={idx}
                  className={`ra-step ${active ? "active" : ""} ${done ? "done" : ""}`}
                >
                  <div className="ra-step-circle">
                    {done ? <FiCheckCircle /> : <span>{idx}</span>}
                  </div>
                  <span className="ra-step-label">{label}</span>
                  {i < 2 && (
                    <div className={`ra-step-line ${done ? "done" : ""}`} />
                  )}
                </div>
              );
            },
          )}
        </div>

        {/* Step 1 – Template Selection */}
        {step === 1 && (
          <div className="ra-step-content">
            <h3 className="ra-step-heading">Choose an Agreement Template</h3>
            <p className="ra-step-sub">
              Select the template that best matches your rental type
            </p>
            <div className="ra-templates">
              {TEMPLATES.map((t) => (
                <div
                  key={t.id}
                  className={`ra-template-card ${selectedTemplate?.id === t.id ? "selected" : ""}`}
                  onClick={() => setSelectedTemplate(t)}
                >
                  <div className="ra-template-tag">{t.tag}</div>
                  <h4>{t.name}</h4>
                  <p className="ra-template-desc">{t.description}</p>
                  <ul className="ra-template-features">
                    {t.features.map((f, fi) => (
                      <li key={fi}>
                        <FiCheckCircle className="feature-check" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {selectedTemplate?.id === t.id && (
                    <div className="ra-selected-badge">
                      <FiCheckCircle /> Selected
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 – Duration Selection */}
        {step === 2 && (
          <div className="ra-step-content">
            <h3 className="ra-step-heading">Select Rental Duration</h3>
            <p className="ra-step-sub">
              How long do you want to rent this property?
            </p>
            <div className="ra-durations">
              {DURATIONS.map((d) => {
                const end = addMonths(startDate, d.months);
                return (
                  <div
                    key={d.months}
                    className={`ra-duration-card ${selectedDuration?.months === d.months ? "selected" : ""}`}
                    onClick={() => setSelectedDuration(d)}
                  >
                    <div className="ra-duration-icon">📅</div>
                    <h4>{d.label}</h4>
                    <p className="ra-duration-dates">
                      {fmt(startDate)} → {fmt(end)}
                    </p>
                    <p className="ra-duration-total">
                      Total: {inr(property?.price * d.months)}
                    </p>
                    <p className="ra-duration-deposit">
                      + Deposit: {inr(property?.price * 2)}
                    </p>
                    {selectedDuration?.months === d.months && (
                      <div className="ra-selected-badge">
                        <FiCheckCircle /> Selected
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="ra-summary-box">
              <div className="ra-summary-row">
                <span>Template</span>
                <strong>{selectedTemplate?.name}</strong>
              </div>
              <div className="ra-summary-row">
                <span>Property</span>
                <strong>{property?.title}</strong>
              </div>
              <div className="ra-summary-row">
                <span>Monthly Rent</span>
                <strong>{inr(property?.price)}</strong>
              </div>
              {selectedDuration && (
                <>
                  <div className="ra-summary-row">
                    <span>Duration</span>
                    <strong>{selectedDuration.label}</strong>
                  </div>
                  <div className="ra-summary-row total">
                    <span>Total Rent</span>
                    <strong>
                      {inr(property?.price * selectedDuration.months)}
                    </strong>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 3 – Preview */}
        {step === 3 && (
          <div className="ra-step-content ra-preview-content">
            <div className="ra-preview-toolbar">
              <div className="ra-preview-info">
                <span className="ra-badge">{selectedTemplate?.name}</span>
                <span className="ra-badge duration">
                  {selectedDuration?.label}
                </span>
              </div>
              <button className="ra-print-btn" onClick={handlePrint}>
                <FiPrinter /> Print / Save PDF
              </button>
            </div>
            <div className="ra-agreement-preview" ref={printRef}>
              {renderAgreementContent()}
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="ra-footer">
          {step > 1 && (
            <button
              className="ra-btn-secondary"
              onClick={() => setStep(step - 1)}
            >
              <FiChevronLeft /> Back
            </button>
          )}
          <div className="ra-footer-right">
            {step < 3 ? (
              <button
                className="ra-btn-primary"
                disabled={!canGoNext}
                onClick={() => setStep(step + 1)}
              >
                Continue <FiChevronRight />
              </button>
            ) : (
              <button className="ra-btn-success" onClick={handlePrint}>
                <FiPrinter /> Print Agreement
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalAgreement;
