'use client';

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

// FAQ data - will be replaced with API data later
const faqs = [
  {
    id: 1,
    question: "How do I start online consultation with the doctors on Pulse RX?",
    answer: "Starting an online consultation is easy! Simply navigate to our 'Consultations' section, select a doctor from our list of certified medical professionals, choose your preferred time slot, and complete the booking. You'll receive a confirmation email with a video call link for your scheduled appointment.",
  },
  {
    id: 2,
    question: "How does the prescription delivery process work?",
    answer: "Our prescription delivery process is designed to be seamless. Once your doctor prescribes medication, you can place an order directly through our platform. We ensure every medicine is genuine and stored under proper conditions. Simply reach out to us with your prescription, and our dedicated team will process your order and deliver it to your doorstep within the specified timeframe.",
  },
  {
    id: 3,
    question: "What sets Pulse RX apart from other pharmacy services?",
    answer: "Pulse RX stands out through our commitment to quality, genuine medicines, and exceptional customer service. We ensure proper storage conditions for all medications, offer free shipping on orders over $199, provide 24/9 customer support, and have a money-back guarantee. Our platform also offers online doctor consultations, making healthcare more accessible.",
  },
  {
    id: 4,
    question: "Can Pulse RX handle bulk orders for large-scale corporate events?",
    answer: "Yes, absolutely! Pulse RX can handle bulk orders for corporate events, institutions, and large-scale requirements. Please contact our corporate sales team through the 'Contact Us' page, and we'll work with you to create a customized solution that meets your specific needs, including special pricing and delivery arrangements.",
  },
  {
    id: 5,
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, digital wallets, and bank transfers. All transactions are secured with SSL encryption to ensure your payment information is safe and protected.",
  },
  {
    id: 6,
    question: "Do you offer refunds or returns?",
    answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with your purchase, you can return the product within 30 days of delivery for a full refund. Please ensure the product is unopened and in its original packaging. For more details, visit our Returns & Refunds policy page.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(1); // First item open by default

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full bg-white py-16 md:py-20 px-4 md:px-6 lg:px-12">
      <div className="container mx-auto max-w-4xl">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#374151] mb-4">
            We&apos;ve answered all your questions
          </h2>
          <p className="text-[#6B7280] text-base md:text-lg max-w-2xl mx-auto">
            Find answers to common questions about our services, delivery, and more
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openIndex === faq.id;
            
            return (
              <div
                key={faq.id}
                className={`rounded-xl md:rounded-2xl transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'bg-[#EFEFEF] border-2 border-[#01AC28]'
                    : 'bg-[#EFEFEF] border border-transparent hover:border-gray-300'
                }`}
              >
                {/* Question Button */}
                <button
                  onClick={() => toggleItem(faq.id)}
                  className={`w-full flex items-center justify-between p-5 md:p-6 text-left transition-colors duration-300 ${
                    isOpen ? 'text-[#01AC28]' : 'text-[#374151]'
                  }`}
                  aria-expanded={isOpen}
                >
                  <span className={`font-semibold text-base md:text-lg pr-4 flex-1 ${
                    isOpen ? 'text-[#01AC28]' : 'text-[#374151]'
                  }`}>
                    {faq.question}
                  </span>
                  
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {isOpen ? (
                      <Minus className="w-5 h-5 md:w-6 md:h-6 text-[#01AC28]" />
                    ) : (
                      <Plus className="w-5 h-5 md:w-6 md:h-6 text-[#374151]" />
                    )}
                  </div>
                </button>

                {/* Answer Content */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  } overflow-hidden`}
                >
                  <div className="px-5 md:px-6 pb-5 md:pb-6">
                    <p className="text-sm md:text-base text-[#374151] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 md:mt-16 text-center">
          <p className="text-[#6B7280] text-sm md:text-base mb-4">
            Still have questions?
          </p>
          <a
            href="/contact"
            className="inline-block bg-[#01AC28] hover:bg-[#044644] text-white px-6 md:px-8 py-3 md:py-4 rounded-lg md:rounded-xl font-semibold text-sm md:text-base transition-colors shadow-lg"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
}
