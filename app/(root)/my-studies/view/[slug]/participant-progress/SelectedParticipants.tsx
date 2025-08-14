import { listSelectedWithWorkflow } from "@/lib/actions/participation.actions";
import SelectedTableClient from "./SelectedTableClient";

export default async function SelectedParticipants({ slug }: { slug: string }) {
  const { steps, rows } = await listSelectedWithWorkflow(slug);
  return <SelectedTableClient steps={steps} rows={rows} />;
}






// import { Button } from "@/components/ui/button";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { listSelectedWithWorkflow, setParticipantStepStatus, } from "@/lib/actions/participation.actions";
// import { useRouter } from "next/navigation";
// import { useState, useTransition } from "react";
// import StepHeader from "./SelectedComponent";

// const SelectedParticipants = async ({slug} : {slug: string}) => {
    
//     const { steps, rows } = await listSelectedWithWorkflow(slug);

//      const router = useRouter();
//     const [isPending, start] = useTransition();
//     const [busyKey, setBusyKey] = useState<string | null>(null); // "participationId:stepId"

//     const toggle = (pId: string, stepId: string, curr: "todo" | "completed") => {
//         const next = curr === "completed" ? "todo" : "completed";
//         const key = `${pId}:${stepId}`;
//         setBusyKey(key);
//         start(async () => {
//         await setParticipantStepStatus({ participationId: pId, stepId, status: next });
//         router.refresh(); // 簡單可靠：重撈最新狀態
//         setBusyKey(null);
//         });
//     };

//     return (
//        <div className="my-8">

//             <Table>
//                 {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
//                 <TableHeader>
//                     <TableRow>
//                         <TableHead className="min-w-[200px]">Participant</TableHead>
//                         {steps.map(s => (
//                             <TableHead key={s.id} className="text-center">
//                                 <StepHeader
//                                 name={s.name}
//                                 noteResearcher={s.noteResearcher}
//                                 noteParticipant={s.noteParticipant}
//                                 deadline={s.deadline}
//                                 />
//                             </TableHead>
//                         ))}
//                         <TableHead className="text-center">Thank you</TableHead>
//                     </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                     {rows.map((r) => (
//                     <TableRow key={r.participationId}>
//                         <TableCell className="font-medium">
//                             {r.user.name}
//                         </TableCell>
//                         {r.statuses.map(st => {
//                             const key = `${r.participationId}:${st.stepId}`;
//                             const checked = st.status === "completed";
//                             const loading = isPending && busyKey === key;
//                             return (
//                             <TableCell key={st.stepId} className="text-center">
//                                 <Button
//                                 variant={checked ? "default" : "secondary"}
//                                 size="sm"
//                                 disabled={loading}
//                                 onClick={() => toggle(r.participationId, st.stepId, st.status)}
//                                 >
//                                 {loading ? "..." : (checked ? "✓" : "—")}
//                                 </Button>
//                             </TableCell>
//                             );
//                         })}
//                         <TableCell className="text-center">
//                             {/* 送出感謝卡（你已有 ThankYouCertificate 模型，可在這裡呼叫 create 的 action） */}
//                             <Button size="sm" variant="outline">Send</Button>
//                         </TableCell>
                      
//                     </TableRow>
//                     ))}
//                 </TableBody>
//             </Table>
//         </div>
//     );
// }
 
// export default SelectedParticipants;
