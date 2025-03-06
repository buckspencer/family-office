import { Button } from '@/components/ui/button';
import { ArrowRight, CreditCard, Key, Calendar } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PricingSection } from '@/components/pricing/pricing-section';
import { WizardCard } from '@/components/dashboard/WizardCard';

export default function HomePage() {
  return (
    <main>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
                Your Family's Digital
                <span className="block text-orange-500">Home Base</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                The simple way to keep your family's accounts organized. From Netflix passwords 
                to utility bills, keep everything your family needs in one secure place that 
                everyone can access.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full text-lg px-8 py-4 inline-flex items-center justify-center">
                  Start Organizing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <Image
                src="/sample-dashboard.png"
                alt="Family Office Dashboard Preview"
                width={800}
                height={600}
                className="rounded-lg shadow-xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <WizardCard />
            {/* Add more quick action cards here */}
          </div>
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <CreditCard className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Family Subscriptions Made Simple
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  No more forgotten subscriptions or surprise bills. Keep track of everything from 
                  streaming services to gym memberships in one easy-to-use dashboard the whole 
                  family can access.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <Key className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Share Securely with Family
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  "What's the Netflix password again?" Never hear that question again. Safely share 
                  and update family passwords, from streaming services to the home WiFi, all in 
                  one place.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Never Miss Important Dates
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  From bill due dates to subscription renewals, keep track of what needs to be 
                  paid and when. Set reminders so nothing falls through the cracks of busy 
                  family life.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <PricingSection />
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Perfect for Busy Families
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
                Life is busy enough without having to hunt down passwords or track renewal dates. 
                Keep your family organized with a simple dashboard that puts everything you need 
                at your fingertips. Perfect for parents, kids, and anyone who wants to keep the 
                family running smoothly.
              </p>
            </div>
            <div className="mt-8 lg:mt-0 flex justify-center lg:justify-end">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full text-xl px-12 py-6 inline-flex items-center justify-center">
                Join Other Families
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
