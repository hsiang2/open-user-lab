'use client'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { userProfileSchema } from "@/lib/validators";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarIcon, Loader } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { BACKGROUND_CATEGORIES, GENDERS, LANGUAGES, REGIONS } from "@/lib/constants";
import { updateUserProfile } from "@/lib/actions/user.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MultipleSelector, { Option } from "@/components/ui/multipleSelector";
import { Profile } from "@/types";

export const languageOptions: Option[] = LANGUAGES.map((item) => ({
    label: item,
    value: item,
}));

export const backgroundOptions: Option[] = BACKGROUND_CATEGORIES.map((item) => ({
    label: item,
    value: item,
}));

const ProfileForm = ({mode, profile, id}: {mode:'onboarding' | 'edit'; profile?: Profile; id?: string}) => {
    const router = useRouter();
    const [showOtherGender, setShowOtherGender] = useState(false);
    const [showOtherLanguage, setShowOtherLanguage] = useState(false);
    const [showOtherBackground, setShowOtherBackground] = useState(false);
       
    // 1. Define your form.
    const form = useForm({
        resolver: zodResolver(userProfileSchema),
        defaultValues: {
            birth: undefined,
            gender: undefined,
            genderOther: '',
            language: [],
            languageOther: '',
            website: '',
            region: undefined,
            background: [],
            backgroundOther: '',
        },
    })
    
    // 2. Define a submit handler.
    const onSubmit = async (values: Profile) => {
        
        const trimmedGenderOther = values.genderOther?.trim();
        const trimmedLanguageOther = values.languageOther?.trim();
        const trimmedBackgroundOther = values.backgroundOther?.trim();
        const trimmedWebsite = values.website?.trim();

        const payload = {
        ...values,

        genderOther:
            values.gender === "Other" && trimmedGenderOther
            ? trimmedGenderOther
            : null,

        languageOther:
            values.language?.includes("Other") && trimmedLanguageOther
            ? trimmedLanguageOther
            : null,

        backgroundOther:
            values.background?.includes("Other") && trimmedBackgroundOther
            ? trimmedBackgroundOther
            : null,

        website:
            trimmedWebsite === "" ? undefined : trimmedWebsite,
        };

        const res = await updateUserProfile(payload);

        if (!res.success) {
            toast.error(res.message,);
            return;
        }

        if (mode === 'onboarding') {
                router.push('/');
        } else {
            router.push(`/profile/view/${id}`);
        }
        
    }

    useEffect(() => {
    if (mode === 'edit' && profile) {
        form.reset({
        birth: profile.birth ?? undefined,
        gender: profile.gender ?? undefined,
        genderOther: profile.genderOther ?? '',
        language: profile.language ?? [],
        languageOther: profile.languageOther ?? '',
        website: profile.website ?? '',
        region: profile.region ?? undefined,
        background: profile.background ?? [],
        backgroundOther: profile.backgroundOther ?? '',
        });

         setShowOtherGender(profile.gender === "Other");
        setShowOtherLanguage(profile.language?.includes("Other") ?? false);
        setShowOtherBackground(profile.background?.includes("Other") ?? false);
    }
    console.log(profile);
    }, [mode, profile]);


    return (  
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-col flex-center max-w-[1000px]">
                <div className="flex flex-col sm:flex-row sm:flex-center mb-20 space-x-25">
                    <div className="space-y-8 mb-8 sm:mb-0 w-full">
                        <FormField
                            control={form.control}
                            name="birth"
                            render={({ field }) => (
                                <FormItem className="flex flex-col form-item">
                                <FormLabel>Date of birth</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                        >
                                        {field.value ? (
                                            format(field.value as Date, "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value as Date | undefined}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                        date > new Date() || date < new Date("1900-01-01")
                                        }
                                        captionLayout="dropdown"
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormDescription>
                                    Your date of birth is used to calculate your age.
                                </FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem className="form-item">
                                <FormLabel>Gender</FormLabel>
                                <Select 
                                    // onValueChange={field.onChange} defaultValue={field.value}
                                    // value={field.value ?? ""}
                                    // onValueChange={(value) => {
                                    //     field.onChange(value);
                                    //     setShowOtherGender(value === "Other");
                                    // }}
                                   defaultValue={profile?.gender as typeof GENDERS[number]}
                                    onValueChange={(value) => {
                                        form.setValue("gender", value as typeof GENDERS[number]);
                                        setShowOtherGender(value === "Other");

                                        // if (value !== "Other") {
                                        //     form.setValue("genderOther", ""); 
                                        // }
                                    }}
                                    
                                >
                                    <FormControl className="w-full">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your gender" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {GENDERS.map((gender) => (
                                            <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {/* <FormDescription>
                                    You can manage email addresses in your{" "}
                                </FormDescription> */}
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        {showOtherGender && (
                            <FormField
                                control={form.control}
                                name="genderOther"
                                render={({ field }) => (
                                    <FormItem className="mt-2 form-item">
                                        <FormLabel>Please describe your gender</FormLabel>
                                        <FormControl className="w-full">
                                            <Input placeholder="Your gender" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        <FormField
                            control={form.control}
                            name="region"
                            render={({ field }) => (
                                <FormItem className="form-item">
                                <FormLabel>Region</FormLabel>
                                <Select 
                                    onValueChange={field.onChange} defaultValue={field.value}
                                >
                                    <FormControl className="w-full">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your region" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {REGIONS.map((region) => (
                                            <SelectItem key={region} value={region}>{region}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {/* <FormDescription>
                                    You can manage email addresses in your{" "}
                                </FormDescription> */}
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="space-y-8 w-full">
                        <FormField
                            control={form.control}
                            name="language"
                            render={({ field }) => (
                                <FormItem className="form-item">
                                <FormLabel>Language Spoken</FormLabel>
                                <FormControl className="w-full">
                                    <MultipleSelector
                                        value={languageOptions.filter(opt =>  (field.value as string[])?.includes(opt.value))}
                                        onChange={(selected: Option[]) => {
                                            // const values = selected.map(opt => opt.value);
                                            let values = selected.map(opt => opt.value);

                                            const includesPreferNot = values.includes("Prefer not to say");

                                            if (includesPreferNot && values.length > 1) {
                                                const lastSelected = selected[selected.length - 1].value;
                                                if (lastSelected === "Prefer not to say") {
                                                values = ["Prefer not to say"];
                                                toast.info("Other options have been cleared because you selected 'Prefer not to say'.");
                                                } else {
                                                values = values.filter(v => v !== "Prefer not to say");
                                                toast.info("'Prefer not to say' has been removed because you selected other options.");
                                                }
                                            }                                           

                                            field.onChange(values);
                                            setShowOtherLanguage(values.includes("Other"));
                                            // if (!values.includes("Other")) {
                                            //     form.setValue("languageOther", "");
                                            // }
                                        }}
                                        // {...field}
                                        defaultOptions={languageOptions}
                                        placeholder="Select your languages"
                                        emptyIndicator={
                                            <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                            no results found.
                                            </p>
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        {showOtherLanguage && (
                            <FormField
                                control={form.control}
                                name="languageOther"
                                render={({ field }) => (
                                    <FormItem className="form-item">
                                        <FormLabel>Other language (please specify)</FormLabel>
                                        <FormControl className="w-full">
                                            <Input placeholder="Enter language" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        <FormField
                            control={form.control}
                            name="background"
                            render={({ field }) => (
                                <FormItem className="form-item">
                                <FormLabel>Professional or Academic Background</FormLabel>
                                <FormControl className="w-full">
                                    <MultipleSelector
                                        value={backgroundOptions.filter(opt =>  (field.value as string[])?.includes(opt.value))}
                                        onChange={(selected: Option[]) => {
                                            // const values = selected.map(opt => opt.value);
                                            let values = selected.map(opt => opt.value);

                                            const includesPreferNot = values.includes("Prefer not to say");

                                            if (includesPreferNot && values.length > 1) {
                                                const lastSelected = selected[selected.length - 1].value;
                                                if (lastSelected === "Prefer not to say") {
                                                values = ["Prefer not to say"];
                                                toast.info("Other options have been cleared because you selected 'Prefer not to say'.");
                                                } else {
                                                values = values.filter(v => v !== "Prefer not to say");
                                                toast.info("'Prefer not to say' has been removed because you selected other options.");
                                                }
                                            }                                           

                                            field.onChange(values);
                                            setShowOtherBackground(values.includes("Other"));
                                            // if (!values.includes("Other")) {
                                            //     form.setValue("backgroundOther", "");
                                            // }
                                        }}
                                        // {...field}
                                        defaultOptions={backgroundOptions}
                                        placeholder="Select your background"
                                        emptyIndicator={
                                            <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                            no results found.
                                            </p>
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        {showOtherBackground && (
                            <FormField
                                control={form.control}
                                name="backgroundOther"
                                render={({ field }) => (
                                    <FormItem className="form-item">
                                        <FormLabel>Other background (please specify)</FormLabel>
                                        <FormControl className="w-full">
                                            <Input placeholder="Enter field" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        <FormField
                            control={form.control}
                            name="website"
                            render={({ field }) => (
                                <FormItem className="form-item">
                                <FormLabel>Personal Website</FormLabel>
                                <FormControl className="w-full">
                                    <Input placeholder="e.g. https://www.linkedin.com/in/your-name" {...field} />
                                </FormControl>
                                {/* <FormDescription>
                                    This is your public display name.
                                </FormDescription> */}
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
                
                
                
                <Button 
                    type="submit"
                    disabled={form.formState.isSubmitting}
                >
                     { mode === 'onboarding' ? (
                        <>
                            {form.formState.isSubmitting ? (
                                <Loader className='w-4 h-4 animate-spin' />
                                ) : (
                                <ArrowRight className='w-4 h-4' />
                                )}{' '}
                            Save and Continue
                        </>
                    ) : (
                        <>
                            {form.formState.isSubmitting && (
                                <>
                                    <Loader className='w-4 h-4 animate-spin' />{' '}
                                </>
                            )}
                            Save
                        </>
                    )}
                    
                </Button>
            </form>
        </Form>
    );
}
 
export default ProfileForm;