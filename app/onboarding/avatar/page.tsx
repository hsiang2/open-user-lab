import { Metadata } from "next";
import AvatarForm from "./AvatarForm";
import { auth } from "@/auth";
import { getUserById } from "@/lib/actions/user.action";

export const metadata: Metadata = {
    title: 'Avatar',
  };

const OnboardingAvatarPage = async () => {

    const session = await auth();
    const userId = session?.user?.id;
  
    if (!userId) throw new Error('User not found');
  
    const user = await getUserById(userId);

    return ( 
        <AvatarForm isResearcher={user.isResearcher} />
    );
}
 
export default OnboardingAvatarPage;