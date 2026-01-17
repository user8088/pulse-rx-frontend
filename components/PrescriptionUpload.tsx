'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, XCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { PrescriptionStatus } from '@/lib/context/CartContext';

interface PrescriptionUploadProps {
  itemId: number;
  itemName: string;
  currentStatus: PrescriptionStatus;
  fileName?: string;
  rejectionReason?: string;
  onUpload: (file: File) => void;
}

export default function PrescriptionUpload({
  itemId,
  itemName,
  currentStatus,
  fileName,
  rejectionReason,
  onUpload
}: PrescriptionUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onUpload(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusDisplay = () => {
    switch (currentStatus) {
      case 'pending':
        return {
          icon: Clock,
          text: 'Pending Verification',
          description: 'Your prescription is being reviewed by our pharmacy team. This usually takes a few minutes.',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'verified':
        return {
          icon: CheckCircle2,
          text: 'Verified',
          description: 'Your prescription has been verified. You can proceed with your order.',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'rejected':
        return {
          icon: XCircle,
          text: 'Rejected',
          description: rejectionReason || 'Your prescription could not be verified. Please upload a new prescription.',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return null;
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="space-y-4">
      {/* Status Banner */}
      {statusDisplay && (
        <div className={`${statusDisplay.bgColor} ${statusDisplay.borderColor} border-2 rounded-xl p-4 flex items-start gap-3`}>
          <statusDisplay.icon className={`w-5 h-5 ${statusDisplay.color} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <p className={`text-sm font-bold ${statusDisplay.color} mb-1`}>
              {statusDisplay.text}
            </p>
            <p className="text-xs text-gray-600">
              {statusDisplay.description}
            </p>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {currentStatus !== 'verified' && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-xl p-6 md:p-8 transition-all ${
            isDragging
              ? 'border-[#01AC28] bg-green-50'
              : currentStatus === 'rejected'
              ? 'border-red-300 bg-red-50/50'
              : 'border-gray-300 bg-gray-50/50 hover:border-[#01AC28] hover:bg-green-50/30'
          }`}
        >
          {preview ? (
            <div className="space-y-4">
              <div className="relative w-full aspect-video bg-white rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={preview}
                  alt="Prescription preview"
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={handleRemove}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">{fileName}</span>
                </div>
                {currentStatus === 'pending' && (
                  <div className="flex items-center gap-2 text-sm text-yellow-600">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="font-medium">Verifying...</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
                id={`prescription-upload-${itemId}`}
              />
              <label
                htmlFor={`prescription-upload-${itemId}`}
                className="cursor-pointer flex flex-col items-center gap-4"
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  currentStatus === 'rejected' ? 'bg-red-100' : 'bg-green-100'
                }`}>
                  <Upload className={`w-8 h-8 ${
                    currentStatus === 'rejected' ? 'text-red-500' : 'text-[#01AC28]'
                  }`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#374151] mb-1">
                    {currentStatus === 'rejected' ? 'Upload New Prescription' : 'Upload Prescription'}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    Drag and drop or click to browse
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                    JPG, PNG up to 5MB
                  </p>
                </div>
              </label>
            </div>
          )}
        </div>
      )}

      {/* Info Alert */}
      {currentStatus === null && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-blue-900 mb-1">
              Prescription Required
            </p>
            <p className="text-xs text-blue-700">
              This product requires a valid prescription. Please upload a clear image of your prescription before proceeding with checkout.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
