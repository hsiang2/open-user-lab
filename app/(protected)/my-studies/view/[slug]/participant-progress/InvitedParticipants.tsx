
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listInvitationsForStudy } from "@/lib/actions/participation.actions";
import { format } from "date-fns";
import Link from "next/link";


const InvitedParticipants = async ({slug} : {slug:string}) => {
    const invitations = await listInvitationsForStudy(slug)
   
    return (
            <div className="my-8">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="min-w-[200px]">Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invited At</TableHead>
                    <TableHead>Responded At</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">
                            <Link href={`/profile/view/${invitation.user.id}`} >
                             {invitation.user.name}
                            </Link>
                        </TableCell>
                        <TableCell>{invitation.status}</TableCell>
                        <TableCell>{format(invitation.createdAt, "PPP")}</TableCell>
                        <TableCell>{ invitation.status !== "pending" && invitation.respondedAt ? format(invitation.respondedAt, "PPP") : "-" }</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
    );
}
 
export default InvitedParticipants;
