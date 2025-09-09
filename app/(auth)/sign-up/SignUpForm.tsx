'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpDefaultValues } from "@/lib/constants";
import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { signUpUser } from "@/lib/actions/user.action";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const SignUpForm = () => {
    const [data, action] = useActionState(signUpUser, {
        success: false,
        message: ''
    })

    const [isResearcher, setIsResearcher] = useState("true");

    const SignUpButton = () => {
        const { pending } = useFormStatus();

        return (
            <Button disabled={pending} className="w-full">
                {pending ? 'Submitting...' : 'Sign Up'}
            </Button>
        )
    }
    return ( 
        <form action={action}>
            <div className='space-y-6'>
                <div>
                    <Label htmlFor='name'>Name</Label>
                    <Input
                    id='name'
                    name='name'
                    type='text'
                    autoComplete='name'
                    defaultValue={signUpDefaultValues.name}
                    />
                </div>
                <div>
                    <Label htmlFor='email'>Email</Label>
                    <Input
                    id='email'
                    name='email'
                    type='text'
                    autoComplete='email'
                    defaultValue={signUpDefaultValues.email}
                    />
                </div>
                <div>
                    <Label htmlFor='password'>Password</Label>
                    <Input
                    id='password'
                    name='password'
                    type='password'
                    required
                    autoComplete='password'
                    defaultValue={signUpDefaultValues.password}
                    />
                </div>
                <div>
                    <Label htmlFor='confirmPassword'>Confirm Password</Label>
                    <Input
                    id='confirmPassword'
                    name='confirmPassword'
                    type='password'
                    required
                    autoComplete='confirmPassword'
                    defaultValue={signUpDefaultValues.confirmPassword}
                    />
                </div>
                <div>
                    <Label htmlFor='isResearcher'>Are you a researcher?</Label>
                    <RadioGroup  
                        name="isResearcher" 
                        defaultValue="true"
                        onValueChange={setIsResearcher}
                    >
                        <div className="flex items-center gap-3">
                            <RadioGroupItem value="true" id="r1" />
                            <Label htmlFor="r1">Yes</Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <RadioGroupItem value="false" id="r2" />
                            <Label htmlFor="r2">No</Label>
                        </div>
                    </RadioGroup>
                </div>
                {isResearcher === "true" && (
                    <div>
                        <Label htmlFor='institution'>Institution</Label>
                        <Input
                        id='institution'
                        name='institution'
                        type='text'
                        autoComplete='institution'
                        defaultValue={signUpDefaultValues.institution}
                        />
                    </div>
                )}
               
                <div>
                    <SignUpButton />
                </div>
        
                {data && !data.success && (
                    <div className='text-center text-destructive'>{data.message}</div>
                )}
        
                <div className='text-sm text-center text-muted-foreground'>
                    Already have an account?{' '}
                    <Link href='/sign-in' target='_self' className='link'>
                        Sign In
                    </Link>
                </div>
            </div>
      </form>
    );
}
 
export default SignUpForm;