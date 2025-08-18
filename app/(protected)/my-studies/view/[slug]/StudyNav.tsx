import { Button } from "@/components/ui/button";
import Link from "next/link";

const StudyNav = async ( {slug} : {slug: string} ) => {
    return ( 
        <div className="my-10">
            <nav className="flex flex-wrap items-center justify-center">
                <Button asChild variant='ghost'>
                    <Link href={`/my-studies/view/${slug}/overview`}>
                        Overview
                    </Link>
                </Button>
                <Button asChild variant='ghost'>
                    <Link href={`/my-studies/view/${slug}/application-form`}>
                        Application Form
                    </Link>
                </Button>
                <Button asChild variant='ghost'>
                    <Link href={`/my-studies/view/${slug}/recruitment-settings`}>
                        Recruitment Settings
                    </Link>
                </Button>
                <Button asChild variant='ghost'>
                    <Link href={`/my-studies/view/${slug}/potential-participants`}>
                        Potential Participants
                    </Link>
                </Button>
                <Button asChild variant='ghost'>
                    <Link href={`/my-studies/view/${slug}/participant-progress`}>
                        Participant Progress
                    </Link>
                </Button>
            </nav>
        </div>
     );
}
 
export default StudyNav;