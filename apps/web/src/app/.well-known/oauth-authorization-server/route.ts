import { oAuthDiscoveryMetadata } from "better-auth/plugins";
import { auth } from "@matrifacil-/auth";

export const GET = oAuthDiscoveryMetadata(auth);
