import { Certificate } from "@/types";

const Wall = ({certificates}: {certificates: Certificate[]}) => {
    return (  
        <div className="bg-gray-200 w-full min-h-[200px] p-8 flex flex-center">
            {certificates.length ? (
                certificates.map((certificate) => (
                    <div>{certificate.studyName}</div>
                ))
             ) : (
                <div>No certificates yet.</div>
            )}
        </div>
    );
}
 
export default Wall;