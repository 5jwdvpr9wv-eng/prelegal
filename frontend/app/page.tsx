"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "./auth-context";
import { AuthModal } from "./components/AuthModal";
import { MyDocumentsModal } from "./components/MyDocumentsModal";
import { SaveDocumentModal } from "./components/SaveDocumentModal";

// ── Generic types ─────────────────────────────────────────────────────────────

interface FieldDef {
  key: string;
  label: string;
  required: boolean;
  fieldType: "text" | "date" | "textarea" | "email";
  placeholder: string;
}

interface DocConfig {
  docType: string;
  name: string;
  requiredFieldKeys: string[];
  fields: FieldDef[];
}

type FormData = Record<string, string>;

function emptyFormData(config: DocConfig): FormData {
  return Object.fromEntries(config.fields.map((f) => [f.key, ""]));
}

// ── Document configs (mirrors backend REGISTRY) ───────────────────────────────

const _NDA_FIELDS: FieldDef[] = [
  { key: "party1Name", label: "Party 1 Legal Name", required: true, fieldType: "text", placeholder: "Acme Corp." },
  { key: "party1Address", label: "Party 1 Address", required: false, fieldType: "text", placeholder: "123 Main St, San Francisco, CA 94105" },
  { key: "party1Email", label: "Party 1 Email", required: false, fieldType: "email", placeholder: "legal@acme.com" },
  { key: "party1SignatoryName", label: "Party 1 Signatory Name", required: false, fieldType: "text", placeholder: "Jane Smith" },
  { key: "party1SignatoryTitle", label: "Party 1 Signatory Title", required: false, fieldType: "text", placeholder: "Chief Executive Officer" },
  { key: "party2Name", label: "Party 2 Legal Name", required: true, fieldType: "text", placeholder: "Globex Inc." },
  { key: "party2Address", label: "Party 2 Address", required: false, fieldType: "text", placeholder: "456 Market St, New York, NY 10001" },
  { key: "party2Email", label: "Party 2 Email", required: false, fieldType: "email", placeholder: "legal@globex.com" },
  { key: "party2SignatoryName", label: "Party 2 Signatory Name", required: false, fieldType: "text", placeholder: "John Doe" },
  { key: "party2SignatoryTitle", label: "Party 2 Signatory Title", required: false, fieldType: "text", placeholder: "Chief Executive Officer" },
  { key: "purpose", label: "Purpose", required: true, fieldType: "textarea", placeholder: "evaluating a potential business relationship between the parties" },
  { key: "effectiveDate", label: "Effective Date", required: true, fieldType: "date", placeholder: "" },
  { key: "mndaTerm", label: "MNDA Term", required: true, fieldType: "text", placeholder: "2 years from Effective Date" },
  { key: "termOfConfidentiality", label: "Term of Confidentiality", required: true, fieldType: "text", placeholder: "3 years following expiration or termination" },
  { key: "governingLaw", label: "Governing Law (State)", required: true, fieldType: "text", placeholder: "Delaware" },
  { key: "jurisdiction", label: "Jurisdiction", required: true, fieldType: "text", placeholder: "Wilmington, Delaware" },
];

const _NDA_REQUIRED = ["party1Name", "party2Name", "purpose", "effectiveDate", "mndaTerm", "termOfConfidentiality", "governingLaw", "jurisdiction"];

