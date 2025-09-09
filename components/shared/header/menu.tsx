import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getUserAvatar, signOutUser } from "@/lib/actions/user.action";
import Avatar from "../avatar/Avatar";
import { AvatarInfo } from "@/types";

const Menu = async () => {
    const session = await auth();

    if (!session?.user?.id) {
        return (
            <div>
                <nav className="hidden md:flex">
                    <Button asChild variant='ghost'>
                        <Link href='/explore'>
                            Explore
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href='/sign-in'>
                            Sign In
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
                            <Button asChild>
                                <Link href='/sign-in'>
                                    Sign In
                                </Link>
                            </Button>
                        </SheetContent>
                    </Sheet>
                </nav>
            </div>
        );
    }

    const avatar = await getUserAvatar(session.user.id) as AvatarInfo;

    return ( 
        <div>
            <nav className="hidden md:flex md:items-center">
                <Button asChild variant='ghost'>
                    <Link href='/explore'>
                        Explore
                    </Link>
                </Button>
                    {
                        session.user?.isResearcher && (
                            <Button asChild variant='ghost'>
                                <Link href='/my-studies'>
                                    My Studies
                                </Link>
                            </Button>
                        )
                    }
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
                <div 
                    // className='flex gap-2 items-center'
                >
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          
                            <div 
                            className='flex items-center ml-4'
                            >
                                <Avatar width={50} background={avatar?.avatarBg} style={avatar?.avatarBase} accessory={avatar?.avatarAccessory}  />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className='w-56' align='end' forceMount>
                            <DropdownMenuLabel className='font-normal'>
                            <div className='flex flex-col space-y-1'>
                                <div className='text-sm font-medium leading-none'>
                                {session.user?.name}
                                </div>
                                <div className='text-sm text-muted-foreground leading-none'>
                                {session.user?.email}
                                </div>
                            </div>
                            </DropdownMenuLabel>
                            <DropdownMenuItem>
                            <Link href={`/profile/view/${session.user.id}`} className='w-full'>
                                User Profile
                            </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className='p-0 mb-1'>
                                <form action={signOutUser} className='w-full'>
                                    <Button
                                        className='w-full py-4 px-2 h-4 justify-start'
                                        variant='ghost'
                                    >
                                        Sign Out
                                    </Button>
                                </form>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </nav>
            <nav className="md:hidden">
                <Sheet>
                    <SheetTrigger className="align-middle">
                        <MenuIcon />
                    </SheetTrigger>
                    <SheetContent className="flex flex-col items-start">
                        <SheetTitle className="p-4">Menu</SheetTitle>
                        <Button asChild variant='ghost'>
                            <Link href='/exploe'>
                                Explore
                            </Link>
                        </Button>
                        {
                            session.user?.isResearcher && (
                                <Button asChild variant='ghost'>
                                    <Link href='/my-studies'>
                                        My Studies
                                    </Link>
                                </Button>
                            )
                        }
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
                        <div className='flex gap-2 items-center'>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                
                                <div 
                                className='flex items-center ml-4'
                                >
                                    <Avatar width={50} background={avatar?.avatarBg} style={avatar?.avatarBase} accessory={avatar?.avatarAccessory}  />
                                    <Button variant='ghost'>
                                        { session.user?.name}
                                    </Button>
                                </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className='w-56' align='end' forceMount>
                                    <DropdownMenuLabel className='font-normal'>
                                    <div className='flex flex-col space-y-1'>
                                        <div className='text-sm font-medium leading-none'>
                                        {session.user?.name}
                                        </div>
                                        <div className='text-sm text-muted-foreground leading-none'>
                                        {session.user?.email}
                                        </div>
                                    </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem>
                                    <Link href={`/profile/view/${session.user.id}`} className='w-full'>
                                        User Profile
                                    </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className='p-0 mb-1'>
                                        <form action={signOutUser} className='w-full'>
                                            <Button
                                                className='w-full py-4 px-2 h-4 justify-start'
                                                variant='ghost'
                                            >
                                                Sign Out
                                            </Button>
                                        </form>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </SheetContent>
                </Sheet>
            </nav>
        </div>
     );
}
 
export default Menu;