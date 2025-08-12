
import { auth } from "@/auth";
import StudyImage from "@/components/shared/image/StudyImage";
import { Button } from "@/components/ui/button";
import { getStudyForExplore } from "@/lib/actions/study.actions";
import { AVATAR_ACCESSORY_KEYS, AVATAR_STYLE, STUDY_IMAGE } from "@/lib/constants";
import Link from "next/link";
import { notFound } from "next/navigation";

const StudyDetailsRecruitmentPage = async (props: {
    params: Promise<{ slug: string }>;
}) => {
    const { slug } = await props.params;

    const study = await getStudyForExplore(slug);
    if (!study) notFound();

    const session = await auth();
    const currentUser = session?.user?.id;
    

    return ( 
        <div className="flex flex-col flex-center">
            <h1 className="text-title mb-4">{study.name}</h1>
            <p className="text-body mb-16">{study.recruitment?.description}</p>
            <div className=" mb-16 flex space-x-20 flex-col justify-center md:flex-row">
                 <div className="flex-shrink-0">
                     <StudyImage 
                        width={400} 
                        background={study.recruitment?.image  as (typeof STUDY_IMAGE)[number] }  
                        styleResearcher= {study.recruitment?.avatarBaseResearcher  as (typeof AVATAR_STYLE)[number] } 
                        accessoryResearcher= {study.recruitment?.avatarAccessoryResearcher as (typeof AVATAR_ACCESSORY_KEYS)[number] } 

                        styleParticipant= {study.recruitment?.avatarBaseResearcher  as (typeof AVATAR_STYLE)[number] } 
                        accessoryParticipant= {study.recruitment?.avatarAccessoryResearcher as (typeof AVATAR_ACCESSORY_KEYS)[number] } 
                    />
                 </div>
                   
                
                 <div className="space-y-8 max-w-xl w-full">
                    <div className="space-y-4">
                        <h2 className="text-subtitle">Participant Criteria</h2>
                        <p className="text-body ">{study.recruitment?.criteriaDescription}</p>
                    </div>
                   <div className="space-y-4">
                        <h2 className="text-subtitle">Format</h2>
                        <p className="text-body">{study.recruitment?.format.join(' / ')}</p>
                   </div>
                   <div className="space-y-4">
                        <h2 className="text-subtitle">Estimated Duration</h2>
                        <p className="text-body">{study.recruitment?.durationMinutes}</p>
                   </div>
                   { study.recruitment?.sessionDetail && (
                        <div className="space-y-4">
                            <h2 className="text-subtitle">Session Details</h2>
                            <p className="text-body">{study.recruitment?.sessionDetail}</p>
                        </div>
                   )
                   }
                  
                   <div className="space-y-4">
                      <h2 className="text-subtitle">Reward</h2>
                       { study.recruitment?.reward ? (
                            <p className="text-body">{study.recruitment?.reward}</p>
                        ) : 
                            <p className="text-body">This study does not offer a reward.</p>
                        }
                    
                   </div>
                </div>
            </div>

            <div className="flex justify-center gap-2">
                {/* TODO */}
                <Button variant="secondary" type="button">
                    Share
                </Button>
                <Button disabled={!currentUser} variant="secondary" type="button">
                    Save
                </Button>
                <Button disabled={!currentUser}>
                    Apply
                </Button>
            </div>
            
         
        </div>
    );
}
 
export default StudyDetailsRecruitmentPage;