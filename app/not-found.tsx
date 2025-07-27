'use client'

import { Button } from "@/components/ui/button";

const NotFoundPage = () => {
    return ( 
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-title mb-7">Page Not Found</h1>
            <Button 
                onClick={() => (window.location.href = '/')}
            >
                Back To Home
            </Button>
        </div>
    );
}
 
export default NotFoundPage;