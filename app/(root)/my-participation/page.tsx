import { auth } from "@/auth";
import StudyList from "@/components/shared/study/studyList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listMyEndedStudies, listMyInvitationStudies, listMyParticipatingStudies, listMyPendingStudies } from "@/lib/actions/my-participation.action";

const MyParticipationPage = async () => {
  
  const session = await auth();
        
  if (!session?.user?.id) throw new Error('User not found');

 const [participating, invitations, pending, ended] = await Promise.all([
    listMyParticipatingStudies(),
    listMyInvitationStudies(),
    listMyPendingStudies(),
    listMyEndedStudies(),
  ]);
  

  return (
      <div className="flex flex-col items-center my-8">
          <Tabs defaultValue="participating" className="flex flex-col items-center w-full">
              {/* w-[400px] */}
          <TabsList>
              <TabsTrigger value="participating">Participating</TabsTrigger>
               <TabsTrigger value="invitations">Invitations</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="ended">Ended</TabsTrigger>
          </TabsList>
          <TabsContent value="participating" className="w-full p-4">
            <StudyList data={participating} type="participant" />
          </TabsContent>

          <TabsContent value="invitations" className="w-full p-4">
            <StudyList data={invitations} type="explore" />
          </TabsContent>

          <TabsContent value="pending" className="w-full p-4">
            <StudyList data={pending} type="explore" />
          </TabsContent>

          <TabsContent value="ended" className="w-full p-4">
            <StudyList data={ended} type="participant" />
          </TabsContent>
          </Tabs>
      </div>
  );
}
   
  export default MyParticipationPage;