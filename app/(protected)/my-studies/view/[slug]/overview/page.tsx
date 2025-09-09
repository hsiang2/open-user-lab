'use client'

import { useStudy } from "../StudyProviderClient";
import { StatusActionDialog } from "@/components/shared/study/StatusActionDialog";
import Avatar from "@/components/shared/avatar/Avatar";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteStudy, endStudy, goLive, pauseRecruitment, resumeRecruitment } from "@/lib/actions/study.actions";
import { Button } from "@/components/ui/button";
import { RecruitmentGoal } from "./RecruitmentGoal";
import StudyWorkflow from "./StudyWorkflow";

const StudyOverviewPage = () => {
    const {study, workflow} = useStudy();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const call = (fn: (slug: string) => Promise<void>) =>
        startTransition(async () => {
        await fn(study.slug);
        router.refresh();
    });

    return (
        <div className="py-4 px-7 flex flex-col items-center space-y-10 justify-center md:flex-row md:space-x-15 md:space-y-0 md:items-start flex-wrap">
            {workflow.steps.length !== 0 && 
             <div className="min-w-full flex flex-col flex-center space-y-10 mb-10 mr-0">
                <h2 className="text-subtitle">Study Workflow</h2>
                <div>
                    <StudyWorkflow studyId={workflow.studyId} statuses={workflow.statuses} steps={workflow.steps} />
                </div>
               
            </div>
            }
            <div className="flex flex-col space-y-10 basis-0 grow-[2] min-w-0">
                <h2 className="text-subtitle">Status</h2>
                <div className="flex flex-col space-y-4">
                    <div className="flex space-x-1">
                        <p className="text-body font-bold">Recruitment</p>
                        <p className="text-body">{study.recruitmentStatus}</p>
                    </div>
                    {study.status === "ongoing" && study.recruitmentStatus === "closed" && (
                        <StatusActionDialog
                        type="resumeRecruitment"
                        onConfirm={() => call(resumeRecruitment)}
                        />
                    )}
                    {study.status === "ongoing" && study.recruitmentStatus === "open" && (
                        <StatusActionDialog
                        type="pauseRecruitment"
                        onConfirm={() => call(pauseRecruitment)}
                        />
                    )}
                </div>
                <div className="flex flex-col space-y-4">
                    <div>
                        <p className="text-body font-bold">Recruitment Goal</p>
                        <p className="text-caption">Recruitment will automatically stop when any of the selected conditions is met.</p>
                    </div>
                    <RecruitmentGoal slug={study.slug} />
                </div>
                <div className="flex flex-col space-y-4">
                    <div className="flex space-x-1">
                        <p className="text-body font-bold">Study Status</p>
                        <p className="text-body">{study.status}</p>
                    </div>
                    {/* <div className="flex flex-col space-y-2"> */}
                         {study.status === "draft" && (
                            <StatusActionDialog
                            type="goLive"
                            onConfirm={() => call(goLive)} 
                        />
                        )}
                        {study.status === "ongoing" && (
                            <StatusActionDialog
                            type="endStudy"
                            onConfirm={() => call(endStudy)} 
                            />
                        )}
                        <StatusActionDialog
                            type="deleteStudy"
                            onConfirm={() => call(deleteStudy)} 
                        />          
                </div>
            </div>
            
            
            <div className="flex flex-col space-y-10 basis-0 grow min-w-0">
                <div className="flex flex-col space-y-8">
                    <h2 className="text-subtitle">Description</h2>
                    <p className="text-body">{study.description}</p>
                    <Button variant="secondary" className="w-fit">
                        {/* TODO <Link href='/profile/edit-profile'> */}
                             Edit
                        {/* </Link> */}
                    </Button>
                </div>
                <div className="flex flex-col space-y-8">
                    <h2 className="text-subtitle">Collaborators</h2>
                    { study.collaborators.map((c) => (
                        <div key={c.id} className="flex items-center justify-between">
                            <div  className="flex space-x-4 items-center">
                                <Avatar width={50} background={c.user?.profile?.avatarBg} style={c.user?.profile?.avatarBase} accessory={c.user?.profile?.avatarAccessory} />
                                <p className="text-body font-bold">{c.user.name}</p>
                            </div>
                        
                            <p className="text-body">{c.role}</p>
                        </div>
                    ))
                    }
                    <Button variant="secondary" className="w-fit">
                        {/* TODO <Link href='/profile/edit-profile'> */}
                            Edit
                        {/* </Link> */}
                    </Button>
                </div>
            </div>
        </div>
    );
}
 
export default StudyOverviewPage;
