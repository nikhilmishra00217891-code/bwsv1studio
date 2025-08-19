# **App Name**: BiharWaleSirji

## Core Features:

- Home Page: Home Page with Hero section featuring the slogan “Parivaar. Pratishtha. Parivartan.” and subtext: “India's first platform that teaches like an elder brother, not a stranger.” Includes Featured Courses (top 3 from Firestore /courses), a Testimonials carousel (from /testimonials), and CTA Buttons: "Browse Courses" + "Ask Our AI Mentor". A Footer with mission tagline, minimal social icons, and navigation links is also present.
- Courses Page: Dynamic Courses Page that lists all courses from Firestore (/courses). Each course is displayed as a card with a title, category, isFree badge, and thumbnail. Clicking on a course reveals a dynamic expandable section (on the same page) showing the Course title, mentor name, short description, a list of lessons (video/PDF) from /courses/{id}/lessons, a "Start Learning" or "Enroll" button (binded to user Auth), and an “Ask AI Mentor” button below every course.
- AI Mentor (BWS Buddy): An AI Mentor (BWS Buddy) provides context-based support, acting as a personal 'elder brother' AI tool. The buddy is implemented as a floating or embedded chat widget accessible across all pages. It uses context-based messages (e.g. "Stuck in Motion chapter? I got you." or “Need help with Organic Chemistry?”). Chat history is stored under /users/{uid}/chatHistory.
- Login/Signup: Secure Login/Signup using Firebase Auth with email and OTP. User data is stored in /users with fields: name, email, enrolledCourses, preferredSubjects. After login, the user is redirected to the Dashboard.
- User Dashboard: User Dashboard for logged-in users. It welcomes the user by name (e.g., “Welcome back, Chintu!”), shows all enrolled courses with progress (using data from /users/{uid}/enrolledCourses), provides a Continue Learning button (resumes last lesson), an “Ask AI Mentor” big button, and a Logout option.
- About Page: An About Page that displays a full poetic About Us text (provided by the founder) with a bold orange heading: “We’re not just a platform, we’re Parivaar.” An animated cultural image or vector map of Bihar is displayed in the background (light opacity). A “Meet the BhaiyaBot” section explains: "Your AI Doubt Buddy, available 24x7" and is “Powered by AI, trained to think like your elder brother”.
- Enhanced Animations: Extensive use of animations and motion graphics throughout the app to enhance the overall user experience and engagement, smooth scrolling and fade-in animations.

## Style Guidelines:

- Primary color: Orange (#F99006) for a warm and trustworthy feel.
- Background color: Light orange (#F9E3C2) provides a gentle contrast while staying within the primary hue, desaturated for comfortable viewing.
- Accent color: A slightly different shade of orange with less saturation and increased brightness, such as a very light orange-yellow (#F9C606) creates noticeable but visually unified highlights.
- Font: 'Poppins' sans-serif font to offer contemporary, and precise experience.
- Use relevant icons related to courses and learning modules.
- Implement smooth transitions between pages and fade-in animations to create a seamless experience.
- Responsive layout that adjusts to different screen sizes for optimal viewing experience.