const DOCUMENT_CONFIGS: Record<string, DocConfig> = {
  mutual_nda: {
    docType: "mutual_nda",
    name: "Mutual Non-Disclosure Agreement",
    requiredFieldKeys: _NDA_REQUIRED,
    fields: _NDA_FIELDS,
  },
  mutual_nda_coverpage: {
    docType: "mutual_nda_coverpage",
    name: "Mutual NDA Cover Page",
    requiredFieldKeys: _NDA_REQUIRED,
    fields: _NDA_FIELDS,
  },
  cloud_service_agreement: {
    docType: "cloud_service_agreement",
    name: "Cloud Service Agreement",
    requiredFieldKeys: ["providerName", "customerName", "cloudServiceDescription", "orderDate", "subscriptionPeriod", "fees", "governingLaw", "chosenCourts"],
    fields: [
      { key: "providerName", label: "Provider Name", required: true, fieldType: "text", placeholder: "Acme Cloud Inc." },
      { key: "customerName", label: "Customer Name", required: true, fieldType: "text", placeholder: "Globex Corp." },
      { key: "cloudServiceDescription", label: "Cloud Service Description", required: true, fieldType: "textarea", placeholder: "cloud-based project management platform" },
      { key: "orderDate", label: "Order Date", required: true, fieldType: "date", placeholder: "" },
      { key: "subscriptionPeriod", label: "Subscription Period", required: true, fieldType: "text", placeholder: "1 year" },
      { key: "nonRenewalNoticeDate", label: "Non-Renewal Notice", required: false, fieldType: "text", placeholder: "30 days before end of Subscription Period" },
      { key: "fees", label: "Fees", required: true, fieldType: "text", placeholder: "$500/month" },
      { key: "paymentProcess", label: "Payment Process", required: false, fieldType: "text", placeholder: "monthly invoicing, net 30" },
      { key: "generalCapAmount", label: "General Liability Cap", required: false, fieldType: "text", placeholder: "fees paid in the prior 12 months" },
      { key: "governingLaw", label: "Governing Law", required: true, fieldType: "text", placeholder: "Delaware" },
      { key: "chosenCourts", label: "Chosen Courts", required: true, fieldType: "text", placeholder: "courts located in Wilmington, Delaware" },
    ],
  },
  design_partner: {
    docType: "design_partner",
    name: "Design Partner Agreement",
    requiredFieldKeys: ["providerName", "partnerName", "productDescription", "effectiveDate", "term", "governingLaw", "chosenCourts"],
    fields: [
      { key: "providerName", label: "Provider Name", required: true, fieldType: "text", placeholder: "Acme Inc." },
      { key: "partnerName", label: "Partner Name", required: true, fieldType: "text", placeholder: "Globex Corp." },
      { key: "productDescription", label: "Product Description", required: true, fieldType: "textarea", placeholder: "AI-powered analytics dashboard" },
      { key: "programDescription", label: "Program Description", required: false, fieldType: "textarea", placeholder: "quarterly feedback sessions and product testing" },
      { key: "effectiveDate", label: "Effective Date", required: true, fieldType: "date", placeholder: "" },
      { key: "term", label: "Term", required: true, fieldType: "text", placeholder: "6 months" },
      { key: "fees", label: "Fees", required: false, fieldType: "text", placeholder: "none" },
      { key: "governingLaw", label: "Governing Law", required: true, fieldType: "text", placeholder: "Delaware" },
      { key: "chosenCourts", label: "Chosen Courts", required: true, fieldType: "text", placeholder: "courts located in Wilmington, Delaware" },
      { key: "noticeAddress", label: "Notice Address", required: false, fieldType: "text", placeholder: "" },
    ],
  },
  sla: {
    docType: "sla",
    name: "Service Level Agreement",
    requiredFieldKeys: ["providerName", "customerName", "cloudServiceName", "effectiveDate", "targetUptime"],
    fields: [
      { key: "providerName", label: "Provider Name", required: true, fieldType: "text", placeholder: "Acme Cloud Inc." },
      { key: "customerName", label: "Customer Name", required: true, fieldType: "text", placeholder: "Globex Corp." },
      { key: "cloudServiceName", label: "Cloud Service Name", required: true, fieldType: "text", placeholder: "AcmeCloud Platform" },
      { key: "effectiveDate", label: "Effective Date", required: true, fieldType: "date", placeholder: "" },
      { key: "targetUptime", label: "Target Uptime", required: true, fieldType: "text", placeholder: "99.9%" },
      { key: "targetResponseTime", label: "Target Response Time", required: false, fieldType: "text", placeholder: "within 1 hour for critical issues" },
      { key: "scheduledDowntime", label: "Scheduled Downtime", required: false, fieldType: "text", placeholder: "Sundays 2am-4am UTC" },
      { key: "uptimeCredit", label: "Uptime Credit", required: false, fieldType: "text", placeholder: "10% of monthly fees per 0.1% below target" },
      { key: "responseTimeCredit", label: "Response Time Credit", required: false, fieldType: "text", placeholder: "" },
    ],
  },
  professional_services: {
    docType: "professional_services",
    name: "Professional Services Agreement",
    requiredFieldKeys: ["providerName", "customerName", "servicesDescription", "deliverables", "fees", "effectiveDate", "governingLaw", "chosenCourts"],
    fields: [
      { key: "providerName", label: "Provider Name", required: true, fieldType: "text", placeholder: "Acme Consulting Inc." },
      { key: "customerName", label: "Customer Name", required: true, fieldType: "text", placeholder: "Globex Corp." },
      { key: "servicesDescription", label: "Services Description", required: true, fieldType: "textarea", placeholder: "software development and implementation services" },
      { key: "deliverables", label: "Deliverables", required: true, fieldType: "textarea", placeholder: "custom API integration, documentation, and training" },
      { key: "timeline", label: "Timeline", required: false, fieldType: "textarea", placeholder: "completion within 90 days of project start" },
      { key: "fees", label: "Fees", required: true, fieldType: "text", placeholder: "$150/hour" },
      { key: "paymentTerms", label: "Payment Terms", required: false, fieldType: "text", placeholder: "monthly invoicing, net 30" },
      { key: "effectiveDate", label: "Effective Date", required: true, fieldType: "date", placeholder: "" },
      { key: "intellectualPropertyTerms", label: "Intellectual Property", required: false, fieldType: "textarea", placeholder: "Customer owns all work product upon full payment" },
      { key: "governingLaw", label: "Governing Law", required: true, fieldType: "text", placeholder: "Delaware" },
      { key: "chosenCourts", label: "Chosen Courts", required: true, fieldType: "text", placeholder: "courts located in Wilmington, Delaware" },
    ],
  },
  data_processing: {
    docType: "data_processing",
    name: "Data Processing Agreement",
    requiredFieldKeys: ["processorName", "controllerName", "serviceDescription", "personalDataCategories", "dataSubjectCategories", "processingPurpose", "effectiveDate", "governingLaw"],
    fields: [
      { key: "processorName", label: "Processor Name", required: true, fieldType: "text", placeholder: "Acme SaaS Inc." },
      { key: "controllerName", label: "Controller Name", required: true, fieldType: "text", placeholder: "Globex Corp." },
      { key: "serviceDescription", label: "Service Description", required: true, fieldType: "textarea", placeholder: "cloud-based CRM and data analytics services" },
      { key: "personalDataCategories", label: "Personal Data Categories", required: true, fieldType: "textarea", placeholder: "names, email addresses, usage data" },
      { key: "dataSubjectCategories", label: "Data Subject Categories", required: true, fieldType: "text", placeholder: "customers and employees" },
      { key: "processingPurpose", label: "Processing Purpose", required: true, fieldType: "textarea", placeholder: "providing and improving the cloud service" },
      { key: "processingDuration", label: "Processing Duration", required: false, fieldType: "text", placeholder: "duration of the service agreement plus 30 days" },
      { key: "specialCategoryData", label: "Special Category Data", required: false, fieldType: "text", placeholder: "none" },
      { key: "effectiveDate", label: "Effective Date", required: true, fieldType: "date", placeholder: "" },
      { key: "governingLaw", label: "Governing Law", required: true, fieldType: "text", placeholder: "Delaware" },
    ],
  },
  software_license: {
    docType: "software_license",
    name: "Software License Agreement",
    requiredFieldKeys: ["licensorName", "licenseeName", "softwareDescription", "licenseScope", "fees", "term", "effectiveDate", "governingLaw", "chosenCourts"],
    fields: [
      { key: "licensorName", label: "Licensor Name", required: true, fieldType: "text", placeholder: "Acme Software Inc." },
      { key: "licenseeName", label: "Licensee Name", required: true, fieldType: "text", placeholder: "Globex Corp." },
      { key: "softwareDescription", label: "Software Description", required: true, fieldType: "textarea", placeholder: "enterprise analytics software platform" },
      { key: "licenseScope", label: "License Scope", required: true, fieldType: "textarea", placeholder: "install and use on up to 100 user seats for internal business purposes" },
      { key: "licenseRestrictions", label: "License Restrictions", required: false, fieldType: "textarea", placeholder: "no sublicensing, no reverse engineering" },
      { key: "fees", label: "License Fees", required: true, fieldType: "text", placeholder: "$10,000/year" },
      { key: "paymentTerms", label: "Payment Terms", required: false, fieldType: "text", placeholder: "annually in advance" },
      { key: "term", label: "License Term", required: true, fieldType: "text", placeholder: "2 years" },
      { key: "maintenanceSupport", label: "Maintenance and Support", required: false, fieldType: "textarea", placeholder: "email support during business hours, quarterly updates" },
      { key: "effectiveDate", label: "Effective Date", required: true, fieldType: "date", placeholder: "" },
      { key: "governingLaw", label: "Governing Law", required: true, fieldType: "text", placeholder: "Delaware" },
      { key: "chosenCourts", label: "Chosen Courts", required: true, fieldType: "text", placeholder: "courts located in Wilmington, Delaware" },
    ],
  },
  partnership: {
    docType: "partnership",
    name: "Partnership Agreement",
    requiredFieldKeys: ["party1Name", "party2Name", "partnershipPurpose", "party1Role", "party2Role", "revenueSharingTerms", "effectiveDate", "term", "governingLaw", "chosenCourts"],
    fields: [
      { key: "party1Name", label: "Party 1 Name", required: true, fieldType: "text", placeholder: "Acme Inc." },
      { key: "party2Name", label: "Party 2 Name", required: true, fieldType: "text", placeholder: "Globex Corp." },
      { key: "partnershipPurpose", label: "Partnership Purpose", required: true, fieldType: "textarea", placeholder: "jointly developing and marketing an AI-powered software product" },
      { key: "party1Role", label: "Party 1 Role", required: true, fieldType: "textarea", placeholder: "product development, engineering, and technical operations" },
      { key: "party2Role", label: "Party 2 Role", required: true, fieldType: "textarea", placeholder: "sales, marketing, and customer relationships" },
      { key: "revenueSharingTerms", label: "Revenue Sharing", required: true, fieldType: "text", placeholder: "50% to Party 1, 50% to Party 2" },
      { key: "intellectualPropertyTerms", label: "Intellectual Property", required: false, fieldType: "textarea", placeholder: "jointly owned by both parties" },
      { key: "effectiveDate", label: "Effective Date", required: true, fieldType: "date", placeholder: "" },
      { key: "term", label: "Term", required: true, fieldType: "text", placeholder: "2 years" },
      { key: "governingLaw", label: "Governing Law", required: true, fieldType: "text", placeholder: "Delaware" },
      { key: "chosenCourts", label: "Chosen Courts", required: true, fieldType: "text", placeholder: "courts located in Wilmington, Delaware" },
    ],
  },
  pilot: {
    docType: "pilot",
    name: "Pilot Agreement",
    requiredFieldKeys: ["providerName", "customerName", "productDescription", "effectiveDate", "pilotPeriod", "governingLaw", "chosenCourts"],
    fields: [
      { key: "providerName", label: "Provider Name", required: true, fieldType: "text", placeholder: "Acme Inc." },
      { key: "customerName", label: "Customer Name", required: true, fieldType: "text", placeholder: "Globex Corp." },
      { key: "productDescription", label: "Product Description", required: true, fieldType: "textarea", placeholder: "cloud-based AI analytics platform" },
      { key: "evaluationPurpose", label: "Evaluation Purpose", required: false, fieldType: "textarea", placeholder: "test integration with existing systems and evaluate performance" },
      { key: "effectiveDate", label: "Effective Date", required: true, fieldType: "date", placeholder: "" },
      { key: "pilotPeriod", label: "Pilot Period", required: true, fieldType: "text", placeholder: "90 days" },
      { key: "fees", label: "Fees", required: false, fieldType: "text", placeholder: "no fee" },
      { key: "generalCapAmount", label: "General Liability Cap", required: false, fieldType: "text", placeholder: "$10,000" },
      { key: "governingLaw", label: "Governing Law", required: true, fieldType: "text", placeholder: "Delaware" },
      { key: "chosenCourts", label: "Chosen Courts", required: true, fieldType: "text", placeholder: "courts located in Wilmington, Delaware" },
      { key: "noticeAddress", label: "Notice Address", required: false, fieldType: "text", placeholder: "" },
    ],
  },
  business_associate: {
    docType: "business_associate",
    name: "Business Associate Agreement",
    requiredFieldKeys: ["providerName", "companyName", "serviceDescription", "baaEffectiveDate", "breachNotificationPeriod", "governingLaw"],
    fields: [
      { key: "providerName", label: "Provider Name", required: true, fieldType: "text", placeholder: "Acme Health Tech Inc." },
      { key: "companyName", label: "Covered Entity Name", required: true, fieldType: "text", placeholder: "Metro Health System" },
      { key: "serviceDescription", label: "Service Description", required: true, fieldType: "textarea", placeholder: "electronic health record software and data storage services" },
      { key: "baaEffectiveDate", label: "Effective Date", required: true, fieldType: "date", placeholder: "" },
      { key: "agreementReference", label: "Main Agreement Reference", required: false, fieldType: "text", placeholder: "Cloud Service Agreement" },
      { key: "breachNotificationPeriod", label: "Breach Notification Period", required: true, fieldType: "text", placeholder: "60 days" },
      { key: "limitationsOnDisclosures", label: "Limitations on Disclosures", required: false, fieldType: "textarea", placeholder: "PHI may not be used for marketing purposes" },
      { key: "governingLaw", label: "Governing Law", required: true, fieldType: "text", placeholder: "Delaware" },
    ],
  },
  ai_addendum: {
    docType: "ai_addendum",
    name: "AI Addendum",
    requiredFieldKeys: ["providerName", "customerName", "baseAgreementName", "aiServiceDescription", "effectiveDate", "governingLaw"],
    fields: [
      { key: "providerName", label: "Provider Name", required: true, fieldType: "text", placeholder: "Acme AI Inc." },
      { key: "customerName", label: "Customer Name", required: true, fieldType: "text", placeholder: "Globex Corp." },
      { key: "baseAgreementName", label: "Base Agreement Name", required: true, fieldType: "text", placeholder: "Cloud Service Agreement" },
      { key: "baseAgreementDate", label: "Base Agreement Date", required: false, fieldType: "date", placeholder: "" },
      { key: "aiServiceDescription", label: "AI Service Description", required: true, fieldType: "textarea", placeholder: "AI-powered content generation and analysis features" },
      { key: "effectiveDate", label: "Effective Date", required: true, fieldType: "date", placeholder: "" },
      { key: "modelTrainingPolicy", label: "Model Training Policy", required: false, fieldType: "textarea", placeholder: "customer data will not be used to train AI models without explicit consent" },
      { key: "liabilityTerms", label: "AI Liability Terms", required: false, fieldType: "textarea", placeholder: "provider is not liable for decisions made based solely on AI-generated content" },
      { key: "governingLaw", label: "Governing Law", required: true, fieldType: "text", placeholder: "Delaware" },
    ],
  },
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SavedDocWithFields {
  id: number;
  name: string;
  document_type: string;
  form_data: FormData;
  created_at: string;
  updated_at: string;
}

// ── Preview subcomponents ─────────────────────────────────────────────────────

function Val({ children }: { children: string }) {
  return children.trim() ? (
    <span className="field-value">{children}</span>
  ) : (
    <span className="field-empty">{"[___________]"}</span>
  );
}

function SectionRule({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3 my-6 font-sans">
      <div className="h-px flex-1 bg-rule" />
      <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
        {children}
      </span>
      <div className="h-px flex-1 bg-rule" />
    </div>
  );
}

function CoverRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline py-2 border-b border-rule/60 last:border-0 font-sans">
      <span className="text-[10px] font-semibold text-slate-500 w-40 flex-none uppercase tracking-wide">
        {label}
      </span>
      <span className="flex-1 text-[11px] text-slate-800">{children}</span>
    </div>
  );
}

