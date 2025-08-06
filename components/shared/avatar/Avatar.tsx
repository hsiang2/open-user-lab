import { AVATAR_ACCESSORY, AVATAR_ACCESSORY_KEYS, AVATAR_BACKGROUND, AVATAR_STYLE } from "@/lib/constants";
import Image from "next/image";

const Avatar = ({
    width,
    background = AVATAR_BACKGROUND[0], 
    style = AVATAR_STYLE[0], 
    accessory = null
} : {
    width: number; 
    background: (typeof AVATAR_BACKGROUND)[number]; 
    style: (typeof AVATAR_STYLE)[number]; 
    accessory?:(typeof AVATAR_ACCESSORY_KEYS)[number] | null;
}) => {
    return (  
        <div className="relative" style={{ width, height: width }}>
            <Image
                src={`/images/avatars/background/${background}.png`}
                alt='avatar image'
                width={width}
                height={width}
                className="absolute rounded-full object-cover object-center"
                // className='min-h-[300px] object-cover object-center'
            />
            <Image
                src={`/images/avatars/style/${style}.png`}
                alt='avatar image'
                width={width}
                height={width}
                className="absolute rounded-full object-cover object-center"
                // className='min-h-[300px] object-cover object-center'
            />
            {accessory && 
                <Image
                    src={`/images/avatars/accessory/${accessory}.png`}
                    alt='avatar image'
                    width={width}
                    height={width}
                    className="absolute rounded-full object-cover object-center"
                    // className='min-h-[300px] object-cover object-center'
                />
            }
        </div>
    );
}
 
export default Avatar;