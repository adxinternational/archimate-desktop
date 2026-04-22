import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Trash2, Copy, Download, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  onClick: (selectedIds: string[]) => void;
}

interface BulkActionsProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: (selected: boolean) => void;
  onClearSelection: () => void;
  actions: BulkAction[];
  isLoading?: boolean;
}

export function BulkActionsBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  actions,
  isLoading = false,
}: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={selectedCount === totalCount ? true : selectedCount > 0 ? "indeterminate" : false}
            onCheckedChange={(checked) => onSelectAll(!!checked)}
            disabled={isLoading}
          />
          <span className="text-sm font-medium text-blue-900">
            {selectedCount} élément{selectedCount > 1 ? "s" : ""} sélectionné{selectedCount > 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSelection}
            disabled={isLoading}
          >
            Désélectionner
          </Button>

          {actions.length <= 3 ? (
            actions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant || "outline"}
                size="sm"
                onClick={() => action.onClick(Array.from({ length: selectedCount }, (_, i) => String(i)))}
                disabled={isLoading}
                className="gap-2"
              >
                {action.icon}
                {action.label}
              </Button>
            ))
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isLoading}>
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.map((action, idx) => (
                  <div key={action.id}>
                    {idx > 0 && action.variant === "destructive" && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      onClick={() => action.onClick(Array.from({ length: selectedCount }, (_, i) => String(i)))}
                      className={action.variant === "destructive" ? "text-red-600" : ""}
                    >
                      {action.icon && <span className="mr-2">{action.icon}</span>}
                      {action.label}
                    </DropdownMenuItem>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </Card>
  );
}

interface BulkSelectableRowProps {
  id: string;
  selected: boolean;
  onSelectionChange: (selected: boolean) => void;
  children: React.ReactNode;
}

export function BulkSelectableRow({
  id,
  selected,
  onSelectionChange,
  children,
}: BulkSelectableRowProps) {
  return (
    <div className={`flex items-center gap-3 ${selected ? "bg-blue-50" : ""}`}>
      <Checkbox
        checked={selected}
        onCheckedChange={onSelectionChange}
        className="flex-shrink-0"
      />
      <div className="flex-1">{children}</div>
    </div>
  );
}
