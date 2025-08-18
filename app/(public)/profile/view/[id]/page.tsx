import { auth } from "@/auth";
import Avatar from "@/components/shared/avatar/Avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserById, getUserProfileByUserId } from "@/lib/actions/user.action";
import { AvatarInfo } from "@/types";
import { TabsContent } from "@radix-ui/react-tabs";
import { differenceInYears } from "date-fns";
import { Landmark, Mail } from "lucide-react";
import Link from "next/link";
import Wall from "./Wall";
import { getMyStudies, getThankYouCertificates } from "@/lib/actions/study.actions";
import StudyList from "@/components/shared/study/studyList";
import { PageParams } from "@/types/next-helper";

const ProfilePage = async ({ params }: PageParams<{ id: string }>) => {
    const { id } = await params;
    const session = await auth();
    const isCurrentUser = session?.user?.id === id;
    const user = await getUserById(id);
    const profile = await getUserProfileByUserId(id);
    const certificates = await getThankYouCertificates(id);
    const avatarInfo = {
        avatarBase: profile?.avatarBase,
        avatarBg: profile?.avatarBg,
        avatarAccessory: profile?.avatarAccessory
    } as AvatarInfo

    let processedLanguage: string[] = []
    const langOther = profile?.languageOther?.trim();
    let processedBackground: string[] = []
    const bgOther = profile?.backgroundOther?.trim();

    if (profile?.language.includes("Other") && langOther) {
         processedLanguage = profile.language.map(item =>
            item === "Other" ? langOther : item
        );
    }
    if (profile?.background.includes("Other") && bgOther) {
         processedBackground = profile.background.map(item =>
            item === "Other" ? bgOther : item
        );
    } 

     const rawStudies = await getMyStudies(id);
    
    const studies = rawStudies.filter(s => s.status !== 'draft');


    return (
        <div className="my-8">
            <div className="p-4 flex flex-col items-center space-y-10 justify-center md:flex-row md:space-x-8 md:space-y-0 md:items-start">
                <div className="flex flex-col items-center md:flex-row md:space-x-8 md:items-start basis-0 grow min-w-0">
                    <Avatar width={175} background={avatarInfo.avatarBg} style={avatarInfo.avatarBase} accessory={avatarInfo.avatarAccessory} />
                    <div className="flex flex-col basis-0 grow items-center md:items-start min-w-0">
                        
                        <h1 className="text-title text-center mb-3 mt-3 md:mt-0 md:text-start wrap-break-word w-full max-w-full ">{user.name}</h1>
                        <div className="flex items-center space-x-1 mb-2">
                            <Mail size={16} className="shrink-0" />
                            <p className="text-body break-all">{user.email}</p>
                        </div>
                        
                        { user.institution && 
                            <div className="flex items-center space-x-1">
                                <Landmark size={16} className="shrink-0" />
                                <p className="text-body break-all">{user.institution}</p>
                            </div>
                        }
                        { isCurrentUser &&
                            <div className="flex flex-wrap mt-5 space-x-2 space-y-2">
                                <Button variant="secondary">
                                    <Link href='/profile/edit-profile'>
                                        Edit Profile
                                    </Link>
                                </Button>
                                <Button variant="secondary">
                                    <Link href='/profile/edit-avatar'>
                                        Edit Avatar
                                    </Link>
                                </Button>
                            </div>
                        }
                    </div>
                </div>
                
                <div className="flex space-x-8 basis-0 grow min-w-0">
                    <div className="flex flex-col space-y-5 basis-0 grow min-w-0">
                        <div className="space-y-2">
                            <h2 className="text-subtitle">Age</h2>
                            {
                                profile?.birth ?
                                <p className="text-body">{differenceInYears(new Date(), profile.birth)}</p> 
                                :<p className="text-body">-</p>
                            }
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-subtitle">Gender</h2>
                            {
                                profile?.gender ?
                                <p className="text-body">{
                                    profile.gender !== "Other" ? (<>{profile.gender}</>) :(<>{profile.genderOther}</>)
                                }</p> 
                                :<p className="text-body">-</p>
                            }
                        </div>
                       
                        <div className="space-y-2">
                            <h2 className="text-subtitle">Region</h2>
                            {
                                profile?.region ?
                                <p className="text-body">{profile.region}</p> 
                                :<p className="text-body">-</p>
                            }
                        </div>
                         
                    </div>
                    <div className="flex flex-col space-y-5 basis-0 grow min-w-0">
                        <div className="space-y-2">
                            <h2 className="text-subtitle">Language Spoken</h2>
                            {
                                profile?.language.length ?
                                <p className="text-body">
                                    {
                                        processedLanguage.length ? (
                                           <>{processedLanguage.join(", ")}</> 
                                        ) : (
                                            <>{profile.language.join(", ")}</>
                                        )
                                    }
                                </p> 
                                :<p className="text-body">-</p>
                            }
                        </div>
                       
                        <div className="space-y-2">
                            <h2 className="text-subtitle">Background</h2>
                            {
                                profile?.background.length ?
                                <p className="text-body">
                                     {
                                        processedBackground.length ? (
                                           <>{processedBackground.join(", ")}</> 
                                        ) : (
                                            <>{profile.background.join(", ")}</>
                                        )
                                    }
                                </p> 
                                :<p className="text-body">-</p>
                            }
                        </div>
                        
                        <div className="space-y-2">
                            <h2 className="text-subtitle">Personal website</h2>
                            {
                                profile?.website ?
                                <p className="text-body break-all">{profile.website}</p> 
                                :<p className="text-body">-</p>
                            }
                        </div>
                       
                    </div>
                </div>
                
            </div>
            <div className="flex flex-col items-center mt-18 ">
                <Tabs defaultValue="participation" className="flex flex-col items-center w-full">
                    {/* w-[400px] */}
                <TabsList>
                    <TabsTrigger value="participation">Participation</TabsTrigger>
                    {
                        user.isResearcher && (
                            <TabsTrigger value="studies">Studies</TabsTrigger>
                        )
                    }
                </TabsList>
                <TabsContent value="participation" className="w-full p-4">
                    <Wall certificates={certificates} />
                </TabsContent>
                <TabsContent value="studies" className="w-full p-4">
                    <div className="bg-[#FCF2E0] rounded-md w-full min-h-[200px] p-8">
                        <StudyList data={studies} type="explore" />
                    </div>
                    
                </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
 
export default ProfilePage;