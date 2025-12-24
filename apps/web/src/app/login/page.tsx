"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
	const router = useRouter();
	const { login, isLoading } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			await login(email, password);
			toast.success("Connexion réussie !");
			router.push("/dashboard");
		} catch (error) {
			toast.error((error as Error).message ?? "Erreur de connexion");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="animate-pulse">Chargement...</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
			<Card className="w-full max-w-md border-slate-700 bg-slate-900/50 backdrop-blur">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 text-5xl">🧠</div>
					<CardTitle className="text-2xl text-white">SYNAP Admin</CardTitle>
					<CardDescription>Connectez-vous pour accéder au dashboard</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email" className="text-white">
								Email
							</Label>
							<Input
								id="email"
								type="email"
								placeholder="admin@synap.app"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="bg-slate-800 border-slate-700 text-white"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password" className="text-white">
								Mot de passe
							</Label>
							<Input
								id="password"
								type="password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="bg-slate-800 border-slate-700 text-white"
							/>
						</div>
						<Button
							type="submit"
							className="w-full bg-emerald-600 hover:bg-emerald-700"
							disabled={isSubmitting}
						>
							{isSubmitting ? "Connexion..." : "Se connecter"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
