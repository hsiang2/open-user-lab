import { Button } from "@/components/ui/button";
import { inviteUserToStudy, listPotentialParticipantsForStudy } from "@/lib/actions/participation.actions";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PotentialParticipantCard } from "./PotentialParticipantsCard";

type PageProps = {
  params: { slug: string };
  searchParams: { cursor?: string; };
};

const PotentialParticipantsPage = async ({ params, searchParams }: PageProps) => {

    const { cursor } = await searchParams; 
    const  { slug } = await params;
    // const onlyEligible = searchParams.onlyEligible !== "false"; // 預設 true
    // const cursor = searchParams.cursor;

    const { items, nextCursor } = await listPotentialParticipantsForStudy({
        slug,
        take: 20,
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
         <div className="my-8 space-y-10">
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
                                item={it as any}
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