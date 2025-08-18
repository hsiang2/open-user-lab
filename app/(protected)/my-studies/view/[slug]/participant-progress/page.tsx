
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InvitedParticipants from "./InvitedParticipants";
import AppliedParticipants from "./AppliedParticipants";
import SelectedParticipants from "./SelectedParticipants";
import SortSelect from "./SortSelect";
import { PageProps } from "@/types/next-helper";


// type PageProps = {
//   params: { slug: string };
//   searchParams: Promise<{ sort?: string }>;
// };

const ParticipantProgressPage = async (
     { params, searchParams }: PageProps<{ slug: string }, { sort?: string }>
//     { params, searchParams }: {

//   params: { slug: string };
//   searchParams: Promise<{ sort?: string }>;
// }
) => {

    const { slug } = await params;
    const { sort } = await searchParams;

  return (
      <div className="flex flex-col items-center my-8">
          <Tabs defaultValue="selected" className="flex flex-col items-center w-full">
              {/* w-[400px] */}
          <TabsList>
              <TabsTrigger value="selected">Selected</TabsTrigger>
              <TabsTrigger value="applied">Applied</TabsTrigger>
              <TabsTrigger value="invited">Invited</TabsTrigger>
            
          </TabsList>
          <TabsContent value="selected" className="w-full p-4">
                <SelectedParticipants slug={slug} />
          </TabsContent>
          <TabsContent value="applied"  className="w-full p-4">
                 <div className="space-y-4">
                    <div className="flex justify-end">
                        <SortSelect value={sort} />
                    </div>
                    <AppliedParticipants slug={slug} sort={sort} />
                    </div>
          </TabsContent>
          <TabsContent value="invited" className="w-full p-4">
                <InvitedParticipants slug={slug} />
          </TabsContent>
          </Tabs>
      </div>
  );
}
 
export default ParticipantProgressPage;