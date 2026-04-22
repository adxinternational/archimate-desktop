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
    weather: "", workDescription: "", workers: "", notes: "",
  });

  // Meeting form
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    date: new Date().toISOString().split("T")[0],
    title: "", attendees: "", summary: "", decisions: "", nextActions: "",
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
        <Link href="/chantier"><Button variant="outline" className="mt-4">Retour</Button></Link>
      </div>
    );
  }

  const project = projects?.find(p => p.id === site.projectId);
  const openIncidents = incidents?.filter(i => i.status === "open").length ?? 0;

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Link href="/chantier">
            <Button variant="ghost" size="icon" className="h-8 w-8 mt-0.5"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{site.name}</h1>
              <Badge className={getSiteStatusColor(site.status)}>{SITE_STATUS_LABELS[site.status]}</Badge>
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              {project && <span>{project.name}</span>}
              {site.address && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{site.address}</span>}
              {openIncidents > 0 && (
                <span className="flex items-center gap-1 text-orange-600 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />{openIncidents} incident(s) ouvert(s)
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={site.status} onValueChange={v => updateSite.mutate({ id: siteId, status: v as any })}>
            <SelectTrigger className="w-36 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">Planification</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="paused">Pausé</SelectItem>
              <SelectItem value="completed">Terminé</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"
            onClick={() => { if (confirm("Supprimer ce chantier ?")) deleteSite.mutate({ id: siteId }); }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Avancement du chantier</span>
            <span className="text-sm font-bold text-primary">{site.progress ?? 0}%</span>
          </div>
          <Slider
            value={[site.progress ?? 0]}
            min={0} max={100} step={5}
            onValueCommit={([v]) => updateSite.mutate({ id: siteId, progress: v })}
            className="w-full"
          />
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>Début</span>
            <span>Terminé</span>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="journal">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="journal" className="gap-2">
            <BookOpen className="w-3.5 h-3.5" />Journal ({journal?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="meetings" className="gap-2">
            <Users className="w-3.5 h-3.5" />Réunions ({meetings?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="incidents" className="gap-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            Incidents
            {openIncidents > 0 && (
              <span className="ml-1 w-4 h-4 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center">
                {openIncidents}
              </span>
            )}
          </TabsTrigger>
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
                          <Select value={journalForm.weather} onValueChange={v => setJournalForm(f => ({ ...f, weather: v }))}>
                            <SelectTrigger><SelectValue placeholder="Météo" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Ensoleillé">☀️ Ensoleillé</SelectItem>
                              <SelectItem value="Nuageux">⛅ Nuageux</SelectItem>
                              <SelectItem value="Pluvieux">🌧️ Pluvieux</SelectItem>
                              <SelectItem value="Venteux">💨 Venteux</SelectItem>
                              <SelectItem value="Neige">❄️ Neige</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Travaux effectués <span className="text-destructive">*</span></Label>
                        <Textarea
                          value={journalForm.workDescription}
                          onChange={e => setJournalForm(f => ({ ...f, workDescription: e.target.value }))}
                          placeholder="Description des travaux effectués..."
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label>Nombre d'ouvriers</Label>
                          <Input type="number" value={journalForm.workers} onChange={e => setJournalForm(f => ({ ...f, workers: e.target.value }))} placeholder="0" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Notes</Label>
                        <Textarea value={journalForm.notes} onChange={e => setJournalForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setJournalOpen(false)}>Annuler</Button>
                        <Button
                          onClick={() => addJournal.mutate({
                            siteId,
                            date: new Date(journalForm.date),
                            weather: journalForm.weather || undefined,
                            workDescription: journalForm.workDescription,
                            workers: journalForm.workers ? parseInt(journalForm.workers) : undefined,
                            notes: journalForm.notes || undefined,
                          })}
                          disabled={!journalForm.workDescription || addJournal.isPending}
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
                  {journal.map(entry => (
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
                              {entry.workers && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <HardHat className="w-3 h-3" />{entry.workers} ouvriers
                                </span>
                              )}
                            </div>
                            <p className="text-sm mt-1">{entry.workDescription}</p>
                            {entry.notes && <p className="text-xs text-muted-foreground mt-1">{entry.notes}</p>}
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
                        <Label>Résumé</Label>
                        <Textarea value={meetingForm.summary} onChange={e => setMeetingForm(f => ({ ...f, summary: e.target.value }))} rows={3} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Décisions prises (une par ligne)</Label>
                        <Textarea value={meetingForm.decisions} onChange={e => setMeetingForm(f => ({ ...f, decisions: e.target.value }))} rows={2} placeholder="Décision 1&#10;Décision 2" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Actions suivantes (une par ligne)</Label>
                        <Textarea value={meetingForm.nextActions} onChange={e => setMeetingForm(f => ({ ...f, nextActions: e.target.value }))} rows={2} />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setMeetingOpen(false)}>Annuler</Button>
                        <Button
                          onClick={() => addMeeting.mutate({
                            siteId,
                            date: new Date(meetingForm.date),
                            title: meetingForm.title,
                            attendees: meetingForm.attendees ? meetingForm.attendees.split(",").map(s => s.trim()) : [],
                            summary: meetingForm.summary || undefined,
                            decisions: meetingForm.decisions ? meetingForm.decisions.split("\n").filter(Boolean) : [],
                            nextActions: meetingForm.nextActions ? meetingForm.nextActions.split("\n").filter(Boolean).map(a => ({ action: a, responsible: "", dueDate: undefined })) : [],
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
                  {meetings.map(meeting => {
                    const attendees = Array.isArray(meeting.attendees) ? meeting.attendees : [];
                    const decisions = Array.isArray(meeting.decisions) ? meeting.decisions : [];
                    const nextActions = Array.isArray(meeting.nextActions) ? meeting.nextActions : [];
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
                            {meeting.summary && <p className="text-sm mt-2 text-muted-foreground">{meeting.summary}</p>}
                            {decisions.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-foreground mb-1">Décisions :</p>
                                {decisions.map((d: string, i: number) => (
                                  <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                    <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{d}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {nextActions.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-foreground mb-1">Actions :</p>
                                {nextActions.map((a: any, i: number) => (
                                  <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <span>{a.action || a}</span>
                                  </div>
                                ))}
                              </div>
                            )}
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
                  {incidents.map(incident => (
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
                          {incident.resolution && <p className="text-xs text-green-600 mt-1">✓ {incident.resolution}</p>}
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