function NDAPreview({ data }: { data: FormData }) {
  return (
    <div className="nda-body">
      {/* Cover Page */}
      <SectionRule>Cover Page</SectionRule>
      <div className="mb-2">
        <CoverRow label="Effective Date">
          <Val>{data.effectiveDate ?? ""}</Val>
        </CoverRow>
        <CoverRow label="Party 1">
          <div>
            <Val>{data.party1Name ?? ""}</Val>
          </div>
          {data.party1Address && (
            <div className="text-slate-400 text-[10px] mt-0.5">
              {data.party1Address}
            </div>
          )}
          {data.party1Email && (
            <div className="text-slate-400 text-[10px]">{data.party1Email}</div>
          )}
        </CoverRow>
        <CoverRow label="Party 2">
          <div>
            <Val>{data.party2Name ?? ""}</Val>
          </div>
          {data.party2Address && (
            <div className="text-slate-400 text-[10px] mt-0.5">
              {data.party2Address}
            </div>
          )}
          {data.party2Email && (
            <div className="text-slate-400 text-[10px]">{data.party2Email}</div>
          )}
        </CoverRow>
        <CoverRow label="Purpose">
          <Val>{data.purpose ?? ""}</Val>
        </CoverRow>
        <CoverRow label="MNDA Term">
          <Val>{data.mndaTerm ?? ""}</Val>
        </CoverRow>
        <CoverRow label="Confidentiality">
          <Val>{data.termOfConfidentiality ?? ""}</Val>
        </CoverRow>
        <CoverRow label="Governing Law">
          State of <Val>{data.governingLaw ?? ""}</Val>
        </CoverRow>
        <CoverRow label="Jurisdiction">
          <Val>{data.jurisdiction ?? ""}</Val>
        </CoverRow>
      </div>

      {/* Standard Terms */}
      <SectionRule>Standard Terms</SectionRule>

      <p>
        <strong>1. Introduction.</strong> This Mutual Non-Disclosure Agreement
        (which incorporates these Standard Terms and the Cover Page (defined
        below)) (&ldquo;<strong>MNDA</strong>&rdquo;) allows each party (&ldquo;
        <strong>Disclosing Party</strong>&rdquo;) to disclose or make available
        information in connection with the <Val>{data.purpose ?? ""}</Val> which (1)
        the Disclosing Party identifies to the receiving party (&ldquo;
        <strong>Receiving Party</strong>&rdquo;) as &ldquo;confidential&rdquo;,
        &ldquo;proprietary&rdquo;, or the like or (2) should be reasonably
        understood as confidential or proprietary due to its nature and the
        circumstances of its disclosure (&ldquo;
        <strong>Confidential Information</strong>&rdquo;). Each party&apos;s
        Confidential Information also includes the existence and status of the
        parties&apos; discussions and information on the Cover Page. Confidential
        Information includes technical or business information, product designs
        or roadmaps, requirements, pricing, security and compliance
        documentation, technology, inventions and know-how. To use this MNDA,
        the parties must complete and sign a cover page incorporating these
        Standard Terms (&ldquo;<strong>Cover Page</strong>&rdquo;). Each party
        is identified on the Cover Page and capitalized terms have the meanings
        given herein or on the Cover Page.
      </p>

      <p>
        <strong>2. Use and Protection of Confidential Information.</strong> The
        Receiving Party shall: (a) use Confidential Information solely for the{" "}
        <Val>{data.purpose ?? ""}</Val>; (b) not disclose Confidential Information to
        third parties without the Disclosing Party&apos;s prior written
        approval, except that the Receiving Party may disclose Confidential
        Information to its employees, agents, advisors, contractors and other
        representatives having a reasonable need to know for the{" "}
        <Val>{data.purpose ?? ""}</Val>, provided these representatives are bound by
        confidentiality obligations no less protective of the Disclosing Party
        than the applicable terms in this MNDA and the Receiving Party remains
        responsible for their compliance with this MNDA; and (c) protect
        Confidential Information using at least the same protections the
        Receiving Party uses for its own similar information but no less than a
        reasonable standard of care.
      </p>

      <p>
        <strong>3. Exceptions.</strong> The Receiving Party&apos;s obligations
        in this MNDA do not apply to information that it can demonstrate: (a) is
        or becomes publicly available through no fault of the Receiving Party;
        (b) it rightfully knew or possessed prior to receipt from the Disclosing
        Party without confidentiality restrictions; (c) it rightfully obtained
        from a third party without confidentiality restrictions; or (d) it
        independently developed without using or referencing the Confidential
        Information.
      </p>

      <p>
        <strong>4. Disclosures Required by Law.</strong> The Receiving Party may
        disclose Confidential Information to the extent required by law,
        regulation or regulatory authority, subpoena or court order, provided
        (to the extent legally permitted) it provides the Disclosing Party
        reasonable advance notice of the required disclosure and reasonably
        cooperates, at the Disclosing Party&apos;s expense, with the Disclosing
        Party&apos;s efforts to obtain confidential treatment for the
        Confidential Information.
      </p>

      <p>
        <strong>5. Term and Termination.</strong> This MNDA commences on the{" "}
        <Val>{data.effectiveDate ?? ""}</Val> and expires at the end of the{" "}
        <Val>{data.mndaTerm ?? ""}</Val>. Either party may terminate this MNDA for any
        or no reason upon written notice to the other party. The Receiving
        Party&apos;s obligations relating to Confidential Information will
        survive for the <Val>{data.termOfConfidentiality ?? ""}</Val>, despite any
        expiration or termination of this MNDA.
      </p>

      <p>
        <strong>6. Return or Destruction of Confidential Information.</strong>{" "}
        Upon expiration or termination of this MNDA or upon the Disclosing
        Party&apos;s earlier request, the Receiving Party will: (a) cease using
        Confidential Information; (b) promptly after the Disclosing Party&apos;s
        written request, destroy all Confidential Information in the Receiving
        Party&apos;s possession or control or return it to the Disclosing Party;
        and (c) if requested by the Disclosing Party, confirm its compliance
        with these obligations in writing. As an exception to subsection (b),
        the Receiving Party may retain Confidential Information in accordance
        with its standard backup or record retention policies or as required by
        law, but the terms of this MNDA will continue to apply to the retained
        Confidential Information.
      </p>

      <p>
        <strong>7. Proprietary Rights.</strong> The Disclosing Party retains all
        of its intellectual property and other rights in its Confidential
        Information and its disclosure to the Receiving Party grants no license
        under such rights.
      </p>

      <p>
        <strong>8. Disclaimer.</strong> ALL CONFIDENTIAL INFORMATION IS PROVIDED
        &ldquo;AS IS&rdquo;, WITH ALL FAULTS, AND WITHOUT WARRANTIES, INCLUDING
        THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY AND FITNESS FOR A
        PARTICULAR PURPOSE.
      </p>

      <p>
        <strong>9. Governing Law and Jurisdiction.</strong> This MNDA and all
        matters relating hereto are governed by, and construed in accordance
        with, the laws of the State of <Val>{data.governingLaw ?? ""}</Val>, without
        regard to the conflict of laws provisions of such State of{" "}
        <Val>{data.governingLaw ?? ""}</Val>. Any legal suit, action, or proceeding
        relating to this MNDA must be instituted in the federal or state courts
        located in <Val>{data.jurisdiction ?? ""}</Val>. Each party irrevocably
        submits to the exclusive jurisdiction of such{" "}
        <Val>{data.jurisdiction ?? ""}</Val> in any such suit, action, or proceeding.
      </p>

      <p>
        <strong>10. Equitable Relief.</strong> A breach of this MNDA may cause
        irreparable harm for which monetary damages are an insufficient remedy.
        Upon a breach of this MNDA, the Disclosing Party is entitled to seek
        appropriate equitable relief, including an injunction, in addition to
        its other remedies.
      </p>

      <p>
        <strong>11. General.</strong> Neither party has an obligation under this
        MNDA to disclose Confidential Information to the other or proceed with
        any proposed transaction. Neither party may assign this MNDA without the
        prior written consent of the other party, except that either party may
        assign this MNDA in connection with a merger, reorganization, acquisition
        or other transfer of all or substantially all its assets or voting
        securities. Any assignment in violation of this Section is null and void.
        This MNDA will bind and inure to the benefit of each party&apos;s
        permitted successors and assigns. Waivers must be signed by the waiving
        party&apos;s authorized representative and cannot be implied from
        conduct. If any provision of this MNDA is held unenforceable, it will be
        limited to the minimum extent necessary so the rest of this MNDA remains
        in effect. This MNDA (including the Cover Page) constitutes the entire
        agreement of the parties with respect to its subject matter, and
        supersedes all prior and contemporaneous understandings, agreements,
        representations, and warranties, whether written or oral, regarding such
        subject matter. This MNDA may only be amended, modified, waived, or
        supplemented by an agreement in writing signed by both parties. Notices,
        requests and approvals under this MNDA must be sent in writing to the
        email or postal addresses on the Cover Page and are deemed delivered on
        receipt. This MNDA may be executed in counterparts, including electronic
        copies, each of which is deemed an original and which together form the
        same agreement.
      </p>

      {/* Signatures */}
      <div className="mt-8 pt-6 border-t border-rule font-sans">
        <div className="grid grid-cols-2 gap-10">
          <div>
            <p className="text-[11px] font-semibold text-ink mb-5">
              <Val>{data.party1Name ?? ""}</Val>
            </p>
            <div className="border-b border-ink mb-1.5 h-8" />
            <p className="text-[9px] uppercase tracking-[0.15em] text-slate-400 mb-3">
              Signature
            </p>
            <p className="text-[11px] font-medium text-ink">
              <Val>{data.party1SignatoryName ?? ""}</Val>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              <Val>{data.party1SignatoryTitle ?? ""}</Val>
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-ink mb-5">
              <Val>{data.party2Name ?? ""}</Val>
            </p>
            <div className="border-b border-ink mb-1.5 h-8" />
            <p className="text-[9px] uppercase tracking-[0.15em] text-slate-400 mb-3">
              Signature
            </p>
            <p className="text-[11px] font-medium text-ink">
              <Val>{data.party2SignatoryName ?? ""}</Val>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              <Val>{data.party2SignatoryTitle ?? ""}</Val>
            </p>
          </div>
        </div>
      </div>

      <p className="text-[9px] text-slate-300 mt-8 text-center font-sans tracking-wide">
        Common Paper Mutual Non-Disclosure Agreement Version 1.0 — CC BY 4.0
      </p>
    </div>
  );
}

