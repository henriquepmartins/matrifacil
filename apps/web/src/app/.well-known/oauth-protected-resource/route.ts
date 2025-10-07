import { oAuthProtectedResourceMetadata } from "better-auth/plugins";
import { auth } from "@matrifacil-/auth";

export const GET = oAuthProtectedResourceMetadata(auth);
