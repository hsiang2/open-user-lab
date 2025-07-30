import { Study } from "@/types";
import StudyCardResearcher from "./StudyCardResearcher";
import StudyCardExplore from "./studyCardExplore";

const StudyList = ({data, type,  limit}: {data: Study[]; type: string; limit?: number}) => {
    const limitedData = limit ? data.slice(0, limit) : data;
    return ( 
        <div className="my-10">
            { limitedData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {limitedData.map((study: Study) => (
                        type === "researcher" ? 
                        <StudyCardResearcher key={study.id} study={study} />: 
                        type === "partipant" ? 
                        <></> : 
                        <StudyCardExplore key={study.id} study={study} />
                        
                    ))}
                </div>
            ) : (
                <div>
                    <p>No studies found</p>
                </div>

            )}
        </div>
    );
}
 
export default StudyList;