import { TeamMember } from "@/lib/api";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Users, CheckSquare, Square } from "lucide-react";

interface TeamMemberSelectProps {
  members: TeamMember[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
}

export function TeamMemberSelect({ members, selectedIds, onSelectionChange }: TeamMemberSelectProps) {
  const allSelected = members.length > 0 && selectedIds.length === members.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < members.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(members.map((m) => m.id));
    }
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const toggleMember = (id: number) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Users className="w-10 h-10 mb-2 opacity-50" />
        <p className="text-sm">No team members found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {selectedIds.length} of {members.length} selected
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="text-xs"
          >
            <CheckSquare className="w-3.5 h-3.5 mr-1" />
            {allSelected ? "Deselect All" : "Select All"}
          </Button>
          {selectedIds.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-xs"
            >
              <Square className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-2 max-h-64 overflow-y-auto pr-1">
        {members.map((member) => {
          const isSelected = selectedIds.includes(member.id);
          return (
            <label
              key={member.id}
              className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "bg-wine/5 border-wine/30"
                  : "bg-cream-light border-border/50 hover:border-border"
              }`}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleMember(member.id)}
                className="border-wine/30 data-[state=checked]:bg-wine data-[state=checked]:border-wine"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-foreground truncate">
                    {member.name}
                  </span>
                  <span className="text-xs text-muted-foreground">@{member.username}</span>
                </div>
                <span className="text-xs text-muted-foreground truncate block">
                  {member.email}
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
