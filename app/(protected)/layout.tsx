import { auth } from "@/auth";
import Footer from "@/components/footer";
import Header from "@/components/shared/header/Header";
import { redirect } from "next/navigation";


export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session?.user?.id) redirect("/explore"); 

  return (
    <div className="flex h-screen flex-col">
        <Header />
            <main className="flex-1 wrapper">{children}</main>
        <Footer />
    </div>

  );
}
