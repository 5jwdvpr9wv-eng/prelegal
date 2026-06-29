"use client";

import { useState } from "react";

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

function Val({ children }: { children: string }) {
  return (
    <span className="field-value">{children || "[___________]"}</span>
  );
}

function NDAPreview({ data }: { data: NDAFormData }) {
  return (
    <div className="nda-body font-serif">
      <div className="border border-gray-300 rounded-lg p-8 mb-8 bg-white">
        <h2 className="text-lg font-bold text-center mb-6 tracking-wide uppercase">
          Cover Page
        </h2>
        <table className="w-full text-sm border-collapse">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-3 pr-4 font-semibold text-gray-600 w-48 align-top">Effective Date</td>
              <td className="py-3"><Val>{data.effectiveDate}</Val></td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-3 pr-4 font-semibold text-gray-600 align-top">Party 1</td>
              <td className="py-3">
                <Val>{data.party1Name}</Val>
                {data.party1Address && <div className="mt-1 text-gray-600">{data.party1Address}</div>}
                {data.party1Email && <div className="text-gray-600">{data.party1Email}</div>}
              </td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-3 pr-4 font-semibold text-gray-600 align-top">Party 2</td>
              <td className="py-3">
                <Val>{data.party2Name}</Val>
                {data.party2Address && <div className="mt-1 text-gray-600">{data.party2Address}</div>}
                {data.party2Email && <div className="text-gray-600">{data.party2Email}</div>}
              </td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-3 pr-4 font-semibold text-gray-600 align-top">Purpose</td>
              <td className="py-3"><Val>{data.purpose}</Val></td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-3 pr-4 font-semibold text-gray-600 align-top">MNDA Term</td>
              <td className="py-3"><Val>{data.mndaTerm}</Val></td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-3 pr-4 font-semibold text-gray-600 align-top">Term of Confidentiality</td>
              <td className="py-3"><Val>{data.termOfConfidentiality}</Val></td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-3 pr-4 font-semibold text-gray-600 align-top">Governing Law</td>
              <td className="py-3">State of <Val>{data.governingLaw}</Val></td>
            </tr>
            <tr>
              <td className="py-3 pr-4 font-semibold text-gray-600 align-top">Jurisdiction</td>
              <td className="py-3"><Val>{data.jurisdiction}</Val></td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-lg font-bold text-center mb-6 tracking-wide uppercase">
        Standard Terms
      </h2>

      <p>
        <strong>1. Introduction.</strong> This Mutual Non-Disclosure Agreement (which incorporates these Standard Terms and the Cover Page (defined below)) (&ldquo;<strong>MNDA</strong>&rdquo;) allows each party (&ldquo;<strong>Disclosing Party</strong>&rdquo;) to disclose or make available information in connection with the <Val>{data.purpose}</Val> which (1) the Disclosing Party identifies to the receiving party (&ldquo;<strong>Receiving Party</strong>&rdquo;) as &ldquo;confidential&rdquo;, &ldquo;proprietary&rdquo;, or the like or (2) should be reasonably understood as confidential or proprietary due to its nature and the circumstances of its disclosure (&ldquo;<strong>Confidential Information</strong>&rdquo;). Each party&apos;s Confidential Information also includes the existence and status of the parties&apos; discussions and information on the Cover Page. Confidential Information includes technical or business information, product designs or roadmaps, requirements, pricing, security and compliance documentation, technology, inventions and know-how. To use this MNDA, the parties must complete and sign a cover page incorporating these Standard Terms (&ldquo;<strong>Cover Page</strong>&rdquo;). Each party is identified on the Cover Page and capitalized terms have the meanings given herein or on the Cover Page.
      </p>

      <p>
        <strong>2. Use and Protection of Confidential Information.</strong> The Receiving Party shall: (a) use Confidential Information solely for the <Val>{data.purpose}</Val>; (b) not disclose Confidential Information to third parties without the Disclosing Party&apos;s prior written approval, except that the Receiving Party may disclose Confidential Information to its employees, agents, advisors, contractors and other representatives having a reasonable need to know for the <Val>{data.purpose}</Val>, provided these representatives are bound by confidentiality obligations no less protective of the Disclosing Party than the applicable terms in this MNDA and the Receiving Party remains responsible for their compliance with this MNDA; and (c) protect Confidential Information using at least the same protections the Receiving Party uses for its own similar information but no less than a reasonable standard of care.
      </p>

      <p>
        <strong>3. Exceptions.</strong> The Receiving Party&apos;s obligations in this MNDA do not apply to information that it can demonstrate: (a) is or becomes publicly available through no fault of the Receiving Party; (b) it rightfully knew or possessed prior to receipt from the Disclosing Party without confidentiality restrictions; (c) it rightfully obtained from a third party without confidentiality restrictions; or (d) it independently developed without using or referencing the Confidential Information.
      </p>

      <p>
        <strong>4. Disclosures Required by Law.</strong> The Receiving Party may disclose Confidential Information to the extent required by law, regulation or regulatory authority, subpoena or court order, provided (to the extent legally permitted) it provides the Disclosing Party reasonable advance notice of the required disclosure and reasonably cooperates, at the Disclosing Party&apos;s expense, with the Disclosing Party&apos;s efforts to obtain confidential treatment for the Confidential Information.
      </p>

      <p>
        <strong>5. Term and Termination.</strong> This MNDA commences on the <Val>{data.effectiveDate}</Val> and expires at the end of the <Val>{data.mndaTerm}</Val>. Either party may terminate this MNDA for any or no reason upon written notice to the other party. The Receiving Party&apos;s obligations relating to Confidential Information will survive for the <Val>{data.termOfConfidentiality}</Val>, despite any expiration or termination of this MNDA.
      </p>

      <p>
        <strong>6. Return or Destruction of Confidential Information.</strong> Upon expiration or termination of this MNDA or upon the Disclosing Party&apos;s earlier request, the Receiving Party will: (a) cease using Confidential Information; (b) promptly after the Disclosing Party&apos;s written request, destroy all Confidential Information in the Receiving Party&apos;s possession or control or return it to the Disclosing Party; and (c) if requested by the Disclosing Party, confirm its compliance with these obligations in writing. As an exception to subsection (b), the Receiving Party may retain Confidential Information in accordance with its standard backup or record retention policies or as required by law, but the terms of this MNDA will continue to apply to the retained Confidential Information.
      </p>

      <p>
        <strong>7. Proprietary Rights.</strong> The Disclosing Party retains all of its intellectual property and other rights in its Confidential Information and its disclosure to the Receiving Party grants no license under such rights.
      </p>

      <p>
        <strong>8. Disclaimer.</strong> ALL CONFIDENTIAL INFORMATION IS PROVIDED &ldquo;AS IS&rdquo;, WITH ALL FAULTS, AND WITHOUT WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
      </p>

      <p>
        <strong>9. Governing Law and Jurisdiction.</strong> This MNDA and all matters relating hereto are governed by, and construed in accordance with, the laws of the State of <Val>{data.governingLaw}</Val>, without regard to the conflict of laws provisions of such State of <Val>{data.governingLaw}</Val>. Any legal suit, action, or proceeding relating to this MNDA must be instituted in the federal or state courts located in <Val>{data.jurisdiction}</Val>. Each party irrevocably submits to the exclusive jurisdiction of such <Val>{data.jurisdiction}</Val> in any such suit, action, or proceeding.
      </p>

      <p>
        <strong>10. Equitable Relief.</strong> A breach of this MNDA may cause irreparable harm for which monetary damages are an insufficient remedy. Upon a breach of this MNDA, the Disclosing Party is entitled to seek appropriate equitable relief, including an injunction, in addition to its other remedies.
      </p>

      <p>
        <strong>11. General.</strong> Neither party has an obligation under this MNDA to disclose Confidential Information to the other or proceed with any proposed transaction. Neither party may assign this MNDA without the prior written consent of the other party, except that either party may assign this MNDA in connection with a merger, reorganization, acquisition or other transfer of all or substantially all its assets or voting securities. Any assignment in violation of this Section is null and void. This MNDA will bind and inure to the benefit of each party&apos;s permitted successors and assigns. Waivers must be signed by the waiving party&apos;s authorized representative and cannot be implied from conduct. If any provision of this MNDA is held unenforceable, it will be limited to the minimum extent necessary so the rest of this MNDA remains in effect. This MNDA (including the Cover Page) constitutes the entire agreement of the parties with respect to its subject matter, and supersedes all prior and contemporaneous understandings, agreements, representations, and warranties, whether written or oral, regarding such subject matter. This MNDA may only be amended, modified, waived, or supplemented by an agreement in writing signed by both parties. Notices, requests and approvals under this MNDA must be sent in writing to the email or postal addresses on the Cover Page and are deemed delivered on receipt. This MNDA may be executed in counterparts, including electronic copies, each of which is deemed an original and which together form the same agreement.
      </p>

      <div className="border-t border-gray-300 mt-8 pt-8">
        <div className="grid grid-cols-2 gap-12">
          <div>
            <p className="font-semibold mb-6"><Val>{data.party1Name}</Val></p>
            <div className="border-b border-gray-800 mb-2 h-8" />
            <p className="text-xs text-gray-600">Signature</p>
            <div className="mt-4">
              <p><Val>{data.party1SignatoryName}</Val></p>
              <p className="text-gray-600 text-sm"><Val>{data.party1SignatoryTitle}</Val></p>
            </div>
          </div>
          <div>
            <p className="font-semibold mb-6"><Val>{data.party2Name}</Val></p>
            <div className="border-b border-gray-800 mb-2 h-8" />
            <p className="text-xs text-gray-600">Signature</p>
            <div className="mt-4">
              <p><Val>{data.party2SignatoryName}</Val></p>
              <p className="text-gray-600 text-sm"><Val>{data.party2SignatoryTitle}</Val></p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-8 text-center">
        Common Paper Mutual Non-Disclosure Agreement Version 1.0 — free to use under CC BY 4.0
      </p>
    </div>
  );
}

