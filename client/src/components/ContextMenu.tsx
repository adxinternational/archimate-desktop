import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit2, Trash2, Copy, Eye } from "lucide-react";

export interface ContextMenuAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive";
  divider?: boolean;
}

interface ContextMenuProps {
  actions: ContextMenuAction[];
  triggerIcon?: React.ReactNode;
  triggerLabel?: string;
}

export function ContextMenu({
  actions,
  triggerIcon = <MoreHorizontal size={16} />,
  triggerLabel,
}: ContextMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          {triggerIcon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action, idx) => (
          <div key={action.id}>
            {action.divider && idx > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={action.onClick}
              className={action.variant === "destructive" ? "text-red-600 focus:text-red-600" : ""}
            >
              {action.icon && <span className="mr-2 h-4 w-4">{action.icon}</span>}
              {action.label}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Prédéfinis d'actions contextuelles communes
 */
export const CommonContextActions = {
  edit: (onClick: () => void): ContextMenuAction => ({
    id: "edit",
    label: "Éditer",
    icon: <Edit2 size={16} />,
    onClick,
  }),
  view: (onClick: () => void): ContextMenuAction => ({
    id: "view",
    label: "Voir",
    icon: <Eye size={16} />,
    onClick,
  }),
  copy: (onClick: () => void): ContextMenuAction => ({
    id: "copy",
    label: "Copier",
    icon: <Copy size={16} />,
    onClick,
  }),
  delete: (onClick: () => void): ContextMenuAction => ({
    id: "delete",
    label: "Supprimer",
    icon: <Trash2 size={16} />,
    onClick,
    variant: "destructive",
    divider: true,
  }),
};
