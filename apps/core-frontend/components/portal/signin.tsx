"use client";

import { SignInPage } from "@/components/ui/sign-in";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

export type SignInFormValues = z.infer<typeof signInSchema>;

const SignIn = () => {
  const router = useRouter();
  const { isLoaded, setActive, signIn } = useSignIn();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const getClerkErrorMessage = (error: unknown) => {
    if (error && typeof error === "object" && "errors" in error) {
      const typedError = error as { errors?: Array<{ message?: string }> };
      return typedError.errors?.[0]?.message ?? "Unable to sign in.";
    }

    return "Unable to sign in.";
  };

  const onSubmit = async (data: SignInFormValues) => {
    if (!isLoaded) {
      return;
    }

    try {
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/portal");
        return;
      }

      toast.info("Additional verification is required. Please complete sign-in in Clerk.");
    } catch (error) {
      toast.error(getClerkErrorMessage(error));
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isLoaded) {
      return;
    }

    await signIn.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/signin",
      redirectUrlComplete: "/portal",
    });
  };
  
  const handleResetPassword = () => {
    toast.info("Reset password flow is not configured yet.");
  }

  const handleCreateAccount = () => {
    router.push("/signup");
  }

  return (
    <div className="bg-background text-foreground">
      <SignInPage
        heroImageSrc="/report.jpg"
        form={form}
        onSignIn={onSubmit}
        onGoogleSignIn={handleGoogleSignIn}
        onResetPassword={handleResetPassword}
        onCreateAccount={handleCreateAccount}
      />
    </div>
  );
};

export default SignIn;