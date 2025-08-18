
import { auth } from "@/auth";
import StudyImage from "@/components/shared/image/StudyImage";
import { Button } from "@/components/ui/button";
import { prisma } from "@/db/prisma";
import { getStudyForExplore } from "@/lib/actions/study.actions";
import { AVATAR_ACCESSORY_KEYS, AVATAR_BACKGROUND, AVATAR_STYLE, STUDY_IMAGE } from "@/lib/constants";
import { notFound } from "next/navigation";
import InviteBanner from "./InviteBanner";
import { ApplyButton } from "./ApplyButton";
import Avatar from "@/components/shared/avatar/Avatar";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2Icon } from "lucide-react";
import { PageProps } from "@/types/next-helper";

// type PageProps = {
//   params: { slug: string };
//   searchParams: Promise<{ applied?: string; dup?: string; error?: string }>;
// };

const StudyDetailsRecruitmentPage = async (
    { params, searchParams }: PageProps<{ slug: string }, { applied?: string; dup?: string; error?: string }>
//     { params, searchParams }: {
//   params: { slug: string };
//   searchParams: Promise<{ applied?: string; dup?: string; error?: string }>;
// }
) => {
     const { slug } = await params;            
  const { applied, dup, error } = await searchParams; 

   const isApplied = applied === "1";
  const isDup = dup === "1";
  const errorMsg = error ? decodeURIComponent(error) : "";

    const study = await getStudyForExplore(slug);
    if (!study) notFound();

    const session = await auth();
    const userId = session?.user?.id?? null;

    let pendingInvitation: { id: string } | null = null;
    let existingParticipation: | { id: string }  | null = null;

    if (userId) {
        pendingInvitation = await prisma.invitation.findFirst({
            where: { studyId: study.id, userId, status: "pending" },
            select: { id: true },
        });

        existingParticipation = await prisma.participation.findFirst({
            where: {
                studyId: study.id,
                userId,
            
            },
            select: { id: true },
        });
    }
    
    return ( 
        <div className="flex flex-col flex-center">
            {isApplied && (
               
                <Alert className="my-8 w-fit">
                    <CheckCircle2Icon />
                    <AlertTitle>{isDup ? "You already applied" : "Application submitted"}</AlertTitle>
                    <AlertDescription>
                        {isDup ? "Your previous application is on file." : "We’ve received your application."}
                    </AlertDescription>
                </Alert>
            )}
            {errorMsg && (
                <Alert variant="destructive" className="my-8">
                <AlertTitle>Submission failed</AlertTitle>
                <AlertDescription>{errorMsg}</AlertDescription>
                </Alert>
            )}
            <h1 className="text-title mb-4">{study.name}</h1>
            <p className="text-body mb-4">{study.recruitment?.description}</p>
            { study.collaborators.map((c) => (
                 <Button variant="ghost" key={c.id} className="mb-16 h-[50px]">
                    <Link href={`/profile/view/${c.user.id}`}>
                        <div  className="flex space-x-4 items-center min-w-0">
                            <div className="flex-shrink-0">
                                <Avatar width={50} 
                                background={c.user.profile?.avatarBg} 
                                style={c.user.profile?.avatarBase} 
                                accessory={c.user.profile?.avatarAccessory} 
                                />
                            </div>
                            <p className="text-body font-bold truncate min-w-0">{c.user.name}</p>
                        </div>
                    </Link>
                </Button>    
            ))}
            <div className=" mb-16 flex space-x-20 flex-col justify-center md:flex-row">
                 <div className="flex-shrink-0">
                     <StudyImage 
                        width={400} 
                        background={study.recruitment?.image  as (typeof STUDY_IMAGE)[number] }  
                        styleResearcher= {study.recruitment?.avatarBaseResearcher  as (typeof AVATAR_STYLE)[number] } 
                        accessoryResearcher= {study.recruitment?.avatarAccessoryResearcher as (typeof AVATAR_ACCESSORY_KEYS)[number] } 
                    />
                 </div>
                
                 <div className="space-y-8 max-w-xl w-full">
                    <div className="space-y-4">
                        <h2 className="text-subtitle">Participant Criteria</h2>
                        <p className="text-body whitespace-pre-line">{study.recruitment?.criteriaDescription}</p>
                    </div>
                   <div className="space-y-4">
                        <h2 className="text-subtitle">Format</h2>
                        <p className="text-body">
                           {study.recruitment?.format
                            ?.map((f) => (f === "Other" ? study.recruitment?.formatOther : f))
                            .join(" / ")}
                        </p>
                   </div>
                   <div className="space-y-4">
                        <h2 className="text-subtitle">Estimated Duration</h2>
                        <p className="text-body">{study.recruitment?.durationMinutes} minutes</p>
                   </div>
                   { study.recruitment?.sessionDetail && (
                        <div className="space-y-4">
                            <h2 className="text-subtitle">Session Details</h2>
                            <p className="text-body whitespace-pre-line">{study.recruitment?.sessionDetail}</p>
                        </div>
                   )
                   }
                  
                   <div className="space-y-4">
                      <h2 className="text-subtitle">Reward</h2>
                       { study.recruitment?.reward ? (
                            <p className="text-body">{study.recruitment?.reward}</p>
                        ) : 
                            <p className="text-body">This study does not offer a reward.</p>
                        }
                    
                   </div>
                </div>
            </div>

            {pendingInvitation && (
                <div className="mb-8">
                 <InviteBanner invitationId={pendingInvitation.id} />
                </div>
            )}
            <div className="flex justify-center gap-2">
                {/* TODO */}
                <Button disabled={!(study.status==='ongoing')} variant="secondary" type="button">
                    Share
                </Button>
                <Button disabled={!userId || !(study.status==='ongoing')} variant="secondary" type="button">
                    Save
                </Button>
                <ApplyButton slug={slug} disabled={!userId || (study.recruitmentStatus === 'closed') || !!existingParticipation} />
            </div>
        </div>
    );
}
 
export default StudyDetailsRecruitmentPage;