function GenericPreview({ config, data }: { config: DocConfig; data: FormData }) {
  return (
    <div className="nda-body">
      <SectionRule>{config.name}</SectionRule>
      <div className="mb-2">
        {config.fields.map((field) => (
          <CoverRow key={field.key} label={field.label}>
            <Val>{data[field.key] ?? ""}</Val>
          </CoverRow>
        ))}
      </div>
      <p className="text-[9px] text-slate-300 mt-8 text-center font-sans tracking-wide">
        Common Paper {config.name} — CC BY 4.0
      </p>
    </div>
  );
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function generatePDF(data: FormData): Promise<void> {
  const { default: jsPDF } = await import("jspdf");

  const f = (v: string, fallback = "[___________]") => (v ?? "").trim() || fallback;
  const purpose = f(data.purpose).replace(/\s+/g, " ");
  const effectiveDate = formatDate(data.effectiveDate) || f(data.effectiveDate);
  const mndaTerm = f(data.mndaTerm);
  const termOfConf = f(data.termOfConfidentiality);
  const govLaw = f(data.governingLaw);
  const jurisdiction = f(data.jurisdiction);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const PW = doc.internal.pageSize.getWidth();
  const PH = doc.internal.pageSize.getHeight();
  const ML = 22,
    MR = 22,
    MT = 22,
    MB = 25;
  const CW = PW - ML - MR;
  let y = MT;
  const LH = 5;

  const ensureSpace = (h: number) => {
    if (y + h > PH - MB) {
      doc.addPage();
      y = MT;
    }
  };

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("MUTUAL NON-DISCLOSURE AGREEMENT", PW / 2, y, { align: "center" });
  y += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Common Paper MNDA Version 1.0", PW / 2, y, { align: "center" });
  y += 10;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("COVER PAGE", PW / 2, y, { align: "center" });
  y += 3;
  doc.setDrawColor(160, 160, 160);
  doc.setLineWidth(0.3);
  doc.line(ML, y, PW - MR, y);
  y += 7;

  const LABEL_W = 58;
  const coverRow = (label: string, value: string, indent = 0) => {
    const lines = doc.splitTextToSize(value, CW - LABEL_W - indent);
    ensureSpace(lines.length * LH + 1);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(label, ML + indent, y);
    doc.setFont("helvetica", "normal");
    doc.text(lines, ML + indent + LABEL_W, y);
    y += lines.length * LH;
  };

  coverRow("Effective Date", effectiveDate || f(data.effectiveDate));
  y += 2;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Party 1", ML, y);
  y += LH;
  coverRow("Legal Name", f(data.party1Name), 6);
  if ((data.party1Address ?? "").trim()) coverRow("Address", data.party1Address, 6);
  if ((data.party1Email ?? "").trim()) coverRow("Email", data.party1Email, 6);
  if ((data.party1SignatoryName ?? "").trim())
    coverRow(
      "Signatory",
      `${data.party1SignatoryName}${data.party1SignatoryTitle ? ", " + data.party1SignatoryTitle : ""}`,
      6
    );
  y += 2;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Party 2", ML, y);
  y += LH;
  coverRow("Legal Name", f(data.party2Name), 6);
  if ((data.party2Address ?? "").trim()) coverRow("Address", data.party2Address, 6);
  if ((data.party2Email ?? "").trim()) coverRow("Email", data.party2Email, 6);
  if ((data.party2SignatoryName ?? "").trim())
    coverRow(
      "Signatory",
      `${data.party2SignatoryName}${data.party2SignatoryTitle ? ", " + data.party2SignatoryTitle : ""}`,
      6
    );
  y += 2;

  coverRow("Purpose", purpose);
  coverRow("MNDA Term", mndaTerm);
  coverRow("Term of Confidentiality", termOfConf);
  coverRow("Governing Law", `State of ${govLaw}`);
  coverRow("Jurisdiction", jurisdiction);

  doc.addPage();
  y = MT;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("STANDARD TERMS", PW / 2, y, { align: "center" });
  y += 3;
  doc.setDrawColor(160, 160, 160);
  doc.line(ML, y, PW - MR, y);
  y += 8;

  const clause = (num: string, heading: string, body: string) => {
    const bodyLines = doc.splitTextToSize(
      body.replace(/\s+/g, " ").trim(),
      CW - 8
    );
    ensureSpace(LH * 2 + LH * Math.min(bodyLines.length, 4) + 4);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`${num}. ${heading}`, ML, y);
    y += LH;
    doc.setFont("helvetica", "normal");
    bodyLines.forEach((line: string) => {
      ensureSpace(LH);
      doc.text(line, ML + 8, y);
      y += LH;
    });
    y += 4;
  };

  clause("1", "Introduction", `This Mutual Non-Disclosure Agreement (which incorporates these Standard Terms and the Cover Page (defined below)) ("MNDA") allows each party ("Disclosing Party") to disclose or make available information in connection with the ${purpose} which (1) the Disclosing Party identifies to the receiving party ("Receiving Party") as "confidential", "proprietary", or the like or (2) should be reasonably understood as confidential or proprietary due to its nature and the circumstances of its disclosure ("Confidential Information"). Each party's Confidential Information also includes the existence and status of the parties' discussions and information on the Cover Page. Confidential Information includes technical or business information, product designs or roadmaps, requirements, pricing, security and compliance documentation, technology, inventions and know-how. To use this MNDA, the parties must complete and sign a cover page incorporating these Standard Terms ("Cover Page"). Each party is identified on the Cover Page and capitalized terms have the meanings given herein or on the Cover Page.`);
  clause("2", "Use and Protection of Confidential Information", `The Receiving Party shall: (a) use Confidential Information solely for the ${purpose}; (b) not disclose Confidential Information to third parties without the Disclosing Party's prior written approval, except that the Receiving Party may disclose Confidential Information to its employees, agents, advisors, contractors and other representatives having a reasonable need to know for the ${purpose}, provided these representatives are bound by confidentiality obligations no less protective of the Disclosing Party than the applicable terms in this MNDA and the Receiving Party remains responsible for their compliance with this MNDA; and (c) protect Confidential Information using at least the same protections the Receiving Party uses for its own similar information but no less than a reasonable standard of care.`);
  clause("3", "Exceptions", `The Receiving Party's obligations in this MNDA do not apply to information that it can demonstrate: (a) is or becomes publicly available through no fault of the Receiving Party; (b) it rightfully knew or possessed prior to receipt from the Disclosing Party without confidentiality restrictions; (c) it rightfully obtained from a third party without confidentiality restrictions; or (d) it independently developed without using or referencing the Confidential Information.`);
  clause("4", "Disclosures Required by Law", `The Receiving Party may disclose Confidential Information to the extent required by law, regulation or regulatory authority, subpoena or court order, provided (to the extent legally permitted) it provides the Disclosing Party reasonable advance notice of the required disclosure and reasonably cooperates, at the Disclosing Party's expense, with the Disclosing Party's efforts to obtain confidential treatment for the Confidential Information.`);
  clause("5", "Term and Termination", `This MNDA commences on the ${effectiveDate} and expires at the end of the ${mndaTerm}. Either party may terminate this MNDA for any or no reason upon written notice to the other party. The Receiving Party's obligations relating to Confidential Information will survive for the ${termOfConf}, despite any expiration or termination of this MNDA.`);
  clause("6", "Return or Destruction of Confidential Information", `Upon expiration or termination of this MNDA or upon the Disclosing Party's earlier request, the Receiving Party will: (a) cease using Confidential Information; (b) promptly after the Disclosing Party's written request, destroy all Confidential Information in the Receiving Party's possession or control or return it to the Disclosing Party; and (c) if requested by the Disclosing Party, confirm its compliance with these obligations in writing. As an exception to subsection (b), the Receiving Party may retain Confidential Information in accordance with its standard backup or record retention policies or as required by law, but the terms of this MNDA will continue to apply to the retained Confidential Information.`);
  clause("7", "Proprietary Rights", `The Disclosing Party retains all of its intellectual property and other rights in its Confidential Information and its disclosure to the Receiving Party grants no license under such rights.`);
  clause("8", "Disclaimer", `ALL CONFIDENTIAL INFORMATION IS PROVIDED "AS IS", WITH ALL FAULTS, AND WITHOUT WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.`);
  clause("9", "Governing Law and Jurisdiction", `This MNDA and all matters relating hereto are governed by, and construed in accordance with, the laws of the State of ${govLaw}, without regard to the conflict of laws provisions of such ${govLaw}. Any legal suit, action, or proceeding relating to this MNDA must be instituted in the federal or state courts located in ${jurisdiction}. Each party irrevocably submits to the exclusive jurisdiction of such ${jurisdiction} in any such suit, action, or proceeding.`);
  clause("10", "Equitable Relief", `A breach of this MNDA may cause irreparable harm for which monetary damages are an insufficient remedy. Upon a breach of this MNDA, the Disclosing Party is entitled to seek appropriate equitable relief, including an injunction, in addition to its other remedies.`);
  clause("11", "General", `Neither party has an obligation under this MNDA to disclose Confidential Information to the other or proceed with any proposed transaction. Neither party may assign this MNDA without the prior written consent of the other party, except that either party may assign this MNDA in connection with a merger, reorganization, acquisition or other transfer of all or substantially all its assets or voting securities. Any assignment in violation of this Section is null and void. This MNDA will bind and inure to the benefit of each party's permitted successors and assigns. Waivers must be signed by the waiving party's authorized representative and cannot be implied from conduct. If any provision of this MNDA is held unenforceable, it will be limited to the minimum extent necessary so the rest of this MNDA remains in effect. This MNDA (including the Cover Page) constitutes the entire agreement of the parties with respect to its subject matter, and supersedes all prior and contemporaneous understandings, agreements, representations, and warranties, whether written or oral, regarding such subject matter. This MNDA may only be amended, modified, waived, or supplemented by an agreement in writing signed by both parties. Notices, requests and approvals under this MNDA must be sent in writing to the email or postal addresses on the Cover Page and are deemed delivered on receipt. This MNDA may be executed in counterparts, including electronic copies, each of which is deemed an original and which together form the same agreement.`);

  ensureSpace(55);
  y += 4;
  doc.setDrawColor(160, 160, 160);
  doc.setLineWidth(0.3);
  doc.line(ML, y, PW - MR, y);
  y += 8;

  const col1X = ML;
  const col2X = ML + CW / 2 + 8;
  const sigW = CW / 2 - 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(f(data.party1Name), col1X, y);
  doc.text(f(data.party2Name), col2X, y);
  y += 12;

  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(col1X, y, col1X + sigW, y);
  doc.line(col2X, y, col2X + sigW, y);
  y += 3;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Signature", col1X, y);
  doc.text("Signature", col2X, y);
  y += 8;

  doc.setFontSize(9);
  doc.text(f(data.party1SignatoryName, ""), col1X, y);
  doc.text(f(data.party2SignatoryName, ""), col2X, y);
  y += LH;

  doc.setFontSize(8);
  doc.text(f(data.party1SignatoryTitle, ""), col1X, y);
  doc.text(f(data.party2SignatoryTitle, ""), col2X, y);
  y += 12;

  doc.setFontSize(7);
  doc.setTextColor(140);
  doc.text(
    "Common Paper Mutual Non-Disclosure Agreement Version 1.0 — free to use under CC BY 4.0",
    PW / 2,
    y,
    { align: "center" }
  );

  doc.save("mutual-nda.pdf");
}

