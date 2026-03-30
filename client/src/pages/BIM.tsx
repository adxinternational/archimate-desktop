import { useState } from "react";
import { EnhancedLayout } from "@/components/EnhancedLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Upload, FileText, Eye, Download, Trash2, Plus, Clock, User } from "lucide-react";

interface BIMFile {
  id: string;
  name: string;
  type: "3D Model" | "Plan" | "Rendering" | "Document";
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  version: number;
  status: "active" | "archived";
}

const MOCK_BIM_FILES: BIMFile[] = [
  {
    id: "1",
    name: "Immeuble_Centre-Ville_v3.ifc",
    type: "3D Model",
    size: "245 MB",
    uploadedBy: "Jean Dupont",
    uploadedAt: "2026-03-28",
    version: 3,
    status: "active",
  },
  {
    id: "2",
    name: "Plan_RDC_v2.dwg",
    type: "Plan",
    size: "12 MB",
    uploadedBy: "Marie Martin",
    uploadedAt: "2026-03-25",
    version: 2,
    status: "active",
  },
  {
    id: "3",
    name: "Rendering_Facade_v1.png",
    type: "Rendering",
    size: "8.5 MB",
    uploadedBy: "Pierre Leclerc",
    uploadedAt: "2026-03-20",
    version: 1,
    status: "active",
  },
  {
    id: "4",
    name: "Specifications_Techniques.pdf",
    type: "Document",
    size: "3.2 MB",
    uploadedBy: "Sophie Bernard",
    uploadedAt: "2026-03-15",
    version: 1,
    status: "active",
  },
  {
    id: "5",
    name: "Plan_Etage_v1.dwg",
    type: "Plan",
    size: "15 MB",
    uploadedBy: "Thomas Rousseau",
    uploadedAt: "2026-03-10",
    version: 1,
    status: "archived",
  },
];

const TYPE_COLORS: Record<string, string> = {
  "3D Model": "bg-blue-100 text-blue-800",
  "Plan": "bg-purple-100 text-purple-800",
  "Rendering": "bg-green-100 text-green-800",
  "Document": "bg-orange-100 text-orange-800",
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  "3D Model": "🎯",
  "Plan": "📐",
  "Rendering": "🖼️",
  "Document": "📄",
};

export default function BIM() {
  const [files, setFiles] = useState<BIMFile[]>(MOCK_BIM_FILES);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || file.type === filterType;
    return matchesSearch && matchesType;
  });

  const activeFiles = files.filter((f) => f.status === "active").length;
  const totalSize = files.reduce((sum, f) => {
    const sizeNum = parseFloat(f.size);
    const multiplier = f.size.includes("MB") ? 1 : f.size.includes("GB") ? 1024 : 1;
    return sum + sizeNum * multiplier;
  }, 0);

  return (
    <EnhancedLayout title="Gestion BIM/Plans/3D">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Gérez vos fichiers BIM, plans CAO et modèles 3D avec versioning et annotations
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Upload className="mr-2 h-4 w-4" />
            Uploader Fichier
          </Button>
        </div>

        {/* Storage Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Fichiers Actifs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeFiles}</div>
              <p className="text-xs text-muted-foreground">fichiers en utilisation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Espace Utilisé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSize.toFixed(0)} MB</div>
              <p className="text-xs text-muted-foreground">sur 5 GB disponibles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Versions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{files.length}</div>
              <p className="text-xs text-muted-foreground">versions totales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Dernière Mise à Jour</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28/03</div>
              <p className="text-xs text-muted-foreground">2026</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Recherche et Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Rechercher par nom de fichier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="flex gap-2 flex-wrap">
                {["3D Model", "Plan", "Rendering", "Document"].map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType(filterType === type ? null : type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Files List */}
        <div className="space-y-3">
          {filteredFiles.length > 0 ? (
            filteredFiles.map((file) => (
              <Card key={file.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{TYPE_ICONS[file.type]}</span>
                        <div>
                          <h3 className="font-semibold text-foreground">{file.name}</h3>
                          <p className="text-xs text-muted-foreground">{file.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <Badge className={TYPE_COLORS[file.type]}>{file.type}</Badge>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" /> {file.uploadedBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {file.uploadedAt}
                        </span>
                        <span>v{file.version}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" title="Visualiser">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Télécharger">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Supprimer">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Aucun fichier ne correspond à votre recherche</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Version History */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des Versions</CardTitle>
            <CardDescription>Suivi des modifications et versions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.slice(0, 3).map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      v{file.version} • {file.uploadedBy} • {file.uploadedAt}
                    </p>
                  </div>
                  <Badge variant="outline">v{file.version}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Annotations */}
        <Card>
          <CardHeader>
            <CardTitle>Annotations Récentes</CardTitle>
            <CardDescription>Commentaires et annotations collaboratives</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border border-border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">Vérifier la structure</p>
                    <p className="text-sm text-muted-foreground">Jean Dupont</p>
                  </div>
                  <span className="text-xs text-muted-foreground">28/03/2026</span>
                </div>
                <p className="text-sm">À vérifier sur le modèle 3D : alignement des poutres étage 2</p>
              </div>
              <div className="p-3 border border-border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">Modifier les dimensions</p>
                    <p className="text-sm text-muted-foreground">Marie Martin</p>
                  </div>
                  <span className="text-xs text-muted-foreground">25/03/2026</span>
                </div>
                <p className="text-sm">Les dimensions du RDC doivent être augmentées de 2m</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </EnhancedLayout>
  );
}
