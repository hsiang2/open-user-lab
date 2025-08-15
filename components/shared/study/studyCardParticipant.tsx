import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Study } from "@/types";
import Link from "next/link";

const StudyCardParticipant = ({ study }: { study: Study }) => {
    return ( 
        <Card 
        className="w-full"
        >
            <CardHeader >
                <Link href={`/my-participation/view/${study.slug}`}>
                    <h2 className="text-subtitle">{study.name}</h2>
                </Link>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href={`/my-participation/view/${study.slug}`}>
                        View
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
 
export default StudyCardParticipant;