async function generateGenericPDF(config: DocConfig, data: FormData): Promise<void> {
  const { default: jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const PW = doc.internal.pageSize.getWidth();
  const PH = doc.internal.pageSize.getHeight();
  const ML = 22, MR = 22, MT = 22, MB = 25;
  const CW = PW - ML - MR;
  let y = MT;
  const LH = 5;
  const LABEL_W = 60;

  const ensureSpace = (h: number) => {
    if (y + h > PH - MB) { doc.addPage(); y = MT; }
  };

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(config.name.toUpperCase(), PW / 2, y, { align: "center" });
  y += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Common Paper Standard Agreement", PW / 2, y, { align: "center" });
  y += 10;

  doc.setDrawColor(160, 160, 160);
  doc.setLineWidth(0.3);
  doc.line(ML, y, PW - MR, y);
  y += 8;

  config.fields.forEach((field) => {
    const val = (data[field.key] ?? "").trim() || "[___________]";
    const lines = doc.splitTextToSize(val, CW - LABEL_W);
    ensureSpace(LH * lines.length + 3);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(field.label, ML, y);
    doc.setFont("helvetica", "normal");
    doc.text(lines, ML + LABEL_W, y);
    y += LH * lines.length + 2;
  });

  y += 8;
  ensureSpace(20);
  doc.setFontSize(7);
  doc.setTextColor(140);
  doc.text(
    `Common Paper ${config.name} — free to use under CC BY 4.0`,
    PW / 2, y, { align: "center" }
  );

  doc.save(`${config.docType.replace(/_/g, "-")}.pdf`);
}

// ── Form components ───────────────────────────────────────────────────────────

function FormSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-lg border border-rule shadow-sm overflow-hidden">
      <div className="px-4 pt-3.5 pb-0.5 border-b border-rule/60">
        <div className="flex items-center gap-3 pb-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            {label}
          </span>
          <div className="flex-1 h-px bg-rule" />
        </div>
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </section>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="text-gold ml-0.5">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="form-input"
      />
    </div>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="text-gold ml-0.5">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={3}
        className="form-input resize-none"
      />
    </div>
  );
}

