import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Heart, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
        <div className="mb-8 inline-flex items-center rounded-full border bg-muted px-4 py-2 text-sm">
          <Sparkles className="mr-2 size-4" />
          Share your special moments
        </div>
        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Virtual Wedding Guestbook
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Let your guests upload photos and leave wishes directly from their phones.
          No app download required. Simple, fast, and beautiful.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg" className="text-lg">
            <Link href="/login">Create Free Account</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg">
            <Link href="/e/demo-event-123">View Demo</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Everything you need in one place
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <Camera className="mb-2 size-8 text-primary" />
                <CardTitle>Easy Photo Uploads</CardTitle>
                <CardDescription>
                  Guests scan a QR code and upload photos directly from their phones.
                  No app installation needed.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Heart className="mb-2 size-8 text-primary" />
                <CardTitle>Beautiful Gallery</CardTitle>
                <CardDescription>
                  All photos are displayed in a beautiful, mobile-optimized gallery
                  that everyone can enjoy.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Sparkles className="mb-2 size-8 text-primary" />
                <CardTitle>Simple Management</CardTitle>
                <CardDescription>
                  Moderate content, download photos, and manage your event all from
                  one dashboard.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Simple Pricing</h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that works for you
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Perfect for trying out</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-3xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  1 Event
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Up to 50 photos
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Basic features
                </li>
              </ul>
              <Button asChild className="w-full" variant="outline">
                <Link href="/login">Get Started</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>Most popular</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-3xl font-bold">$29</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Unlimited events
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Unlimited photos
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Priority support
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Download all photos
                </li>
              </ul>
              <Button asChild className="w-full">
                <Link href="/login">Get Started</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <CardDescription>For large events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-3xl font-bold">$99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Everything in Pro
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Custom branding
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Dedicated support
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Advanced analytics
                </li>
              </ul>
              <Button asChild className="w-full" variant="outline">
                <Link href="/login">Contact Sales</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to get started?</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Create your free account and set up your first event in minutes.
          </p>
          <Button asChild size="lg" className="text-lg">
            <Link href="/login">Create Free Account</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
