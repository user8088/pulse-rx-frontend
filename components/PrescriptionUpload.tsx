'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, CheckCircle2, XCircle, Clock, AlertCircle, Trash2 } from 'lucide-react';
import type { Prescription } from '@/types/prescription';
import {
  uploadPrescription as apiUpload,
  uploadGuestPrescription as apiGuestUpload,
  listPrescriptions as apiList,
  listGuestPrescriptions as apiGuestList,
  deletePrescription as apiDelete,
} from '@/lib/api/prescriptions';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
const MAX_SIZE = 8 * 1024 * 1024; // 8 MB

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BaseProps {
  itemName: string;
}

/** Pre-order mode: user picks a file client-side; no API calls yet. */
interface PreOrderProps extends BaseProps {
  mode: 'pre-order';
  currentFile?: File | null;
  onFileSelect: (file: File) => void;
}

/** Post-order mode: uploads go straight to the backend. */
interface PostOrderAuthProps extends BaseProps {
  mode: 'post-order';
  orderId: number;
  orderItemId: number;
  phone?: never;
  orderNumber?: never;
}

interface PostOrderGuestProps extends BaseProps {
  mode: 'post-order-guest';
  orderNumber: string;
  orderItemId: number;
  phone: string;
  orderId?: never;
}

type Props = PreOrderProps | PostOrderAuthProps | PostOrderGuestProps;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PrescriptionUpload(props: Props) {
  const { itemName } = props;

  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(
    props.mode === 'pre-order' ? (props.currentFile ?? null) : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing prescriptions (post-order modes only)
  const fetchPrescriptions = useCallback(async () => {
    if (props.mode === 'pre-order') return;
    try {
      let list: Prescription[];
      if (props.mode === 'post-order') {
        list = await apiList(props.orderId, props.orderItemId);
      } else {
        list = await apiGuestList(props.orderNumber, props.orderItemId, props.phone);
      }
      setPrescriptions(list);
    } catch {
      /* backend may not have prescriptions yet */
    } finally {
      setLoaded(true);
    }
  }, [props]);

  // Load on first render for post-order modes
  if (!loaded && props.mode !== 'pre-order') {
    fetchPrescriptions();
  }

  const validate = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Please upload a JPG, PNG, or PDF file.';
    }
    if (file.size > MAX_SIZE) {
      return 'File size must be less than 8 MB.';
    }
    return null;
  };

  const handleFile = async (file: File) => {
    const err = validate(file);
    if (err) {
      setError(err);
      return;
    }
    setError(null);

    if (props.mode === 'pre-order') {
      setPreviewFile(file);
      props.onFileSelect(file);
      return;
    }

    setUploading(true);
    try {
      if (props.mode === 'post-order') {
        await apiUpload(props.orderId, props.orderItemId, file);
      } else {
        await apiGuestUpload(props.orderNumber, props.orderItemId, props.phone, file);
      }
      await fetchPrescriptions();
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (rx: Prescription) => {
    if (props.mode !== 'post-order') return;
    try {
      await apiDelete(props.orderId, props.orderItemId, rx.id);
      await fetchPrescriptions();
    } catch {
      setError('Could not delete prescription.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Determine aggregate status from uploaded prescriptions
  const hasApproved = prescriptions.some(p => p.status === 'approved');
  const hasPending = prescriptions.some(p => p.status === 'pending');
  const allRejected = prescriptions.length > 0 && prescriptions.every(p => p.status === 'rejected');
  const needsUpload = props.mode !== 'pre-order' && !hasApproved && !hasPending && !allRejected && prescriptions.length === 0;

  const inputId = `rx-upload-${itemName.replace(/\s/g, '-')}`;

  return (
    <div className="space-y-3">
      {/* Status banner for post-order modes */}
      {props.mode !== 'pre-order' && prescriptions.length > 0 && (
        <div className="space-y-2">
          {prescriptions.map(rx => (
            <div
              key={rx.id}
              className={`flex items-start gap-3 rounded-xl border-2 p-3 text-sm ${
                rx.status === 'approved'
                  ? 'bg-green-50 border-green-200'
                  : rx.status === 'rejected'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              {rx.status === 'approved' && <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />}
              {rx.status === 'pending' && <Clock className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />}
              {rx.status === 'rejected' && <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-xs ${
                  rx.status === 'approved' ? 'text-green-700' : rx.status === 'rejected' ? 'text-red-700' : 'text-yellow-700'
                }`}>
                  {rx.status === 'approved' ? 'Approved' : rx.status === 'rejected' ? 'Rejected' : 'Pending Review'}
                </p>
                {rx.notes && <p className="text-xs text-gray-600 mt-0.5">{rx.notes}</p>}
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Uploaded {new Date(rx.created_at).toLocaleDateString()}
                </p>
              </div>
              {rx.status === 'pending' && props.mode === 'post-order' && (
                <button onClick={() => handleDelete(rx)} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pre-order file preview */}
      {props.mode === 'pre-order' && previewFile && (
        <div className="flex items-center gap-3 bg-green-50 border-2 border-green-200 rounded-xl p-3">
          <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-green-700 truncate">{previewFile.name}</p>
            <p className="text-[10px] text-green-600">Ready — will be uploaded when you place the order</p>
          </div>
          <button
            onClick={() => { setPreviewFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
            className="text-gray-400 hover:text-red-500"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload area: show when not fully approved */}
      {!hasApproved && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          className={`border-2 border-dashed rounded-xl p-5 transition-all ${
            isDragging
              ? 'border-[#01AC28] bg-green-50'
              : allRejected
                ? 'border-red-300 bg-red-50/50'
                : 'border-gray-300 bg-gray-50/50 hover:border-[#01AC28] hover:bg-green-50/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleInputChange}
            className="hidden"
            id={inputId}
          />
          <label htmlFor={inputId} className="cursor-pointer flex flex-col items-center gap-3 text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              allRejected ? 'bg-red-100' : 'bg-green-100'
            }`}>
              {uploading ? (
                <div className="w-5 h-5 border-2 border-green-300 border-t-green-600 rounded-full animate-spin" />
              ) : (
                <Upload className={`w-5 h-5 ${allRejected ? 'text-red-500' : 'text-[#01AC28]'}`} />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-[#374151]">
                {uploading ? 'Uploading...' : allRejected ? 'Upload New Prescription' : 'Upload Prescription'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Drag and drop or click to browse
              </p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
                JPG, PNG, PDF — max 8 MB
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {/* Info alert when nothing uploaded yet */}
      {needsUpload && loaded && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            <span className="font-bold">{itemName}</span> requires a valid prescription. Please upload a clear image or PDF of your prescription.
          </p>
        </div>
      )}
    </div>
  );
}
