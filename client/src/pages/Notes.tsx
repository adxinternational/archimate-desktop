import { EnhancedLayout } from "@/components/EnhancedLayout";
import { Card, CardContent } from "@/components/ui/card";
import { StickyNote } from "lucide-react";
export default function Notes() {
  return (
    <EnhancedLayout title="Notes">
      <Card className="p-10 text-center">
        <CardContent className="pt-4">
          <StickyNote size={40} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">Module notes en cours de développement.</p>
        </CardContent>
      </Card>
    </EnhancedLayout>
  );
}
