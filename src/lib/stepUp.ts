import { apiClient } from "./axios";
import {
  StepUpChallengeRequestSchema,
  StepUpChallengeResponseSchema,
  StepUpVerifyRequestSchema,
  StepUpVerifyResponseSchema,
  type StepUpChallengeRequest,
  type StepUpChallengeResponse,
  type StepUpVerifyRequest,
  type StepUpVerifyResponse,
} from "../features/admin/validation/adminSchema";

export const STEP_UP_TOKEN_HEADER = "X-Step-Up-Token";

const normalizeStepUpValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") {
    return Number.isInteger(value) ? value.toString() : value.toString();
  }

  return String(value);
};

export const buildStepUpContext = (entries: Array<[string, unknown]>): string =>
  entries.map(([key, value]) => `${key}=${normalizeStepUpValue(value)}`).join(";");

export const requestStepUpChallengeApi = async (
  payload: StepUpChallengeRequest
): Promise<StepUpChallengeResponse> => {
  const parsedPayload = StepUpChallengeRequestSchema.parse(payload);
  const { data } = await apiClient.post("/auth/step-up/challenge", parsedPayload);
  return StepUpChallengeResponseSchema.parse(data);
};

export const verifyStepUpChallengeApi = async (
  payload: StepUpVerifyRequest
): Promise<StepUpVerifyResponse> => {
  const parsedPayload = StepUpVerifyRequestSchema.parse(payload);
  const { data } = await apiClient.post("/auth/step-up/verify", parsedPayload);
  return StepUpVerifyResponseSchema.parse(data);
};
