import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { KeyRound, Mail } from "lucide-react"
import Link from "next/link"

export function LoginForm() {
  return (
    <Card className="w-full max-w-sm shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">Welcome!</CardTitle>
        <CardDescription>Login or create an account to continue</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input id="email" type="email" placeholder="chintu@email.com" required className="pl-10" />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="otp">One-Time Password (OTP)</Label>
          <div className="relative">
             <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input id="otp" type="password" required className="pl-10" placeholder="••••••" />
          </div>
        </div>
        <Button className="w-full">Send OTP & Login</Button>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="relative w-full">
            <Separator />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                OR CONTINUE WITH
            </span>
        </div>
        <Button variant="outline" className="w-full">
            <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.3 1.84-4.25 1.84A6.96 6.96 0 0 1 5 12.1a6.96 6.96 0 0 1 6.96-6.96c1.82 0 3.25.68 4.25 1.62l2.33-2.33A11.97 11.97 0 0 0 12.23 2a12.23 12.23 0 0 0-11.96 12.25c0 6.62 5.34 11.96 11.96 11.96 6.42 0 11.43-4.38 11.43-11.75 0-.78-.08-1.48-.2-2.15z"></path></svg>
            Google
        </Button>
        <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link href="#" className="underline hover:text-primary">
                Terms of Service
            </Link>.
        </p>
      </CardFooter>
    </Card>
  )
}
