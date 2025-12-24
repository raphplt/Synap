"use client"

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
import { toast } from "sonner"

export default function SettingsPage() {
	const { user } = useAuth()

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault()
		toast.success("Paramètres sauvegardés (simulation)")
	}

	return (
		<div className="space-y-6 max-w-2xl">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold text-white">Paramètres</h1>
				<p className="text-slate-400 mt-1">Configuration du dashboard admin</p>
			</div>

			{/* API Settings */}
			<CardUI className="bg-slate-900 border-slate-800">
				<CardHeader>
					<CardTitle className="text-white">Configuration API</CardTitle>
					<CardDescription>Paramètres de connexion à l&apos;API backend</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSave} className="space-y-4">
						<div className="space-y-2">
							<Label>URL de l&apos;API</Label>
							<Input
								defaultValue={process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}
								className="bg-slate-800 border-slate-700"
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
						<Button variant="destructive" size="sm">
							Supprimer
						</Button>
					</div>
					<Separator className="bg-slate-800" />
					<div className="flex items-center justify-between">
						<div>
							<p className="text-white font-medium">Reset complet</p>
							<p className="text-slate-500 text-sm">
								Réinitialise complètement la base de données
							</p>
						</div>
						<Button variant="destructive" size="sm">
							Reset
						</Button>
					</div>
				</CardContent>
			</CardUI>
		</div>
	)
}
