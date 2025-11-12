"use client";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { useState, Suspense } from "react";
import Loader from "@/components/loader";

function LoginContent() {
	const [showSignIn, setShowSignIn] = useState(false);

	return showSignIn ? (
		<SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
	) : (
		<SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
	);
}

export default function LoginPage() {
	return (
		<Suspense fallback={<Loader />}>
			<LoginContent />
		</Suspense>
	);
}
