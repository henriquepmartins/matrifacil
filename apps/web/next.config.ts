import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	env: {
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "https://server-production-3365.up.railway.app",
	},
};

export default nextConfig;
