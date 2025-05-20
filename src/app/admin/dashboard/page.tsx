
// This is a placeholder for the admin dashboard page.
// You can build out this page with admin-specific functionality.

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { LayoutDashboard, Users, FileText, LogOut } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 md:p-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <LayoutDashboard className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="font-orbitron text-3xl text-primary">Admin Dashboard</CardTitle>
          <p className="text-muted-foreground">Welcome, Administrator!</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-foreground">
            This is a placeholder page for the admin dashboard.
            You can add administrative functionalities here.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button variant="outline" className="w-full justify-start">
              <Users className="mr-2 h-5 w-5" /> Manage Users
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-5 w-5" /> View Submissions
            </Button>
          </div>
          <Button asChild variant="default" className="w-full font-poppins font-semibold">
            <Link href="/">
              <LogOut className="mr-2 h-5 w-5" /> Go Back to Homepage
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
