import { AppointmentsToolbar } from "@/components/appointments/AppointmentsToolbar";
import { Card, CardContent } from "@/components/ui/card";

export default function AppointmentsPage() {
    return (
        <div className="container mx-auto max-w-6xl py-6 md:py-8 flex flex-col gap-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Upcoming Appointments</h1>
                <p className="text-muted-foreground mt-2 text-sm md:text-base">
                    View and manage your scheduled medical visits.
                </p>
            </div>

            <Card className="border-border/80 shadow-sm">
                <CardContent className="p-4 md:p-6 flex flex-col gap-6">
                    <AppointmentsToolbar />
                    {/* table */}
                </CardContent>
            </Card>
        </div>
    );
}
