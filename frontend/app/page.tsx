"use client";

import { useEffect, useRef, useState } from "react";

interface NDAFormData {
  party1Name: string;
  party1Address: string;
  party1Email: string;
  party1SignatoryName: string;
  party1SignatoryTitle: string;
  party2Name: string;
  party2Address: string;
  party2Email: string;
  party2SignatoryName: string;
  party2SignatoryTitle: string;
  purpose: string;
  effectiveDate: string;
  mndaTerm: string;
  termOfConfidentiality: string;
  governingLaw: string;
  jurisdiction: string;
}

const empty: NDAFormData = {
  party1Name: "",
  party1Address: "",
  party1Email: "",
  party1SignatoryName: "",
  party1SignatoryTitle: "",
  party2Name: "",
  party2Address: "",
  party2Email: "",
  party2SignatoryName: "",
  party2SignatoryTitle: "",
  purpose: "",
  effectiveDate: "",
  mndaTerm: "",
  termOfConfidentiality: "",
  governingLaw: "",
  jurisdiction: "",
};

const REQUIRED_FIELDS: (keyof NDAFormData)[] = [
  "party1Name",
  "party2Name",
  "purpose",
  "effectiveDate",
  "mndaTerm",
  "termOfConfidentiality",
  "governingLaw",
  "jurisdiction",
];

