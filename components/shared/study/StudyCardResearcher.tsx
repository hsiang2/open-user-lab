import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StudyCard } from "@/contracts/study";
import Link from "next/link";

const StudyCardResearcher = ({ study }: { study: StudyCard }) => {
    return ( 
        <Card 
        className="w-full"
        >
            <CardHeader >
                <Link href={`/my-studies/view/${study.slug}/overview`}>
                    <h2 className="text-subtitle">{study.name}</h2>
                </Link>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href={`/my-studies/view/${study.slug}/overview`}>
                        View
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
 
export default StudyCardResearcher;