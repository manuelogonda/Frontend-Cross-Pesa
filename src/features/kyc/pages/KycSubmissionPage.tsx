// 1. Import the Smile ID Web Component globally
import '@smile_identity/smart-camera-web';
import { useKyc } from '../hooks/useKyc';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { documentTypes, kycSubmissionSchema, type KycSubmissionFormData } from '../validation/KycShema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Shield } from 'lucide-react';

export const KycSubmissionPage = () => {
  const { submitKyc, isLoading, error } = useKyc();
  const [success, setSuccess] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  // Ref to listen to the custom events fired by the Smile ID web component
  const cameraRef = useRef<HTMLElement>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<KycSubmissionFormData>({
    resolver: zodResolver(kycSubmissionSchema),
    defaultValues: { documentCountry: "KE" }
  });

  const smileJobId = watch("smileJobId");

  // 2. Set up the event listeners for the Smile ID Camera
  useEffect(() => {
    const currentCamera = cameraRef.current;
    
    // When Smile ID successfully captures and uploads the images to their server
    const handleSuccess = (event: any) => {
      console.log("Smile ID Capture Success!", event.detail);
      
      // Smile ID returns a 'job_id' in the event details. 
      // We inject this securely into our React Hook Form!
      setValue("smileJobId", event.detail.job_id, { shouldValidate: true });
      setIsCameraActive(false); // Close the camera
    };

    const handleError = (event: any) => {
      console.error("Smile ID Camera Error:", event.detail);
      alert("Camera error: " + (event.detail?.message || "Please check camera permissions."));
      setIsCameraActive(false);
    };

    if (currentCamera) {
      currentCamera.addEventListener('imagesComputed', handleSuccess);
      currentCamera.addEventListener('error', handleError);
    }

    return () => {
      if (currentCamera) {
        currentCamera.removeEventListener('imagesComputed', handleSuccess);
        currentCamera.removeEventListener('error', handleError);
      }
    };
  }, [setValue, isCameraActive]);

  const onSubmit = async (data: KycSubmissionFormData) => {
    try {
      await submitKyc(data);
      setSuccess(true);
    } catch (err) {
      // Handled by hook error state
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow text-center">
        <Shield className="mx-auto text-green-500 w-16 h-16 mb-4" />
        <h2 className="text-2xl font-bold">Verification Submitted!</h2>
        <p className="text-slate-500 mt-2">Your documents are securely processing. This usually takes less than 5 minutes.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow border border-slate-100">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Shield className="text-indigo-600" /> Verify Identity
      </h2>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Country</label>
          <select {...register("documentCountry")} className="w-full p-3 border rounded-lg bg-slate-50">
            <option value="KE">Kenya (KE)</option>
            <option value="NG">Nigeria (NG)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Document Type</label>
          <select {...register("documentType")} className="w-full p-3 border rounded-lg bg-slate-50">
            {documentTypes.map(doc => <option key={doc} value={doc}>{doc.replace('_', ' ')}</option>)}
          </select>
        </div>

        {/* --- SMILE ID CAMERA SECTION --- */}
        <div className="p-5 border-2 border-dashed border-slate-300 rounded-lg text-center bg-slate-50 relative overflow-hidden">
          
          {isCameraActive ? (
            // The actual Smile ID Web Component
            <smart-camera-web 
              ref={cameraRef}
              style={{ width: '100%', height: '300px', display: 'block' }}
              allow-manual-capture="true" 
              manual-capture-timeout="10000" // Shows a manual capture button after 10 seconds
              style={{ width: '100%', height: '400px', display: 'block' }}
            />
          ) : !smileJobId ? (
            // Pre-camera launch UI
            <>
              <Camera className="mx-auto text-slate-400 mb-2" size={32} />
              <button 
                type="button"
                onClick={() => setIsCameraActive(true)}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Start Secure Scan
              </button>
              <p className="text-xs text-slate-500 mt-2">Ensure you are in a well-lit room.</p>
            </>
          ) : (
            // Post-camera success UI
            <div className="text-green-600 font-medium p-4">
              ✓ Scans Captured Securely
            </div>
          )}
          
        </div>
        {errors.smileJobId && <p className="text-red-500 text-xs text-center">{errors.smileJobId.message}</p>}

        <button 
          type="submit" 
          disabled={isLoading || !smileJobId}
          className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold disabled:opacity-50"
        >
          {isLoading ? "Submitting..." : "Complete Verification"}
        </button>
      </form>
    </div>
  );
};