import { Metadata } from "next";
import AvatarForm from "./AvatarForm";
import { auth } from "@/auth";

export const metadata: Metadata = {
    title: 'Avatar',
  };

const OnboardingAvatarPage = async () => {

    const session = await auth();
  
    if (!session?.user?.id) throw new Error('User not found');
  
    return ( 
        <div className="flex-col flex-center">
            <h1 className="text-title mb-20">Choose your avatar</h1>
            <AvatarForm isResearcher={session.user.isResearcher} mode="onboarding" />
        </div>
       
    );
}
 
export default OnboardingAvatarPage;