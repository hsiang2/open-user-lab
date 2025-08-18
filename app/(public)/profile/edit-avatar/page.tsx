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
            {/* <p className="text-body mb-20 text-center max-w-[20rem] sm:max-w-[40rem]">These details help researchers match you to suitable studies. All fields are optional and can be edited later.</p> */}
            <AvatarForm isResearcher={session.user.isResearcher} mode="edit" avatar={avatar} id={session.user.id} />
        </div>
        
    );
}
 
export default EditAvatarPage;