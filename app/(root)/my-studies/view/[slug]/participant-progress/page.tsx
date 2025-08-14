
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InvitedParticipants from "./InvitedParticipants";
import { useStudy } from "../StudyProviderClient";
import AppliedParticipants from "./AppliedParticipants";
import SelectedParticipants from "./SelectedParticipants";

const ParticipantProgressPage = async ({params}: {params: { slug: string }}) => {

    const {slug} = await params;

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
                <AppliedParticipants slug={slug} />
          </TabsContent>
          <TabsContent value="invited" className="w-full p-4">
                <InvitedParticipants slug={slug} />
          </TabsContent>
          </Tabs>
      </div>
  );
}
 
export default ParticipantProgressPage;