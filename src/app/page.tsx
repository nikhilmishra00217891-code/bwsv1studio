import FeaturedCourses from "@/components/home/FeaturedCourses";
import Hero from "@/components/home/Hero";
import Testimonials from "@/components/home/Testimonials";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <FeaturedCourses />
      <Testimonials />
    </div>
  );
}
