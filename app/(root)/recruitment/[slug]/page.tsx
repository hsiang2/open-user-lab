
import { getStudyForExplore } from "@/lib/actions/study.actions";
import { notFound } from "next/navigation";

const StudyDetailsRecruitmentPage = async (props: {
    params: Promise<{ slug: string }>;
}) => {
    const { slug } = await props.params;

    const study = await getStudyForExplore(slug);
    if (!study) notFound();

    return ( 
        <div>
            <h1 className="text-title mb-7">{study.name}</h1>
            <p className="text-body">{study.recruitment?.description}</p>
            {/* <Image 

            /> */}
            <h2 className="text-subtitle">Participant Criteria</h2>
            <p className="text-body">{study.recruitment?.criteriaDescription}</p>
            <h2 className="text-subtitle">Format</h2>
            <p className="text-body">{study.recruitment?.format}</p>
            <h2 className="text-subtitle">Estimated Duration</h2>
            <p className="text-body">{study.recruitment?.duration}</p>
            <h2 className="text-subtitle">Session Details</h2>
            <p className="text-body">{study.recruitment?.sessionDetail}</p>
            <h2 className="text-subtitle">Reward</h2>
            <p className="text-body">{study.recruitment?.reward}</p>
        </div>
    );
}
 
export default StudyDetailsRecruitmentPage;