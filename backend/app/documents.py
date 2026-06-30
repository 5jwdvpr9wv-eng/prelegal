"""Document type registry — one DocumentConfig per supported legal document."""
from dataclasses import dataclass
from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, create_model

FieldType = Literal["text", "date", "textarea", "email"]


@dataclass
class FieldDef:
    key: str
    label: str
    description: str
    required: bool = True
    field_type: FieldType = "text"
    placeholder: str = ""


@dataclass
class DocumentConfig:
    doc_type: str
    name: str
    template_file: str
    fields: List[FieldDef]
    required_field_keys: List[str]
    greeting: str
    chat_system_prompt: str
    extract_system_prompt: str


def _build_chat_prompt(name: str, fields: List[FieldDef], required_keys: List[str]) -> str:
    required = [f for f in fields if f.key in required_keys]
    items = "\n".join(
        f"{i + 1}. {f.label}: {f.description}"
        for i, f in enumerate(required)
    )
    return (
        f"You are a professional legal assistant helping a user create a {name}. "
        "Your job is to gather the necessary information through friendly, conversational questions.\n\n"
        "Rules:\n"
        "- Ask about one thing at a time. Never ask multiple questions in one message.\n"
        "- Keep responses concise (2-3 sentences max). Be professional but approachable.\n"
        "- Do not mention technical field names — use natural language.\n"
        "- When you have all required fields, confirm the key details clearly and tell the user "
        "their document is ready to download.\n\n"
        f"Required information to collect in natural conversational order:\n{items}"
    )


def _build_extract_prompt(name: str, fields: List[FieldDef]) -> str:
    schema_lines = "\n".join(
        f'  "{f.key}": "{f.description}, or null",'
        for f in fields
    )
    schema = "{\n" + schema_lines + "\n}"
    return (
        f"You are a data extraction assistant. Given a conversation about creating a {name}, "
        "extract any field values clearly stated.\n\n"
        "Return a JSON object with exactly these keys. Use null for fields not yet mentioned or unclear:\n"
        f"{schema}\n\n"
        "Rules:\n"
        "- Extract only values explicitly stated. Do not guess or infer.\n"
        "- For date fields, convert to YYYY-MM-DD format.\n"
        "- Return the full object every time — include all keys even if null."
    )


def _make_config(
    doc_type: str,
    name: str,
    template_file: str,
    fields: List[FieldDef],
    required_keys: List[str],
    greeting: str,
) -> DocumentConfig:
    return DocumentConfig(
        doc_type=doc_type,
        name=name,
        template_file=template_file,
        fields=fields,
        required_field_keys=required_keys,
        greeting=greeting,
        chat_system_prompt=_build_chat_prompt(name, fields, required_keys),
        extract_system_prompt=_build_extract_prompt(name, fields),
    )


def make_fields_model(config: DocumentConfig) -> type[BaseModel]:
    """Dynamically build a Pydantic model for structured field extraction."""
    return create_model(
        f"{config.doc_type}Fields",
        **{f.key: (Optional[str], None) for f in config.fields},
    )


# ── Field lists ───────────────────────────────────────────────────────────────

_NDA_FIELDS: List[FieldDef] = [
    FieldDef("party1Name", "Party 1 Legal Name", "Legal name of first party (your company or your own name if individual)", True, "text", "Acme Corp."),
    FieldDef("party1Address", "Party 1 Address", "Postal address of first party", False, "text", "123 Main St, San Francisco, CA 94105"),
    FieldDef("party1Email", "Party 1 Email", "Email address for notices for first party", False, "email", "legal@acme.com"),
    FieldDef("party1SignatoryName", "Party 1 Signatory Name", "Name of person signing for first party", False, "text", "Jane Smith"),
    FieldDef("party1SignatoryTitle", "Party 1 Signatory Title", "Title of person signing for first party", False, "text", "Chief Executive Officer"),
    FieldDef("party2Name", "Party 2 Legal Name", "Legal name of second party (the other company or individual)", True, "text", "Globex Inc."),
    FieldDef("party2Address", "Party 2 Address", "Postal address of second party", False, "text", "456 Market St, New York, NY 10001"),
    FieldDef("party2Email", "Party 2 Email", "Email address for notices for second party", False, "email", "legal@globex.com"),
    FieldDef("party2SignatoryName", "Party 2 Signatory Name", "Name of person signing for second party", False, "text", "John Doe"),
    FieldDef("party2SignatoryTitle", "Party 2 Signatory Title", "Title of person signing for second party", False, "text", "Chief Executive Officer"),
    FieldDef("purpose", "Purpose", "Purpose of the NDA — what confidential information will be used for", True, "textarea", "evaluating a potential business relationship between the parties"),
    FieldDef("effectiveDate", "Effective Date", "Effective date in YYYY-MM-DD format", True, "date", ""),
    FieldDef("mndaTerm", "MNDA Term", "Duration of agreement e.g. '2 years from Effective Date'", True, "text", "2 years from Effective Date"),
    FieldDef("termOfConfidentiality", "Term of Confidentiality", "Confidentiality period after termination e.g. '3 years following expiration or termination'", True, "text", "3 years following expiration or termination"),
    FieldDef("governingLaw", "Governing Law (State)", "US state whose laws govern the agreement (state name only e.g. 'Delaware')", True, "text", "Delaware"),
    FieldDef("jurisdiction", "Jurisdiction", "City and state for courts e.g. 'Wilmington, Delaware'", True, "text", "Wilmington, Delaware"),
]

