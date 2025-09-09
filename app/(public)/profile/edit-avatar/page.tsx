import AvatarForm from "@/app/onboarding/avatar/AvatarForm";
import { auth } from "@/auth";
import { getUserAvatar } from "@/lib/actions/user.action";
import { AvatarInfo } from "@/types";

const EditAvatarPage = async () => {

    const session = await auth();
  
    if (!session?.user?.id) throw new Error('User not found');

    const avatar = await getUserAvatar(session.user.id) as AvatarInfo;
  
    return ( 
         <div className="flex-col flex-center mt-8">
            <h1 className="text-title mb-20">Edit Avatar</h1>
            <AvatarForm isResearcher={session.user.isResearcher} mode="edit" avatar={avatar} id={session.user.id} />
        </div>
        
    );
}
 
export default EditAvatarPage;