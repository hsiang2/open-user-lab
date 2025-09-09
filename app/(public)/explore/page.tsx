
import StudyList from "@/components/shared/study/studyList";
import { listExplore, listExploreMatched } from "@/lib/actions/study.actions";
import ExploreToolbar from "./searchBar";
import Link from "next/link";
import { auth } from "@/auth";

type Search = { q?: string; cursor?: string; matched?: string };

const ExplorePage = async(
    { searchParams }: { searchParams: Promise<Search> }
) => {

    const session = await auth();
      const userId = session?.user?.id?? null;

     const { q, cursor, matched } = await searchParams;
  const onlyMatched = matched === "1";

  const { items, nextCursor } = onlyMatched
    ? await listExploreMatched({ q, cursor, take: 12 })
    : await listExplore({ q, cursor, take: 12 });

  const nextHref = (() => {
    if (!nextCursor) return null;
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (onlyMatched) qs.set("matched", "1");
    qs.set("cursor", nextCursor);
    return `/explore?${qs.toString()}`;
  })();

  return (
    <div className="space-y-6">
      <ExploreToolbar defaultQ={q ?? ""} matched={onlyMatched} userId={userId} />
      <StudyList data={items} type="explore" />
      {nextHref && (
        <div className="flex justify-center">
          <Link href={nextHref} className="btn">Load more</Link>
        </div>
      )}
      {!items.length && <p className="text-center py-12">No studies found.</p>}
    </div>
  );
  }
   
  export default ExplorePage;