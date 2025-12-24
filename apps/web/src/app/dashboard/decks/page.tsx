"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Deck, decksApi, categoriesApi, Category, CreateDeckRequest } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
	Card as CardUI,
	CardContent,
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

export default function DecksPage() {
	const { token } = useAuth()
	const [decks, setDecks] = useState<Deck[]>([])
	const [categories, setCategories] = useState<Category[]>([])
	const [loading, setLoading] = useState(true)
	const [search, setSearch] = useState("")
	const [createOpen, setCreateOpen] = useState(false)
	const [formData, setFormData] = useState<CreateDeckRequest>({
		name: "",
		slug: "",
		description: "",
		imageUrl: "",
		categoryId: undefined,
		isActive: true,
	})

	const fetchData = async () => {
		try {
			const [decksData, categoriesData] = await Promise.all([
				decksApi.getAll(),
				categoriesApi.getAll(),
			])
			setDecks(decksData)
			setCategories(categoriesData)
		} catch (error) {
			console.error("Failed to fetch:", error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchData()
	}, [])

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			await decksApi.create(formData, token!)
			toast.success("Deck créé avec succès !")
			setCreateOpen(false)
			setFormData({
				name: "",
				slug: "",
				description: "",
				imageUrl: "",
				categoryId: undefined,
				isActive: true,
			})
			fetchData()
		} catch (error) {
			toast.error((error as Error).message ?? "Erreur lors de la création")
		}
	}

	const handleDelete = async (id: string) => {
		if (!confirm("Êtes-vous sûr de vouloir supprimer ce deck ?")) return
		try {
			await decksApi.delete(id, token!)
			toast.success("Deck supprimé")
			fetchData()
		} catch (error) {
			toast.error((error as Error).message ?? "Erreur lors de la suppression")
		}
	}

	const generateSlug = (name: string) => {
		return name
			.toLowerCase()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)/g, "")
	}

	const filteredDecks = decks.filter(
		(deck) =>
			deck.name.toLowerCase().includes(search.toLowerCase()) ||
			deck.description.toLowerCase().includes(search.toLowerCase())
	)

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-white">Decks</h1>
					<p className="text-slate-400 mt-1">Gérer les collections de cartes</p>
				</div>
				<Dialog open={createOpen} onOpenChange={setCreateOpen}>
					<DialogTrigger asChild>
						<Button className="bg-emerald-600 hover:bg-emerald-700">
							<Plus className="h-4 w-4 mr-2" />
							Nouveau deck
						</Button>
					</DialogTrigger>
					<DialogContent className="bg-slate-900 border-slate-800">
						<DialogHeader>
							<DialogTitle className="text-white">Créer un deck</DialogTitle>
							<DialogDescription>
								Ajoutez une nouvelle collection de cartes
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={handleCreate} className="space-y-4">
							<div className="space-y-2">
								<Label>Nom</Label>
								<Input
									value={formData.name}
									onChange={(e) => {
										const name = e.target.value
										setFormData({
											...formData,
											name,
											slug: generateSlug(name),
										})
									}}
									placeholder="Ex: Biais Cognitifs"
									className="bg-slate-800 border-slate-700"
									required
								/>
							</div>
							<div className="space-y-2">
								<Label>Slug</Label>
								<Input
									value={formData.slug}
									onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
									placeholder="biais-cognitifs"
									className="bg-slate-800 border-slate-700"
									required
								/>
							</div>
							<div className="space-y-2">
								<Label>Description</Label>
								<Textarea
									value={formData.description}
									onChange={(e) => setFormData({ ...formData, description: e.target.value })}
									placeholder="Description courte du deck..."
									className="bg-slate-800 border-slate-700"
									required
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>URL Image</Label>
									<Input
										value={formData.imageUrl}
										onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
										placeholder="https://..."
										className="bg-slate-800 border-slate-700"
									/>
								</div>
								<div className="space-y-2">
									<Label>Catégorie</Label>
									<Select
										value={formData.categoryId ?? "none"}
										onValueChange={(v) => setFormData({ ...formData, categoryId: v === "none" ? undefined : v })}
									>
										<SelectTrigger className="bg-slate-800 border-slate-700">
											<SelectValue placeholder="Aucune catégorie" />
										</SelectTrigger>
										<SelectContent className="bg-slate-800 border-slate-700">
											<SelectItem value="none">Aucune catégorie</SelectItem>
											{categories.map((cat) => (
												<SelectItem key={cat.id} value={cat.id}>
													{cat.name}
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
					placeholder="Rechercher un deck..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="pl-10 bg-slate-900 border-slate-800"
				/>
			</div>

			{/* Table */}
			<CardUI className="bg-slate-900 border-slate-800">
				<CardHeader>
					<CardTitle className="text-white">Tous les decks ({filteredDecks.length})</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<p className="text-slate-500">Chargement...</p>
					) : filteredDecks.length === 0 ? (
						<p className="text-slate-500">Aucun deck trouvé.</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow className="border-slate-800">
									<TableHead className="text-slate-400">Nom</TableHead>
									<TableHead className="text-slate-400">Catégorie</TableHead>
									<TableHead className="text-slate-400">Cartes</TableHead>
									<TableHead className="text-slate-400">Statut</TableHead>
									<TableHead className="text-slate-400 text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredDecks.map((deck) => (
									<TableRow key={deck.id} className="border-slate-800">
										<TableCell>
											<div>
												<p className="text-white font-medium">{deck.name}</p>
												<p className="text-slate-500 text-sm">{deck.slug}</p>
											</div>
										</TableCell>
										<TableCell className="text-slate-400">
											{categories.find((c) => c.id === deck.categoryId)?.name ?? "—"}
										</TableCell>
										<TableCell className="text-slate-400">
											{deck.cardCount}
										</TableCell>
										<TableCell>
											<Badge
												variant={deck.isActive ? "default" : "secondary"}
												className={deck.isActive ? "bg-emerald-600" : ""}
											>
												{deck.isActive ? "Actif" : "Inactif"}
											</Badge>
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
												onClick={() => handleDelete(deck.id)}
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
