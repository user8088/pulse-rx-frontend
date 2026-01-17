'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, AlertCircle } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";

interface ProductDetailsProps {
  productId: string;
}

const variations = [
  { id: '150mg', label: '150mg', image: '/assets/home/product-150mg.png' },
  { id: '250mg', label: '250mg', image: '/assets/home/product-250mg.png' },
  { id: '500mg', label: '500mg', image: '/assets/home/product-500mg.png' },
];

const quantities = [
  { id: '30tab', label: '30TAB' },
  { id: '60tab', label: '60TAB' },
  { id: '90tab', label: '90TAB' },
];

const deliveryOptions = [
  { id: 'standard', label: 'STANDARD' },
  { id: 'express', label: 'EXPRESS' },
];

const productInfo = [
  {
    number: '/01',
    title: 'Active Ingredient',
    content: 'Ibuprofen 200 mg (or similar NSAID) - reduces pain and inflammation.',
  },
  {
    number: '/02',
    title: 'Inactive Ingredients',
    content: (
      <>
        Microcrystalline cellulose (binder)
        <br />
        Magnesium stearate (stabilizer)
      </>
    ),
  },
  {
    number: '/03',
    title: 'Dosage',
    content: 'Typically 1-2 tablets every 4-6 hours as needed, not exceeding 6 tablets in 24 hours.',
  },
  {
    number: '/04',
    title: 'Usage',
    content: 'Used for pain relief from headaches, muscle aches, toothaches, back pain, menstrual cramps.',
  },
];

const faqs = [
  {
    id: 1,
    question: 'What is this medicine used for?',
    answer: 'This medicine is used to relieve mild to moderate pain, including headaches, muscle pain, backaches, and menstrual cramps.',
  },
  {
    id: 2,
    question: 'How should I take this medicine?',
    answer: 'Take 1-2 tablets every 4-6 hours as needed for pain relief. Do not exceed 6 tablets in 24 hours. Take with food or milk to reduce stomach upset.',
  },
  {
    id: 3,
    question: 'Are there any side effects?',
    answer: 'Common side effects may include nausea, stomach pain, heartburn, or dizziness. If you experience severe side effects, stop taking the medicine and consult your doctor.',
  },
  {
    id: 4,
    question: 'Can I take this with other medications?',
    answer: 'Consult your doctor or pharmacist before taking this medicine with other medications, especially blood thinners, other pain relievers, or medications for high blood pressure.',
  },
];

