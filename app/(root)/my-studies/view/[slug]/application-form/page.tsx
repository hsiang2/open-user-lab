'use client'

import { useStudy } from "../StudyProviderClient";

const StudyRecruitmentSettingPage = () => {
    const study = useStudy();
   
    // const getUserAvatar
    return (
        <div className="my-8">
            <div className="flex flex-col flex-center space-y-10">
                <h2 className="text-subtitle">Application Form</h2>
                {/* <RecruitmentForm slug={study.slug} recruitment={study.recruitment}  /> */}
            </div>
        </div>
    );
}
 
export default StudyRecruitmentSettingPage;
