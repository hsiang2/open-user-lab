
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listAppliedParticipants, } from "@/lib/actions/participation.actions";
import Link from "next/link";
import RowActions from "./RowAction";
import { Check, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CriteriaList } from "../potential-participants/PotentialParticipantsCard"
import { ManualDecision } from "@prisma/client";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ManualReviewDialog from "./ManualReviewDialog";


const AppliedParticipants = async ({slug} : {slug: string}) => {
    
    const participation = await listAppliedParticipants(slug)

    return (
       <div className="my-8">
            <Table >
                {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Criteria Match</TableHead>
                        <TableHead>Manual Questions</TableHead>
                        <TableHead>Scored Questions</TableHead>
                        <TableHead>Unscored Questions</TableHead>
                        {/* <TableHead>Submitted At</TableHead> */}
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {participation.map((p) => (
                    <TableRow key={p.id}>
                        <TableCell className="font-medium max-w-40 truncate">
                              {p.user.name}
                            <Button asChild size="sm" variant="outline" className="ml-2">
                                <Link href={`/profile/view/${p.user.id}`} >
                                Profile
                                 </Link>
                            </Button>
                        </TableCell>

                        {/* Criteria match */}
                        <TableCell>
                            <div className="flex gap-3 items-center">
                                <div className="flex">
                                    <Check size={16} /> 
                                    <p className="text-body">{p.criteria.requiredMatched.length + p.criteria.optionalMatched.length}</p>
                                </div>
                                <div className="flex">
                                    <X  size={16} className="text-destructive"/> 
                                    <p className="text-body text-destructive">{p.criteria.requiredMismatches.length + p.criteria.optionalMismatches.length}</p>
                                </div>
                                <div className="flex gap-1">
                                    <p className="text-body text-muted-foreground">?</p>
                                    <p className="text-body text-muted-foreground">{p.criteria.missingRequired.length + p.criteria.missingOptional.length}</p>
                                </div>

                                <Dialog>
                                    <DialogTrigger  asChild>
                                         <Button size="sm" variant="outline" >
                                            View
                                         </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                        <DialogTitle>Criteria Match</DialogTitle>
                                       
                                        </DialogHeader>
                                        <div className="mb-10 space-y-4 w-full px-3">
                                            <CriteriaList label="Required" matched={p.criteria.requiredMatched}  mismatched={p.criteria.requiredMismatches} missing={p.criteria.missingRequired}  />
                                            <CriteriaList label="Optional" matched={p.criteria.optionalMatched}  mismatched={p.criteria.optionalMismatches} missing={p.criteria.missingOptional}  />
                                        </div>
                                        {/* <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="outline">Cancel</Button>
                                            </DialogClose>
                                            <Button type="submit">Save changes</Button>
                                        </DialogFooter> */}
                                    </DialogContent>
                                </Dialog>
                            </div>
                            
                           
                        </TableCell>

                        {/* Manual questions */}
                        <TableCell>
                             <div className="flex gap-3 items-center">
                                <div className="flex">
                                    <Check size={16} /> 
                                    <p className="text-body">{p.form.manual.counts.pass}</p>
                                </div>
                                <div className="flex">
                                    <X  size={16} className="text-destructive"/> 
                                    <p className="text-body text-destructive">{p.form.manual.counts.fail}</p>
                                </div>
                                <div className="flex gap-1">
                                    <p className="text-body text-muted-foreground">?</p>
                                    <p className="text-body text-muted-foreground">{p.form.manual.counts.unsure}</p>
                                </div>
                               <ManualReviewDialog
                                slug={slug}
                                participationId={p.id}
                                answers={p.form.manual.answers}
                                // triggerLabel="Review" // 可選
                                />
                            </div>
                            
                        </TableCell>

                        {/* Scored questions */}
                        <TableCell>
                             <div className="flex gap-4 items-center justify-center">
                                <p>{p.form.totalScore}</p>
                                <Dialog>
                                    <DialogTrigger  asChild>
                                        <Button size="sm" variant="outline" >
                                            View
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                        <DialogTitle>Scored Questions</DialogTitle>
                                        
                                        </DialogHeader>
                                        <div className="mb-10 space-y-4 w-full px-3">
                                            {
                                                p.form.scored.answers.map((a, i) => (
                                                    <div key={a.answerId} className="flex justify-between">
                                                        <div>
                                                            <p className="text-body">
                                                            {i+1}.  {a.questionText}
                                                            </p>
                                                            
                                                            <div className="ml-3 mt-1">
                                                                {a.selectedOptions.map((a)=> (
                                                                   <div key={a.id} className="font-semibold">
                                                                    {a.text} 
                                                                    <span className="text-muted-foreground ml-4 font-normal">+{a.score}</span>
                                                                   </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                         <p className="text-body">
                                                          Score: {a.questionScore}
                                                        </p>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                        {/* <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="outline">Cancel</Button>
                                            </DialogClose>
                                            <Button type="submit">Save changes</Button>
                                        </DialogFooter> */}
                                    </DialogContent>
                                </Dialog>
                             </div>
                            
                            
                        </TableCell>

                        {/* Unscored questions */}
                        <TableCell className="flex flex-center">
                            <Dialog>
                                <DialogTrigger  asChild>
                                    <Button size="sm" variant="outline" >
                                        View
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                    <DialogTitle>Unscored Questions</DialogTitle>
                                    
                                    </DialogHeader>
                                    <div className="mb-10 space-y-4 w-full px-3">
                                        {
                                            p.form.unscored.answers.map((a, i) => (
                                                <div key={a.answerId} className="flex justify-between">
                                                    <div>
                                                        <p className="text-body">
                                                        {i+1}.  {a.questionText}
                                                        </p>
                                                        
                                                        <div className="ml-3 mt-1">
                                                            { a.type === "text" ? (
                                                                <div className="font-semibold">{a.textAnswer}</div>
                                                            ) : (
                                                                <>
                                                                    { a.selectedOptions?.map((a)=> (
                                                                    <div key={a.id} className="font-semibold">
                                                                    {a.text} 
                                                                    </div>
                                                                    ))}
                                                                </>
                                                            ) }       
                                                        </div>
                                                    </div>
                                                    
                                                </div>
                                            ))
                                        }
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </TableCell>


                        <TableCell>
                            <RowActions id={p.id} />
                        </TableCell>
                      
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
 
export default AppliedParticipants;
