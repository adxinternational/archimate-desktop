import { useState, useCallback } from "react";

interface UseMultiSelectOptions {
  initialSelected?: string[];
}

export function useMultiSelect(options?: UseMultiSelectOptions) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(options?.initialSelected || [])
  );

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelected(new Set(ids));
  }, []);

  const deselectAll = useCallback(() => {
    setSelected(new Set());
  }, []);

  const isSelected = useCallback(
    (id: string) => selected.has(id),
    [selected]
  );

  const getSelectedIds = useCallback(() => Array.from(selected), [selected]);

  const getSelectedCount = useCallback(() => selected.size, [selected]);

  return {
    selected,
    toggleSelect,
    selectAll,
    deselectAll,
    isSelected,
    getSelectedIds,
    getSelectedCount,
  };
}
