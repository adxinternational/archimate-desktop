import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppLayout } from "@/components/AppLayout";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Download, Eye } from "lucide-react";

export function QuotesManagement() {
  const [, params] = useRoute("/projects/:id");
  const projectId = params?.id ? parseInt(params.id) : null;

  const { data: project, isLoading: projectLoading } = trpc.projects.byId.useQuery(
    { id: projectId! },
    { enabled: !!projectId }
  );

  const { data: quotes, isLoading: quotesLoading } = trpc.mvp.quotes.byProject.useQuery(
    { projectId: projectId! },
    { enabled: !!projectId }
  );

  const [showNewQuote, setShowNewQuote] = useState(false);
  const [lineItems, setLineItems] = useState<any[]>([]);

  if (!projectId) {
    return (
      <AppLayout>
        <div className="text-center text-muted-foreground">
          Projet non trouvé
        </div>
      </AppLayout>
    );
  }

  if (projectLoading || quotesLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Spinner />
        </div>
      </AppLayout>
    );
  }

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: `item-${Date.now()}`,
        category: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
        phase: "esq",
      },
    ]);
  };

  const updateLineItem = (index: number, field: string, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    
    // Recalculate total
    if (field === "quantity" || field === "unitPrice") {
      updated[index].total = updated[index].quantity * updated[index].unitPrice;
    }
    
    setLineItems(updated);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-between justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Devis & Estimatifs</h1>
            <p className="text-muted-foreground mt-2">
              Gestion des devis pour le projet {project?.name}
            </p>
          </div>
          <Button onClick={() => setShowNewQuote(!showNewQuote)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Devis
          </Button>
        </div>

        {/* Nouveau Devis */}
        {showNewQuote && (
          <Card>
            <CardHeader>
              <CardTitle>Créer un Nouveau Devis</CardTitle>
              <CardDescription>
                Structurez votre estimatif par lots et phases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Line Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Catégorie</th>
                      <th className="text-left py-2 px-2">Description</th>
                      <th className="text-right py-2 px-2">Quantité</th>
                      <th className="text-right py-2 px-2">Prix Unitaire</th>
                      <th className="text-right py-2 px-2">Total</th>
                      <th className="text-center py-2 px-2">Phase</th>
                      <th className="text-center py-2 px-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, index) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-2 px-2">
                          <Input
                            value={item.category}
                            onChange={(e) => updateLineItem(index, "category", e.target.value)}
                            placeholder="Ex: Gros œuvre"
                            className="text-xs"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <Input
                            value={item.description}
                            onChange={(e) => updateLineItem(index, "description", e.target.value)}
                            placeholder="Description"
                            className="text-xs"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(index, "quantity", parseFloat(e.target.value))}
                            className="text-xs"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateLineItem(index, "unitPrice", parseFloat(e.target.value))}
                            className="text-xs"
                          />
                        </td>
                        <td className="py-2 px-2 text-right font-medium">
                          {item.total.toLocaleString('fr-FR')}€
                        </td>
                        <td className="py-2 px-2 text-center">
                          <select
                            value={item.phase}
                            onChange={(e) => updateLineItem(index, "phase", e.target.value)}
                            className="text-xs border rounded px-2 py-1"
                          >
                            <option>esq</option>
                            <option>aps</option>
                            <option>apd</option>
                            <option>pro</option>
                            <option>dce</option>
                            <option>exe</option>
                          </select>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLineItem(index)}
                          >
                            ✕
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Button variant="outline" onClick={addLineItem} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une Ligne
              </Button>

              {/* Summary */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total du Devis</span>
                  <span className="text-2xl font-bold">
                    {totalAmount.toLocaleString('fr-FR')}€
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Générer PDF
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setShowNewQuote(false)}>
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Existing Quotes */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Devis Existants</h2>
          {quotes && Object.keys(quotes).length > 0 ? (
            Object.entries(quotes).map(([phase, items]: [string, any]) => (
              items.length > 0 && (
                <Card key={phase}>
                  <CardHeader>
                    <CardTitle className="text-lg">Phase: {phase.toUpperCase()}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {items.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-muted rounded">
                          <div>
                            <p className="font-medium">{item.description}</p>
                            <p className="text-sm text-muted-foreground">{item.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{parseFloat(item.estimatedAmount).toLocaleString('fr-FR')}€</p>
                            <p className="text-sm text-muted-foreground">{item.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">Aucun devis pour ce projet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
