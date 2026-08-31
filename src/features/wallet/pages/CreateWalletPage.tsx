import { Navigate } from "react-router-dom";

/**
 * Legacy route shim.
 *
 * Wallet provisioning now happens automatically during registration on the
 * backend, so this route is no longer part of the primary onboarding flow.
 */
export const CreateWalletPage = () => <Navigate to="/dashboard" replace />;
