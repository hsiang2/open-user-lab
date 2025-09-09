import ProfileForm from "@/app/onboarding/profile/ProfileForm";
import { auth } from "@/auth";
import { getUserProfileByUserId } from "@/lib/actions/user.action";
import { Profile } from "@/types";


const EditProfilePage = async () => {
     const session = await auth();
      
    if (!session?.user?.id) throw new Error('User not found');
    
    const profile = await getUserProfileByUserId(session.user.id) as Profile;

    return (  
        <div className="flex-col flex-center mt-8">
            <h1 className="text-title mb-20">Edit Profile</h1>
            <ProfileForm mode="edit" profile={profile} id={session.user.id} />
        </div>
    );
}
 
export default EditProfilePage;