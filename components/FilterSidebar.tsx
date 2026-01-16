'use client';

import { useState } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";

interface FilterSidebarProps {
  showCategoryFilter?: boolean;
  onFilterChange?: (filters: FilterState) => void;
}

interface FilterState {
  brands: string[];
  categories: string[];
  medicalCriteria: string[];
  priceRange: [number, number] | null;
}

// Placeholder data - will be replaced with API data later
const brands = [
  "Pfizer",
  "Johnson & Johnson",
  "Novartis",
  "Roche",
  "Merck",
  "GSK",
  "Sanofi",
  "AstraZeneca",
];

const categories = [
  "Pain Relief",
  "Cold & Flu",
  "Diabetes",
  "Child Care",
  "Skin Care",
  "Optics",
];

const medicalCriteria = [
  "Prescription Required",
  "Over the Counter",
  "Generic",
  "Brand Name",
  "FDA Approved",
  "Organic",
  "Vegan",
  "Gluten Free",
];

export default function FilterSidebar({ showCategoryFilter = false, onFilterChange }: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    brand: true,
    category: true,
    medical: true,
    price: true,
  });
  
  const [filters, setFilters] = useState<FilterState>({
    brands: [],
    categories: [],
    medicalCriteria: [],
    priceRange: null,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleFilter = (type: 'brands' | 'categories' | 'medicalCriteria', value: string) => {
    setFilters(prev => {
      const currentArray = prev[type];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      const newFilters = {
        ...prev,
        [type]: newArray,
      };
      
      onFilterChange?.(newFilters);
      return newFilters;
    });
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      brands: [],
      categories: [],
      medicalCriteria: [],
      priceRange: null,
    };
    setFilters(clearedFilters);
    onFilterChange?.(clearedFilters);
  };

  const hasActiveFilters = filters.brands.length > 0 || 
                          filters.categories.length > 0 || 
                          filters.medicalCriteria.length > 0 ||
                          filters.priceRange !== null;

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-[#01AC28] hover:text-[#01AC28] transition-colors"
      >
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span className="text-sm md:text-base font-semibold">Filter</span>
        {hasActiveFilters && (
          <span className="bg-[#01AC28] text-white text-xs px-2 py-0.5 rounded-full">
            {filters.brands.length + filters.categories.length + filters.medicalCriteria.length}
          </span>
        )}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-full lg:h-auto
          w-56 max-w-full bg-white border-r border-gray-200
          z-50 lg:z-auto
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-y-auto overflow-x-hidden
        `}
      >
        <div className="p-3 md:p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-[#374151]">Filters</h2>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-[#01AC28] hover:text-[#044644] font-semibold"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Category Filter - Only for Special Offers */}
          {showCategoryFilter && (
            <div className="mb-4 pb-4 border-b border-gray-200">
              <button
                onClick={() => toggleSection('category')}
                className="w-full flex items-center justify-between mb-3"
              >
                <h3 className="text-sm md:text-base font-semibold text-[#374151]">Category</h3>
                {expandedSections.category ? (
                  <ChevronUp className="w-5 h-5 text-[#6B7280]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#6B7280]" />
                )}
              </button>
              {expandedSections.category && (
                <div className="space-y-1">
                  {categories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={() => toggleFilter('categories', category)}
                        className="w-4 h-4 text-[#01AC28] border-gray-300 rounded focus:ring-[#01AC28]"
                      />
                      <span className="text-xs md:text-sm text-[#374151]">{category}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Brand Filter */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <button
              onClick={() => toggleSection('brand')}
              className="w-full flex items-center justify-between mb-3"
            >
              <h3 className="text-sm md:text-base font-semibold text-[#374151]">Brand</h3>
              {expandedSections.brand ? (
                <ChevronUp className="w-5 h-5 text-[#6B7280]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#6B7280]" />
              )}
            </button>
            {expandedSections.brand && (
              <div className="space-y-1">
                {brands.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={filters.brands.includes(brand)}
                      onChange={() => toggleFilter('brands', brand)}
                      className="w-4 h-4 text-[#01AC28] border-gray-300 rounded focus:ring-[#01AC28]"
                    />
                    <span className="text-xs md:text-sm text-[#374151]">{brand}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Medical Criteria Filter */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <button
              onClick={() => toggleSection('medical')}
              className="w-full flex items-center justify-between mb-3"
            >
              <h3 className="text-sm md:text-base font-semibold text-[#374151]">Medical Criteria</h3>
              {expandedSections.medical ? (
                <ChevronUp className="w-5 h-5 text-[#6B7280]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#6B7280]" />
              )}
            </button>
            {expandedSections.medical && (
              <div className="space-y-1">
                {medicalCriteria.map((criteria) => (
                  <label
                    key={criteria}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={filters.medicalCriteria.includes(criteria)}
                      onChange={() => toggleFilter('medicalCriteria', criteria)}
                      className="w-4 h-4 text-[#01AC28] border-gray-300 rounded focus:ring-[#01AC28]"
                    />
                    <span className="text-xs md:text-sm text-[#374151]">{criteria}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Price Range Filter */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('price')}
              className="w-full flex items-center justify-between mb-3"
            >
              <h3 className="text-sm md:text-base font-semibold text-[#374151]">Price Range</h3>
              {expandedSections.price ? (
                <ChevronUp className="w-5 h-5 text-[#6B7280]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#6B7280]" />
              )}
            </button>
            {expandedSections.price && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 w-full">
                  <input
                    type="number"
                    placeholder="Min"
                    className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#01AC28] w-0"
                  />
                  <span className="text-[#6B7280] text-sm flex-shrink-0">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#01AC28] w-0"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
