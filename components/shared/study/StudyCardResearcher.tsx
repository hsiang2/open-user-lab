import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Study } from "@/types";
import Link from "next/link";

const StudyCardResearcher = ({ study }: { study: Study }) => {
    return ( 
        <Card 
        // className="w-full max-w-sm"
        >
            <CardHeader >
                <Link href={`/my-studies/${study.slug}`}>
                    <h2 className="text-subtitle">{study.name}</h2>
                </Link>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href={`/my-studies/${study.slug}`}>
                        View
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
 
export default StudyCardResearcher;