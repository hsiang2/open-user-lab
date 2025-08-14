
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listAppliedParticipants, } from "@/lib/actions/participation.actions";
import Link from "next/link";
import RowActions from "./RowAction";

const AppliedParticipants = async ({slug} : {slug: string}) => {
    
    const participation = await listAppliedParticipants(slug)

    return (
       <div className="my-8">

            <Table>
                {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Criteria Match</TableHead>
                        <TableHead>Manual Questions</TableHead>
                        <TableHead>Scored Questions</TableHead>
                        <TableHead>Unscored Questions</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {participation.map((p) => (
                    <TableRow key={p.id}>
                        <TableCell className="font-medium max-w-40 truncate">
                            <Link href={`/profile/view/${p.user.id}`} >
                              {p.user.name}
                            </Link>
                        </TableCell>

                        {/* Criteria match */}
                        <TableCell>

                        </TableCell>

                        {/* Manual questions */}
                        <TableCell>

                        </TableCell>

                        {/* Scored questions */}
                        <TableCell>

                        </TableCell>

                        {/* Unscored questions */}
                        <TableCell>
                            
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
