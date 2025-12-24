"use client"

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context"
import {
	Category,
	categoriesApi,
	CreateCategoryRequest,
	PaginatedResponse,
} from "@/lib/api";
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
	Plus,
	Trash2,
	Edit,
	Search,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { toast } from "sonner"

export default function CategoriesPage() {
	const { token } = useAuth()
	const [data, setData] = useState<PaginatedResponse<Category> | null>(null);
	const [loading, setLoading] = useState(true)
	const [search, setSearch] = useState("")
	const [page, setPage] = useState(1);
	const limit = 20;
	const [createOpen, setCreateOpen] = useState(false)
	const [formData, setFormData] = useState<CreateCategoryRequest>({
		name: "",
		slug: "",
		description: "",
		imageUrl: "",
	})

	const fetchData = useCallback(async () => {
		if (!token) return;
		setLoading(true);
		try {
			const response = await categoriesApi.getAll(token, page, limit, search);
			setData(response);
		} catch (error) {
			console.error("Failed to fetch:", error);
		} finally {
			setLoading(false);
		}
	}, [token, page, search]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	useEffect(() => {
		const timer = setTimeout(() => setPage(1), 300);
		return () => clearTimeout(timer);
	}, [search]);

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			await categoriesApi.create(formData, token!)
			toast.success("Catégorie créée avec succès !")
			setCreateOpen(false)
			setFormData({ name: "", slug: "", description: "", imageUrl: "" })
			fetchData()
		} catch (error) {
			toast.error((error as Error).message ?? "Erreur lors de la création")
		}
	}

	const handleDelete = async (id: string) => {
		if (!confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) return
		try {
			await categoriesApi.delete(id, token!)
			toast.success("Catégorie supprimée")
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
			.replace(/(^-|-$)/g, "");
	}

	const categories = data?.items ?? [];
	const total = data?.total ?? 0;
	const totalPages = data?.totalPages ?? 1;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-white">Catégories</h1>
					<p className="text-slate-400 mt-1">Gérer les thèmes de connaissances</p>
				</div>
				<Dialog open={createOpen} onOpenChange={setCreateOpen}>
					<DialogTrigger asChild>
						<Button className="bg-emerald-600 hover:bg-emerald-700">
							<Plus className="h-4 w-4 mr-2" />
							Nouvelle catégorie
						</Button>
					</DialogTrigger>
					<DialogContent className="bg-slate-900 border-slate-800">
						<DialogHeader>
							<DialogTitle className="text-white">Créer une catégorie</DialogTitle>
							<DialogDescription>
								Ajoutez un nouveau thème de connaissances
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={handleCreate} className="space-y-4">
							<div className="space-y-2">
								<Label>Nom</Label>
								<Input
									value={formData.name}
									onChange={(e) => {
										const name = e.target.value;
										setFormData({ ...formData, name, slug: generateSlug(name) });
									}}
									placeholder="Ex: Psychologie"
									className="bg-slate-800 border-slate-700"
									required
								/>
							</div>
							<div className="space-y-2">
								<Label>Slug</Label>
								<Input
									value={formData.slug}
									onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
									placeholder="psychologie"
									className="bg-slate-800 border-slate-700"
									required
								/>
							</div>
							<div className="space-y-2">
								<Label>Description</Label>
								<Textarea
									value={formData.description}
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
									placeholder="Description courte..."
									className="bg-slate-800 border-slate-700"
								/>
							</div>
							<div className="space-y-2">
								<Label>URL Image / Emoji</Label>
								<Input
									value={formData.imageUrl}
									onChange={(e) =>
										setFormData({ ...formData, imageUrl: e.target.value })
									}
									placeholder="🧠 ou https://..."
									className="bg-slate-800 border-slate-700"
								/>
							</div>
							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={() => setCreateOpen(false)}
									className="border-slate-700"
								>
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
					placeholder="Rechercher une catégorie..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="pl-10 bg-slate-900 border-slate-800"
				/>
			</div>

			{/* Table */}
			<CardUI className="bg-slate-900 border-slate-800">
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle className="text-white">
						Toutes les catégories ({total})
					</CardTitle>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page === 1}
							className="border-slate-700"
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<span className="text-slate-400 text-sm">
							{page} / {totalPages}
						</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							disabled={page >= totalPages}
							className="border-slate-700"
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{loading ? (
						<p className="text-slate-500">Chargement...</p>
					) : categories.length === 0 ? (
						<p className="text-slate-500">Aucune catégorie trouvée.</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow className="border-slate-800">
									<TableHead className="text-slate-400">Icône</TableHead>
									<TableHead className="text-slate-400">Nom</TableHead>
									<TableHead className="text-slate-400">Description</TableHead>
									<TableHead className="text-slate-400">Ordre</TableHead>
									<TableHead className="text-slate-400 text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{categories.map((cat) => (
									<TableRow key={cat.id} className="border-slate-800">
										<TableCell className="text-2xl">
											{cat.imageUrl?.startsWith("http") ? "📁" : cat.imageUrl ?? "📁"}
										</TableCell>
										<TableCell>
											<div>
												<p className="text-white font-medium">{cat.name}</p>
												<p className="text-slate-500 text-sm">{cat.slug}</p>
											</div>
										</TableCell>
										<TableCell className="text-slate-400 max-w-xs truncate">
											{cat.description ?? "—"}
										</TableCell>
										<TableCell className="text-slate-400">{cat.sortOrder}</TableCell>
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
												onClick={() => handleDelete(cat.id)}
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
	);
}
