import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import Link from "next/link";
import Menu from "./menu";

const Header = () => {
    return (
        <header className="w-full">
            <div className="wrapper flex-between">
                <Link href='/'>
                    <h1 className="text-logo">{APP_NAME}</h1>
                </Link>
                <Menu />
            </div>
        </header>
    );
}
 
export default Header;