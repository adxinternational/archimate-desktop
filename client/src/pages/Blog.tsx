import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Search, Trash2, Edit3, Newspaper, Loader2, Calendar, User, Eye, ArrowRight } from "lucide-react";
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

export default function Blog() {
  const [search, setSearch] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [form, setForm] = useState({ title: "", slug: "", content: "", excerpt: "", status: "draft" as any });

  const utils = trpc.useUtils();
  const { data: posts, isLoading } = trpc.blog.list.useQuery();

  const createMutation = trpc.blog.create.useMutation({
    onSuccess: () => {
      utils.blog.list.invalidate();
      toast.success("Article créé");
      setIsEditorOpen(false);
      resetForm();
    },
  });

  const updateMutation = trpc.blog.update.useMutation({
    onSuccess: () => {
      utils.blog.list.invalidate();
      toast.success("Article mis à jour");
      setIsEditorOpen(false);
      resetForm();
    },
  });

  const deleteMutation = trpc.blog.delete.useMutation({
    onSuccess: () => {
      utils.blog.list.invalidate();
      toast.success("Article supprimé");
    },
  });

  const resetForm = () => {
    setForm({ title: "", slug: "", content: "", excerpt: "", status: "draft" });
    setEditingPost(null);
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      slug: post.slug,
      content: post.content || "",
      excerpt: post.excerpt || "",
      status: post.status,
    });
    setIsEditorOpen(true);
  };

  const handleSubmit = () => {
    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  const filteredPosts = posts?.filter(post => 
    post.title.toLowerCase().includes(search.toLowerCase()) || 
    post.excerpt?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Blog & Actualités</h1>
          <p className="text-muted-foreground mt-1">Gérez le contenu de votre site web et vos articles</p>
        </div>
        <Dialog open={isEditorOpen} onOpenChange={(o) => { setIsEditorOpen(o); if(!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> Nouvel article
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? "Modifier l'article" : "Créer un article"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Titre</label>
                  <Input 
                    placeholder="Titre de l'article..." 
                    value={form.title}
                    onChange={e => {
                      const title = e.target.value;
                      const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                      setForm(f => ({ ...f, title, slug }));
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Slug (URL)</label>
                  <Input 
                    placeholder="mon-article-slug" 
                    value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Statut</label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="published">Publié</SelectItem>
                      <SelectItem value="archived">Archivé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Extrait</label>
                <Textarea 
                  placeholder="Bref résumé de l'article..." 
                  rows={2}
                  value={form.excerpt}
                  onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                  className="resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contenu</label>
                <Textarea 
                  placeholder="Contenu de l'article (Markdown supporté)..." 
                  rows={10}
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditorOpen(false)}>Annuler</Button>
              <Button 
                onClick={handleSubmit}
                disabled={!form.title || !form.slug || createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingPost ? "Mettre à jour" : "Publier"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Rechercher un article..." 
          className="pl-10 h-12 bg-background/50 border-muted-foreground/20 text-lg"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Chargement des articles...</p>
        </div>
      ) : filteredPosts?.length === 0 ? (
        <Card className="border-dashed border-2 py-20 flex flex-col items-center justify-center text-muted-foreground">
          <Newspaper className="w-12 h-12 mb-4 opacity-20" />
          <p>Aucun article trouvé</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredPosts?.map(post => (
            <Card key={post.id} className="group overflow-hidden border-muted-foreground/10 hover:shadow-lg transition-all duration-300">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/4 bg-muted/50 flex items-center justify-center border-r p-4">
                  <div className="text-center">
                    <Calendar className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <div className="text-sm font-medium">
                      {format(new Date(post.createdAt), "dd MMM", { locale: fr })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(post.createdAt), "yyyy")}
                    </div>
                  </div>
                </div>
                <div className="flex-1 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant={post.status === 'published' ? 'default' : post.status === 'draft' ? 'secondary' : 'outline'} className="rounded-full">
                      {post.status === 'published' ? 'Publié' : post.status === 'draft' ? 'Brouillon' : 'Archivé'}
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                      <User className="w-3 h-3" /> Admin
                    </div>
                  </div>
                  <CardTitle className="text-2xl mb-2 group-hover:text-primary transition-colors cursor-pointer" onClick={() => handleEdit(post)}>
                    {post.title}
                  </CardTitle>
                  <p className="text-muted-foreground mb-4 line-clamp-2 italic">
                    {post.excerpt || "Aucun extrait disponible."}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex gap-4">
                      <Button variant="ghost" size="sm" className="gap-2 h-8 px-2 text-muted-foreground hover:text-foreground">
                        <Eye className="w-4 h-4" /> Aperçu
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2 h-8 px-2 text-muted-foreground hover:text-primary" onClick={() => handleEdit(post)}>
                        <Edit3 className="w-4 h-4" /> Modifier
                      </Button>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        if (confirm("Supprimer cet article ?")) {
                          deleteMutation.mutate({ id: post.id });
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
