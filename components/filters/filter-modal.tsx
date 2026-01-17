'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export interface FilterOptions {
  status: string[];
  dateRange: {
    from: string;
    to: string;
  };
  minPregnantWomen: string;
  minHealthWorkers: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

export default function FilterModal({
  isOpen,
  onClose,
  onApply,
  currentFilters,
}: FilterModalProps) {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      status: [],
      dateRange: { from: '', to: '' },
      minPregnantWomen: '',
      minHealthWorkers: '',
    };
    setFilters(resetFilters);
  };

  const toggleStatus = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status],
    }));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-xl shadow-xl z-50 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Advanced Filters</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Registration Status
            </label>
            <div className="space-y-2">
              {[
                { value: 'approved', label: 'Approved', color: 'green' },
                { value: 'pending_approval', label: 'Pending Approval', color: 'orange' },
                { value: 'rejected', label: 'Rejected', color: 'red' },
                { value: 'draft', label: 'Draft', color: 'gray' },
              ].map((status) => (
                <label
                  key={status.value}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status.value)}
                    onChange={() => toggleStatus(status.value)}
                    className="w-4 h-4 text-[#3B9ECF] border-gray-300 rounded focus:ring-[#3B9ECF]"
                  />
                  <span className="text-sm text-gray-700">{status.label}</span>
                  <span
                    className={`ml-auto w-2 h-2 rounded-full bg-${status.color}-500`}
                  ></span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Registration Date
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">From</label>
                <input
                  type="date"
                  value={filters.dateRange.from}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, from: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B9ECF] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">To</label>
                <input
                  type="date"
                  value={filters.dateRange.to}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, to: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B9ECF] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Minimum Counts */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Min. Pregnant Women
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g., 10"
                value={filters.minPregnantWomen}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    minPregnantWomen: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B9ECF] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Min. Health Workers
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g., 5"
                value={filters.minHealthWorkers}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    minHealthWorkers: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B9ECF] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Reset All
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 text-sm font-medium text-white bg-[#3B9ECF] rounded-lg hover:bg-[#2d7ba8] transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
