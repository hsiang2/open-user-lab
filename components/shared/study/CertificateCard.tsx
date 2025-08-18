
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Certificate } from "@/types";
import StudyImage from "../image/StudyImage";
import { AVATAR_ACCESSORY_KEYS, AVATAR_STYLE, STUDY_IMAGE } from "@/lib/constants";
import { format } from "date-fns";

const CertificateCard = ({ certificate }: { certificate: Certificate }) => {
    return ( 
        <Card 
        // className="w-full max-w-sm"
        >
            <CardHeader >
                {/* <Link href={`/recruitment/${study.slug}`}> */}
                    <h2 className="text-subtitle text-center">{certificate.studyName}</h2>
                {/* </Link> */}
            </CardHeader>
            <CardContent>
                {/* <div className="flex flex-col"> */}
                <div className="flex flex-col flex-center">
                    <h1 className="text-sign mb-4 text-2xl">{certificate.participantName}</h1>
                    <StudyImage 
                        width={250} 
                        background={certificate.image  as (typeof STUDY_IMAGE)[number] }  
                        styleResearcher= {certificate.avatarBaseResearcher  as (typeof AVATAR_STYLE)[number] } 
                        accessoryResearcher= {certificate.avatarAccessoryResearcher as (typeof AVATAR_ACCESSORY_KEYS)[number] } 
                        styleParticipant={certificate.avatarBaseParticipant as (typeof AVATAR_STYLE)[number] }
                        accessoryParticipant={certificate.avatarAccessoryParticipant as (typeof AVATAR_ACCESSORY_KEYS)[number]}
                    />
                    
                    <p className="text-caption text-center mb-6">{certificate.message}</p>
                    <div className="self-end text-end">
                        <p className="text-sign">{certificate.researcherName}</p>
                        <p className="text-sign">{format(certificate.createdAt, "PPP")}</p>
                    </div>   
                </div>
                
            </CardContent>
        </Card>
    );
}
 
export default CertificateCard;