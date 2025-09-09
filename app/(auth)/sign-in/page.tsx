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
import SignInForm from './signInForm';

  
  export const metadata: Metadata = {
    title: 'Sign In',
  };
  
  const SignInPage = async (props: {
    searchParams: Promise<{
      callbackUrl: string;
    }>;
  }) => {
    const { callbackUrl } = await props.searchParams;
  
    const session = await auth();
  
    if (session) {
      return redirect(callbackUrl || '/');
    }
  
    return (
      <div className='w-full max-w-md mx-auto'>
        <Card>
          <CardHeader className='space-y-4'>
            <Link href='/' className='flex-center'>
            </Link>
            <CardTitle className='text-center'>Sign In</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <SignInForm />
          </CardContent>
        </Card>
      </div>
    );
  };
  
  export default SignInPage;