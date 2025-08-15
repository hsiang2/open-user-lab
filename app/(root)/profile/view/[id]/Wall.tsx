
import CertificateCard from "@/components/shared/study/CertificateCard";
import { Certificate } from "@/types";

const Wall = ({certificates}: {certificates: Certificate[]}) => {
    return (  
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4
            bg-[#FCF2E0] rounded-md w-full min-h-[200px] p-8
        ">
        {/* <div className="bg-[#FCF2E0] rounded-md w-full min-h-[200px] p-8 flex flex-center"> */}
            {certificates.length ? (
                certificates.map((certificate) => (
                    <CertificateCard key={certificate.id} certificate={certificate}/>
                ))
             ) : (
                <div className="flex flex-center">No certificates yet.</div>
            )} 
        </div>
    );
}
 
export default Wall;