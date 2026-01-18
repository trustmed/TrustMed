import { Badge } from "@/components/ui/badge";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Faq5Props {
  badge?: string;
  heading?: string;
  description?: string;
  faqs?: FaqItem[];
}

const defaultFaqs: FaqItem[] = [
  {
    question: "What is TrustMed?",
    answer:
      "TrustMed is a decentralized, patient-controlled medical history platform. It allows you to securely manage and share your health records with hospitals using blockchain technology, ensuring you are the true owner of your data.",
  },
  {
    question: "How does TrustMed benefit patients?",
    answer:
      "Patients gain complete control over their medical history, eliminating the need for repeated tests and physical document transport. It ensures seamless access to records across different hospitals, reducing waiting times and improving care quality.",
  },
  {
    question: "How does TrustMed benefit hospitals?",
    answer:
      "Hospitals can instantly access accurate, comprehensive patient histories with consent, reducing administrative costs and duplicate testing. It improves diagnostic accuracy and operational efficiency while maintaining their own internal record systems.",
  },
  {
    question: "Is my medical data secure?",
    answer:
      "Yes. TrustMed uses a permissioned blockchain (Hyperledger Fabric) to store audit logs and consent rules, not your actual medical files. Your sensitive health data remains encrypted and is only shared when you explicitly grant access.",
  },
  {
    question: "Does TrustMed replace existing hospital systems?",
    answer:
      "No. TrustMed works alongside existing hospital systems (EMR/EHR). It acts as a secure bridge, allowing hospitals to request and view records from other institutions through a standardized API without replacing their current infrastructure.",
  },
  {
    question: "How does the consent mechanism work?",
    answer:
      "You have full control. When a hospital needs your records, a request is sent to you. You can grant or deny access, and even revoke it later. All access events are permanently recorded on the blockchain for full transparency.",
  },
];

export const Faq5 = ({
  badge = "FAQ",
  heading = "Common Questions & Answers",
  description = "Find out all the essential details about our platform and how it can serve your needs.",
  faqs = defaultFaqs,
}: Faq5Props) => {
  return (
    <section className="py-16 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <Badge className="text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90">
            {badge}
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold text-foreground md:text-4xl">
            {heading}
          </h1>
          <p className="mt-6 font-medium text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="mx-auto mt-14 max-w-screen-sm">
          {faqs.map((faq, index) => (
            <div key={faq.question} className="mb-8 flex gap-4">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-primary font-mono text-xs text-primary-foreground">
                {index + 1}
              </span>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium text-foreground">
                    {faq.question}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
