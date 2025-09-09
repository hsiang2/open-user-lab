import { auth } from "@/auth";
import { StepperWithForm } from "@/components/stepper-with-form";

const CreateStudyPage = async () => {
     const session = await auth();
      
    if (!session?.user?.id) throw new Error('User not found');

    return (  
        <div className="flex-col flex-center mt-8">
            <h1 className="text-title mb-20">Create a Study</h1>
            <StepperWithForm />
        </div>
    );
}
 
export default CreateStudyPage;