import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getCustomerSession } from "@/lib/customerAuth";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getCustomerSession();

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user ? { name: user.name, email: user.email } : null} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