_NDA_REQUIRED = ["party1Name", "party2Name", "purpose", "effectiveDate", "mndaTerm", "termOfConfidentiality", "governingLaw", "jurisdiction"]


# ── Registry ──────────────────────────────────────────────────────────────────

REGISTRY: Dict[str, DocumentConfig] = {}

REGISTRY["mutual_nda"] = _make_config(
    doc_type="mutual_nda",
    name="Mutual Non-Disclosure Agreement",
    template_file="templates/Mutual-NDA.md",
    fields=_NDA_FIELDS,
    required_keys=_NDA_REQUIRED,
    greeting=(
        "Hi! I'm here to help you create a Mutual Non-Disclosure Agreement. "
        "Let's start with the basics — what's the full legal name of the first party "
        "(that's your company, or your own name if you're an individual)?"
    ),
)

REGISTRY["mutual_nda_coverpage"] = _make_config(
    doc_type="mutual_nda_coverpage",
    name="Mutual NDA Cover Page",
    template_file="templates/Mutual-NDA-coverpage.md",
    fields=_NDA_FIELDS,
    required_keys=_NDA_REQUIRED,
    greeting=(
        "Hi! I'm here to help you create a Mutual NDA Cover Page. "
        "Let's gather the key business terms — what's the full legal name of the first party?"
    ),
)

REGISTRY["cloud_service_agreement"] = _make_config(
    doc_type="cloud_service_agreement",
    name="Cloud Service Agreement",
    template_file="templates/CSA.md",
    fields=[
        FieldDef("providerName", "Provider Name", "Legal name of the cloud service provider company", True, "text", "Acme Cloud Inc."),
        FieldDef("customerName", "Customer Name", "Legal name of the customer company", True, "text", "Globex Corp."),
        FieldDef("cloudServiceDescription", "Cloud Service Description", "Description of the cloud service or SaaS product being sold", True, "textarea", "cloud-based project management platform"),
        FieldDef("orderDate", "Order Date", "Date the order starts in YYYY-MM-DD format", True, "date", ""),
        FieldDef("subscriptionPeriod", "Subscription Period", "Duration of subscription e.g. '1 year'", True, "text", "1 year"),
        FieldDef("nonRenewalNoticeDate", "Non-Renewal Notice", "How far in advance non-renewal notice must be given e.g. '30 days before end of Subscription Period'", False, "text", "30 days before end of Subscription Period"),
        FieldDef("fees", "Fees", "Subscription fees e.g. '$500/month' or '$6,000/year'", True, "text", "$500/month"),
        FieldDef("paymentProcess", "Payment Process", "How and when payments are made e.g. 'monthly invoicing, net 30'", False, "text", "monthly invoicing, net 30"),
        FieldDef("generalCapAmount", "General Liability Cap", "Maximum liability amount e.g. 'fees paid in the prior 12 months'", False, "text", "fees paid in the prior 12 months"),
        FieldDef("governingLaw", "Governing Law", "Governing state for the agreement e.g. 'Delaware'", True, "text", "Delaware"),
        FieldDef("chosenCourts", "Chosen Courts", "Courts with exclusive jurisdiction e.g. 'courts located in Wilmington, Delaware'", True, "text", "courts located in Wilmington, Delaware"),
    ],
    required_keys=["providerName", "customerName", "cloudServiceDescription", "orderDate", "subscriptionPeriod", "fees", "governingLaw", "chosenCourts"],
    greeting="Hi! I'm here to help you create a Cloud Service Agreement. Let's start — what's the full legal name of the cloud service provider?",
)

