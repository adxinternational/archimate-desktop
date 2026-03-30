import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface GanttTask {
  id: number;
  title: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  assignedTo?: string;
  dependencies?: number[];
}

interface GanttChartProps {
  tasks: GanttTask[];
  onTaskUpdate?: (taskId: number, updates: Partial<GanttTask>) => void;
}

export function GanttChart({ tasks, onTaskUpdate }: GanttChartProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());
  const [selectedTask, setSelectedTask] = useState<number | null>(null);

  // Calculate date range
  const dateRange = useMemo(() => {
    if (tasks.length === 0) return { start: new Date(), end: new Date() };
    const dates = tasks.flatMap((t) => [t.startDate, t.endDate]);
    return {
      start: new Date(Math.min(...dates.map((d) => d.getTime()))),
      end: new Date(Math.max(...dates.map((d) => d.getTime()))),
    };
  }, [tasks]);

  // Generate month headers
  const months = useMemo(() => {
    const result = [];
    const current = new Date(dateRange.start);
    while (current <= dateRange.end) {
      result.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }
    return result;
  }, [dateRange]);

  // Calculate pixel position for date
  const getDatePosition = (date: Date): number => {
    const totalDays = Math.ceil(
      (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysSinceStart = Math.ceil(
      (date.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)
    );
    return (daysSinceStart / totalDays) * 100;
  };

  // Calculate bar width for task
  const getTaskBarWidth = (task: GanttTask): number => {
    const startPos = getDatePosition(task.startDate);
    const endPos = getDatePosition(task.endDate);
    return Math.max(endPos - startPos, 2);
  };

  const toggleTaskExpand = (taskId: number) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  return (
    <Card className="w-full overflow-hidden">
      <div className="overflow-x-auto">
        <div className="flex">
          {/* Left Panel - Task List */}
          <div className="w-64 border-r border-border bg-accent/30 flex-shrink-0">
            <div className="sticky top-0 bg-background border-b border-border p-3 font-semibold text-sm">
              Tâches
            </div>
            <div className="space-y-1 p-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-2 rounded cursor-pointer text-sm transition-colors ${
                    selectedTask === task.id
                      ? "bg-blue-100 text-blue-900"
                      : "hover:bg-accent"
                  }`}
                  onClick={() => setSelectedTask(task.id)}
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="truncate flex-1">{task.title}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      {task.progress}%
                    </span>
                  </div>
                  {task.assignedTo && (
                    <p className="text-xs text-muted-foreground mt-1 ml-5">
                      {task.assignedTo}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Timeline */}
          <div className="flex-1 min-w-0">
            {/* Month Headers */}
            <div className="sticky top-0 bg-background border-b border-border flex">
              {months.map((month, idx) => (
                <div
                  key={idx}
                  className="flex-1 min-w-32 border-r border-border p-2 text-xs font-semibold text-center"
                >
                  {month.toLocaleDateString("fr-FR", {
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              ))}
            </div>

            {/* Task Rows */}
            <div className="space-y-0">
              {tasks.map((task) => {
                const startPos = getDatePosition(task.startDate);
                const barWidth = getTaskBarWidth(task);

                return (
                  <div
                    key={task.id}
                    className={`flex h-12 border-b border-border transition-colors ${
                      selectedTask === task.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex-1 relative p-1">
                      {/* Task Bar */}
                      <div
                        className="absolute top-2 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded shadow-sm cursor-move hover:shadow-md transition-shadow group"
                        style={{
                          left: `${startPos}%`,
                          width: `${barWidth}%`,
                          minWidth: "40px",
                        }}
                      >
                        {/* Progress Fill */}
                        <div
                          className="h-full bg-blue-700 rounded opacity-70 transition-all"
                          style={{ width: `${task.progress}%` }}
                        />

                        {/* Label */}
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          {task.progress}%
                        </div>
                      </div>

                      {/* Tooltip on Hover */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        {task.startDate.toLocaleDateString("fr-FR")} -{" "}
                        {task.endDate.toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-border p-3 bg-accent/20 text-xs text-muted-foreground">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded" />
            <span>Progression réelle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-400 rounded" />
            <span>Durée totale</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
