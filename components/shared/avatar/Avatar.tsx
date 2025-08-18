import { AVATAR_ACCESSORY_KEYS, AVATAR_BACKGROUND, AVATAR_STYLE } from "@/lib/constants";
import { toConstOrDefault, toConstOrNull } from "@/lib/utils";
import Image from "next/image";

type Bg = (typeof AVATAR_BACKGROUND)[number];
type Style = (typeof AVATAR_STYLE)[number];
type Acc = (typeof AVATAR_ACCESSORY_KEYS)[number];

const Avatar = ({
    width,
    background, 
    style, 
    accessory
} : {
   width: number;
  background?: string | null;
  style?: string | null;
  accessory?: string | null;
}) => {

    const bg: Bg = toConstOrDefault(AVATAR_BACKGROUND, background, AVATAR_BACKGROUND[0]);
    const st: Style = toConstOrDefault(AVATAR_STYLE, style, AVATAR_STYLE[0]);
    const acc: Acc | null = toConstOrNull(AVATAR_ACCESSORY_KEYS, accessory);

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