REGISTRY["design_partner"] = _make_config(
    doc_type="design_partner",
    name="Design Partner Agreement",
    template_file="templates/design-partner-agreement.md",
    fields=[
        FieldDef("providerName", "Provider Name", "Legal name of the company providing the product", True, "text", "Acme Inc."),
        FieldDef("partnerName", "Partner Name", "Legal name of the design partner company", True, "text", "Globex Corp."),
        FieldDef("productDescription", "Product Description", "Description of the product being designed and tested", True, "textarea", "AI-powered analytics dashboard"),
        FieldDef("programDescription", "Program Description", "Description of the design partner program and participation requirements", False, "textarea", "quarterly feedback sessions and product testing"),
        FieldDef("effectiveDate", "Effective Date", "Agreement start date in YYYY-MM-DD format", True, "date", ""),
        FieldDef("term", "Term", "Duration of the design partner agreement e.g. '6 months'", True, "text", "6 months"),
        FieldDef("fees", "Fees", "Any fees the partner will pay, or 'none' if no fees apply", False, "text", "none"),
        FieldDef("governingLaw", "Governing Law", "Governing state for the agreement e.g. 'Delaware'", True, "text", "Delaware"),
        FieldDef("chosenCourts", "Chosen Courts", "Courts with exclusive jurisdiction", True, "text", "courts located in Wilmington, Delaware"),
        FieldDef("noticeAddress", "Notice Address", "Address for formal notices to both parties", False, "text", ""),
    ],
    required_keys=["providerName", "partnerName", "productDescription", "effectiveDate", "term", "governingLaw", "chosenCourts"],
    greeting="Hi! I'm here to help you create a Design Partner Agreement. Let's start — what's the full legal name of the company providing the product?",
)

REGISTRY["sla"] = _make_config(
    doc_type="sla",
    name="Service Level Agreement",
    template_file="templates/sla.md",
    fields=[
        FieldDef("providerName", "Provider Name", "Legal name of the service provider", True, "text", "Acme Cloud Inc."),
        FieldDef("customerName", "Customer Name", "Legal name of the customer", True, "text", "Globex Corp."),
        FieldDef("cloudServiceName", "Cloud Service Name", "Name of the cloud service this SLA covers", True, "text", "AcmeCloud Platform"),
        FieldDef("effectiveDate", "Effective Date", "SLA effective date in YYYY-MM-DD format", True, "date", ""),
        FieldDef("targetUptime", "Target Uptime", "Uptime commitment percentage e.g. '99.9%'", True, "text", "99.9%"),
        FieldDef("targetResponseTime", "Target Response Time", "Response time commitment e.g. 'within 1 hour for critical issues'", False, "text", "within 1 hour for critical issues"),
        FieldDef("scheduledDowntime", "Scheduled Downtime", "Planned maintenance window policy e.g. 'Sundays 2am-4am UTC'", False, "text", "Sundays 2am-4am UTC"),
        FieldDef("uptimeCredit", "Uptime Credit", "Service credit for uptime failures e.g. '10% of monthly fees per 0.1% below target'", False, "text", "10% of monthly fees per 0.1% below target"),
        FieldDef("responseTimeCredit", "Response Time Credit", "Service credit for response time failures", False, "text", ""),
    ],
    required_keys=["providerName", "customerName", "cloudServiceName", "effectiveDate", "targetUptime"],
    greeting="Hi! I'm here to help you create a Service Level Agreement. Let's start — what's the full legal name of the service provider?",
)

