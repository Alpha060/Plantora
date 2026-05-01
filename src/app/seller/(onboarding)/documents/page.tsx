"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/shared/file-upload";

export default function OnboardingDocumentsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [aadhaarUrl, setAadhaarUrl] = useState<string | null>(null);
  const [panUrl, setPanUrl] = useState<string | null>(null);
  const [gstUrl, setGstUrl] = useState<string | null>(null);
  const [licenseUrl, setLicenseUrl] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!aadhaarUrl || !panUrl || !licenseUrl) {
      toast.error("Aadhaar, PAN, and Shop License are mandatory.");
      return;
    }

    setIsLoading(true);
    try {
      const documents = [];
      if (aadhaarUrl) documents.push({ document_type: "aadhaar", document_url: aadhaarUrl });
      if (panUrl) documents.push({ document_type: "pan", document_url: panUrl });
      if (gstUrl) documents.push({ document_type: "gst", document_url: gstUrl });
      if (licenseUrl) documents.push({ document_type: "shop_license", document_url: licenseUrl });

      const response = await fetch("/api/seller/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documents }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to save documents");
        return;
      }

      toast.success("Documents saved successfully");
      router.push("/seller/bank");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface-lowest rounded-2xl shadow-ambient border border-surface-container-high p-6 md:p-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-on-surface mb-2">KYC Documents</h1>
        <p className="text-on-surface-variant">Upload your business registration documents. These are required for verification.</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FileUpload
            title="Aadhaar Card *"
            description="Front and back in a single PDF or image."
            bucket="seller-documents"
            value={aadhaarUrl}
            onChange={setAadhaarUrl}
          />
          
          <FileUpload
            title="PAN Card *"
            description="Clear image of your business or personal PAN."
            bucket="seller-documents"
            value={panUrl}
            onChange={setPanUrl}
          />
          
          <FileUpload
            title="Shop/Trade License *"
            description="Municipal trade license or Udyam registration."
            bucket="seller-documents"
            value={licenseUrl}
            onChange={setLicenseUrl}
          />
          
          <FileUpload
            title="GST Certificate"
            description="(Optional) Upload if you have GST registration."
            bucket="seller-documents"
            value={gstUrl}
            onChange={setGstUrl}
          />
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-surface-container-high mt-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push("/seller/onboarding/store")}
            disabled={isLoading}
            className="text-on-surface-variant"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading} 
            className="bg-primary px-8 rounded-full h-12 shadow-md"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save & Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
