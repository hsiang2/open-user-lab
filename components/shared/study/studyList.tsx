import StudyCardExplore from "./studyCardExplore";
import StudyCardResearcher from "./StudyCardResearcher";
import StudyCardParticipant from "./studyCardParticipant";
import { StudyCard } from "@/contracts/study";


const StudyList = ({data, type, limit}: {data: StudyCard[]; type: "researcher"|'participant' | 'explore'; limit?: number}) => {
    const limitedData = limit ? data.slice(0, limit) : data;
    return ( 
        <div className="my-10">
            { limitedData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {limitedData.map((study: StudyCard) => (
                        type === "researcher" ? 
                        <StudyCardResearcher key={study.id} study={study} />: 
                        type === "participant" ? 
                        <StudyCardParticipant key={study.id} study={study} /> : 
                        <StudyCardExplore key={study.id} study={study} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-center">
                    <p>No studies found</p>
                </div>

            )}
        </div>
    );
}
 
export default StudyList;