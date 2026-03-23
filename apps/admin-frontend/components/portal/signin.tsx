"use client";

import { SignInPage } from "@/components/ui/sign-in";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useAuthControllerLogin } from "@/services/api/auth/auth";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

export type SignInFormValues = z.infer<typeof signInSchema>;

const SignIn = () => {
  const router = useRouter();

  const { mutate: login, isPending: isLoading } = useAuthControllerLogin({
    mutation: {
      onSuccess: () => router.push("/portal"),
      onError: (error) => {
        const msg =
          (error as unknown as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? "Unable to sign in. Please check your credentials.";
        toast.error(msg);
      },
    },
  });

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = (data: SignInFormValues) => {
    login({ data: { email: data.email, password: data.password } });
  };

  const handleResetPassword = () => {
    toast.info("Reset password flow is not configured yet.");
  }



  const handleBackHome = () => {
    router.push("/#home");
  }

  return (
    <div className="bg-background text-foreground">
      <SignInPage
        heroImageSrc="/report.jpg"
        form={form}
        onSignIn={onSubmit}
        onResetPassword={handleResetPassword}
        onBackHome={handleBackHome}
        isLoading={isLoading}
      />
    </div>
  );
};

export default SignIn;