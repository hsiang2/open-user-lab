import { Button } from "@/components/ui/button";
import Link from "next/link";

const StudyNav = async () => {
    return ( 
        <div>
            <nav className="hidden md:flex md:items-center">
                <Button asChild variant='ghost'>
                    <Link href='/explore'>
                        Overview
                    </Link>
                </Button>
                <Button asChild variant='ghost'>
                    <Link href='/my-participation'>
                        Application Form
                    </Link>
                </Button>
                <Button asChild variant='ghost'>
                    <Link href='/schedule'>
                        Schedule
                    </Link>
                </Button>
                <Button asChild variant='ghost'>
                    <Link href='/notifications'>
                        Notifications
                    </Link>
                </Button>
            </nav>
        </div>
     );
}
 
export default StudyNav;