
"use client";

import Hero from "@/components/home/NewHero";
import FeaturedCourses from "@/components/home/FeaturedCourses";
import Testimonials from "@/components/home/Testimonials";

import AnnouncementSlider from "@/components/home/AnnouncementSlider";
import QuickActions from "@/components/home/QuickActions";
import { useAuth } from "@/components/auth/AuthProvider";
import WhyBws from "@/components/home/WhyBws";


export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col space-y-16 md:space-y-24 py-16 md:py-24">
      <AnnouncementSlider />
      <Hero />
      <WhyBws />
      <FeaturedCourses />
      {user && <QuickActions />}
      <Testimonials />
    </div>
  );
}
