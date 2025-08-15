// app/my-participation/[slug]/page.tsx (Server)
import Avatar from "@/components/shared/avatar/Avatar";
import StudyImage from "@/components/shared/image/StudyImage";
import WorkflowParticipant from "@/components/shared/study/WorkflowParticipant";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMyParticipationDetailBySlug } from "@/lib/actions/my-participation.action";
import { AVATAR_ACCESSORY_KEYS, AVATAR_BACKGROUND, AVATAR_STYLE, STUDY_IMAGE } from "@/lib/constants";
import Link from "next/link";

export default async function MyParticipationDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await params
  const data = await getMyParticipationDetailBySlug(slug);

  return (
       <div className="flex flex-col items-center my-8">
            <h1 className="text-title text-center max-w-[800px] mb-8">{data.study.name}</h1>
            <Tabs defaultValue="progress"  className="flex flex-col items-center w-full">
              <TabsList>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="details">Study Details</TabsTrigger>
              </TabsList>

              <TabsContent value="progress" className="mt-4">
                {/* 這裡畫 chips/steps，或用你之前的 SelectedTableClient 簡化版 */}
                <div className="flex flex-col gap-10 my-8">
                  {data.progress.steps.map((st, i) => {
                    const s = data.progress.statuses.find(x => x.stepId === st.id);
                    const done = s?.status === "completed";
                    return (
                      <WorkflowParticipant key={st.id} order={st.order} name={st.name} done={done} noteParticipant={st.noteParticipant} deadline={st.deadline} />
                      // <div
                      //   key={st.id}
                      //   className={`px-3 py-1 rounded-full text-sm border ${
                      //     done ? "bg-green-100 border-green-200" : "bg-muted border-muted-foreground/20"
                      //   }`}
                      //   title={st.noteParticipant ?? undefined}
                      // >
                      //   {i + 1}. {st.name}
                      // </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="details" className="mt-4">
                <div className="flex flex-col flex-center mt-4">
                  <h1 className="text-title mb-4">{data.study.name}</h1>
                  <p className="text-body mb-4">{data.study.recruitment?.description}</p>
                  { data.study.collaborators.map((c) => (
                      <Button variant="ghost" key={c.id} className="mb-16 h-[50px]">
                          <Link href={`/profile/view/${c.user.id}`}>
                              <div  className="flex space-x-4 items-center min-w-0">
                                  <div className="flex-shrink-0">
                                      <Avatar width={50} 
                                      background={c.user.profile?.avatarBg as typeof AVATAR_BACKGROUND[number]} 
                                      style={c.user.profile?.avatarBase as typeof AVATAR_STYLE[number]} 
                                      accessory={c.user.profile?.avatarAccessory as typeof AVATAR_ACCESSORY_KEYS[number] | null} 
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
                              background={data.study.recruitment?.image  as (typeof STUDY_IMAGE)[number] }  
                              styleResearcher= {data.study.recruitment?.avatarBaseResearcher  as (typeof AVATAR_STYLE)[number] } 
                              accessoryResearcher= {data.study.recruitment?.avatarAccessoryResearcher as (typeof AVATAR_ACCESSORY_KEYS)[number] } 
                          />
                      </div>
                      
                      <div className="space-y-8 max-w-xl w-full">
                          <div className="space-y-4">
                              <h2 className="text-subtitle">Participant Criteria</h2>
                              <p className="text-body ">{data.study.recruitment?.criteriaDescription}</p>
                          </div>
                        <div className="space-y-4">
                              <h2 className="text-subtitle">Format</h2>
                              <p className="text-body">{data.study.recruitment?.format.join(' / ')}</p>
                        </div>
                        <div className="space-y-4">
                              <h2 className="text-subtitle">Estimated Duration</h2>
                              <p className="text-body">{data.study.recruitment?.durationMinutes} minutes</p>
                        </div>
                        { data.study.recruitment?.sessionDetail && (
                              <div className="space-y-4">
                                  <h2 className="text-subtitle">Session Details</h2>
                                  <p className="text-body">{data.study.recruitment?.sessionDetail}</p>
                              </div>
                        )
                        }
                        
                        <div className="space-y-4">
                            <h2 className="text-subtitle">Reward</h2>
                            { data.study.recruitment?.reward ? (
                                  <p className="text-body">{data.study.recruitment?.reward}</p>
                              ) : 
                                  <p className="text-body">This study does not offer a reward.</p>
                              }
                        </div>
                      </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
        </div>

  );
}
