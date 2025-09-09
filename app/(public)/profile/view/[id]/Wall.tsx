
import CertificateCard from "@/components/shared/study/CertificateCard";
import { Certificate } from "@/types";

const Wall = ({certificates}: {certificates: Certificate[]}) => {
    return (  
       <>
            {certificates.length ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4
                    bg-[#FCF2E0] rounded-md w-full min-h-[200px] p-8
                ">
                {certificates.map((certificate) => (
                    <CertificateCard key={certificate.id} certificate={certificate}/>
                ))}
                </div>
             ) : (
                <div className="flex flex-center bg-[#FCF2E0] rounded-md w-full min-h-[200px] p-8">No certificates yet.</div>
            )} 
       </>
    );
}
 
export default Wall;