import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { ArrowLeft, FolderOpen, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { PHASE_LABELS } from "@/lib/constants";

const projectSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  clientId: z.string().optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  currentPhase: z.enum(["esq", "aps", "apd", "pc", "dce", "chantier", "doe"]),
  budgetEstimated: z.string().optional(),
  startDate: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function ProjectCreate() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      clientId: "",
      type: "",
      description: "",
      address: "",
      city: "",
      currentPhase: "esq",
      budgetEstimated: "",
      startDate: "",
    },
  });

  const { data: clients } = trpc.clients.list.useQuery();

  const createMutation = trpc.projects.create.useMutation({
    onSuccess: (data) => {
      utils.projects.list.invalidate();
      toast.success("Projet créé avec succès");
      navigate(`/projects/${data.id}`);
    },
    onError: (err) => toast.error("Erreur : " + err.message),
  });

  const onSubmit = (values: ProjectFormValues) => {
    createMutation.mutate({
      ...values,
      clientId: values.clientId ? parseInt(values.clientId) : undefined,
      budgetEstimated: values.budgetEstimated ? parseFloat(values.budgetEstimated) : undefined,
      startDate: values.startDate ? new Date(values.startDate) : undefined,
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/projects">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Nouveau projet</h1>
          <p className="text-sm text-muted-foreground">Créer un nouveau projet architectural</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-primary" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du projet <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Villa Dupont - Réhabilitation" {...field} className="bg-background" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Sélectionner un client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(Array.isArray(clients) ? clients : []).map(c => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de projet</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PROJECT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Description du projet..."
                        className="bg-background resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse</FormLabel>
                      <FormControl>
                        <Input placeholder="Adresse du projet" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ville</FormLabel>
                      <FormControl>
                        <Input placeholder="Ville" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currentPhase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phase initiale</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(PHASE_LABELS).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="budgetEstimated"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget estimé (€)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de démarrage</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="bg-background" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-3 mt-6 justify-end">
            <Link href="/projects">
              <Button type="button" variant="outline">Annuler</Button>
            </Link>
            <Button type="submit" disabled={createMutation.isPending} className="gap-2">
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {createMutation.isPending ? "Création..." : "Créer le projet"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
