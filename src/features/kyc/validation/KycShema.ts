import { z } from 'zod';

export const documentTypes = ['NATIONAL_ID', 'PASSPORT'] as const;

export const kycSubmissionSchema = z.object({
  documentType: z.enum(documentTypes, {
    errorMap: () => ({ message: "Please select a valid document type" })
  }),
  documentCountry: z.string().length(2, "Select a valid 2-letter country code (e.g., KE, NG)"),
  
  // The user won't type this; our Smile ID SDK will generate it and inject it into the form
  smileJobId: z.string().min(1, "Job ID is missing. Please complete the camera scan.")
});

export type KycSubmissionFormData = z.infer<typeof kycSubmissionSchema>;