REGISTRY["professional_services"] = _make_config(
    doc_type="professional_services",
    name="Professional Services Agreement",
    template_file="templates/psa.md",
    fields=[
        FieldDef("providerName", "Provider Name", "Legal name of the services provider company", True, "text", "Acme Consulting Inc."),
        FieldDef("customerName", "Customer Name", "Legal name of the customer company", True, "text", "Globex Corp."),
        FieldDef("servicesDescription", "Services Description", "Detailed description of the professional services to be provided", True, "textarea", "software development and implementation services"),
        FieldDef("deliverables", "Deliverables", "List of deliverables to be produced", True, "textarea", "custom API integration, documentation, and training"),
        FieldDef("timeline", "Timeline", "Project timeline and key milestones", False, "textarea", "completion within 90 days of project start"),
        FieldDef("fees", "Fees", "Service fees e.g. '$150/hour' or '$50,000 fixed fee'", True, "text", "$150/hour"),
        FieldDef("paymentTerms", "Payment Terms", "When and how payments are made", False, "text", "monthly invoicing, net 30"),
        FieldDef("effectiveDate", "Effective Date", "Agreement start date in YYYY-MM-DD format", True, "date", ""),
        FieldDef("intellectualPropertyTerms", "Intellectual Property", "Who owns IP created under this agreement", False, "textarea", "Customer owns all work product upon full payment"),
        FieldDef("governingLaw", "Governing Law", "Governing state for the agreement e.g. 'Delaware'", True, "text", "Delaware"),
        FieldDef("chosenCourts", "Chosen Courts", "Courts with exclusive jurisdiction", True, "text", "courts located in Wilmington, Delaware"),
    ],
    required_keys=["providerName", "customerName", "servicesDescription", "deliverables", "fees", "effectiveDate", "governingLaw", "chosenCourts"],
    greeting="Hi! I'm here to help you create a Professional Services Agreement. Let's start — what's the full legal name of the services provider?",
)

REGISTRY["data_processing"] = _make_config(
    doc_type="data_processing",
    name="Data Processing Agreement",
    template_file="templates/DPA.md",
    fields=[
        FieldDef("processorName", "Processor Name", "Legal name of the data processor (the service provider)", True, "text", "Acme SaaS Inc."),
        FieldDef("controllerName", "Controller Name", "Legal name of the data controller (the customer)", True, "text", "Globex Corp."),
        FieldDef("serviceDescription", "Service Description", "Description of the services involving personal data processing", True, "textarea", "cloud-based CRM and data analytics services"),
        FieldDef("personalDataCategories", "Personal Data Categories", "Types of personal data to be processed e.g. 'names, email addresses, usage data'", True, "textarea", "names, email addresses, usage data"),
        FieldDef("dataSubjectCategories", "Data Subject Categories", "Categories of individuals whose data is processed e.g. 'customers, employees'", True, "text", "customers and employees"),
        FieldDef("processingPurpose", "Processing Purpose", "Purpose for which personal data is processed", True, "textarea", "providing and improving the cloud service"),
        FieldDef("processingDuration", "Processing Duration", "How long data will be retained and processed", False, "text", "duration of the service agreement plus 30 days"),
        FieldDef("specialCategoryData", "Special Category Data", "Any sensitive data like health, financial, or biometric data (or 'none')", False, "text", "none"),
        FieldDef("effectiveDate", "Effective Date", "DPA effective date in YYYY-MM-DD format", True, "date", ""),
        FieldDef("governingLaw", "Governing Law", "Governing state for the agreement e.g. 'Delaware'", True, "text", "Delaware"),
    ],
    required_keys=["processorName", "controllerName", "serviceDescription", "personalDataCategories", "dataSubjectCategories", "processingPurpose", "effectiveDate", "governingLaw"],
    greeting="Hi! I'm here to help you create a Data Processing Agreement for GDPR compliance. Let's start — what's the full legal name of the data processor (the service provider)?",
)

REGISTRY["software_license"] = _make_config(
    doc_type="software_license",
    name="Software License Agreement",
    template_file="templates/Software-License-Agreement.md",
    fields=[
        FieldDef("licensorName", "Licensor Name", "Legal name of the software licensor company", True, "text", "Acme Software Inc."),
        FieldDef("licenseeName", "Licensee Name", "Legal name of the licensee company", True, "text", "Globex Corp."),
        FieldDef("softwareDescription", "Software Description", "Description of the software being licensed", True, "textarea", "enterprise analytics software platform"),
        FieldDef("licenseScope", "License Scope", "What the licensee is permitted to do with the software", True, "textarea", "install and use on up to 100 user seats for internal business purposes"),
        FieldDef("licenseRestrictions", "License Restrictions", "What the licensee is not permitted to do", False, "textarea", "no sublicensing, no reverse engineering, no use in competing products"),
        FieldDef("fees", "License Fees", "License fees e.g. '$10,000/year'", True, "text", "$10,000/year"),
        FieldDef("paymentTerms", "Payment Terms", "When and how license fees are paid", False, "text", "annually in advance"),
        FieldDef("term", "License Term", "Duration of the license e.g. '2 years' or 'perpetual'", True, "text", "2 years"),
        FieldDef("maintenanceSupport", "Maintenance and Support", "Description of maintenance and support included", False, "textarea", "email support during business hours, quarterly updates"),
        FieldDef("effectiveDate", "Effective Date", "Agreement start date in YYYY-MM-DD format", True, "date", ""),
        FieldDef("governingLaw", "Governing Law", "Governing state for the agreement e.g. 'Delaware'", True, "text", "Delaware"),
        FieldDef("chosenCourts", "Chosen Courts", "Courts with exclusive jurisdiction", True, "text", "courts located in Wilmington, Delaware"),
    ],
    required_keys=["licensorName", "licenseeName", "softwareDescription", "licenseScope", "fees", "term", "effectiveDate", "governingLaw", "chosenCourts"],
    greeting="Hi! I'm here to help you create a Software License Agreement. Let's start — what's the full legal name of the software licensor?",
)

