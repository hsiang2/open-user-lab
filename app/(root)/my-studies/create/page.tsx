import { auth } from "@/auth";

const CreateStudyPage = async () => {
     const session = await auth();
      
    if (!session?.user?.id) throw new Error('User not found');
    
    // const profile = await getUserProfileByUserId(session.user.id) as Profile;

    return (  
        <div className="flex-col flex-center mt-8">
            <h1 className="text-title mb-20">Create a Study</h1>
            {/* <p className="text-body mb-20 text-center max-w-[20rem] sm:max-w-[40rem]">These details help researchers match you to suitable studies. All fields are optional and can be edited later.</p> */}
            {/* <ProfileForm mode="edit" profile={profile} id={session.user.id} /> */}
        </div>
    );
}
 
export default CreateStudyPage;