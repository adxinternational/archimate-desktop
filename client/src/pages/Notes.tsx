import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Search, Trash2, Star, StickyNote, Filter, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
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

export default function Notes() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "", category: "general" });

  const utils = trpc.useUtils();
  const { data: notesData, isLoading } = trpc.notes.list.useQuery();
  const notes = Array.isArray(notesData) ? notesData : [];

  const createMutation = trpc.notes.create.useMutation({
    onSuccess: () => {
      utils.notes.list.invalidate();
      toast.success("Note créée");
      setIsCreateOpen(false);
      setNewNote({ title: "", content: "", category: "general" });
    },
  });

  const deleteMutation = trpc.notes.delete.useMutation({
    onSuccess: () => {
      utils.notes.list.invalidate();
      toast.success("Note supprimée");
    },
  });

  const toggleFavoriteMutation = trpc.notes.toggleFavorite.useMutation({
    onSuccess: () => {
      utils.notes.list.invalidate();
    },
  });

  const filteredNotes = notes?.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(search.toLowerCase()) || 
                         note.content?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || note.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(notes?.map(n => n.category) || [])).filter(Boolean);

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Notes & Idées</h1>
          <p className="text-muted-foreground mt-1">Gérez vos notes personnelles et professionnelles</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> Nouvelle note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Créer une note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Titre</label>
                <Input 
                  placeholder="Titre de la note..." 
                  value={newNote.title}
                  onChange={e => setNewNote(n => ({ ...n, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Catégorie</label>
                <Select 
                  value={newNote.category} 
                  onValueChange={v => setNewNote(n => ({ ...n, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Général</SelectItem>
                    <SelectItem value="project">Projet</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="idea">Idée</SelectItem>
                    <SelectItem value="todo">À faire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contenu</label>
                <Textarea 
                  placeholder="Écrivez votre note ici..." 
                  rows={5}
                  value={newNote.content}
                  onChange={e => setNewNote(n => ({ ...n, content: e.target.value }))}
                  className="resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
              <Button 
                onClick={() => createMutation.mutate(newNote)}
                disabled={!newNote.title || createMutation.isPending}
              >
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher une note..." 
            className="pl-10 bg-background/50 border-muted-foreground/20 focus:border-primary"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px] bg-background/50">
            <Filter className="w-4 h-4 mr-2 opacity-50" />
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat!}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <p>Chargement de vos notes...</p>
        </div>
      ) : filteredNotes?.length === 0 ? (
        <Card className="border-dashed border-2 py-20 flex flex-col items-center justify-center text-muted-foreground">
          <StickyNote className="w-12 h-12 mb-4 opacity-20" />
          <p>Aucune note trouvée</p>
          {search || categoryFilter !== "all" ? (
            <Button variant="link" onClick={() => { setSearch(""); setCategoryFilter("all"); }}> Effacer les filtres </Button>
          ) : null}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes?.map(note => (
            <Card key={note.id} className="group hover:shadow-md transition-all duration-200 border-muted-foreground/10 overflow-hidden flex flex-col">
              <CardHeader className="pb-3 flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                      {note.category}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(note.createdAt), "d MMMM yyyy", { locale: fr })}
                    </span>
                  </div>
                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                    {note.title}
                  </CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-8 w-8 ${note.isFavorite ? 'text-yellow-500' : 'text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity'}`}
                  onClick={() => toggleFavoriteMutation.mutate({ id: note.id, isFavorite: !note.isFavorite })}
                >
                  <Star className={`w-4 h-4 ${note.isFavorite ? 'fill-current' : ''}`} />
                </Button>
              </CardHeader>
              <CardContent className="pb-4 flex-1">
                <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>
              </CardContent>
              <div className="px-6 py-3 bg-muted/30 border-t flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    if (confirm("Supprimer cette note ?")) {
                      deleteMutation.mutate({ id: note.id });
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
