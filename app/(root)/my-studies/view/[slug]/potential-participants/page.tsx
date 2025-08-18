import { Button } from "@/components/ui/button";
import { inviteUserToStudy, listPotentialParticipantsForStudy } from "@/lib/actions/participation.actions";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PotentialParticipantCard } from "./PotentialParticipantsCard";
import { prisma } from "@/db/prisma";

type PageProps = {
  params: { slug: string };
  searchParams: { cursor?: string; };
};

const PotentialParticipantsPage = async ({ params, searchParams }: PageProps) => {

    const { cursor } = await searchParams; 
    const  { slug } = await params;
    // const onlyEligible = searchParams.onlyEligible !== "false"; // 預設 true
    // const cursor = searchParams.cursor;

    const study = await prisma.study.findUnique({
        where: { slug },
        select: { id:true, status:true, recruitmentStatus:true },
    });
    if (!study) throw new Error("Study not found");

    const canInvite= study.status === "ongoing" && study.recruitmentStatus === "open"

    const { items, nextCursor } = await listPotentialParticipantsForStudy({
        slug,
        take: 9,
        cursor,
    });

    async function inviteAction(formData: FormData) {
        "use server";
        const uid = String(formData.get("userId"));
        await inviteUserToStudy(slug, uid);
        // 回到當前頁
        redirect(`/my-studies/view/${slug}/potential-participants${cursor ? `?cursor=${cursor}` : ""}`);
    }


    return (  
         <div className="relative my-8 space-y-10">

            {!canInvite && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl
                                backdrop-blur-[2px] bg-background/60 ">
                <div className="max-w-md text-center space-y-3 p-6 rounded-lg bg-accent shadow">
                    <div className="text-lg font-semibold">Invitations are disabled</div>
                    <p className="text-sm text-muted-foreground">
                    {study.status !== "ongoing"
                        ? "This study is still a draft. Go live to start inviting participants."
                        : "Recruitment is closed. Reopen recruitment to invite participants."}
                    </p>
                    <div className="flex gap-2 justify-center pt-2">
                    {study.status !== "ongoing" ? (
                        <Link href={`/my-studies/view/${slug}/overview`}>
                        <Button>Go live</Button>
                        </Link>
                    ) : (
                        <Link href={`/my-studies/view/${slug}/overview`}>
                        <Button>Reopen recruitment</Button>
                        </Link>
                    )}
                    </div>
                </div>
                </div>
            )}

            {/* <div className="flex justify-end">
                <Link
                    href={`?onlyEligible=${!onlyEligible}`}
                    className="text-sm underline"
                >
                    {onlyEligible ? "Show near‑match" : "Show only eligible"}
                </Link>
            </div> */}
            { items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {items.map((it) => (
                        <form key={it.userId} action={inviteAction}>
                            <input type="hidden" name="userId" value={it.userId} />
                            <PotentialParticipantCard
                                item={it}
                                // onInvite={() => {}}
                                // onSave={() => {}}
                                // onView={() => {}}
                            />
                        </form>
                    ))}
                </div>
            ) : (
                <div className="flex flex-center">
                    <p>No candidates found</p>
                </div>

            )}
            
            <div className="flex justify-center">
                {nextCursor ? (
                <Link
                    href={`?cursor=${nextCursor}`}
                >
                    <Button variant="secondary">Load more</Button>
                </Link>
                ) : (
                <span className="text-sm text-muted-foreground">No more results</span>
                )}
            </div>
        </div>
    );
}
 
export default PotentialParticipantsPage;