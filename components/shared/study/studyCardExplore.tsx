import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";

const StudyCardExplore = ({ study }: { study: any }) => {
    return ( 
        <Card 
        // className="w-full max-w-sm"
        >
            <CardHeader >
                <Link href={`/recruitment/${study.slug}`}>
                    <h2 className="text-subtitle">{study.name}</h2>
                </Link>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href={`/recruitment/${study.slug}`}>
                        View
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
 
export default StudyCardExplore;