function generatePlainText(data: NDAFormData): string {
  const f = (v: string, fallback = "[___________]") => v || fallback;
  return `MUTUAL NON-DISCLOSURE AGREEMENT

COVER PAGE

Effective Date:           ${f(data.effectiveDate)}
Party 1:                  ${f(data.party1Name)}
  Address:                ${f(data.party1Address)}
  Email:                  ${f(data.party1Email)}
  Signatory:              ${f(data.party1SignatoryName)}, ${f(data.party1SignatoryTitle)}
Party 2:                  ${f(data.party2Name)}
  Address:                ${f(data.party2Address)}
  Email:                  ${f(data.party2Email)}
  Signatory:              ${f(data.party2SignatoryName)}, ${f(data.party2SignatoryTitle)}
Purpose:                  ${f(data.purpose)}
MNDA Term:                ${f(data.mndaTerm)}
Term of Confidentiality:  ${f(data.termOfConfidentiality)}
Governing Law:            State of ${f(data.governingLaw)}
Jurisdiction:             ${f(data.jurisdiction)}

---

STANDARD TERMS

1. Introduction. This Mutual Non-Disclosure Agreement (which incorporates these Standard Terms and the Cover Page (defined below)) ("MNDA") allows each party ("Disclosing Party") to disclose or make available information in connection with the ${f(data.purpose)} which (1) the Disclosing Party identifies to the receiving party ("Receiving Party") as "confidential", "proprietary", or the like or (2) should be reasonably understood as confidential or proprietary due to its nature and the circumstances of its disclosure ("Confidential Information"). Each party's Confidential Information also includes the existence and status of the parties' discussions and information on the Cover Page. Confidential Information includes technical or business information, product designs or roadmaps, requirements, pricing, security and compliance documentation, technology, inventions and know-how. To use this MNDA, the parties must complete and sign a cover page incorporating these Standard Terms ("Cover Page"). Each party is identified on the Cover Page and capitalized terms have the meanings given herein or on the Cover Page.

2. Use and Protection of Confidential Information. The Receiving Party shall: (a) use Confidential Information solely for the ${f(data.purpose)}; (b) not disclose Confidential Information to third parties without the Disclosing Party's prior written approval, except that the Receiving Party may disclose Confidential Information to its employees, agents, advisors, contractors and other representatives having a reasonable need to know for the ${f(data.purpose)}, provided these representatives are bound by confidentiality obligations no less protective of the Disclosing Party than the applicable terms in this MNDA and the Receiving Party remains responsible for their compliance with this MNDA; and (c) protect Confidential Information using at least the same protections the Receiving Party uses for its own similar information but no less than a reasonable standard of care.

3. Exceptions. The Receiving Party's obligations in this MNDA do not apply to information that it can demonstrate: (a) is or becomes publicly available through no fault of the Receiving Party; (b) it rightfully knew or possessed prior to receipt from the Disclosing Party without confidentiality restrictions; (c) it rightfully obtained from a third party without confidentiality restrictions; or (d) it independently developed without using or referencing the Confidential Information.

4. Disclosures Required by Law. The Receiving Party may disclose Confidential Information to the extent required by law, regulation or regulatory authority, subpoena or court order, provided (to the extent legally permitted) it provides the Disclosing Party reasonable advance notice of the required disclosure and reasonably cooperates, at the Disclosing Party's expense, with the Disclosing Party's efforts to obtain confidential treatment for the Confidential Information.

5. Term and Termination. This MNDA commences on the ${f(data.effectiveDate)} and expires at the end of the ${f(data.mndaTerm)}. Either party may terminate this MNDA for any or no reason upon written notice to the other party. The Receiving Party's obligations relating to Confidential Information will survive for the ${f(data.termOfConfidentiality)}, despite any expiration or termination of this MNDA.

6. Return or Destruction of Confidential Information. Upon expiration or termination of this MNDA or upon the Disclosing Party's earlier request, the Receiving Party will: (a) cease using Confidential Information; (b) promptly after the Disclosing Party's written request, destroy all Confidential Information in the Receiving Party's possession or control or return it to the Disclosing Party; and (c) if requested by the Disclosing Party, confirm its compliance with these obligations in writing. As an exception to subsection (b), the Receiving Party may retain Confidential Information in accordance with its standard backup or record retention policies or as required by law, but the terms of this MNDA will continue to apply to the retained Confidential Information.

7. Proprietary Rights. The Disclosing Party retains all of its intellectual property and other rights in its Confidential Information and its disclosure to the Receiving Party grants no license under such rights.

8. Disclaimer. ALL CONFIDENTIAL INFORMATION IS PROVIDED "AS IS", WITH ALL FAULTS, AND WITHOUT WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.

9. Governing Law and Jurisdiction. This MNDA and all matters relating hereto are governed by, and construed in accordance with, the laws of the State of ${f(data.governingLaw)}, without regard to the conflict of laws provisions of such State of ${f(data.governingLaw)}. Any legal suit, action, or proceeding relating to this MNDA must be instituted in the federal or state courts located in ${f(data.jurisdiction)}. Each party irrevocably submits to the exclusive jurisdiction of such ${f(data.jurisdiction)} in any such suit, action, or proceeding.

10. Equitable Relief. A breach of this MNDA may cause irreparable harm for which monetary damages are an insufficient remedy. Upon a breach of this MNDA, the Disclosing Party is entitled to seek appropriate equitable relief, including an injunction, in addition to its other remedies.

11. General. Neither party has an obligation under this MNDA to disclose Confidential Information to the other or proceed with any proposed transaction. Neither party may assign this MNDA without the prior written consent of the other party, except that either party may assign this MNDA in connection with a merger, reorganization, acquisition or other transfer of all or substantially all its assets or voting securities. Any assignment in violation of this Section is null and void. This MNDA will bind and inure to the benefit of each party's permitted successors and assigns. Waivers must be signed by the waiving party's authorized representative and cannot be implied from conduct. If any provision of this MNDA is held unenforceable, it will be limited to the minimum extent necessary so the rest of this MNDA remains in effect. This MNDA (including the Cover Page) constitutes the entire agreement of the parties with respect to its subject matter, and supersedes all prior and contemporaneous understandings, agreements, representations, and warranties, whether written or oral, regarding such subject matter. This MNDA may only be amended, modified, waived, or supplemented by an agreement in writing signed by both parties. Notices, requests and approvals under this MNDA must be sent in writing to the email or postal addresses on the Cover Page and are deemed delivered on receipt. This MNDA may be executed in counterparts, including electronic copies, each of which is deemed an original and which together form the same agreement.

SIGNATURES

${f(data.party1Name)}                    ${f(data.party2Name)}

_______________________              _______________________
Signature                            Signature

${f(data.party1SignatoryName)}           ${f(data.party2SignatoryName)}
${f(data.party1SignatoryTitle)}          ${f(data.party2SignatoryTitle)}

---
Common Paper Mutual Non-Disclosure Agreement Version 1.0 — free to use under CC BY 4.0
`;
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
  name: keyof NDAFormData;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
  name: keyof NDAFormData;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={3}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
      />
    </div>
  );
}

