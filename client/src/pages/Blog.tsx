import { EnhancedLayout } from "@/components/EnhancedLayout";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
export default function Blog() {
  return (
    <EnhancedLayout title="Blog">
      <Card className="p-10 text-center">
        <CardContent className="pt-4">
          <BookOpen size={40} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">Module blog en cours de développement.</p>
        </CardContent>
      </Card>
    </EnhancedLayout>
  );
}