REGISTRY["partnership"] = _make_config(
    doc_type="partnership",
    name="Partnership Agreement",
    template_file="templates/Partnership-Agreement.md",
    fields=[
        FieldDef("party1Name", "Party 1 Name", "Legal name of the first partner company or individual", True, "text", "Acme Inc."),
        FieldDef("party2Name", "Party 2 Name", "Legal name of the second partner company or individual", True, "text", "Globex Corp."),
        FieldDef("partnershipPurpose", "Partnership Purpose", "Purpose and goals of the business partnership", True, "textarea", "jointly developing and marketing an AI-powered software product"),
        FieldDef("party1Role", "Party 1 Role", "Roles and responsibilities of Party 1", True, "textarea", "product development, engineering, and technical operations"),
        FieldDef("party2Role", "Party 2 Role", "Roles and responsibilities of Party 2", True, "textarea", "sales, marketing, and customer relationships"),
        FieldDef("revenueSharingTerms", "Revenue Sharing", "How revenue or profits will be split between the parties", True, "text", "50% to Party 1, 50% to Party 2"),
        FieldDef("intellectualPropertyTerms", "Intellectual Property", "Who owns IP created during the partnership", False, "textarea", "jointly owned by both parties"),
        FieldDef("effectiveDate", "Effective Date", "Agreement start date in YYYY-MM-DD format", True, "date", ""),
        FieldDef("term", "Term", "Duration of the partnership agreement e.g. '2 years'", True, "text", "2 years"),
        FieldDef("governingLaw", "Governing Law", "Governing state for the agreement e.g. 'Delaware'", True, "text", "Delaware"),
        FieldDef("chosenCourts", "Chosen Courts", "Courts with exclusive jurisdiction", True, "text", "courts located in Wilmington, Delaware"),
    ],
    required_keys=["party1Name", "party2Name", "partnershipPurpose", "party1Role", "party2Role", "revenueSharingTerms", "effectiveDate", "term", "governingLaw", "chosenCourts"],
    greeting="Hi! I'm here to help you create a Partnership Agreement. Let's start — what's the full legal name of the first partner?",
)

REGISTRY["pilot"] = _make_config(
    doc_type="pilot",
    name="Pilot Agreement",
    template_file="templates/Pilot-Agreement.md",
    fields=[
        FieldDef("providerName", "Provider Name", "Legal name of the product/service provider company", True, "text", "Acme Inc."),
        FieldDef("customerName", "Customer Name", "Legal name of the customer evaluating the product", True, "text", "Globex Corp."),
        FieldDef("productDescription", "Product Description", "Description of the product or service being evaluated", True, "textarea", "cloud-based AI analytics platform"),
        FieldDef("evaluationPurpose", "Evaluation Purpose", "Specific goals and criteria for the pilot evaluation", False, "textarea", "test integration with existing systems and evaluate performance"),
        FieldDef("effectiveDate", "Effective Date", "Pilot agreement start date in YYYY-MM-DD format", True, "date", ""),
        FieldDef("pilotPeriod", "Pilot Period", "Duration of the pilot/trial e.g. '90 days'", True, "text", "90 days"),
        FieldDef("fees", "Fees", "Any fees during the pilot (or 'no fee' if complimentary)", False, "text", "no fee"),
        FieldDef("generalCapAmount", "General Liability Cap", "Maximum liability amount e.g. '$10,000'", False, "text", "$10,000"),
        FieldDef("governingLaw", "Governing Law", "Governing state for the agreement e.g. 'Delaware'", True, "text", "Delaware"),
        FieldDef("chosenCourts", "Chosen Courts", "Courts with exclusive jurisdiction", True, "text", "courts located in Wilmington, Delaware"),
        FieldDef("noticeAddress", "Notice Address", "Address for formal notices", False, "text", ""),
    ],
    required_keys=["providerName", "customerName", "productDescription", "effectiveDate", "pilotPeriod", "governingLaw", "chosenCourts"],
    greeting="Hi! I'm here to help you create a Pilot Agreement for a product trial. Let's start — what's the full legal name of the product provider?",
)

