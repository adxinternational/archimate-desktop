import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ContextMenu, CommonContextActions } from "@/components/ContextMenu";
import {
  Plus, Users, CheckSquare, Clock, Euro, Trash2, Edit2,
  TrendingUp, TrendingDown, BarChart2, Mail, Phone,
  CheckCircle2, Circle, Timer, AlertCircle
} from "lucide-react";
import {
  formatCurrency, formatDate, getPriorityColor, getInvoiceStatusColor,
  PRIORITY_LABELS, TASK_STATUS_LABELS, INVOICE_STATUS_LABELS
} from "@/lib/constants";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

// ============================================================
// Team Tab
// ============================================================
function TeamTab() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", email: "", phone: "", hourlyRate: "" });
  const utils = trpc.useUtils();

  const { data: teamData } = trpc.team.list.useQuery();
  const team = Array.isArray(teamData) ? teamData : [];
  const createMember = trpc.team.create.useMutation({
    onSuccess: () => { utils.team.list.invalidate(); setOpen(false); setForm({ name: "", role: "", email: "", phone: "", hourlyRate: "" }); toast.success("Membre ajouté"); },
  });
  const deleteMember = trpc.team.delete.useMutation({
    onSuccess: () => { utils.team.list.invalidate(); toast.success("Membre supprimé"); },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="w-4 h-4" />Ajouter un membre</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouveau membre de l'équipe</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Nom <span className="text-destructive">*</span></Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Prénom Nom" />
                </div>
                <div className="space-y-1.5">
                  <Label>Rôle <span className="text-destructive">*</span></Label>
                  <Input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="Architecte, Dessinateur..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Téléphone</Label>
                  <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Taux horaire (€/h)</Label>
                <Input type="number" value={form.hourlyRate} onChange={e => setForm(f => ({ ...f, hourlyRate: e.target.value }))} placeholder="0" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                <Button
                  onClick={() => createMember.mutate({
                    name: form.name, role: form.role,
                    email: form.email || undefined,
                    phone: form.phone || undefined,
                    hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : undefined,
                  })}
                  disabled={!form.name || !form.role || createMember.isPending}
                >Ajouter</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {team.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p className="text-sm">Aucun membre dans l'équipe</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map(member => (
            <Card key={member.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => { if (confirm("Supprimer ce membre ?")) deleteMember.mutate({ id: member.id }); }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {member.email && <div className="flex items-center gap-1.5"><Mail className="w-3 h-3" />{member.email}</div>}
                  {member.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{member.phone}</div>}
                  {member.hourlyRate && (
                    <div className="flex items-center gap-1.5 text-primary font-medium">
                      <Euro className="w-3 h-3" />{member.hourlyRate} €/h
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Tasks Tab
// ============================================================
function TasksTab() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", projectId: "", assigneeId: "",
    priority: "medium" as const, status: "todo" as const, dueDate: "", estimatedHours: "",
  });
  const utils = trpc.useUtils();

  const { data: tasksData } = trpc.tasks.list.useQuery();
  const { data: projectsData } = trpc.projects.list.useQuery();
  const { data: teamData } = trpc.team.list.useQuery();

  const tasks = Array.isArray(tasksData) ? tasksData : [];
  const projects = Array.isArray(projectsData) ? projectsData : [];
  const team = Array.isArray(teamData) ? teamData : [];

  const createTask = trpc.tasks.create.useMutation({
    onSuccess: () => { utils.tasks.list.invalidate(); setOpen(false); toast.success("Tâche créée"); },
  });
  const updateTask = trpc.tasks.update.useMutation({
    onSuccess: () => utils.tasks.list.invalidate(),
  });
  const deleteTask = trpc.tasks.delete.useMutation({
    onSuccess: () => { utils.tasks.list.invalidate(); toast.success("Tâche supprimée"); },
  });

  const tasksByStatus = {
    todo: tasks.filter(t => t.status === "todo"),
    in_progress: tasks.filter(t => t.status === "in_progress"),
    review: tasks.filter(t => t.status === "review"),
    done: tasks.filter(t => t.status === "done"),
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === "done") return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (status === "in_progress") return <Timer className="w-4 h-4 text-blue-500" />;
    if (status === "review") return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    return <Circle className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="w-4 h-4" />Nouvelle tâche</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouvelle tâche</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Titre <span className="text-destructive">*</span></Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Description de la tâche" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Projet</Label>
                  <Select value={form.projectId} onValueChange={v => setForm(f => ({ ...f, projectId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Projet" /></SelectTrigger>
                    <SelectContent>
                      {projects?.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Assigné à</Label>
                  <Select value={form.assigneeId} onValueChange={v => setForm(f => ({ ...f, assigneeId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Membre" /></SelectTrigger>
                    <SelectContent>
                      {team.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Priorité</Label>
                  <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Faible</SelectItem>
                      <SelectItem value="medium">Moyen</SelectItem>
                      <SelectItem value="high">Élevé</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Échéance</Label>
                  <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Heures estimées</Label>
                <Input type="number" value={form.estimatedHours} onChange={e => setForm(f => ({ ...f, estimatedHours: e.target.value }))} placeholder="0" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                <Button
                  onClick={() => createTask.mutate({
                    title: form.title,
                    projectId: form.projectId ? parseInt(form.projectId) : undefined,
                    assigneeId: form.assigneeId ? parseInt(form.assigneeId) : undefined,
                    priority: form.priority,
                    status: form.status,
                    dueDate: form.dueDate ? new Date(form.dueDate) : undefined,
                    estimatedHours: form.estimatedHours ? parseFloat(form.estimatedHours) : undefined,
                  })}
                  disabled={!form.title || createTask.isPending}
                >Créer</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(["todo", "in_progress", "review", "done"] as const).map(status => (
          <div key={status}>
            <div className="flex items-center gap-2 mb-3">
              <StatusIcon status={status} />
              <span className="text-sm font-medium">{TASK_STATUS_LABELS[status]}</span>
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                {tasksByStatus[status].length}
              </span>
            </div>
            <div className="space-y-2">
              {tasksByStatus[status].map(task => {
                const project = projects?.find(p => p.id === task.projectId);
                const assignee = team?.find(m => m.id === task.assigneeId);
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";
                return (
                  <div key={task.id} className="p-3 rounded-lg border border-border bg-card hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-xs font-medium leading-snug flex-1">{task.title}</p>
                      <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-destructive flex-shrink-0"
                        onClick={() => deleteTask.mutate({ id: task.id })}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="mt-2 space-y-1">
                      <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>{PRIORITY_LABELS[task.priority]}</Badge>
                      {project && <p className="text-xs text-muted-foreground truncate">{project.name}</p>}
                      {assignee && <p className="text-xs text-muted-foreground">{assignee.name}</p>}
                      {task.dueDate && (
                        <p className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                          {isOverdue ? "⚠ " : ""}{formatDate(task.dueDate)}
                        </p>
                      )}
                    </div>
                    <Select value={task.status} onValueChange={v => updateTask.mutate({ id: task.id, status: v as any })}>
                      <SelectTrigger className="h-6 text-xs mt-2"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">À faire</SelectItem>
                        <SelectItem value="in_progress">En cours</SelectItem>
                        <SelectItem value="review">En révision</SelectItem>
                        <SelectItem value="done">Terminé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Finances Tab
// ============================================================
function FinancesTab() {
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    clientId: "", projectId: "", number: "", amount: "", description: "",
    status: "draft" as const, dueDate: "",
  });
  const [expenseForm, setExpenseForm] = useState({
    projectId: "", category: "", description: "", amount: "",
    date: new Date().toISOString().split("T")[0],
  });
  const utils = trpc.useUtils();

  const { data: invoicesData } = trpc.invoices.list.useQuery();
  const { data: expensesData } = trpc.expenses.list.useQuery();
  const { data: clientsData } = trpc.clients.list.useQuery();
  const { data: projectsData } = trpc.projects.list.useQuery();

  const invoices = Array.isArray(invoicesData) ? invoicesData : [];
  const expenses = Array.isArray(expensesData) ? expensesData : [];
  const clients = Array.isArray(clientsData) ? clientsData : [];
  const projects = Array.isArray(projectsData) ? projectsData : [];

  const createInvoice = trpc.invoices.create.useMutation({
    onSuccess: () => { utils.invoices.list.invalidate(); setInvoiceOpen(false); toast.success("Facture créée"); },
  });
  const updateInvoice = trpc.invoices.update.useMutation({
    onSuccess: () => utils.invoices.list.invalidate(),
  });
  const deleteInvoice = trpc.invoices.delete.useMutation({
    onSuccess: () => { utils.invoices.list.invalidate(); toast.success("Facture supprimée"); },
  });
  const createExpense = trpc.expenses.create.useMutation({
    onSuccess: () => { utils.expenses.list.invalidate(); setExpenseOpen(false); toast.success("Dépense ajoutée"); },
  });
  const deleteExpense = trpc.expenses.delete.useMutation({
    onSuccess: () => utils.expenses.list.invalidate(),
  });

  const totalRevenue = invoices.filter(i => i.status === "paid").reduce((s, i) => s + (parseFloat(i.amount as any) ?? 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + (parseFloat(e.amount as any) ?? 0), 0);
  const pendingAmount = invoices.filter(i => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + (parseFloat(i.amount as any) ?? 0), 0);

  const EXPENSE_CATEGORIES = ["Matériaux", "Sous-traitance", "Déplacements", "Logiciels", "Fournitures", "Formation", "Autre"];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Revenus encaissés</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-100 bg-green-100 rounded-lg p-1.5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Dépenses totales</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-100 bg-red-100 rounded-lg p-1.5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">En attente de paiement</p>
                <p className="text-xl font-bold text-orange-600">{formatCurrency(pendingAmount)}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-100 bg-orange-100 rounded-lg p-1.5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Factures</CardTitle>
            <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2"><Plus className="w-4 h-4" />Nouvelle facture</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Nouvelle facture</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Client <span className="text-destructive">*</span></Label>
                      <Select value={invoiceForm.clientId} onValueChange={v => setInvoiceForm(f => ({ ...f, clientId: v }))}>
                        <SelectTrigger><SelectValue placeholder="Client" /></SelectTrigger>
                        <SelectContent>
                          {clients?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Projet</Label>
                      <Select value={invoiceForm.projectId} onValueChange={v => setInvoiceForm(f => ({ ...f, projectId: v }))}>
                        <SelectTrigger><SelectValue placeholder="Projet" /></SelectTrigger>
                        <SelectContent>
                          {projects?.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>N° Facture <span className="text-destructive">*</span></Label>
                      <Input value={invoiceForm.number} onChange={e => setInvoiceForm(f => ({ ...f, number: e.target.value }))} placeholder="FAC-2024-001" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Montant (€) <span className="text-destructive">*</span></Label>
                      <Input type="number" value={invoiceForm.amount} onChange={e => setInvoiceForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Statut</Label>
                      <Select value={invoiceForm.status} onValueChange={v => setInvoiceForm(f => ({ ...f, status: v as any }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Brouillon</SelectItem>
                          <SelectItem value="sent">Envoyée</SelectItem>
                          <SelectItem value="paid">Payée</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Échéance</Label>
                      <Input type="date" value={invoiceForm.dueDate} onChange={e => setInvoiceForm(f => ({ ...f, dueDate: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Description</Label>
                    <Textarea value={invoiceForm.description} onChange={e => setInvoiceForm(f => ({ ...f, description: e.target.value }))} rows={2} />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setInvoiceOpen(false)}>Annuler</Button>
                    <Button
                      onClick={() => createInvoice.mutate({
                        clientId: parseInt(invoiceForm.clientId),
                        projectId: invoiceForm.projectId ? parseInt(invoiceForm.projectId) : undefined,
                        number: invoiceForm.number,
                        amount: parseFloat(invoiceForm.amount),
                        status: invoiceForm.status,
                        description: invoiceForm.description || undefined,
                        dueDate: invoiceForm.dueDate ? new Date(invoiceForm.dueDate) : undefined,
                      })}
                      disabled={!invoiceForm.clientId || !invoiceForm.number || !invoiceForm.amount || createInvoice.isPending}
                    >Créer</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Aucune facture</p>
          ) : (
            <div className="space-y-2">
              {invoices.map(invoice => {
                const client = clients.find(c => c.id === invoice.clientId);
                const project = projects.find(p => p.id === invoice.projectId);
                return (
                  <div key={invoice.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-medium">{invoice.number}</span>
                        <Badge className={`text-xs ${getInvoiceStatusColor(invoice.status)}`}>{INVOICE_STATUS_LABELS[invoice.status]}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        {client && <span>{client.name}</span>}
                        {project && <><span>•</span><span>{project.name}</span></>}
                        {invoice.dueDate && <><span>•</span><span>Échéance: {formatDate(invoice.dueDate)}</span></>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{formatCurrency(parseFloat(invoice.amount as any) ?? 0)}</span>
                      <Select value={invoice.status} onValueChange={v => updateInvoice.mutate({ id: invoice.id, status: v as any })}>
                        <SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Brouillon</SelectItem>
                          <SelectItem value="sent">Envoyée</SelectItem>
                          <SelectItem value="paid">Payée</SelectItem>
                          <SelectItem value="overdue">En retard</SelectItem>
                          <SelectItem value="cancelled">Annulée</SelectItem>
                        </SelectContent>
                      </Select>
                      <ContextMenu actions={[
                        CommonContextActions.view(() => {}),
                        CommonContextActions.delete(() => {
                          if (confirm(`Supprimer la facture ${invoice.number} ?`)) {
                            deleteInvoice.mutate({ id: invoice.id });
                          }
                        }),
                      ]} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expenses */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Dépenses</CardTitle>
            <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2"><Plus className="w-4 h-4" />Ajouter une dépense</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Nouvelle dépense</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Catégorie <span className="text-destructive">*</span></Label>
                      <Select value={expenseForm.category} onValueChange={v => setExpenseForm(f => ({ ...f, category: v }))}>
                        <SelectTrigger><SelectValue placeholder="Catégorie" /></SelectTrigger>
                        <SelectContent>
                          {EXPENSE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Projet</Label>
                      <Select value={expenseForm.projectId} onValueChange={v => setExpenseForm(f => ({ ...f, projectId: v }))}>
                        <SelectTrigger><SelectValue placeholder="Projet" /></SelectTrigger>
                        <SelectContent>
                          {projects?.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Description <span className="text-destructive">*</span></Label>
                    <Input value={expenseForm.description} onChange={e => setExpenseForm(f => ({ ...f, description: e.target.value }))} placeholder="Description de la dépense" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Montant (€) <span className="text-destructive">*</span></Label>
                      <Input type="number" value={expenseForm.amount} onChange={e => setExpenseForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Date</Label>
                      <Input type="date" value={expenseForm.date} onChange={e => setExpenseForm(f => ({ ...f, date: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setExpenseOpen(false)}>Annuler</Button>
                    <Button
                      onClick={() => createExpense.mutate({
                        projectId: expenseForm.projectId ? parseInt(expenseForm.projectId) : undefined,
                        category: expenseForm.category,
                        description: expenseForm.description,
                        amount: parseFloat(expenseForm.amount),
                        date: new Date(expenseForm.date),
                      })}
                      disabled={!expenseForm.category || !expenseForm.description || !expenseForm.amount || createExpense.isPending}
                    >Ajouter</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Aucune dépense enregistrée</p>
          ) : (
            <div className="space-y-2">
              {expenses.slice(0, 10).map(expense => {
                const project = projects.find(p => p.id === expense.projectId);
                return (
                  <div key={expense.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{expense.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <Badge variant="outline" className="text-xs">{expense.category}</Badge>
                        {project && <span>{project.name}</span>}
                        <span>{formatDate(expense.date)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-red-600">-{formatCurrency(parseFloat(expense.amount as any) ?? 0)}</span>
                      <ContextMenu actions={[
                        CommonContextActions.delete(() => {
                          if (confirm(`Supprimer la dépense "${expense.description}" ?`)) {
                            deleteExpense.mutate({ id: expense.id });
                          }
                        }),
                      ]} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// Main Cabinet Page
// ============================================================
export default function Cabinet() {
  const { data: teamData } = trpc.team.list.useQuery();
  const { data: tasksData } = trpc.tasks.list.useQuery();
  const { data: invoicesData } = trpc.invoices.list.useQuery();

  const team = Array.isArray(teamData) ? teamData : [];
  const tasks = Array.isArray(tasksData) ? tasksData : [];
  const invoices = Array.isArray(invoicesData) ? invoicesData : [];

  const pendingTasks = tasks.filter(t => t.status !== "done").length;
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done").length;
  const pendingInvoices = invoices.filter(i => i.status === "sent" || i.status === "overdue").length;

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cabinet</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Gestion de l'équipe, des tâches et des finances</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Membres équipe</p>
            <p className="text-2xl font-bold">{team?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Tâches en cours</p>
            <p className="text-2xl font-bold">{pendingTasks}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Tâches en retard</p>
            <p className={`text-2xl font-bold ${overdueTasks > 0 ? "text-red-600" : ""}`}>{overdueTasks}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Factures en attente</p>
            <p className={`text-2xl font-bold ${pendingInvoices > 0 ? "text-orange-600" : ""}`}>{pendingInvoices}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="tasks" className="gap-2">
            <CheckSquare className="w-3.5 h-3.5" />Tâches
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="w-3.5 h-3.5" />Équipe
          </TabsTrigger>
          <TabsTrigger value="finances" className="gap-2">
            <Euro className="w-3.5 h-3.5" />Finances
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4"><TasksTab /></TabsContent>
        <TabsContent value="team" className="mt-4"><TeamTab /></TabsContent>
        <TabsContent value="finances" className="mt-4"><FinancesTab /></TabsContent>
      </Tabs>
    </div>
  );
}
