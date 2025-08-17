import { auth } from "@/auth";
import StudyList from "@/components/shared/study/studyList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMyStudies } from "@/lib/actions/study.actions";
import Link from "next/link";

const MyStudiesPage = async () => {
  const session = await auth();
        
  if (!session?.user?.id) throw new Error('User not found');

  const studies = await getMyStudies(session.user.id);

  const ongoing = studies.filter(s => s.status === 'ongoing');
  const draft = studies.filter(s => s.status === 'draft');
  const ended = studies.filter(s => s.status === 'ended');
  

  return (
      <div className="flex flex-col items-center my-8">
          <Tabs defaultValue="ongoing" className="flex flex-col items-center w-full">
              {/* w-[400px] */}
          <TabsList>
              <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="ended">Ended</TabsTrigger>
          </TabsList>
          <TabsContent value="ongoing" className="w-full p-4">
              <StudyList data={ongoing as any} type="researcher" />
          </TabsContent>
          <TabsContent value="draft"  className="w-full p-4">
              <StudyList data={draft as any} type="researcher" />
          </TabsContent>
          <TabsContent value="ended" className="w-full p-4">
              <StudyList data={ended as any} type="researcher" />
          </TabsContent>
          </Tabs>
          <Button>
              <Link href='/my-studies/create'>
                  Create Study
              </Link>
           </Button>
      </div>
  );
}
 
export default MyStudiesPage;