export default function Home() {
  const [formData, setFormData] = useState<NDAFormData>(empty);
  const [showPreview, setShowPreview] = useState(false);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPreview(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDownload = () => {
    const text = generatePlainText(formData);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mutual-nda.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Mutual NDA</h1>
              <p className="text-sm text-gray-500">Review your completed agreement</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← Edit
              </button>
              <button
                onClick={handleDownload}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Download (.txt)
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-10">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10">
            <h1 className="text-2xl font-bold text-center mb-2 tracking-tight">
              Mutual Non-Disclosure Agreement
            </h1>
            <p className="text-center text-gray-500 text-sm mb-10">
              Common Paper MNDA v1.0
            </p>
            <NDAPreview data={formData} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Mutual NDA Creator</h1>
          <p className="text-gray-500 mt-1">
            Fill in the details below to generate your Mutual Non-Disclosure Agreement.
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Party 1</h2>
            <p className="text-sm text-gray-500 mb-5">The first party to this agreement.</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <InputField
                  label="Legal Name"
                  name="party1Name"
                  value={formData.party1Name}
                  onChange={handleInput}
                  placeholder="Acme Corp."
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <InputField
                  label="Address"
                  name="party1Address"
                  value={formData.party1Address}
                  onChange={handleInput}
                  placeholder="123 Main St, San Francisco, CA 94105"
                />
              </div>
              <InputField
                label="Email"
                name="party1Email"
                value={formData.party1Email}
                onChange={handleInput}
                placeholder="legal@acme.com"
                type="email"
              />
              <InputField
                label="Signatory Name"
                name="party1SignatoryName"
                value={formData.party1SignatoryName}
                onChange={handleInput}
                placeholder="Jane Smith"
              />
              <div className="sm:col-span-2">
                <InputField
                  label="Signatory Title"
                  name="party1SignatoryTitle"
                  value={formData.party1SignatoryTitle}
                  onChange={handleInput}
                  placeholder="Chief Executive Officer"
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Party 2</h2>
            <p className="text-sm text-gray-500 mb-5">The second party to this agreement.</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <InputField
                  label="Legal Name"
                  name="party2Name"
                  value={formData.party2Name}
                  onChange={handleInput}
                  placeholder="Globex Inc."
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <InputField
                  label="Address"
                  name="party2Address"
                  value={formData.party2Address}
                  onChange={handleInput}
                  placeholder="456 Market St, New York, NY 10001"
                />
              </div>
              <InputField
                label="Email"
                name="party2Email"
                value={formData.party2Email}
                onChange={handleInput}
                placeholder="legal@globex.com"
                type="email"
              />
              <InputField
                label="Signatory Name"
                name="party2SignatoryName"
                value={formData.party2SignatoryName}
                onChange={handleInput}
                placeholder="John Doe"
              />
              <div className="sm:col-span-2">
                <InputField
                  label="Signatory Title"
                  name="party2SignatoryTitle"
                  value={formData.party2SignatoryTitle}
                  onChange={handleInput}
                  placeholder="Chief Executive Officer"
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Agreement Terms</h2>
            <p className="text-sm text-gray-500 mb-5">Key terms that define the scope and duration of this NDA.</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <TextAreaField
                  label="Purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInput}
                  placeholder="evaluating a potential business relationship between the parties"
                  required
                />
              </div>
              <InputField
                label="Effective Date"
                name="effectiveDate"
                value={formData.effectiveDate}
                onChange={handleInput}
                type="date"
                required
              />
              <InputField
                label="MNDA Term"
                name="mndaTerm"
                value={formData.mndaTerm}
                onChange={handleInput}
                placeholder="2 years from the Effective Date"
                required
              />
              <div className="sm:col-span-2">
                <InputField
                  label="Term of Confidentiality"
                  name="termOfConfidentiality"
                  value={formData.termOfConfidentiality}
                  onChange={handleInput}
                  placeholder="3 years following expiration or termination of this MNDA"
                  required
                />
              </div>
              <InputField
                label="Governing Law (State)"
                name="governingLaw"
                value={formData.governingLaw}
                onChange={handleInput}
                placeholder="Delaware"
                required
              />
              <InputField
                label="Jurisdiction"
                name="jurisdiction"
                value={formData.jurisdiction}
                onChange={handleInput}
                placeholder="Wilmington, Delaware"
                required
              />
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              Preview NDA →
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
