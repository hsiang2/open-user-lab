import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import { Metadata } from 'next';
  import Link from 'next/link';
  import { auth } from '@/auth';
  import { redirect } from 'next/navigation';
import SignUpForm from './SignUpForm';

  
  export const metadata: Metadata = {
    title: 'Sign Up',
  };
  
  const SignUpPage = async () => {
  
    const session = await auth();

    if (session) {
        return redirect('/onboarding/avatar');
    }
  
    return (
      <div className='w-full max-w-md mx-auto'>
        <Card>
          <CardHeader className='space-y-4'>
            <Link href='/' className='flex-center'>
            </Link>
            <CardTitle className='text-center'>Sign Up</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <SignUpForm />
          </CardContent>
        </Card>
      </div>
    );
  };
  
  export default SignUpPage;