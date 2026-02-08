import { NavigationBar } from "@/components/landing/navbar";

export default function LandingLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <NavigationBar />
            {children}
        </>
    );
}