export default function ProductDetails({ productId }: ProductDetailsProps) {
  const [selectedVariation, setSelectedVariation] = useState(variations[1]); // Default to 250mg
  const [selectedQuantity, setSelectedQuantity] = useState(quantities[1]); // Default to 60TAB
  const [selectedDelivery, setSelectedDelivery] = useState(deliveryOptions[0]); // Default to STANDARD
  const [expandedFaq, setExpandedFaq] = useState<number | null>(1);
  const { addItem } = useCart();

  const currentImage = selectedVariation.image;
  const price = 99.00;
  const productIdNum = parseInt(productId);
  const requiresPrescription = productIdNum >= 3; // Products with ID 3+ require prescription

  const handleVariationChange = (variation: typeof variations[0]) => {
    setSelectedVariation(variation);
  };

  const handleAddToCart = () => {
    addItem({
      id: productIdNum,
      name: "MedRelief Fast-Acting Pain Killer",
      variation: selectedVariation.label,
      quantity: selectedQuantity.label,
      price: price,
      image: currentImage,
      qty: 1,
      requiresPrescription: requiresPrescription
    });
  };

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div className="w-full">
      {/* Close Button */}
      <div className="container mx-auto px-4 md:px-6 lg:px-12 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#374151] hover:text-[#01AC28] transition-colors"
        >
          <X className="w-5 h-5" />
          <span className="text-sm font-medium">Close</span>
        </Link>
      </div>

      {/* Main Product Section */}
      <section className="py-8 md:py-12 px-4 md:px-6 lg:px-12">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16">
            {/* Left - Thumbnails */}
            <div className="lg:col-span-2 flex flex-row lg:flex-col gap-3 md:gap-4 order-2 lg:order-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-hide">
              {variations.map((v) => (
                <button
                  key={v.id}
                  onClick={() => handleVariationChange(v)}
                  className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-full lg:aspect-square rounded-xl overflow-hidden border transition-all ${
                    selectedVariation.id === v.id
                      ? 'border-[#01AC28] shadow-sm'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <Image
                    src={v.image}
                    alt={`Thumbnail ${v.label}`}
                    fill
                    className="object-contain p-2 md:p-3"
                    sizes="(max-width: 1024px) 120px, 150px"
                  />
                </button>
              ))}
            </div>

            {/* Center - Main Product Image */}
            <div className="lg:col-span-4 flex items-center justify-center order-1 lg:order-2">
              <div className="relative w-full aspect-square max-w-[350px] sm:max-w-[450px] lg:max-w-full">
                <Image
                  key={selectedVariation.id}
                  src={currentImage}
                  alt={`MedRelief ${selectedVariation.label}`}
                  fill
                  className="object-contain animate-[fadeIn_0.5s_ease-in-out]"
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
            </div>

            {/* Right - Product Information */}
            <div className="lg:col-span-6 flex flex-col order-3 lg:order-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">
                    PAIN KILLER
                  </span>
                  <div className="flex items-center gap-3">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#374151]">
                      MedRelief
                    </h1>
                    {requiresPrescription && (
                      <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-1.5">
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                        <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                          Prescription Required
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-xl md:text-2xl font-bold text-[#374151] pt-2">
                  ${price.toFixed(2)}
                </span>
              </div>

              <p className="text-sm md:text-base text-[#6B7280] mb-10 mt-6 leading-relaxed max-w-xl">
                MedRelief offers fast relief from mild to moderate pain like headaches, muscle aches, and cramps. It targets pain directly, providing long-lasting comfort without drowsiness.
              </p>

              {requiresPrescription && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-blue-900 mb-1">
                        Prescription Required
                      </p>
                      <p className="text-xs text-blue-700">
                        This product requires a valid prescription. You&apos;ll be asked to upload your prescription during checkout. Our pharmacy team will verify it before confirming your order.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rows */}
              <div className="space-y-6 border-t border-gray-100 pt-8">
                {/* Generic */}
                <div className="flex items-center">
                  <span className="text-xs font-bold text-[#374151] w-24 uppercase tracking-wider">GENERIC</span>
                  <div className="bg-[#EFEFEF] border border-gray-100 px-4 py-2 rounded-md">
                    <span className="text-xs font-semibold text-[#374151] uppercase tracking-wider">PAIN RELIEF TABLET</span>
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center">
                  <span className="text-xs font-bold text-[#374151] w-24 uppercase tracking-wider">QUANTITY</span>
                  <div className="flex gap-2">
                    {quantities.map((qty) => (
                      <button
                        key={qty.id}
                        onClick={() => setSelectedQuantity(qty)}
                        className={`px-4 py-2 rounded-md text-[10px] font-bold tracking-widest transition-all border ${
                          selectedQuantity.id === qty.id
                            ? 'bg-[#374151] text-white border-[#374151]'
                            : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        {qty.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delivery */}
                <div className="flex items-center">
                  <span className="text-xs font-bold text-[#374151] w-24 uppercase tracking-wider">DELIVERY</span>
                  <div className="flex gap-2">
                    {deliveryOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSelectedDelivery(option)}
                        className={`px-4 py-2 rounded-md text-[10px] font-bold tracking-widest transition-all border ${
                          selectedDelivery.id === option.id
                            ? 'bg-[#374151] text-white border-[#374151]'
                            : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Buttons Section */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-12">
                <button 
                  data-cursor="Order Now"
                  className="flex-1 bg-[#374151] hover:bg-[#1F2937] text-white py-4 rounded-md font-bold text-xs tracking-[0.2em] transition-all uppercase shadow-md hover:shadow-lg"
                >
                  ORDER NOW
                </button>
                <button 
                  data-cursor="Add to Cart"
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#01AC28] hover:bg-[#044644] text-white py-4 rounded-md font-bold text-xs tracking-[0.2em] transition-all uppercase shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  ADD TO CART
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Features */}
      <section className="px-4 md:px-6 lg:px-12 mb-8 mt-12">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '💠', text: 'FAST-ACTING', color: '#FFFBEB' },
              { icon: '🔆', text: 'NON-DROWSY', color: '#F0FDF4' },
              { icon: '❄️', text: 'MULTI-PURPOSE', color: '#EFF6FF' },
              { icon: '🔘', text: 'EASY-TO-SWALLOW', color: '#FFF1F2' },
            ].map((feature, i) => (
              <div
                key={i}
                style={{ backgroundColor: feature.color }}
                className="aspect-square flex flex-col items-center justify-center rounded-2xl p-6 transition-transform hover:scale-[1.02] cursor-default"
              >
                <span className="text-4xl mb-4">{feature.icon}</span>
                <span className="text-[10px] font-black tracking-[0.15em] text-[#374151] text-center">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Information */}
      <section className="py-12 px-4 md:px-6 lg:px-12">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Info Cards */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {productInfo.map((info, index) => (
                <div key={index} className="bg-gray-50/50 rounded-3xl p-8 md:p-10 min-h-[280px] flex flex-col justify-between hover:bg-gray-50 transition-colors">
                  <span className="text-3xl font-bold text-[#01AC28] block mb-12">{info.number}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-[#374151] mb-4">{info.title}:</h3>
                    <div className="text-sm text-gray-500 leading-relaxed font-medium">
                      {info.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Customer Trust Image Card */}
            <div className="relative rounded-3xl overflow-hidden min-h-[400px] group">
              <Image
                src="/assets/home/banner-info-1.png"
                alt="Customer Trust"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8 text-white">
                <h2 className="text-2xl font-bold mb-2">Customer Trust:</h2>
                <p className="text-sm text-white/80 leading-relaxed">
                  Trusted by thousands for its fast-acting relief and proven results.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-16 px-4 md:px-6 lg:px-12 border-t border-gray-100">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">FAQs</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#374151]">Questions → Answers</h2>
          </div>

          <div className="space-y-4 max-w-4xl">
            {faqs.map((faq) => {
              const isOpen = expandedFaq === faq.id;

              return (
                <div
                  key={faq.id}
                  className={`rounded-xl md:rounded-2xl transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? 'bg-[#EFEFEF] border-2 border-[#01AC28]'
                      : 'bg-[#EFEFEF] border border-transparent hover:border-gray-300'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className={`w-full flex items-center justify-between p-5 md:p-6 text-left transition-colors duration-300 ${
                      isOpen ? 'text-[#01AC28]' : 'text-[#374151]'
                    }`}
                  >
                    <span className={`font-semibold text-base md:text-lg pr-4 flex-1 ${
                      isOpen ? 'text-[#01AC28]' : 'text-[#374151]'
                    }`}>
                      {faq.question}
                    </span>
                    <div className="flex-shrink-0">
                      {isOpen ? (
                        <Minus className="w-5 h-5 md:w-6 md:h-6 text-[#01AC28]" />
                      ) : (
                        <Plus className="w-5 h-5 md:w-6 md:h-6 text-[#374151]" />
                      )}
                    </div>
                  </button>
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
        </div>
      </section>
    </div>
  );
}
