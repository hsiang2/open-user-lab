import { getStudyForResearcher } from "@/lib/actions/study.actions";
import StudyNav from "./StudyNav";
import { StudyProvider } from "./StudyProviderClient";
import { redirect } from "next/navigation";
import { getStudyWorkflowForSlug } from "@/lib/actions/participation.actions";

export default async function StudyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
    const { slug } = await params;    
    // const study = await getStudyForResearcher(slug);
    const studyRaw = await getStudyForResearcher(slug);
    if (!studyRaw) {
        redirect("/my-studies");
    }
    const study = JSON.parse(JSON.stringify(studyRaw));

     const wf = await getStudyWorkflowForSlug(slug); 

    return (
        <StudyProvider study={study} slug={slug} workflow={wf}>
            <div className="flex flex-col items-center my-8">
            <h1 className="text-title text-center max-w-[800px]">{study?.name}</h1>
            <StudyNav slug={slug} />
            <div className="w-full max-w-[900px]">{children}</div>
            </div>
        </StudyProvider>
    );
}
