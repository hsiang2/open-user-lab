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
            {/* <p className="text-body mb-20 text-center max-w-[20rem] sm:max-w-[40rem]">These details help researchers match you to suitable studies. All fields are optional and can be edited later.</p> */}
            <AvatarForm isResearcher={session.user.isResearcher} mode="onboarding" />
        </div>
       
    );
}
 
export default OnboardingAvatarPage;