import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import Link from "next/link";

const Menu = () => {
    return ( 
        <div>
            {/* <nav > */}
            <nav className="hidden md:flex">
                <Button asChild variant='ghost'>
                    <Link href='/exploe'>
                        Explore
                    </Link>
                </Button>
                <Button asChild variant='ghost'>
                    <Link href='/my-studies'>
                        My Studies
                    </Link>
                </Button>
                <Button asChild variant='ghost'>
                    <Link href='/my-participation'>
                        My Participation
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
                <Button asChild variant='ghost'>
                    <Link href='/profile'>
                        [User's name]
                    </Link>
                </Button>
            </nav>
            <nav className="md:hidden">
                <Sheet>
                    <SheetTrigger className="align-middle">
                        <MenuIcon />
                    </SheetTrigger>
                    <SheetContent className="flex flex-col items-start pt-2">
                        <Button asChild variant='ghost'>
                            <Link href='/exploe'>
                                Explore
                            </Link>
                        </Button>
                        <Button asChild variant='ghost'>
                            <Link href='/my-studies'>
                                My Studies
                            </Link>
                        </Button>
                        <Button asChild variant='ghost'>
                            <Link href='/my-participation'>
                                My Participation
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
                        <Button asChild variant='ghost'>
                            <Link href='/profile'>
                                [User's name]
                            </Link>
                        </Button>
                    </SheetContent>
                </Sheet>
            </nav>
        </div>
     );
}
 
export default Menu;