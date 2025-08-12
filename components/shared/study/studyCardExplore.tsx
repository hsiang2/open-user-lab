import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Study } from "@/types";
import Link from "next/link";
import StudyImage from "../image/StudyImage";
import { AVATAR_ACCESSORY_KEYS, AVATAR_STYLE, STUDY_IMAGE } from "@/lib/constants";

const StudyCardExplore = ({ study }: { study: Study }) => {
    return ( 
        <Card 
        // className="w-full max-w-sm"
        >
            <CardHeader >
                <Link href={`/recruitment/${study.slug}`}>
                    <h2 className="text-subtitle text-center">{study.name}</h2>
                </Link>
            </CardHeader>
            <CardContent>
                {/* <div className="flex flex-col"> */}
                <div className="flex flex-col flex-center">
                    <StudyImage 
                        width={250} 
                        background={study.recruitment?.image  as (typeof STUDY_IMAGE)[number] }  
                        styleResearcher= {study.recruitment?.avatarBaseResearcher  as (typeof AVATAR_STYLE)[number] } 
                        accessoryResearcher= {study.recruitment?.avatarAccessoryResearcher as (typeof AVATAR_ACCESSORY_KEYS)[number] } 
                    />
<Button asChild>
                    <Link href={`/recruitment/${study.slug}`}>
                        View
                    </Link>
                </Button>

                </div>
                
            </CardContent>
        </Card>
    );
}
 
export default StudyCardExplore;