// import { auth } from "@/auth";
// import { Button } from "@/components/ui/button";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// import { signOutUser } from "@/lib/actions/user.action";
// import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
// import Link from "next/link";

// const UserButton = async () => {
//     const session = await auth();

//     if (!session) {
//         return (
//             <Button asChild>
//                 <Link href='/sign-in'>
//                     Sign In
//                 </Link>
//             </Button>
//         );
//     }


//     return (
//         <div className='flex gap-2 items-center'>
//             <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                     <div className='flex items-center'>
//                         <Button asChild variant='ghost'>
//                             {/* <Link href='/profile'> */}
//                                 { session.user?.name}
//                             {/* </Link> */}
//                         </Button>
//                     {/* <Button
//                         variant='ghost'
//                         className='relativee w-8 h-8 rounded-full ml-2 flex items-center justify-center bg-gray-200'
//                     >
//                         {firstInitial}
//                     </Button> */}
//                     </div>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent className='w-56' align='end' forceMount>
//                     <DropdownMenuLabel className='font-normal'>
//                         {/* <Link href='/profile'>
//                             Profile
//                         </Link> */}
//                     <div className='flex flex-col space-y-1'>
//                         <div className='text-sm font-medium leading-none'>
//                         {session.user?.name}
//                         </div>
//                         <div className='text-sm text-muted-foreground leading-none'>
//                         {session.user?.email}
//                         </div>
//                     </div>
//                     </DropdownMenuLabel>
        
//                     <DropdownMenuItem>
//                     <Link href='/profile' className='w-full'>
//                         User Profile
//                     </Link>
//                     </DropdownMenuItem>
//                     {/* <DropdownMenuItem>
//                     <Link href='/user/orders' className='w-full'>
//                         Order History
//                     </Link>
//                     </DropdownMenuItem>
        
//                     {session?.user?.role === 'admin' && (
//                     <DropdownMenuItem>
//                         <Link href='/admin/overview' className='w-full'>
//                         Admin
//                         </Link>
//                     </DropdownMenuItem>
//                     )} */}
        
//                     <DropdownMenuItem className='p-0 mb-1'>
//                         <form action={signOutUser} className='w-full'>
//                             <Button
//                                 className='w-full py-4 px-2 h-4 justify-start'
//                                 variant='ghost'
//                             >
//                                 Sign Out
//                             </Button>
//                         </form>
//                     </DropdownMenuItem>
//                 </DropdownMenuContent>
//             </DropdownMenu>
//       </div>
//     );
// }
 
// export default UserButton;