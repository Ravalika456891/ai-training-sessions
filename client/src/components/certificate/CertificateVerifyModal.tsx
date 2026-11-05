import React, { useState, useEffect } from 'react';
import { X, Award, CheckCircle2, AlertCircle, Search, User } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface CertificateVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSerial?: string;
}

export const CertificateVerifyModal: React.FC<CertificateVerifyModalProps> = ({
  isOpen,
  onClose,
  initialSerial = '',
}) => {
  const [serialInput, setSerialInput] = useState(initialSerial);
  const [certData, setCertData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (serial: string) => {
    if (!serial.trim()) return;
    setIsLoading(true);
    setError(null);
    setCertData(null);

    try {
      const res = await fetch(`/api/certificates/verify/${encodeURIComponent(serial.trim().toUpperCase())}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'No certificate record found matching this serial number.');
      }
      setCertData(data.data);
    } catch (err: any) {
      setError(err.message || 'Certificate verification query failed.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSerialInput(initialSerial);
      if (initialSerial) {
        handleVerify(initialSerial);
      } else {
        setCertData(null);
        setError(null);
      }
    }
  }, [isOpen, initialSerial]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50 duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                Public Certificate Verification
                <Badge variant="primary" size="sm">
                  Official Registry
                </Badge>
              </h3>
              <p className="text-xs text-slate-500">
                Verify authentic AI Launchpad credentials & cryptographically signed records
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#0F172A] hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Query Input */}
        <div className="p-6 space-y-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify(serialInput);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Enter Certificate Serial (e.g. AILP-CERT-2026-X841)"
                value={serialInput}
                onChange={(e) => setSerialInput(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#0F172A] placeholder:text-slate-400 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading} className="shrink-0">
              Verify
            </Button>
          </form>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in-50">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {certData && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-blue-200 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  <span className="text-[#0F172A] font-bold text-sm">
                    {certData.isValid ? 'Authentic Verified Credential' : 'Revoked'}
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-blue-600">
                  {certData.serialNumber}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Awarded To:</span>
                  <span className="text-base font-bold text-[#0F172A] flex items-center gap-1.5 mt-0.5">
                    <User className="w-4 h-4 text-blue-600" />
                    {certData.recipientName}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Program Specification:</span>
                  <span className="text-sm font-semibold text-[#0F172A] mt-0.5 block">
                    {certData.workshopTitle}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Completion Date:</span>
                    <span className="text-[#0F172A] font-medium">
                      {new Date(certData.completionDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Issuing Authority:</span>
                    <span className="text-[#0F172A] font-medium">
                      {certData.issuingAuthority}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] text-slate-500 font-mono block mb-1">
                    Cryptographic Verification Hash:
                  </span>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 font-mono text-[10px] text-slate-600 break-all select-all">
                    {certData.verificationHash}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-center text-[11px] text-slate-500">
            Official public verification query backed by MongoDB Atlas immutability logs.
          </div>
        </div>
      </div>
    </div>
  );
};
