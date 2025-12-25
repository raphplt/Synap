"use client"

import { useState } from "react";
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Card as CardUI,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner"
import { Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export default function SettingsPage() {
	const { user, token } = useAuth();
	const [isClearing, setIsClearing] = useState(false);
	const [isResetting, setIsResetting] = useState(false);

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault()
		toast.success("Paramètres sauvegardés (simulation)")
	}

	const handleClearCards = async () => {
		if (!token) {
			toast.error("Non authentifié");
			return;
		}

		setIsClearing(true);
		try {
			const response = await fetch(`${API_URL}/admin/cards`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error(`Erreur ${response.status}`);
			}

			const result = await response.json();
			toast.success(result.message ?? `${result.deleted} cartes supprimées`);
		} catch (error) {
			toast.error(`Erreur: ${(error as Error).message}`);
		} finally {
			setIsClearing(false);
		}
	};

	const handleResetDatabase = async () => {
		if (!token) {
			toast.error("Non authentifié");
			return;
		}

		setIsResetting(true);
		try {
			const response = await fetch(`${API_URL}/admin/reset`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error(`Erreur ${response.status}`);
			}

			const result = await response.json();
			toast.success(
				`Reset effectué: ${result.cardsDeleted} cartes, ${result.decksDeleted} decks, ${result.usersDeleted} utilisateurs supprimés`
			);
		} catch (error) {
			toast.error(`Erreur: ${(error as Error).message}`);
		} finally {
			setIsResetting(false);
		}
	};

	return (
		<div className="space-y-6 max-w-2xl">
			<div>
				<h1 className="text-3xl font-bold text-white">Paramètres</h1>
				<p className="text-slate-400 mt-1">Configuration du dashboard admin</p>
			</div>

			<CardUI className="bg-slate-900 border-slate-800">
				<CardHeader>
					<CardTitle className="text-white">Configuration API</CardTitle>
					<CardDescription>
						Paramètres de connexion à l&apos;API backend
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSave} className="space-y-4">
						<div className="space-y-2">
							<Label className="text-slate-200">URL de l&apos;API</Label>
							<Input
								defaultValue={API_URL}
								className="bg-slate-800 border-slate-700 text-slate-200"
								disabled
							/>
							<p className="text-xs text-slate-500">
								Configurable via NEXT_PUBLIC_API_URL
							</p>
						</div>
						<Separator className="bg-slate-800" />
						<Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
							Sauvegarder
						</Button>
					</form>
				</CardContent>
			</CardUI>

			{/* Account Info */}
			<CardUI className="bg-slate-900 border-slate-800">
				<CardHeader>
					<CardTitle className="text-white">Mon compte</CardTitle>
					<CardDescription>Informations du compte admin actuel</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label className="text-slate-500">Nom d&apos;utilisateur</Label>
							<p className="text-white">{user?.username ?? "—"}</p>
						</div>
						<div>
							<Label className="text-slate-500">Email</Label>
							<p className="text-white">{user?.email ?? "—"}</p>
						</div>
						<div>
							<Label className="text-slate-500">XP Total</Label>
							<p className="text-amber-500 font-medium">{user?.xp ?? 0} XP</p>
						</div>
						<div>
							<Label className="text-slate-500">Streak</Label>
							<p className="text-orange-500 font-medium">{user?.streak ?? 0} jours</p>
						</div>
					</div>
				</CardContent>
			</CardUI>

			{/* Danger Zone */}
			<CardUI className="bg-slate-900 border-red-900/50">
				<CardHeader>
					<CardTitle className="text-red-500">Zone de danger</CardTitle>
					<CardDescription>Actions irréversibles</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-white font-medium">Vider toutes les cartes</p>
							<p className="text-slate-500 text-sm">
								Supprime toutes les cartes de la base de données
							</p>
						</div>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="destructive" size="sm" disabled={isClearing}>
									{isClearing ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										"Supprimer"
									)}
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent className="bg-slate-900 border-slate-800">
								<AlertDialogHeader>
									<AlertDialogTitle className="text-white">
										Supprimer toutes les cartes ?
									</AlertDialogTitle>
									<AlertDialogDescription>
										Cette action est irréversible. Toutes les cartes et leurs interactions
										seront définitivement supprimées.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700">
										Annuler
									</AlertDialogCancel>
									<AlertDialogAction
										onClick={handleClearCards}
										className="bg-red-600 hover:bg-red-700"
									>
										Supprimer
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
					<Separator className="bg-slate-800" />
					<div className="flex items-center justify-between">
						<div>
							<p className="text-white font-medium">Reset complet</p>
							<p className="text-slate-500 text-sm">
								Réinitialise la DB (garde le compte admin)
							</p>
						</div>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="destructive" size="sm" disabled={isResetting}>
									{isResetting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset"}
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent className="bg-slate-900 border-slate-800">
								<AlertDialogHeader>
									<AlertDialogTitle className="text-white">
										Réinitialiser la base de données ?
									</AlertDialogTitle>
									<AlertDialogDescription>
										Cette action est irréversible. Toutes les données seront supprimées
										sauf votre compte admin (XP et streak remis à 0).
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700">
										Annuler
									</AlertDialogCancel>
									<AlertDialogAction
										onClick={handleResetDatabase}
										className="bg-red-600 hover:bg-red-700"
									>
										Réinitialiser
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</CardContent>
			</CardUI>
		</div>
	);
}
