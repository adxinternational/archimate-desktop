import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
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
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  ArrowLeft, Trash2, Plus, BookOpen, Users, AlertTriangle,
  MapPin, Calendar, Cloud, HardHat, CheckCircle2, Clock, AlertCircle
} from "lucide-react";
import { formatDate, getSiteStatusColor, SITE_STATUS_LABELS, getIncidentSeverityColor, INCIDENT_SEVERITY_LABELS } from "@/lib/constants";

export default function SiteDetail() {
  const [, params] = useRoute("/chantier/:id");
  const [, navigate] = useLocation();
  const siteId = parseInt((params as any)?.id ?? "0");
  const utils = trpc.useUtils();

  const { data: site, isLoading } = trpc.sites.byId.useQuery({ id: siteId });
  const { data: journal } = trpc.sites.journal.useQuery({ siteId });
  const { data: meetings } = trpc.sites.meetings.useQuery({ siteId });
  const { data: incidents } = trpc.sites.incidents.useQuery({ siteId });
  const { data: projects } = trpc.projects.list.useQuery();

  // Journal form
  const [journalOpen, setJournalOpen] = useState(false);
  const [journalForm, setJournalForm] = useState({
    date: new Date().toISOString().split("T")[0],
    weather: "", content: "", author: "",
  });

  // Meeting form
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    date: new Date().toISOString().split("T")[0],
    title: "", attendees: "", content: "",
  });

  // Incident form
  const [incidentOpen, setIncidentOpen] = useState(false);
  const [incidentForm, setIncidentForm] = useState({
    title: "", description: "", severity: "medium" as const,
    date: new Date().toISOString().split("T")[0],
  });

  const updateSite = trpc.sites.update.useMutation({
    onSuccess: () => { utils.sites.byId.invalidate(); toast.success("Chantier mis à jour"); },
  });

  const deleteSite = trpc.sites.delete.useMutation({
    onSuccess: () => { utils.sites.list.invalidate(); navigate("/chantier"); toast.success("Chantier supprimé"); },
  });

  const addJournal = trpc.sites.addJournalEntry.useMutation({
    onSuccess: () => { utils.sites.journal.invalidate(); setJournalOpen(false); toast.success("Entrée ajoutée"); },
  });

  const deleteJournal = trpc.sites.deleteJournalEntry.useMutation({
    onSuccess: () => utils.sites.journal.invalidate(),
  });

  const addMeeting = trpc.sites.addMeeting.useMutation({
    onSuccess: () => { utils.sites.meetings.invalidate(); setMeetingOpen(false); toast.success("Réunion ajoutée"); },
  });

  const deleteMeeting = trpc.sites.deleteMeeting.useMutation({
    onSuccess: () => utils.sites.meetings.invalidate(),
  });

  const addIncident = trpc.sites.addIncident.useMutation({
    onSuccess: () => { utils.sites.incidents.invalidate(); setIncidentOpen(false); toast.success("Incident signalé"); },
  });

  const updateIncident = trpc.sites.updateIncident.useMutation({
    onSuccess: () => utils.sites.incidents.invalidate(),
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Chantier introuvable</p>
        <Button variant="link" asChild><Link href="/chantier">Retour aux chantiers</Link></Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild><Link href="/chantier"><ArrowLeft className="w-5 h-5" /></Link></Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{site.name}</h1>
            <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <MapPin className="w-3.5 h-3.5" /> {site.address || "Adresse non renseignée"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getSiteStatusColor(site.status)}>
            {SITE_STATUS_LABELS[site.status]}
          </Badge>
          <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10"
            onClick={() => { if (confirm("Supprimer ce chantier ?")) deleteSite.mutate({ id: site.id }); }}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-0 shadow-sm">
          <CardHeader><CardTitle className="text-lg">Informations Générales</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Projet associé</Label>
                <p className="text-sm font-medium">
                  {projects?.find(p => p.id === site.projectId)?.name || "Chargement..."}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Dates</Label>
                <p className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  {formatDate(site.startDate)} — {formatDate(site.endDate)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-lg">Actions Rapides</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setJournalOpen(true)}>
              <BookOpen className="w-4 h-4" /> Ajouter au journal
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setMeetingOpen(true)}>
              <Users className="w-4 h-4" /> Nouveau compte-rendu
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 text-destructive hover:text-destructive" onClick={() => setIncidentOpen(true)}>
              <AlertTriangle className="w-4 h-4" /> Signaler un incident
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="journal" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="meetings">Réunions</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
        </TabsList>

        {/* Journal Tab */}
        <TabsContent value="journal" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Journal de chantier</CardTitle>
                <Dialog open={journalOpen} onOpenChange={setJournalOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2"><Plus className="w-4 h-4" />Nouvelle entrée</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Nouvelle entrée de journal</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label>Date</Label>
                          <Input type="date" value={journalForm.date} onChange={e => setJournalForm(f => ({ ...f, date: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Météo</Label>
                          <Input value={journalForm.weather} onChange={e => setJournalForm(f => ({ ...f, weather: e.target.value }))} placeholder="Ex: Ensoleillé" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Contenu <span className="text-destructive">*</span></Label>
                        <Textarea
                          value={journalForm.content}
                          onChange={e => setJournalForm(f => ({ ...f, content: e.target.value }))}
                          placeholder="Description des travaux effectués..."
                          rows={5}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Auteur</Label>
                        <Input value={journalForm.author} onChange={e => setJournalForm(f => ({ ...f, author: e.target.value }))} placeholder="Nom de l'auteur" />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setJournalOpen(false)}>Annuler</Button>
                        <Button
                          onClick={() => addJournal.mutate({
                            siteId,
                            date: new Date(journalForm.date),
                            weather: journalForm.weather || undefined,
                            workDescription: journalForm.content,
                          })}
                          disabled={!journalForm.content || addJournal.isPending}
                        >Ajouter</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {!journal || journal.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Aucune entrée dans le journal</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {journal.map((entry: any) => (
                    <div key={entry.id} className="p-4 rounded-lg border border-border">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <div className="text-lg font-bold text-primary">{new Date(entry.date).getDate()}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(entry.date).toLocaleDateString("fr-FR", { month: "short" })}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              {entry.weather && <span className="text-sm">{entry.weather}</span>}
                            </div>
                            <p className="text-sm mt-1 whitespace-pre-wrap">{entry.workDescription}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                          onClick={() => deleteJournal.mutate({ id: entry.id })}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Meetings Tab */}
        <TabsContent value="meetings" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Comptes rendus de réunion</CardTitle>
                <Dialog open={meetingOpen} onOpenChange={setMeetingOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2"><Plus className="w-4 h-4" />Nouvelle réunion</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Compte rendu de réunion</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label>Date</Label>
                          <Input type="date" value={meetingForm.date} onChange={e => setMeetingForm(f => ({ ...f, date: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Titre <span className="text-destructive">*</span></Label>
                          <Input value={meetingForm.title} onChange={e => setMeetingForm(f => ({ ...f, title: e.target.value }))} placeholder="Réunion de chantier" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Participants (séparés par virgule)</Label>
                        <Input value={meetingForm.attendees} onChange={e => setMeetingForm(f => ({ ...f, attendees: e.target.value }))} placeholder="Jean Dupont, Marie Martin..." />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Contenu</Label>
                        <Textarea value={meetingForm.content} onChange={e => setMeetingForm(f => ({ ...f, content: e.target.value }))} rows={5} />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setMeetingOpen(false)}>Annuler</Button>
                        <Button
                          onClick={() => addMeeting.mutate({
                            siteId,
                            date: new Date(meetingForm.date),
                            title: meetingForm.title,
                            attendees: meetingForm.attendees ? meetingForm.attendees.split(",").map(s => s.trim()) : [],
                            summary: meetingForm.content || undefined,
                          })}
                          disabled={!meetingForm.title || addMeeting.isPending}
                        >Ajouter</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {!meetings || meetings.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Aucune réunion enregistrée</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {meetings.map((meeting: any) => {
                    const attendees = Array.isArray(meeting.attendees) ? meeting.attendees : [];
                    return (
                      <div key={meeting.id} className="p-4 rounded-lg border border-border">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{meeting.title}</p>
                              <span className="text-xs text-muted-foreground">{formatDate(meeting.date)}</span>
                            </div>
                            {attendees.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Participants : {attendees.join(", ")}
                              </p>
                            )}
                            {meeting.summary && <p className="text-sm mt-2 text-muted-foreground whitespace-pre-wrap">{meeting.summary}</p>}
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                            onClick={() => deleteMeeting.mutate({ id: meeting.id })}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Incidents & Signalements</CardTitle>
                <Dialog open={incidentOpen} onOpenChange={setIncidentOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="destructive" className="gap-2"><Plus className="w-4 h-4" />Signaler</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Signaler un incident</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div className="space-y-1.5">
                        <Label>Titre <span className="text-destructive">*</span></Label>
                        <Input value={incidentForm.title} onChange={e => setIncidentForm(f => ({ ...f, title: e.target.value }))} placeholder="Description courte de l'incident" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label>Gravité</Label>
                          <Select value={incidentForm.severity} onValueChange={v => setIncidentForm(f => ({ ...f, severity: v as any }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Faible</SelectItem>
                              <SelectItem value="medium">Moyen</SelectItem>
                              <SelectItem value="high">Élevé</SelectItem>
                              <SelectItem value="critical">Critique</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label>Date</Label>
                          <Input type="date" value={incidentForm.date} onChange={e => setIncidentForm(f => ({ ...f, date: e.target.value }))} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Description</Label>
                        <Textarea value={incidentForm.description} onChange={e => setIncidentForm(f => ({ ...f, description: e.target.value }))} rows={3} />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setIncidentOpen(false)}>Annuler</Button>
                        <Button
                          onClick={() => addIncident.mutate({
                            siteId,
                            title: incidentForm.title,
                            description: incidentForm.description || undefined,
                            severity: incidentForm.severity,
                            date: new Date(incidentForm.date),
                          })}
                          disabled={!incidentForm.title || addIncident.isPending}
                        >Signaler</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {!incidents || incidents.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Aucun incident signalé</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {incidents.map((incident: any) => (
                    <div key={incident.id} className={`p-4 rounded-lg border ${
                      incident.status === "resolved" ? "border-border opacity-60" : "border-orange-200 bg-orange-50/50"
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm">{incident.title}</p>
                            <Badge className={`text-xs ${getIncidentSeverityColor(incident.severity)}`}>
                              {INCIDENT_SEVERITY_LABELS[incident.severity]}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{formatDate(incident.date)}</span>
                          </div>
                          {incident.description && <p className="text-sm text-muted-foreground mt-1">{incident.description}</p>}
                          {incident.resolvedDate && <p className="text-xs text-green-600 mt-1">✓ Résolu le {formatDate(incident.resolvedDate)}</p>}
                        </div>
                        <Select
                          value={incident.status}
                          onValueChange={v => updateIncident.mutate({ id: incident.id, status: v as any })}
                        >
                          <SelectTrigger className={`w-32 h-7 text-xs flex-shrink-0 ml-2 ${
                            incident.status === "open" ? "border-orange-300 text-orange-700" :
                            incident.status === "resolved" ? "border-green-300 text-green-700" :
                            "border-blue-300 text-blue-700"
                          }`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Ouvert</SelectItem>
                            <SelectItem value="in_progress">En cours</SelectItem>
                            <SelectItem value="resolved">Résolu</SelectItem>
                            <SelectItem value="closed">Fermé</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
