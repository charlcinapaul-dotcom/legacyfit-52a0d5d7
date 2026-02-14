import { PageLayout } from "@/components/PageLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Do miles reset between challenges?",
    a: "No! Your Lifetime Legacy Miles never reset. When you finish one challenge at 40 miles and start a new one, your lifetime total continues at 41. Every mile you've ever walked stays with you.",
  },
  {
    q: "Can I join multiple challenges at the same time?",
    a: "Yes, you can be enrolled in multiple challenges simultaneously. Miles you log will count toward the specific challenge you select when logging.",
  },
  {
    q: "What if I miss a week?",
    a: "That's completely okay. There are no penalties for missing days or weeks. LegacyFit is designed around consistency, not perfection. Pick back up whenever you're ready.",
  },
  {
    q: "Is this competitive?",
    a: "Not at all. While we have a community leaderboard, it's organized by tiers — not rankings. There's no #1 or #2. We celebrate progress, not competition. Walk at your pace. Every mile matters.",
  },
  {
    q: "Do I need to run?",
    a: "Absolutely not. LegacyFit is built for walking. You can run or jog if you'd like, but walking is the foundation. Indoor, outdoor, treadmill — it all counts.",
  },
  {
    q: "Is this beginner friendly?",
    a: "100%. LegacyFit was created specifically for women who may feel like it's 'too late' to start. Whether you walk one mile a week or one mile a day, you belong here.",
  },
  {
    q: "How do I earn passport stamps?",
    a: "As you log miles and reach historical milestones within a challenge, you'll automatically unlock beautifully designed digital passport stamps. They live inside your Legacy Passport.",
  },
  {
    q: "What are Lifetime Legacy Miles?",
    a: "They're the total number of miles you've logged across every challenge you've ever participated in. They never reset and represent your complete walking legacy on the platform.",
  },
  {
    q: "Can I get a refund?",
    a: "Please refer to our Terms & Privacy page for details on our refund policy, or contact us directly through our Contact page.",
  },
];

const FAQ = () => (
  <PageLayout>
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Frequently Asked <span className="text-gradient-gold">Questions</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about LegacyFit.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-primary/30"
            >
              <AccordionTrigger className="text-left text-foreground font-medium py-5 hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  </PageLayout>
);

export default FAQ;
