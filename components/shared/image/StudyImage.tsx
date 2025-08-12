import { AVATAR_ACCESSORY, AVATAR_ACCESSORY_KEYS, AVATAR_BACKGROUND, AVATAR_STYLE, STUDY_IMAGE } from "@/lib/constants";
import Image from "next/image";

const BASE = 400;

const StudyImage = ({
    width,
    background = STUDY_IMAGE[0], 
    styleResearcher = AVATAR_STYLE[0], 
    accessoryResearcher = null,
    styleParticipant = null, 
    accessoryParticipant = null
} : {
    width: number; 
    background: (typeof STUDY_IMAGE)[number]; 
    styleResearcher: (typeof AVATAR_STYLE)[number]; 
    accessoryResearcher:(typeof AVATAR_ACCESSORY_KEYS)[number] | null;
    styleParticipant?: (typeof AVATAR_STYLE)[number]| null; 
    accessoryParticipant?: (typeof AVATAR_ACCESSORY_KEYS)[number] | null
}) => {
    const scale = width / BASE;
    
    return (  
        <div style={{ width, height: width }}>
              <div 
                className="relative" 
                style={{ width: BASE, height: BASE, transform: `scale(${scale})`,
                transformOrigin: "top left",}}
                
            >
                <Image
                    src={`/images/study/${background}.png`}
                    alt='bg'
                    width={400}
                    height={400}
                    className="absolute rounded-md object-cover object-center"
                    // className='min-h-[300px] object-cover object-center'
                />
                <Image
                    src={`/images/avatars/style/${styleResearcher}.png`}
                    alt='avatar image'
                    width={266}
                    height={266}
                    className="absolute object-cover object-center scale-x-[-1] bottom-20 -left-5"
                    // className='min-h-[300px] object-cover object-center'
                />
                {accessoryResearcher && 
                    <Image
                        src={`/images/avatars/accessory/${accessoryResearcher}.png`}
                        alt='avatar image'
                        width={266}
                        height={266}
                        className="absolute object-cover object-center scale-x-[-1] bottom-20 -left-5"
                    />
                }
                {styleParticipant &&
                    <Image
                        src={`/images/avatars/style/${styleParticipant}.png`}
                        alt='avatar image'
                        width={266}
                        height={266}
                        className="absolute object-cover object-center left-40 bottom-20"
                    />
                }
                {accessoryParticipant && 
                    <Image
                        src={`/images/avatars/accessory/${accessoryParticipant}.png`}
                        alt='avatar image'
                        width={266}
                        height={266}
                        className="absolute object-cover object-center left-40 bottom-20"
                        // className='min-h-[300px] object-cover object-center'
                    />
                }
            </div>

        </div>
       
    );
}
 
export default StudyImage;