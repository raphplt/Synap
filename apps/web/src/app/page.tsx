"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function HomePage() {
	const router = useRouter();
	const { isAuthenticated, isLoading } = useAuth();

	useEffect(() => {
		if (!isLoading) {
			if (isAuthenticated) {
				router.replace("/dashboard");
			} else {
				router.replace("/login");
			}
		}
	}, [isAuthenticated, isLoading, router]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="animate-pulse text-muted-foreground">Chargement...</div>
		</div>
	);
}
