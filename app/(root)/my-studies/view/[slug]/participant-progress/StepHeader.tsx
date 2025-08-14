import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

function StepHeader({ order, name, noteResearcher, noteParticipant, deadline }:{
  order: number; name: string; noteResearcher: string | null; noteParticipant: string | null; deadline: string | null;
}) {
  const isOverdue = deadline ? new Date(deadline) < new Date() : false;
  return (
    <div className="flex items-center justify-center gap-1">
      <span>{order}. {name}</span>
      {(noteResearcher || noteParticipant || deadline) && (
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
            {noteResearcher && (
              <div className="mb-2">
                <div className="font-medium mb-1">Researcher note</div>
                <p className="text-muted-foreground whitespace-pre-wrap">{noteResearcher}</p>
              </div>
            )}
            {noteParticipant && (
              <div>
                <div className="font-medium mb-1">Participant note</div>
                <p className="text-muted-foreground whitespace-pre-wrap">{noteParticipant}</p>
              </div>
            )}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

export default StepHeader