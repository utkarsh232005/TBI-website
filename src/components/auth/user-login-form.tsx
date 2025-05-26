
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogIn } from "lucide-react";

export default function UserLoginForm() {
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
      title: "Feature Coming Soon!",
      description: "User login functionality is currently under development. Please use the application form for now.",
      variant: "default",
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-montserrat text-2xl text-accent">User Login</CardTitle> {/* Title to accent */}
        <CardDescription>
          Sign in to your RCEOM-TBI account or apply if you're new.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="user-email" className="text-foreground">Email Address</Label>
            <Input
              id="user-email"
              type="email"
              placeholder="you@example.com"
              disabled 
              className="bg-card border-border focus:border-accent focus:ring-accent" /* Focus to accent */
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-password" className="text-foreground">Password</Label>
            <Input
              id="user-password"
              type="password"
              placeholder="••••••••"
              disabled 
              className="bg-card border-border focus:border-accent focus:ring-accent" /* Focus to accent */
            />
          </div>
          <Button type="submit" size="lg" className="w-full font-poppins font-semibold group bg-accent hover:bg-accent/90 text-accent-foreground"> {/* Button to accent */}
            Login
            <LogIn className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
          <p className="text-xs text-center text-muted-foreground pt-2">
            User authentication is for demonstration. Full Firebase user login to be implemented.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
