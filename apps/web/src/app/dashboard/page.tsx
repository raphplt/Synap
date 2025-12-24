"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { decksApi, categoriesApi, seedApi, Deck, Category } from "@/lib/api"
import { Users, CreditCard, Layers, FolderTree, Sparkles } from "lucide-react"
import { toast } from "sonner"

export default function DashboardPage() {
	const { token } = useAuth()
	const [stats, setStats] = useState({ decks: 0, categories: 0 })
	const [loading, setLoading] = useState(true)
	const [seeding, setSeeding] = useState(false)

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const [decks, categories] = await Promise.all([
					decksApi.getAll(),
					categoriesApi.getAll()
				])
				setStats({
					decks: decks.length,
					categories: categories.length,
				})
			} catch (error) {
				console.error("Failed to fetch stats:", error)
			} finally {
				setLoading(false)
			}
		}
		fetchStats()
	}, [token])

	const handleSeedGold = async () => {
		setSeeding(true)
		try {
			const result = await seedApi.seedGold()
			toast.success(`Seeding terminé ! ${result.categories} catégories, ${result.decks} decks, ${result.cards} cartes créées.`)
			// Refresh stats
			const [decks, categories] = await Promise.all([
				decksApi.getAll(),
				categoriesApi.getAll()
			])
			setStats({ decks: decks.length, categories: categories.length })
		} catch (error) {
			toast.error((error as Error).message ?? "Erreur lors du seeding")
		} finally {
			setSeeding(false)
		}
	}

	const statCards = [
		{ title: "Utilisateurs", value: "—", icon: Users, color: "text-blue-500" },
		{ title: "Cartes", value: "—", icon: CreditCard, color: "text-emerald-500" },
		{ title: "Decks", value: stats.decks, icon: Layers, color: "text-amber-500" },
		{ title: "Catégories", value: stats.categories, icon: FolderTree, color: "text-purple-500" },
	]

	return (
		<div className="space-y-8">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold text-white">Dashboard</h1>
				<p className="text-slate-400 mt-1">Vue d&apos;ensemble de SYNAP</p>
			</div>

			{/* Stats Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{statCards.map((stat) => (
					<Card key={stat.title} className="bg-slate-900 border-slate-800">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium text-slate-400">
								{stat.title}
							</CardTitle>
							<stat.icon className={`h-5 w-5 ${stat.color}`} />
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-white">
								{loading ? "..." : stat.value}
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Quick Actions */}
			<Card className="bg-slate-900 border-slate-800">
				<CardHeader>
					<CardTitle className="text-white">Actions rapides</CardTitle>
					<CardDescription>Opérations courantes d&apos;administration</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-wrap gap-3">
					<Button
						onClick={handleSeedGold}
						disabled={seeding}
						className="bg-amber-600 hover:bg-amber-700"
					>
						<Sparkles className="h-4 w-4 mr-2" />
						{seeding ? "Seeding..." : "Seed Dataset Gold"}
					</Button>
					<Button variant="outline" className="border-slate-700 hover:bg-slate-800">
						Exporter les données
					</Button>
					<Button variant="outline" className="border-slate-700 hover:bg-slate-800">
						Synchroniser Wikipedia
					</Button>
				</CardContent>
			</Card>

			{/* Recent Activity placeholder */}
			<Card className="bg-slate-900 border-slate-800">
				<CardHeader>
					<CardTitle className="text-white">Activité récente</CardTitle>
					<CardDescription>Dernières actions sur la plateforme</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-slate-500 text-sm">Aucune activité récente</p>
				</CardContent>
			</Card>
		</div>
	)
}