REGISTRY["business_associate"] = _make_config(
    doc_type="business_associate",
    name="Business Associate Agreement",
    template_file="templates/BAA.md",
    fields=[
        FieldDef("providerName", "Provider Name", "Legal name of the business associate (service provider handling PHI)", True, "text", "Acme Health Tech Inc."),
        FieldDef("companyName", "Covered Entity Name", "Legal name of the covered entity (healthcare provider or health plan)", True, "text", "Metro Health System"),
        FieldDef("serviceDescription", "Service Description", "Description of services involving protected health information (PHI)", True, "textarea", "electronic health record software and data storage services"),
        FieldDef("baaEffectiveDate", "Effective Date", "BAA effective date in YYYY-MM-DD format", True, "date", ""),
        FieldDef("agreementReference", "Main Agreement Reference", "Name or reference to the main service agreement this BAA accompanies", False, "text", "Cloud Service Agreement"),
        FieldDef("breachNotificationPeriod", "Breach Notification Period", "Timeframe for notifying of a PHI breach e.g. '60 days'", True, "text", "60 days"),
        FieldDef("limitationsOnDisclosures", "Limitations on Disclosures", "Any specific limitations on how PHI may be disclosed", False, "textarea", "PHI may not be used for marketing purposes"),
        FieldDef("governingLaw", "Governing Law", "Governing state for the agreement e.g. 'Delaware'", True, "text", "Delaware"),
    ],
    required_keys=["providerName", "companyName", "serviceDescription", "baaEffectiveDate", "breachNotificationPeriod", "governingLaw"],
    greeting=(
        "Hi! I'm here to help you create a Business Associate Agreement for HIPAA compliance. "
        "Let's start — what's the full legal name of the business associate "
        "(the service provider who will handle protected health information)?"
    ),
)

REGISTRY["ai_addendum"] = _make_config(
    doc_type="ai_addendum",
    name="AI Addendum",
    template_file="templates/AI-Addendum.md",
    fields=[
        FieldDef("providerName", "Provider Name", "Legal name of the AI service provider", True, "text", "Acme AI Inc."),
        FieldDef("customerName", "Customer Name", "Legal name of the customer", True, "text", "Globex Corp."),
        FieldDef("baseAgreementName", "Base Agreement Name", "Name of the main agreement this addendum supplements", True, "text", "Cloud Service Agreement"),
        FieldDef("baseAgreementDate", "Base Agreement Date", "Date of the main agreement in YYYY-MM-DD format", False, "date", ""),
        FieldDef("aiServiceDescription", "AI Service Description", "Description of the AI features or services covered by this addendum", True, "textarea", "AI-powered content generation and analysis features"),
        FieldDef("effectiveDate", "Effective Date", "Addendum effective date in YYYY-MM-DD format", True, "date", ""),
        FieldDef("modelTrainingPolicy", "Model Training Policy", "Policy on whether customer data may be used for AI model training", False, "textarea", "customer data will not be used to train AI models without explicit consent"),
        FieldDef("liabilityTerms", "AI Liability Terms", "Specific liability terms relating to AI-generated content or decisions", False, "textarea", "provider is not liable for decisions made based solely on AI-generated content"),
        FieldDef("governingLaw", "Governing Law", "Governing state for the agreement e.g. 'Delaware'", True, "text", "Delaware"),
    ],
    required_keys=["providerName", "customerName", "baseAgreementName", "aiServiceDescription", "effectiveDate", "governingLaw"],
    greeting=(
        "Hi! I'm here to help you create an AI Addendum to supplement an existing agreement. "
        "Let's start — what's the full legal name of the AI service provider?"
    ),
)