interface Message {
  role: "user" | "assistant";
  content: string;
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

function NDAPreview({ data }: { data: NDAFormData }) {
  return (
    <div className="nda-body">
      {/* Cover Page */}
      <SectionRule>Cover Page</SectionRule>
      <div className="mb-2">
        <CoverRow label="Effective Date">
          <Val>{data.effectiveDate}</Val>
        </CoverRow>
        <CoverRow label="Party 1">
          <div>
            <Val>{data.party1Name}</Val>
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
            <Val>{data.party2Name}</Val>
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
          <Val>{data.purpose}</Val>
        </CoverRow>
        <CoverRow label="MNDA Term">
          <Val>{data.mndaTerm}</Val>
        </CoverRow>
        <CoverRow label="Confidentiality">
          <Val>{data.termOfConfidentiality}</Val>
        </CoverRow>
        <CoverRow label="Governing Law">
          State of <Val>{data.governingLaw}</Val>
        </CoverRow>
        <CoverRow label="Jurisdiction">
          <Val>{data.jurisdiction}</Val>
        </CoverRow>
      </div>

      {/* Standard Terms */}
      <SectionRule>Standard Terms</SectionRule>

      <p>
        <strong>1. Introduction.</strong> This Mutual Non-Disclosure Agreement
        (which incorporates these Standard Terms and the Cover Page (defined
        below)) (&ldquo;<strong>MNDA</strong>&rdquo;) allows each party (&ldquo;
        <strong>Disclosing Party</strong>&rdquo;) to disclose or make available
        information in connection with the <Val>{data.purpose}</Val> which (1)
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
        <Val>{data.purpose}</Val>; (b) not disclose Confidential Information to
        third parties without the Disclosing Party&apos;s prior written
        approval, except that the Receiving Party may disclose Confidential
        Information to its employees, agents, advisors, contractors and other
        representatives having a reasonable need to know for the{" "}
        <Val>{data.purpose}</Val>, provided these representatives are bound by
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
        <Val>{data.effectiveDate}</Val> and expires at the end of the{" "}
        <Val>{data.mndaTerm}</Val>. Either party may terminate this MNDA for any
        or no reason upon written notice to the other party. The Receiving
        Party&apos;s obligations relating to Confidential Information will
        survive for the <Val>{data.termOfConfidentiality}</Val>, despite any
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
        with, the laws of the State of <Val>{data.governingLaw}</Val>, without
        regard to the conflict of laws provisions of such State of{" "}
        <Val>{data.governingLaw}</Val>. Any legal suit, action, or proceeding
        relating to this MNDA must be instituted in the federal or state courts
        located in <Val>{data.jurisdiction}</Val>. Each party irrevocably
        submits to the exclusive jurisdiction of such{" "}
        <Val>{data.jurisdiction}</Val> in any such suit, action, or proceeding.
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
              <Val>{data.party1Name}</Val>
            </p>
            <div className="border-b border-ink mb-1.5 h-8" />
            <p className="text-[9px] uppercase tracking-[0.15em] text-slate-400 mb-3">
              Signature
            </p>
            <p className="text-[11px] font-medium text-ink">
              <Val>{data.party1SignatoryName}</Val>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              <Val>{data.party1SignatoryTitle}</Val>
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-ink mb-5">
              <Val>{data.party2Name}</Val>
            </p>
            <div className="border-b border-ink mb-1.5 h-8" />
            <p className="text-[9px] uppercase tracking-[0.15em] text-slate-400 mb-3">
              Signature
            </p>
            <p className="text-[11px] font-medium text-ink">
              <Val>{data.party2SignatoryName}</Val>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              <Val>{data.party2SignatoryTitle}</Val>
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

function formatDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function generatePDF(data: NDAFormData): Promise<void> {
  const { default: jsPDF } = await import("jspdf");

  const f = (v: string, fallback = "[___________]") => v.trim() || fallback;
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

  // ── Title ──────────────────────────────────────────────────────────────────
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("MUTUAL NON-DISCLOSURE AGREEMENT", PW / 2, y, { align: "center" });
  y += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Common Paper MNDA Version 1.0", PW / 2, y, { align: "center" });
  y += 10;

  // ── Cover Page ─────────────────────────────────────────────────────────────
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
  if (data.party1Address.trim()) coverRow("Address", data.party1Address, 6);
  if (data.party1Email.trim()) coverRow("Email", data.party1Email, 6);
  if (data.party1SignatoryName.trim())
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
  if (data.party2Address.trim()) coverRow("Address", data.party2Address, 6);
  if (data.party2Email.trim()) coverRow("Email", data.party2Email, 6);
  if (data.party2SignatoryName.trim())
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

  // ── Standard Terms ─────────────────────────────────────────────────────────
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

  clause(
    "1",
    "Introduction",
    `This Mutual Non-Disclosure Agreement (which incorporates these Standard Terms and the Cover Page (defined below)) ("MNDA") allows each party ("Disclosing Party") to disclose or make available information in connection with the ${purpose} which (1) the Disclosing Party identifies to the receiving party ("Receiving Party") as "confidential", "proprietary", or the like or (2) should be reasonably understood as confidential or proprietary due to its nature and the circumstances of its disclosure ("Confidential Information"). Each party's Confidential Information also includes the existence and status of the parties' discussions and information on the Cover Page. Confidential Information includes technical or business information, product designs or roadmaps, requirements, pricing, security and compliance documentation, technology, inventions and know-how. To use this MNDA, the parties must complete and sign a cover page incorporating these Standard Terms ("Cover Page"). Each party is identified on the Cover Page and capitalized terms have the meanings given herein or on the Cover Page.`
  );

  clause(
    "2",
    "Use and Protection of Confidential Information",
    `The Receiving Party shall: (a) use Confidential Information solely for the ${purpose}; (b) not disclose Confidential Information to third parties without the Disclosing Party's prior written approval, except that the Receiving Party may disclose Confidential Information to its employees, agents, advisors, contractors and other representatives having a reasonable need to know for the ${purpose}, provided these representatives are bound by confidentiality obligations no less protective of the Disclosing Party than the applicable terms in this MNDA and the Receiving Party remains responsible for their compliance with this MNDA; and (c) protect Confidential Information using at least the same protections the Receiving Party uses for its own similar information but no less than a reasonable standard of care.`
  );

  clause(
    "3",
    "Exceptions",
    `The Receiving Party's obligations in this MNDA do not apply to information that it can demonstrate: (a) is or becomes publicly available through no fault of the Receiving Party; (b) it rightfully knew or possessed prior to receipt from the Disclosing Party without confidentiality restrictions; (c) it rightfully obtained from a third party without confidentiality restrictions; or (d) it independently developed without using or referencing the Confidential Information.`
  );

  clause(
    "4",
    "Disclosures Required by Law",
    `The Receiving Party may disclose Confidential Information to the extent required by law, regulation or regulatory authority, subpoena or court order, provided (to the extent legally permitted) it provides the Disclosing Party reasonable advance notice of the required disclosure and reasonably cooperates, at the Disclosing Party's expense, with the Disclosing Party's efforts to obtain confidential treatment for the Confidential Information.`
  );

  clause(
    "5",
    "Term and Termination",
    `This MNDA commences on the ${effectiveDate} and expires at the end of the ${mndaTerm}. Either party may terminate this MNDA for any or no reason upon written notice to the other party. The Receiving Party's obligations relating to Confidential Information will survive for the ${termOfConf}, despite any expiration or termination of this MNDA.`
  );

  clause(
    "6",
    "Return or Destruction of Confidential Information",
    `Upon expiration or termination of this MNDA or upon the Disclosing Party's earlier request, the Receiving Party will: (a) cease using Confidential Information; (b) promptly after the Disclosing Party's written request, destroy all Confidential Information in the Receiving Party's possession or control or return it to the Disclosing Party; and (c) if requested by the Disclosing Party, confirm its compliance with these obligations in writing. As an exception to subsection (b), the Receiving Party may retain Confidential Information in accordance with its standard backup or record retention policies or as required by law, but the terms of this MNDA will continue to apply to the retained Confidential Information.`
  );

  clause(
    "7",
    "Proprietary Rights",
    `The Disclosing Party retains all of its intellectual property and other rights in its Confidential Information and its disclosure to the Receiving Party grants no license under such rights.`
  );

  clause(
    "8",
    "Disclaimer",
    `ALL CONFIDENTIAL INFORMATION IS PROVIDED "AS IS", WITH ALL FAULTS, AND WITHOUT WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.`
  );

  clause(
    "9",
    "Governing Law and Jurisdiction",
    `This MNDA and all matters relating hereto are governed by, and construed in accordance with, the laws of the State of ${govLaw}, without regard to the conflict of laws provisions of such ${govLaw}. Any legal suit, action, or proceeding relating to this MNDA must be instituted in the federal or state courts located in ${jurisdiction}. Each party irrevocably submits to the exclusive jurisdiction of such ${jurisdiction} in any such suit, action, or proceeding.`
  );

  clause(
    "10",
    "Equitable Relief",
    `A breach of this MNDA may cause irreparable harm for which monetary damages are an insufficient remedy. Upon a breach of this MNDA, the Disclosing Party is entitled to seek appropriate equitable relief, including an injunction, in addition to its other remedies.`
  );

  clause(
    "11",
    "General",
    `Neither party has an obligation under this MNDA to disclose Confidential Information to the other or proceed with any proposed transaction. Neither party may assign this MNDA without the prior written consent of the other party, except that either party may assign this MNDA in connection with a merger, reorganization, acquisition or other transfer of all or substantially all its assets or voting securities. Any assignment in violation of this Section is null and void. This MNDA will bind and inure to the benefit of each party's permitted successors and assigns. Waivers must be signed by the waiving party's authorized representative and cannot be implied from conduct. If any provision of this MNDA is held unenforceable, it will be limited to the minimum extent necessary so the rest of this MNDA remains in effect. This MNDA (including the Cover Page) constitutes the entire agreement of the parties with respect to its subject matter, and supersedes all prior and contemporaneous understandings, agreements, representations, and warranties, whether written or oral, regarding such subject matter. This MNDA may only be amended, modified, waived, or supplemented by an agreement in writing signed by both parties. Notices, requests and approvals under this MNDA must be sent in writing to the email or postal addresses on the Cover Page and are deemed delivered on receipt. This MNDA may be executed in counterparts, including electronic copies, each of which is deemed an original and which together form the same agreement.`
  );

  // ── Signatures ─────────────────────────────────────────────────────────────
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
  doc.text(f(data.party1SignatoryName), col1X, y);
  doc.text(f(data.party2SignatoryName), col2X, y);
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

// ── Send icon ─────────────────────────────────────────────────────────────────

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

// ── Download icon ─────────────────────────────────────────────────────────────

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
  const [formData, setFormData] = useState<NDAFormData>(empty);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [input, setInput] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isComplete = REQUIRED_FIELDS.every((f) => formData[f].trim() !== "");

  // Fetch greeting on mount
  useEffect(() => {
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
              "Hi! I'm here to help you create a Mutual NDA. What's the legal name of the first party?",
          },
        ])
      );
  }, []);

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

    // Hoisted so finally can commit partial text even if done event never arrives
    let assistantText = "";

    try {
      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history: historySnapshot }),
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
              fields?: NDAFormData;
            };

            if (data.type === "text" && data.content) {
              assistantText += data.content;
              setCurrentMessage(assistantText);
            } else if (data.type === "fields" && data.fields) {
              setFormData(data.fields);
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
      // Always commit any streamed text and reset UI state, even if the
      // stream closed without emitting the done event (e.g. network drop).
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

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex-none bg-navy px-6 py-3 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-[17px] font-semibold text-white tracking-tight">
            Prelegal
          </span>
          <span className="hidden sm:block text-[11px] text-slate-500">
            Mutual NDA Creator
          </span>
        </div>
        {isComplete && (
          <button
            onClick={() => generatePDF(formData)}
            className="flex items-center gap-1.5 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-white hover:bg-gold-hover transition-colors"
          >
            <DownloadIcon />
            Download PDF
          </button>
        )}
      </header>

      {/* ── Split-screen body ───────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex">
        {/* Left panel: AI chat */}
        <div className="w-[400px] flex-none flex flex-col bg-surface border-r border-rule">
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

          {/* Input area */}
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
        </div>

        {/* Right panel: live document preview */}
        <div className="flex-1 overflow-y-auto bg-desk">
          <div className="px-8 py-8">
            <div
              className="max-w-[660px] mx-auto bg-white shadow-paper px-12 py-11"
              style={{ borderRadius: "2px" }}
            >
              <div className="text-center mb-6">
                <h1 className="font-serif text-[21px] font-bold text-ink leading-tight mb-2">
                  Mutual Non-Disclosure Agreement
                </h1>
                <p className="text-[9px] font-sans font-bold uppercase tracking-[0.22em] text-slate-400">
                  Common Paper MNDA v1.0
                </p>
              </div>
              <NDAPreview data={formData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
