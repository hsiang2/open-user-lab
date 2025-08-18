'use client'

import { toRecruitmentFormValues } from "@/contracts/study";
import { useStudy } from "../StudyProviderClient";
import { RecruitmentForm } from "./RecruitmentForm";

const StudyRecruitmentSettingPage = () => {
    const {study} = useStudy();

    const init = toRecruitmentFormValues(study.recruitment);
   
    return (
        <div className="my-8">
            <div className="flex flex-col flex-center space-y-10">
                <h2 className="text-subtitle">Recruitment Page</h2>

                <RecruitmentForm slug={study.slug} recruitment={init}  />
                
            </div>
        </div>
    );
}
 
export default StudyRecruitmentSettingPage;
