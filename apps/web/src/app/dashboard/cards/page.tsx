"use client"

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import {
	Card,
	cardsApi,
	decksApi,
	Deck,
	CreateCardRequest,
	PaginatedResponse,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Card as CardUI,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
	Plus,
	Trash2,
	Edit,
	Search,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

export default function CardsPage() {
	const { token } = useAuth();
	const [data, setData] = useState<PaginatedResponse<Card> | null>(null);
	const [decks, setDecks] = useState<Deck[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const limit = 20;
	const [createOpen, setCreateOpen] = useState(false);
	const [formData, setFormData] = useState<CreateCardRequest>({
		title: "",
		summary: "",
		content: "",
		mediaUrl: "",
		sourceLink: "",
		origin: "CURATED",
		qualityScore: 90,
		deckId: undefined,
	});

	const fetchData = useCallback(async () => {
		if (!token) return;
		setLoading(true);
		try {
			const [cardsResponse, decksData] = await Promise.all([
				cardsApi.getAll(token, page, limit, search),
				decksApi.getAll(),
			]);
			setData(cardsResponse);
			setDecks(decksData);
		} catch (error) {
			console.error("Failed to fetch:", error);
			try {
				const decksData = await decksApi.getAll();
				setDecks(decksData);
			} catch {}
		} finally {
			setLoading(false);
		}
	}, [token, page, search]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => {
			setPage(1);
		}, 300);
		return () => clearTimeout(timer);
	}, [search]);

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await cardsApi.create(formData, token!);
			toast.success("Carte créée avec succès !");
			setCreateOpen(false);
			setFormData({
				title: "",
				summary: "",
				content: "",
				mediaUrl: "",
				sourceLink: "",
				origin: "CURATED",
				qualityScore: 90,
				deckId: undefined,
			});
			fetchData();
		} catch (error) {
			toast.error((error as Error).message ?? "Erreur lors de la création");
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Êtes-vous sûr de vouloir supprimer cette carte ?")) return;
		try {
			await cardsApi.delete(id, token!);
			toast.success("Carte supprimée");
			fetchData();
		} catch (error) {
			toast.error((error as Error).message ?? "Erreur lors de la suppression");
		}
	};

	const cards = data?.items ?? [];
	const total = data?.total ?? 0;
	const totalPages = data?.totalPages ?? 1;

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
								<Label className="text-slate-200">Titre</Label>
								<Input
									value={formData.title}
									onChange={(e) => setFormData({ ...formData, title: e.target.value })}
									placeholder="Ex: Biais de confirmation"
									className="bg-slate-800 border-slate-700"
									required
								/>
							</div>
							<div className="space-y-2">
								<Label className="text-slate-200">Résumé (Face A)</Label>
								<Input
									value={formData.summary}
									onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
									placeholder="Une phrase courte qui résume le concept"
									className="bg-slate-800 border-slate-700"
									required
								/>
							</div>
							<div className="space-y-2">
								<Label className="text-slate-200">Contenu (Face B)</Label>
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
									<Label className="text-slate-200">URL Image</Label>
									<Input
										value={formData.mediaUrl}
										onChange={(e) =>
											setFormData({ ...formData, mediaUrl: e.target.value })
										}
										placeholder="https://..."
										className="bg-slate-800 border-slate-700"
									/>
								</div>
								<div className="space-y-2">
									<Label className="text-slate-200">Deck</Label>
									<Select
										value={formData.deckId ?? "none"}
										onValueChange={(v) =>
											setFormData({ ...formData, deckId: v === "none" ? undefined : v })
										}
									>
										<SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
											<SelectValue placeholder="Aucun deck" />
										</SelectTrigger>
										<SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
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
					placeholder="Rechercher une carte..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="pl-10 bg-slate-900 border-slate-800"
				/>
			</div>

			{/* Table */}
			<CardUI className="bg-slate-900 border-slate-800">
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle className="text-white">Toutes les cartes ({total})</CardTitle>
					{/* Pagination */}
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
					) : cards.length === 0 ? (
						<p className="text-slate-500">
							Aucune carte trouvée. Utilisez le bouton &quot;Seed Dataset Gold&quot;
							sur le dashboard pour initialiser des données.
						</p>
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
								{cards.map((card) => (
									<TableRow key={card.id} className="border-slate-800">
										<TableCell className="text-white font-medium">{card.title}</TableCell>
										<TableCell>
											<Badge variant="outline" className="border-slate-700 text-slate-400">
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
	);
}
