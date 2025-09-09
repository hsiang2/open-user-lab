import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Image from "next/image";

const WorkflowParticipant = (
    {order, name, done, noteParticipant, deadline} : {
    order: number; name: string; done: boolean; noteParticipant?: string | null; deadline?: string | null;
}) => {
    const isOverdue = deadline ? new Date(deadline) < new Date() : false;
    return (  
        <div className="flex justify-between items-center w-full md:w-[500px]">
            <div className="flex gap-5 items-center">
                <h1 className="text-title ">{order}.</h1>
                <div className="space-y-4 w-[300px]">
                    <h2 className="text-subtitle wrap-break-word">{name}</h2>
                    {noteParticipant && (
                        <p className="text-body">{noteParticipant}</p>
                    )}  
                        {deadline && (
                        <Badge variant={isOverdue ? "destructive" : "secondary"}>
                        {format(new Date(deadline), "PPP")}
                        </Badge>
                    )}  
                </div>
            </div>
            <div
                className='flex flex-center w-[60px] h-[60px] rounded-full border-[3px] mr-2 border-[#4A877E]'
            >
                <Image
                    src="/images/study/stamp.png" alt="stamp" width={50} height={50} 
                    className={cn("rounded-full object-cover object-center", 
                        done ? "opacity-100" : "opacity-10"
                    )}
                />
            </div>
        </div>
    );
}
 
export default WorkflowParticipant;