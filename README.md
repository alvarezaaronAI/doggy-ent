# DoggyEnt – Vue Project

------------------------------------------------------
PROJECT OVERVIEW
------------------------------------------------------
DoggyEnt is a real Vue-based portfolio and personal brand website being built for launch as a live product. It is designed to present projects, skills, experience, and contact information in a polished, modern format while following a scalable component-based architecture and responsive design standards.

------------------------------------------------------
TECH STACK
------------------------------------------------------
- Vue 3 (Composition API)
- Vite (Build Tool)
- JavaScript (ES6+)
- HTML5 & CSS3
- Responsive Design (Flexbox / Grid)
- Vue Router
- Git & GitHub
- Deployment Ready Architecture

------------------------------------------------------
PROJECT STRUCTURE
------------------------------------------------------
src/
│
├── assets/              # Images, icons, global styles
├── components/          # Reusable UI components
├── views/               # Page-level sections / route views
├── router/              # Navigation and route configuration
├── store/               # State management (optional future scaling)
├── App.vue              # Root component
└── main.js              # Entry point

------------------------------------------------------
LAYOUT BREAKDOWN
------------------------------------------------------

NAVIGATION BAR
------------------------------------------------------
- Logo (Left-Aligned)
- Navigation Links (Right-Aligned):
    Home   |   Projects   |   Skills   |   About Me   |   Resume   |   Blog   |   Contact
- Optional Call-to-Action Button:
    [ Hire Me ]

Component:
- Navbar.vue

------------------------------------------------------
HERO SECTION
------------------------------------------------------
- Two-Column Layout (Responsive)

Left Side:
- Intro Card
    - Name
    - Title
    - Short Description
    - CTA Buttons

Right Side:
- Profile Image / Illustration

Components:
- HeroSection.vue
- HeroCard.vue

------------------------------------------------------
PROJECTS SECTION
------------------------------------------------------
- Grid Layout of Project Cards

Each Card Includes:
- Project Image
- Title
- Description
- Tech Stack Tags
- Action Buttons (Live Demo / GitHub)

Components:
- ProjectsSection.vue
- ProjectCard.vue

------------------------------------------------------
SKILLS SECTION
------------------------------------------------------
- Categorized Skills Display

Categories:
- Frontend
- Backend
- Tools

Each Category:
- Skill Icons / Labels

Components:
- SkillsSection.vue
- SkillCategory.vue

------------------------------------------------------
ABOUT ME SECTION
------------------------------------------------------
- Text Description
- Optional Image
- Personal Story / Background

Components:
- AboutSection.vue

------------------------------------------------------
RESUME SECTION
------------------------------------------------------
- Download Button
- Experience Summary

Components:
- ResumeSection.vue

------------------------------------------------------
BLOG SECTION
------------------------------------------------------
- List or Grid of Blog Posts

Each Post:
- Title
- Short Preview
- Read More Link

Components:
- BlogSection.vue
- BlogCard.vue

------------------------------------------------------
CONTACT SECTION
------------------------------------------------------
- Contact Form
    - Name Input
    - Email Input
    - Message Input
- Submit Button

Optional:
- Social Links

Components:
- ContactSection.vue
- ContactForm.vue

------------------------------------------------------
FOOTER
------------------------------------------------------
- Copyright
- Social Links

Component:
- Footer.vue

------------------------------------------------------
PRODUCT DETAILS
------------------------------------------------------
- Purpose:
    A live personal website used to showcase projects, skills, experience, and serve as a central hub for personal branding.

- Target Users:
    Recruiters, hiring managers, collaborators, and potential clients.

- Core Value:
    Clean presentation of work, easy navigation, fast performance, and scalable architecture.

- Key Features:
    - Fully responsive layout
    - Modular component-based structure
    - Project showcase with live/demo links
    - Downloadable resume
    - Contact form for direct communication
    - Blog-ready structure for future content

------------------------------------------------------
COMPONENT BREAKDOWN (DETAILED)
------------------------------------------------------

NAVBAR.VUE
------------------------------------------------------
- Handles global navigation across the site
- Contains:
    - Logo / Brand Name
    - Navigation links (scroll or route-based)
    - Optional CTA button (Hire Me)
- Responsibilities:
    - Route navigation or smooth scrolling
    - Mobile responsiveness (hamburger menu later)

------------------------------------------------------
HEROSECTION.VUE
------------------------------------------------------
- First visual entry point of the website
- Layout controller for hero content
- Responsibilities:
    - Manage responsive two-column layout
    - Pass data into HeroCard

HERO CARD (HEROCARD.VUE)
------------------------------------------------------
- Displays core identity information
- Contains:
    - Name
    - Title
    - Short intro
    - CTA buttons (Projects, Contact)
- Responsibilities:
    - Highlight personal brand quickly

------------------------------------------------------
PROJECTSSECTION.VUE
------------------------------------------------------
- Container for all project cards
- Responsibilities:
    - Loop through project data
    - Render ProjectCard components dynamically

PROJECTCARD.VUE
------------------------------------------------------
- Represents a single project
- Contains:
    - Image
    - Title
    - Description
    - Tech stack tags
    - Links (Live / GitHub)
- Responsibilities:
    - Reusable card design
    - Accept props for dynamic content

------------------------------------------------------
SKILLSSECTION.VUE
------------------------------------------------------
- Displays grouped technical skills
- Responsibilities:
    - Organize skills into categories
    - Render SkillCategory components

SKILLCATEGORY.VUE
------------------------------------------------------
- Displays a single category of skills
- Contains:
    - Category title
    - List of skills or icons
- Responsibilities:
    - Keep skills modular and extendable

------------------------------------------------------
ABOUTSECTION.VUE
------------------------------------------------------
- Personal background and story section
- Responsibilities:
    - Present narrative about experience and goals
    - Optional image or visual element

------------------------------------------------------
RESUMESECTION.VUE
------------------------------------------------------
- Resume display and download functionality
- Responsibilities:
    - Provide downloadable file
    - Summarize experience

------------------------------------------------------
BLOGSECTION.VUE
------------------------------------------------------
- Placeholder for future blog content
- Responsibilities:
    - Render blog preview cards
    - Connect to CMS or static content later

BLOGCARD.VUE
------------------------------------------------------
- Individual blog preview component
- Contains:
    - Title
    - Preview text
    - Link to full article

------------------------------------------------------
CONTACTSECTION.VUE
------------------------------------------------------
- Container for contact functionality
- Responsibilities:
    - Layout for contact form and social links

CONTACTFORM.VUE
------------------------------------------------------
- Handles user input and submissions
- Contains:
    - Name field
    - Email field
    - Message field
- Responsibilities:
    - Form validation
    - Submission handling (API integration later)

------------------------------------------------------
FOOTER.VUE
------------------------------------------------------
- Global footer across the site
- Contains:
    - Copyright
    - Social links
- Responsibilities:
    - Provide closing navigation and branding

------------------------------------------------------
DEVELOPMENT SETUP
------------------------------------------------------

Install dependencies:
```
npm install
```

Run development server:
```
npm run dev
```

Build for production:
```
npm run build
```

------------------------------------------------------
FUTURE IMPROVEMENTS
------------------------------------------------------
- Connect live contact form functionality
- Add production-ready SEO and metadata optimization
- Add animations and polished interactions
- Integrate CMS or blog management workflow
- Launch on a production hosting platform

------------------------------------------------------
NOTES
------------------------------------------------------
This project is intended to become a live personal website and real portfolio product. The architecture is organized so each section can be developed, refined, and maintained as a reusable module while supporting future expansion as the site grows.
