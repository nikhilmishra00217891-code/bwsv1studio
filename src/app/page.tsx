import Hero from "@/components/home/NewHero";
import FeaturedCourses from "@/components/home/FeaturedCourses";
import Testimonials from "@/components/home/Testimonials";

// TODO: These will be replaced in subsequent phases with the new components.
import SmartSearch from "@/components/home/SmartSearch";
import AnnouncementSlider from "@/components/home/AnnouncementSlider";
import QuickActions from "@/components/home/QuickActions";


export default function Home() {
  return (
    <div className="flex flex-col space-y-16 md:space-y-24 py-16 md:py-24">
      <Hero />
      <SmartSearch />
      <AnnouncementSlider />
      <FeaturedCourses />
      <QuickActions />
      <Testimonials />
    </div>
  );
}
