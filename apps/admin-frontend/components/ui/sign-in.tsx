"use client";

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormInput, FormPasswordInput} from "@trustmed/components";
import { SignInFormValues } from "@/components/portal/signin";
import { Form } from "./form";

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
  onBackHome?: () => void;
  isLoading?: boolean;
}

// --- SUB-COMPONENTS ---
// GlassInputWrapper removed in favor of standard components

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

export const SignInPage: React.FC<SignInPageProps> = ({
  title = <span className="font-light text-foreground tracking-tighter">TrustMed Admin</span>,
  description = "Please sign in to access the admin portal.",
  heroImageSrc,
  testimonials = [],
  form,
  onSignIn,
  isLoading = false,
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

                <button type="submit" disabled={isLoading} className="animate-element animate-delay-600 w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            </Form>
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