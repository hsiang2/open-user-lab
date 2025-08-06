import ProfileForm from "./ProfileForm";

const OnboardingProfilePage = () => {
    return (  
        <div className="flex-col flex-center">
            <h1 className="text-title mb-5">Tell us more about you</h1>
            <p className="text-body mb-20 text-center max-w-[20rem] sm:max-w-[40rem]">These details help researchers match you to suitable studies. All fields are optional and can be edited later.</p>
            <ProfileForm mode="onboarding"/>
        </div>
    );
}
 
export default OnboardingProfilePage;