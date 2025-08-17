import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

function StudyStepHeader({ order, name, note, deadline }:{
  order: number; name: string; note: string | null; deadline: string | null;
}) {
  const isOverdue = deadline ? new Date(deadline) < new Date() : false;
  return (
    <div className="flex items-center justify-center gap-1">
      <span>{order}. {name}</span>
      {(note || deadline) && (
        <Popover>
          <PopoverTrigger className="inline-flex">
            <Info className="h-4 w-4 opacity-70" />
          </PopoverTrigger>
          <PopoverContent className="w-80 text-sm">
            {deadline && (
              <div className="mb-2">
                <div className="font-medium mb-1">Deadline</div>
                <Badge variant={isOverdue ? "destructive" : "secondary"}>
                  {format(new Date(deadline), "PPP")}
                </Badge>
              </div>
            )}
            {note && (
              <div className="mb-2">
                <div className="font-medium mb-1">Note</div>
                <p className="text-muted-foreground whitespace-pre-wrap">{note}</p>
              </div>
            )}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

export default StudyStepHeader