"use client";

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormInput } from "@/components/core/form-input";
import { FormPasswordInput } from "@/components/core/form-password-input";
import { FormCheckbox } from "@/components/core/form-checkbox";
import { SignInFormValues } from "@/components/portal/signin";
import { Form } from "./form"; // Shadcn Form Wrapper

// --- HELPER COMPONENTS (ICONS) ---

/**
 * GoogleIcon component for Google sign-in button.
 * Renders the Google logo SVG icon.
 */
const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
    </svg>
);


// --- TYPE DEFINITIONS ---

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  form: UseFormReturn<SignInFormValues>;
  onSignIn: (data: SignInFormValues) => void;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
}

// --- SUB-COMPONENTS ---
// GlassInputWrapper removed in favor of standard components

/**
 * TestimonialCard component for displaying user testimonials.
 * Renders a testimonial card with avatar, name, handle, and text in an animated glassmorphic card.
 * 
 * @param {Testimonial} testimonial - Testimonial data
 * @param {string} delay - Animation delay class
 */
const TestimonialCard = ({ testimonial, delay }: { testimonial: Testimonial, delay: string }) => (
  <div className={`animate-testimonial ${delay} flex items-start gap-3 rounded-3xl bg-card/40 dark:bg-zinc-800/40 backdrop-blur-xl border border-white/10 p-5 w-64`}>
    <img src={testimonial.avatarSrc} className="h-10 w-10 object-cover rounded-2xl" alt="avatar" />
    <div className="text-sm leading-snug">
      <p className="flex items-center gap-1 font-medium">{testimonial.name}</p>
      <p className="text-muted-foreground">{testimonial.handle}</p>
      <p className="mt-1 text-foreground/80">{testimonial.text}</p>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

/**
 * SignInPage component for user authentication UI.
 * Renders a split-screen sign-in page with form on the left and hero image with testimonials on the right.
 * Includes email/password fields, remember me checkbox, Google sign-in option, and links for password reset and account creation.
 * 
 * @param {SignInPageProps} props - Component props
 * @param {React.ReactNode} props.title - Page title (default: "Welcome")
 * @param {React.ReactNode} props.description - Page description
 * @param {string} props.heroImageSrc - URL of the hero image
 * @param {Testimonial[]} props.testimonials - Array of testimonials to display
 * @param {UseFormReturn<SignInFormValues>} props.form - React Hook Form instance
 * @param {function} props.onSignIn - Callback when sign-in form is submitted
 * @param {function} props.onGoogleSignIn - Callback when Google sign-in is clicked
 * @param {function} props.onResetPassword - Callback when reset password is clicked
 * @param {function} props.onCreateAccount - Callback when create account is clicked
 */
export const SignInPage: React.FC<SignInPageProps> = ({
  title = <span className="font-light text-foreground tracking-tighter">Welcome</span>,
  description = "Access your account and continue your journey with us",
  heroImageSrc,
  testimonials = [],
  form,
  onSignIn,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
}) => {
  return (
    <div className="h-dvh flex flex-col md:flex-row font-geist w-dvw">
      {/* Left column: sign-in form */}
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <h1 className="animate-element animate-delay-100 text-4xl md:text-5xl font-semibold leading-tight">{title}</h1>
            <p className="animate-element animate-delay-200 text-muted-foreground">{description}</p>

            <Form {...form}>
              <form className="space-y-5" onSubmit={form.handleSubmit(onSignIn)}>
                <div className="animate-element animate-delay-300">
                  <FormInput
                    control={form.control}
                    name="email"
                    label="Email Address"
                    placeholder="Enter your email address"
                  />
                </div>

                <div className="animate-element animate-delay-400">
                   <FormPasswordInput
                    control={form.control}
                    name="password"
                    label="Password"
                    placeholder="Enter your password"
                  />
                </div>

                <div className="animate-element animate-delay-500 flex items-center justify-between text-sm">
                   <FormCheckbox
                    control={form.control}
                    name="rememberMe"
                    label="Keep me signed in"
                    className="space-y-0"
                  />
                  <button type="button" onClick={() => onResetPassword?.()} className="hover:underline text-primary transition-colors">Reset password</button>
                </div>

                <button type="submit" className="animate-element animate-delay-600 w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                  Sign In
                </button>
              </form>
            </Form>

            <div className="animate-element animate-delay-700 relative flex items-center justify-center">
              <span className="w-full border-t border-border"></span>
              <span className="px-4 text-sm text-muted-foreground bg-background absolute">Or continue with</span>
            </div>

            <button onClick={onGoogleSignIn} className="animate-element animate-delay-800 w-full flex items-center justify-center gap-3 border border-border rounded-2xl py-4 hover:bg-secondary transition-colors">
                <GoogleIcon />
                Continue with Google
            </button>

            <p className="animate-element animate-delay-900 text-center text-sm text-muted-foreground">
              New to our platform? <button type="button" onClick={() => onCreateAccount?.()} className="text-primary hover:underline transition-colors">Create Account</button>
            </p>
          </div>
        </div>
      </section>

      {/* Right column: hero image + testimonials */}
      {heroImageSrc && (
        <section className="hidden md:block flex-1 relative p-4">
          <div className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center " style={{ backgroundImage: `url(${heroImageSrc})` }}></div>
          {testimonials.length > 0 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-8 w-full justify-center">
              <TestimonialCard testimonial={testimonials[0]} delay="animate-delay-1000" />
              {testimonials[1] && <div className="hidden xl:flex"><TestimonialCard testimonial={testimonials[1]} delay="animate-delay-1200" /></div>}
              {testimonials[2] && <div className="hidden 2xl:flex"><TestimonialCard testimonial={testimonials[2]} delay="animate-delay-1400" /></div>}
            </div>
          )}
        </section>
      )}
    </div>
  );
};