import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import Link from "next/link";

const PublicHeader = () => {
    return (
        <header className="w-full">
            <div className="wrapper flex-between">
                <Link href='/'>
                    <h1 className="text-logo">{APP_NAME}</h1>
                </Link>
                <div className="space-x-2">
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
                </div>
            </div>
        </header>
    );
}
 
export default PublicHeader;