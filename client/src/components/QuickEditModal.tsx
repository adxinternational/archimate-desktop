import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export interface QuickEditField {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "email" | "number" | "date";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

interface QuickEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fields: QuickEditField[];
  initialValues: Record<string, any>;
  onSave: (values: Record<string, any>) => Promise<void>;
  isLoading?: boolean;
}

export function QuickEditModal({
  open,
  onOpenChange,
  title,
  fields,
  initialValues,
  onSave,
  isLoading = false,
}: QuickEditModalProps) {
  const [values, setValues] = useState(initialValues);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(values);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>

              {field.type === "textarea" ? (
                <Textarea
                  id={field.name}
                  placeholder={field.placeholder}
                  value={values[field.name] || ""}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  disabled={isSaving || isLoading}
                  rows={3}
                />
              ) : field.type === "select" ? (
                <Select
                  value={values[field.name] || ""}
                  onValueChange={(value) => handleFieldChange(field.name, value)}
                  disabled={isSaving || isLoading}
                >
                  <SelectTrigger id={field.name}>
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={values[field.name] || ""}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  disabled={isSaving || isLoading}
                />
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving || isLoading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
