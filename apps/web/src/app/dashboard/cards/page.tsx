"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, cardsApi, decksApi, Deck, CreateCardRequest } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
	Card as CardUI,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit, Search } from "lucide-react"
import { toast } from "sonner"

export default function CardsPage() {
	const { token } = useAuth()
	const [cards, setCards] = useState<Card[]>([])
	const [decks, setDecks] = useState<Deck[]>([])
	const [loading, setLoading] = useState(true)
	const [search, setSearch] = useState("")
	const [createOpen, setCreateOpen] = useState(false)
	const [formData, setFormData] = useState<CreateCardRequest>({
		title: "",
		summary: "",
		content: "",
		mediaUrl: "",
		sourceLink: "",
		origin: "CURATED",
		qualityScore: 90,
		deckId: undefined,
	})

	const fetchData = async () => {
		try {
			const [cardsData, decksData] = await Promise.all([
				cardsApi.getAll(token!),
				decksApi.getAll(),
			])
			setCards(cardsData)
			setDecks(decksData)
		} catch (error) {
			console.error("Failed to fetch:", error)
			// Fallback: fetch only decks if cards endpoint doesn't exist yet
			try {
				const decksData = await decksApi.getAll()
				setDecks(decksData)
			} catch {}
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (token) fetchData()
	}, [token])

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			await cardsApi.create(formData, token!)
			toast.success("Carte créée avec succès !")
			setCreateOpen(false)
			setFormData({
				title: "",
				summary: "",
				content: "",
				mediaUrl: "",
				sourceLink: "",
				origin: "CURATED",
				qualityScore: 90,
				deckId: undefined,
			})
			fetchData()
		} catch (error) {
			toast.error((error as Error).message ?? "Erreur lors de la création")
		}
	}

	const handleDelete = async (id: string) => {
		if (!confirm("Êtes-vous sûr de vouloir supprimer cette carte ?")) return
		try {
			await cardsApi.delete(id, token!)
			toast.success("Carte supprimée")
			fetchData()
		} catch (error) {
			toast.error((error as Error).message ?? "Erreur lors de la suppression")
		}
	}

	const filteredCards = cards.filter(
		(card) =>
			card.title.toLowerCase().includes(search.toLowerCase()) ||
			card.summary.toLowerCase().includes(search.toLowerCase())
	)

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-white">Cartes</h1>
					<p className="text-slate-400 mt-1">Gérer les cartes de connaissances</p>
				</div>
				<Dialog open={createOpen} onOpenChange={setCreateOpen}>
					<DialogTrigger asChild>
						<Button className="bg-emerald-600 hover:bg-emerald-700">
							<Plus className="h-4 w-4 mr-2" />
							Nouvelle carte
						</Button>
					</DialogTrigger>
					<DialogContent className="bg-slate-900 border-slate-800 max-w-2xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle className="text-white">Créer une carte</DialogTitle>
							<DialogDescription>
								Ajoutez une nouvelle carte de connaissances
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={handleCreate} className="space-y-4">
							<div className="space-y-2">
								<Label>Titre</Label>
								<Input
									value={formData.title}
									onChange={(e) => setFormData({ ...formData, title: e.target.value })}
									placeholder="Ex: Biais de confirmation"
									className="bg-slate-800 border-slate-700"
									required
								/>
							</div>
							<div className="space-y-2">
								<Label>Résumé (Face A)</Label>
								<Input
									value={formData.summary}
									onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
									placeholder="Une phrase courte qui résume le concept"
									className="bg-slate-800 border-slate-700"
									required
								/>
							</div>
							<div className="space-y-2">
								<Label>Contenu (Face B)</Label>
								<Textarea
									value={formData.content}
									onChange={(e) => setFormData({ ...formData, content: e.target.value })}
									placeholder="Explication détaillée..."
									className="bg-slate-800 border-slate-700 min-h-[150px]"
									required
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>URL Image</Label>
									<Input
										value={formData.mediaUrl}
										onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
										placeholder="https://..."
										className="bg-slate-800 border-slate-700"
									/>
								</div>
								<div className="space-y-2">
									<Label>Deck</Label>
									<Select
										value={formData.deckId ?? "none"}
										onValueChange={(v) => setFormData({ ...formData, deckId: v === "none" ? undefined : v })}
									>
										<SelectTrigger className="bg-slate-800 border-slate-700">
											<SelectValue placeholder="Aucun deck" />
										</SelectTrigger>
										<SelectContent className="bg-slate-800 border-slate-700">
											<SelectItem value="none">Aucun deck</SelectItem>
											{decks.map((deck) => (
												<SelectItem key={deck.id} value={deck.id}>
													{deck.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
							<DialogFooter>
								<Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="border-slate-700">
									Annuler
								</Button>
								<Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
									Créer
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{/* Search */}
			<div className="relative max-w-md">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
				<Input
					placeholder="Rechercher une carte..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="pl-10 bg-slate-900 border-slate-800"
				/>
			</div>

			{/* Table */}
			<CardUI className="bg-slate-900 border-slate-800">
				<CardHeader>
					<CardTitle className="text-white">Toutes les cartes ({filteredCards.length})</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<p className="text-slate-500">Chargement...</p>
					) : filteredCards.length === 0 ? (
						<p className="text-slate-500">Aucune carte trouvée. Utilisez le bouton &quot;Seed Dataset Gold&quot; sur le dashboard pour initialiser des données.</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow className="border-slate-800">
									<TableHead className="text-slate-400">Titre</TableHead>
									<TableHead className="text-slate-400">Origine</TableHead>
									<TableHead className="text-slate-400">Qualité</TableHead>
									<TableHead className="text-slate-400">Deck</TableHead>
									<TableHead className="text-slate-400 text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredCards.slice(0, 50).map((card) => (
									<TableRow key={card.id} className="border-slate-800">
										<TableCell className="text-white font-medium">
											{card.title}
										</TableCell>
										<TableCell>
											<Badge variant="outline" className="border-slate-700">
												{card.origin}
											</Badge>
										</TableCell>
										<TableCell className="text-slate-400">
											{card.qualityScore}/100
										</TableCell>
										<TableCell className="text-slate-400">
											{decks.find((d) => d.id === card.deckId)?.name ?? "—"}
										</TableCell>
										<TableCell className="text-right">
											<Button
												variant="ghost"
												size="icon"
												className="text-slate-400 hover:text-white"
											>
												<Edit className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="text-slate-400 hover:text-red-500"
												onClick={() => handleDelete(card.id)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</CardUI>
		</div>
	)
}