function DynamicFormPanel({
  config,
  data,
  onInputChange,
  onTextAreaChange,
}: {
  config: DocConfig;
  data: FormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextAreaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <div className="p-4 space-y-3">
      <FormSection label={config.name}>
        <div className="space-y-3">
          {config.fields.map((field) =>
            field.fieldType === "textarea" ? (
              <TextAreaField
                key={field.key}
                label={field.label}
                name={field.key}
                value={data[field.key] ?? ""}
                onChange={onTextAreaChange}
                placeholder={field.placeholder}
                required={field.required}
              />
            ) : (
              <InputField
                key={field.key}
                label={field.label}
                name={field.key}
                value={data[field.key] ?? ""}
                onChange={onInputChange}
                placeholder={field.placeholder}
                required={field.required}
                type={field.fieldType}
              />
            )
          )}
        </div>
      </FormSection>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function SendIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-4 h-4"
    >
      <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-3.5 w-3.5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Home() {
  const { user, loading, signOut } = useAuth();

  // Document workflow state
  const [mode, setMode] = useState<"chat" | "form">("chat");
  const [documentType, setDocumentType] = useState<string | null>(null);
  const [docConfig, setDocConfig] = useState<DocConfig | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [input, setInput] = useState("");

  // Persistence state
  const [currentDocId, setCurrentDocId] = useState<number | null>(null);
  const [saveDocName, setSaveDocName] = useState("");

  // Modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMyDocs, setShowMyDocs] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isComplete =
    docConfig !== null &&
    docConfig.requiredFieldKeys.every((k) => (formData[k] ?? "").trim() !== "");

  const handleDownload = async () => {
    if (!docConfig) return;
    if (documentType === "mutual_nda") {
      await generatePDF(formData);
    } else {
      await generateGenericPDF(docConfig, formData);
    }
  };

  const fetchGreeting = useCallback(() => {
    fetch("/api/chat/greeting")
      .then((r) => r.json())
      .then((data: { message: string }) =>
        setMessages([{ role: "assistant", content: data.message }])
      )
      .catch(() =>
        setMessages([
          {
            role: "assistant",
            content:
              "Hi! I'm here to help you draft legal agreements. What kind of document do you need today?",
          },
        ])
      );
  }, []);

  // Fetch greeting on mount
  useEffect(() => {
    fetchGreeting();
  }, [fetchGreeting]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentMessage]);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    const historySnapshot = [...messages];

    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
    setIsStreaming(true);
    setCurrentMessage("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    let assistantText = "";

    try {
      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: historySnapshot,
          document_type: documentType,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Request failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          if (!part.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(part.slice(6)) as {
              type: string;
              content?: string;
              fields?: FormData;
              document_type?: string;
              name?: string;
            };

            if (data.type === "text" && data.content) {
              assistantText += data.content;
              setCurrentMessage(assistantText);
            } else if (data.type === "detection" && data.document_type) {
              const config = DOCUMENT_CONFIGS[data.document_type];
              if (config) {
                setDocumentType(data.document_type);
                setDocConfig(config);
                setFormData(emptyFormData(config));
              }
            } else if (data.type === "fields" && data.fields) {
              setFormData((prev) => ({
                ...prev,
                ...Object.fromEntries(
                  Object.entries(data.fields as FormData).filter(([, v]) => v !== "")
                ),
              }));
            }
          } catch {
            // Skip malformed SSE events
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      if (assistantText) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: assistantText },
        ]);
      }
      setCurrentMessage("");
      setIsStreaming(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }

  };

  const isNDA = documentType === "mutual_nda" || documentType === "mutual_nda_coverpage";

  const handleNewDocument = useCallback(() => {
    setDocumentType(null);
    setDocConfig(null);
    setFormData({});
    setMessages([]);
    setCurrentDocId(null);
    setSaveDocName("");
    setMode("chat");
    fetchGreeting();
  }, [fetchGreeting]);

  const handleSignout = useCallback(async () => {
    await signOut();
    setCurrentDocId(null);
    setSaveDocName("");
  }, [signOut]);

  const handleSave = useCallback(async () => {
    if (!docConfig || !user || !documentType) return;
    if (currentDocId !== null) {
      const r = await fetch(`/api/documents/${currentDocId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: saveDocName, form_data: formData }),
      }).catch(() => null);
      if (!r?.ok) {
        // Session likely expired — prompt re-auth
        setShowAuthModal(true);
      }
    } else {
      setSaveDocName(docConfig.name);
      setShowSavePrompt(true);
    }
  }, [docConfig, user, documentType, currentDocId, saveDocName, formData]);

  const handleSaveConfirm = useCallback(
    async (name: string) => {
      if (!docConfig || !documentType) return;
      const r = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, document_type: documentType, form_data: formData }),
      });
      if (!r.ok) throw new Error("Save failed");
      const data = await r.json();
      setCurrentDocId(data.id);
      setSaveDocName(name);
      setShowSavePrompt(false);
    },
    [docConfig, documentType, formData]
  );

  const handleLoadDoc = useCallback(
    (doc: SavedDocWithFields) => {
      const config = DOCUMENT_CONFIGS[doc.document_type] ?? null;
      setDocumentType(doc.document_type);
      setDocConfig(config);
      setFormData(doc.form_data);
      setCurrentDocId(doc.id);
      setSaveDocName(doc.name);
      setMessages([]);
      setMode("form");
      setShowMyDocs(false);
    },
    []
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex-none bg-navy px-6 py-3 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-[17px] font-semibold text-white tracking-tight">
            Prelegal
          </span>
          <span className="hidden sm:block text-[11px] text-slate-500">
            {docConfig ? docConfig.name : "Legal Document Creator"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* New Document */}
          {docConfig && (
            <button
              onClick={handleNewDocument}
              className="text-[11px] text-slate-400 hover:text-white border border-slate-600/50 rounded px-2.5 py-1.5 transition-colors"
            >
              New
            </button>
          )}

          {/* Save */}
          {docConfig && user && (
            <button
              onClick={handleSave}
              className="text-[11px] font-semibold text-gold border border-gold/50 rounded px-2.5 py-1.5 hover:bg-gold/10 transition-colors"
            >
              {currentDocId ? "Update" : "Save"}
            </button>
          )}

          {/* My Documents */}
          {user && (
            <button
              onClick={() => setShowMyDocs(true)}
              className="text-[11px] text-slate-400 hover:text-white transition-colors px-1.5"
            >
              My Documents
            </button>
          )}

          {/* Download PDF */}
          {(isComplete || mode === "form") && docConfig && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-white hover:bg-gold-hover transition-colors"
            >
              <DownloadIcon />
              Download PDF
            </button>
          )}

          {/* Auth controls */}
          {!loading && !user && (
            <button
              onClick={() => setShowAuthModal(true)}
              className="text-[11px] font-semibold text-white border border-white/20 rounded px-2.5 py-1.5 hover:bg-white/10 transition-colors"
            >
              Sign In
            </button>
          )}
          {!loading && user && (
            <div className="flex items-center gap-2 ml-1">
              <span className="hidden sm:block text-[11px] text-slate-400 max-w-[140px] truncate">
                {user.email}
              </span>
              <button
                onClick={handleSignout}
                className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Split-screen body ───────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex">
        {/* Left panel: Chat or Form */}
        <div className="w-[400px] flex-none flex flex-col bg-surface border-r border-rule">

          {/* Mode tabs */}
          <div className="flex-none flex bg-white border-b border-rule">
            <button
              onClick={() => setMode("chat")}
              className={`flex-1 py-2.5 text-[12px] font-semibold tracking-wide transition-colors ${
                mode === "chat"
                  ? "text-navy border-b-2 border-navy"
                  : "text-slate-400 hover:text-ink"
              }`}
            >
              AI Chat
            </button>
            <button
              onClick={() => setMode("form")}
              className={`flex-1 py-2.5 text-[12px] font-semibold tracking-wide transition-colors ${
                mode === "form"
                  ? "text-navy border-b-2 border-navy"
                  : "text-slate-400 hover:text-ink"
              }`}
            >
              Manual Form
            </button>
          </div>

          {/* ── AI Chat panel ─────────────────────────────────────────────── */}
          {mode === "chat" && (
            <>
              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-navy text-white rounded-tr-sm"
                          : "bg-white border border-rule text-ink shadow-sm rounded-tl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {/* Typing indicator while waiting for first token */}
                {isStreaming && !currentMessage && (
                  <div className="flex justify-start">
                    <div className="rounded-xl rounded-tl-sm px-3.5 py-3 bg-white border border-rule shadow-sm">
                      <div className="flex gap-1 items-center h-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Streaming message in progress */}
                {currentMessage && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-xl rounded-tl-sm px-3.5 py-2.5 text-[13px] leading-relaxed bg-white border border-rule text-ink shadow-sm whitespace-pre-wrap">
                      {currentMessage}
                      <span className="inline-block w-[2px] h-[14px] ml-0.5 bg-gold animate-pulse align-text-bottom" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat input */}
              <div className="flex-none border-t border-rule bg-white p-3">
                <div className="flex gap-2 items-end">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height =
                        Math.min(e.target.scrollHeight, 120) + "px";
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type your message…"
                    disabled={isStreaming}
                    className="flex-1 form-input resize-none text-[13px] leading-relaxed overflow-y-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ minHeight: "38px", maxHeight: "120px" }}
                    rows={1}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={isStreaming || !input.trim()}
                    aria-label="Send"
                    className="flex-none w-9 h-9 flex items-center justify-center rounded-md bg-navy text-white disabled:opacity-40 hover:bg-navy/90 transition-colors"
                  >
                    <SendIcon />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 ml-0.5">
                  Enter to send · Shift+Enter for new line
                </p>
              </div>
            </>
          )}

          {/* ── Manual Form panel ─────────────────────────────────────────── */}
          {mode === "form" && (
            <div className="flex-1 overflow-y-auto">
              {docConfig ? (
                isNDA ? (
                  /* Retain the structured NDA form layout */
                  <div className="p-4 space-y-3">
                    <FormSection label="Party 1">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <InputField
                            label="Legal Name"
                            name="party1Name"
                            value={formData.party1Name ?? ""}
                            onChange={handleInput}
                            placeholder="Acme Corp."
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <InputField
                            label="Address"
                            name="party1Address"
                            value={formData.party1Address ?? ""}
                            onChange={handleInput}
                            placeholder="123 Main St, San Francisco, CA 94105"
                          />
                        </div>
                        <InputField
                          label="Email"
                          name="party1Email"
                          value={formData.party1Email ?? ""}
                          onChange={handleInput}
                          placeholder="legal@acme.com"
                          type="email"
                        />
                        <InputField
                          label="Signatory Name"
                          name="party1SignatoryName"
                          value={formData.party1SignatoryName ?? ""}
                          onChange={handleInput}
                          placeholder="Jane Smith"
                        />
                        <div className="col-span-2">
                          <InputField
                            label="Signatory Title"
                            name="party1SignatoryTitle"
                            value={formData.party1SignatoryTitle ?? ""}
                            onChange={handleInput}
                            placeholder="Chief Executive Officer"
                          />
                        </div>
                      </div>
                    </FormSection>

                    <FormSection label="Party 2">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <InputField
                            label="Legal Name"
                            name="party2Name"
                            value={formData.party2Name ?? ""}
                            onChange={handleInput}
                            placeholder="Globex Inc."
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <InputField
                            label="Address"
                            name="party2Address"
                            value={formData.party2Address ?? ""}
                            onChange={handleInput}
                            placeholder="456 Market St, New York, NY 10001"
                          />
                        </div>
                        <InputField
                          label="Email"
                          name="party2Email"
                          value={formData.party2Email ?? ""}
                          onChange={handleInput}
                          placeholder="legal@globex.com"
                          type="email"
                        />
                        <InputField
                          label="Signatory Name"
                          name="party2SignatoryName"
                          value={formData.party2SignatoryName ?? ""}
                          onChange={handleInput}
                          placeholder="John Doe"
                        />
                        <div className="col-span-2">
                          <InputField
                            label="Signatory Title"
                            name="party2SignatoryTitle"
                            value={formData.party2SignatoryTitle ?? ""}
                            onChange={handleInput}
                            placeholder="Chief Executive Officer"
                          />
                        </div>
                      </div>
                    </FormSection>

                    <FormSection label="Agreement Terms">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <TextAreaField
                            label="Purpose"
                            name="purpose"
                            value={formData.purpose ?? ""}
                            onChange={handleInput}
                            placeholder="evaluating a potential business relationship between the parties"
                            required
                          />
                        </div>
                        <InputField
                          label="Effective Date"
                          name="effectiveDate"
                          value={formData.effectiveDate ?? ""}
                          onChange={handleInput}
                          type="date"
                          required
                        />
                        <InputField
                          label="MNDA Term"
                          name="mndaTerm"
                          value={formData.mndaTerm ?? ""}
                          onChange={handleInput}
                          placeholder="2 years from Effective Date"
                          required
                        />
                        <div className="col-span-2">
                          <InputField
                            label="Term of Confidentiality"
                            name="termOfConfidentiality"
                            value={formData.termOfConfidentiality ?? ""}
                            onChange={handleInput}
                            placeholder="3 years following expiration or termination"
                            required
                          />
                        </div>
                        <InputField
                          label="Governing Law (State)"
                          name="governingLaw"
                          value={formData.governingLaw ?? ""}
                          onChange={handleInput}
                          placeholder="Delaware"
                          required
                        />
                        <InputField
                          label="Jurisdiction"
                          name="jurisdiction"
                          value={formData.jurisdiction ?? ""}
                          onChange={handleInput}
                          placeholder="Wilmington, Delaware"
                          required
                        />
                      </div>
                    </FormSection>
                  </div>
                ) : (
                  <DynamicFormPanel
                    config={docConfig}
                    data={formData}
                    onInputChange={handleInput}
                    onTextAreaChange={handleInput}
                  />
                )
              ) : (
                <div className="flex items-center justify-center h-full p-8 text-center">
                  <p className="text-slate-400 text-[13px] font-sans">
                    Use the AI Chat tab to tell me what document you need, then switch here to fill in fields manually.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right panel: live document preview */}
        <div className="flex-1 overflow-y-auto bg-desk">
          <div className="px-8 py-8">
            <div
              className="max-w-[660px] mx-auto bg-white shadow-paper px-12 py-11"
              style={{ borderRadius: "2px" }}
            >
              {docConfig ? (
                <>
                  <div className="text-center mb-6">
                    <h1 className="font-serif text-[21px] font-bold text-ink leading-tight mb-2">
                      {docConfig.name}
                    </h1>
                    <p className="text-[9px] font-sans font-bold uppercase tracking-[0.22em] text-slate-400">
                      Common Paper Standard Agreement
                    </p>
                  </div>

                  <div className="mb-6 rounded border border-gold-rule bg-gold-light px-4 py-2.5 text-[10px] font-sans text-center text-slate-500 leading-relaxed">
                    <span className="font-semibold text-slate-600">Draft only</span> — This document is AI-generated for review purposes and does not constitute legal advice. Consult a qualified attorney before signing.
                  </div>

                  {isNDA ? (
                    <NDAPreview data={formData} />
                  ) : (
                    <GenericPreview config={docConfig} data={formData} />
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                  <p className="font-serif text-[18px] text-slate-300 mb-3">Prelegal</p>
                  <p className="text-[13px] text-slate-400 font-sans max-w-xs leading-relaxed">
                    Tell the AI what legal document you need to get started. Your document preview will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
      {showSavePrompt && (
        <SaveDocumentModal
          defaultName={saveDocName}
          onClose={() => setShowSavePrompt(false)}
          onSave={handleSaveConfirm}
        />
      )}
      {showMyDocs && (
        <MyDocumentsModal
          onClose={() => setShowMyDocs(false)}
          onLoad={handleLoadDoc}
        />
      )}
    </div>
  );
}
