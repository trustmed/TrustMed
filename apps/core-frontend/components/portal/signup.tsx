"use client";

import { SignUpPage } from "@/components/ui/sign-up";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useAuthControllerRegister } from "@/services/api/auth/auth";

const signUpSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const router = useRouter();

  const { mutate: register, isPending: isLoading } = useAuthControllerRegister({
    mutation: {
      onSuccess: () => {
        toast.success("Account created successfully!");
        router.push("/portal");
      },
      onError: (error) => {
        const msg =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? "Unable to create account. Please try again.";
        toast.error(msg);
      },
    },
  });

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: SignUpFormValues) => {
    register({
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
      },
    });
  };

  const handleSignInClick = () => {
    router.push("/signin");
  }

  const handleBackHome = () => {
    router.push("/#home");
  }

  return (
    <div className="bg-background text-foreground">
      <SignUpPage
        heroImageSrc="/report.jpg"
        form={form}
        onSignUp={onSubmit}
        onSignInClick={handleSignInClick}
        onBackHome={handleBackHome}
        isLoading={isLoading}
      />
    </div>
  );
};

export default SignUp;
