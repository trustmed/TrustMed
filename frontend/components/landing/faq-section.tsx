import { PhoneCall } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

function FaqSection() {
  const faqs = [
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

  return (
    <div className="w-full py-20 lg:py-40">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="flex gap-10 flex-col">
            <div className="flex gap-4 flex-col">
              <div>
                <Badge variant="outline">FAQ</Badge>
              </div>
              <div className="flex gap-2 flex-col">
                <h4 className="text-3xl md:text-5xl tracking-tighter max-w-xl text-left font-regular">
                  Common Questions
                </h4>
                <p className="text-lg max-w-xl lg:max-w-lg leading-relaxed tracking-tight text-muted-foreground  text-left">
                  Everything you need to know about TrustMed&apos;s
                  decentralized patient-controlled healthcare platform.
                  Can&apos;t find the answer you&apos;re looking for?
                </p>
              </div>
              <div className="">
                <Button className="gap-4" variant="outline">
                  Contact Support <PhoneCall className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.question} value={"index-" + index}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}

export { FaqSection };
