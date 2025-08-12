'use client'

import { useStudy } from "../StudyProviderClient";
import { RecruitmentForm } from "./RecruitmentForm";

const StudyRecruitmentSettingPage = () => {
    const study = useStudy();
   
    // const getUserAvatar
    return (
        <div className="my-8">
            <div className="flex flex-col flex-center space-y-10">
                <h2 className="text-subtitle">Recruitment Page</h2>

                <RecruitmentForm slug={study.slug} recruitment={study.recruitment}  />
                
                 {/* <Button variant="secondary" className="w-fit">
                    <Link href={`/recruitment/${study.slug}`}>
                        Preview
                    </Link>
                </Button> */}
                
            </div>
        </div>
    );
}
 
export default StudyRecruitmentSettingPage;
