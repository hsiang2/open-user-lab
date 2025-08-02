'use client';
import { Button } from "@/components/ui/button";
import { updateUserAvatar } from "@/lib/actions/user.action";
import { AVATAR_ACCESSORY, AVATAR_BACKGROUND, AVATAR_STYLE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ArrowRight, Loader, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

const AvatarForm = ({isResearcher}: {isResearcher: boolean}) => {
    const userRole = isResearcher ? 'researcher' : 'participant';
    const accessoryList =  AVATAR_ACCESSORY.filter(
        (item) => item.role === userRole || item.role === "any"
      );
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [background, setBackground] = useState<typeof AVATAR_BACKGROUND[number]>(AVATAR_BACKGROUND[0]);
    const [style, setStyle] = useState<typeof AVATAR_STYLE[number]>(AVATAR_STYLE[0]);
    const [accessory, setAccessory] = useState<typeof accessoryList[number]["key"] | null>(null);

    const onSubmit = () => {
        startTransition(async () => {
            const res = await updateUserAvatar({
                avatarBase: style,
                avatarBg: background,
                avatarAccessory: accessory,
            });

            if (!res.success) {
                toast.error(res.message,);
                return;
            }

            router.push('/onboarding/profile');
        })
    }

    return (  
        <div className="flex flex-col justify-center items-center">
            <h1 className="text-title mb-20">Choose your avatar</h1>
            <div className="flex flex-col items-center space-x-15 mb-20 sm:flex-row"
            // className='space-y-4'
            >
                <div className="relative w-[300px] h-[300px]">
                    <Image
                        src={`/images/avatars/background/${background}.png`}
                        alt='avatar image'
                        width={300}
                        height={300}
                        className="absolute rounded-full object-cover object-center"
                        // className='min-h-[300px] object-cover object-center'
                    />
                    <Image
                        src={`/images/avatars/style/${style}.png`}
                        alt='avatar image'
                        width={300}
                        height={300}
                        className="absolute rounded-full object-cover object-center"
                        // className='min-h-[300px] object-cover object-center'
                    />
                    {accessory && 
                    <Image
                        src={`/images/avatars/accessory/${accessory}.png`}
                        alt='avatar image'
                        width={300}
                        height={300}
                        className="absolute rounded-full object-cover object-center"
                        // className='min-h-[300px] object-cover object-center'
                    />
                    }
                </div>
                <div>
                    <h2 className="text-subtitle mb-5">Background</h2>
                    <div className='flex  mb-8'>
                        {AVATAR_BACKGROUND.map((image) => (
                        <div
                            key={image}
                            onClick={() => setBackground(image)}
                            className={cn(
                            'w-[60px] h-[60px] rounded-full border-[3px] mr-2 cursor-pointer hover:border-[#4A877E]',
                            background === image && ' border-[#4A877E]'
                            )}
                        >
                            <Image 
                                src={`/images/avatars/background/${image}.png`} alt={image} width={60} height={60} 
                                className="rounded-full object-cover object-center"
                            />
                        </div>
                        ))}
                    </div>

                    <h2 className="text-subtitle mb-5">Style</h2>
                    <div className='flex mb-8'>
                        {AVATAR_STYLE.map((image) => (
                        <div
                            key={image}
                            onClick={() => setStyle(image)}
                            className={cn(
                            'w-[110px] h-[110px] rounded-full border-[3px] mr-2 cursor-pointer hover:border-[#4A877E]',
                            style === image && ' border-[#4A877E]'
                            )}
                        >
                            <Image 
                                src={`/images/avatars/style/${image}.png`} alt={image} width={110} height={110} 
                                className="rounded-full object-cover object-center"
                            />
                        </div>
                        ))}
                    </div>

                    <h2 className="text-subtitle mb-5">Accessory</h2>
                    <div className='flex'>
                        {accessoryList.map((image) => {
                           
                            if(image.key) {
                                return (
                                        <div
                                            key={image.label}
                                            onClick={() => setAccessory(image.key)}
                                            className={cn(
                                            'w-[110px] h-[110px] rounded-full border-[3px] mr-2 cursor-pointer hover:border-[#4A877E] flex-col flex-center',
                                            accessory === image.key && ' border-[#4A877E]'
                                            )}
                                        >
                                            <Image 
                                                src={`/images/avatars/accessory/${image.key}.png`} alt={image.label} width={60} height={60} 
                                                className="rounded-full object-cover object-center"
                                            />
                                            <p className="text-caption">{image.label}</p>
                                        </div>

                                )
                            } else {
                                return (
                                    <div
                                    key={image.label}
                                    onClick={() => setAccessory(null)}
                                    className={cn(
                                        'w-[110px] h-[110px] rounded-full border-[3px] mr-2 cursor-pointer hover:border-[#4A877E] flex-col flex-center',
                                        !accessory && ' border-[#4A877E]'
                                    )}
                                >
                                    <X width={60} height={60} />
                                    <p className="text-caption">{image.label}</p>
                                </div>
                                )
                            }
                        })}
                    </div>
                </div>
            </div>
            <Button
                className="w-fit"
                // className='w-full'
                disabled={isPending}
                onClick={onSubmit}
              >
                {isPending ? (
                  <Loader className='w-4 h-4 animate-spin' />
                ) : (
                  <ArrowRight className='w-4 h-4' />
                )}{' '}
                Save and Continue
            </Button>
        </div>
    );
}
 
export default AvatarForm;