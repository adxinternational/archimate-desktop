import { EnhancedLayout } from "@/components/EnhancedLayout";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
export default function QuotesManagement() {
  return (
    <EnhancedLayout title="Devis">
      <Card className="p-10 text-center">
        <CardContent className="pt-4">
          <FileText size={40} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">Module devis en cours de développement.</p>
        </CardContent>
      </Card>
    </EnhancedLayout>
  );
}
