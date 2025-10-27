// Mock data functions for course content
// Replace these with actual Supabase queries when backend is ready

export interface Lesson {
  id: string;
  title: string;
  description: string;
  lesson_note?: string;
  type: 'video' | 'text' | 'file';
  content_url: string;
  file_url?: string;
  duration: string;
  order_index: number;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  lessons: Lesson[];
}

export interface CourseProgress {
  [lessonId: string]: boolean;
}

export interface CourseProgressData {
  id: string;
  completed: boolean;
  completed_at: string | null;
  last_accessed: string;
}

// Mock data - replace with actual Supabase queries
const mockModules: Module[] = [
  {
    id: "module-1",
    title: "Introduction to Web Development",
    description: "Learn the basics of web development",
    order_index: 1,
    lessons: [
      {
        id: "lesson-1",
        title: "What is Web Development?",
        description: "An overview of web development and its importance in today's digital world.",
        lesson_note: "Welcome to the course! This lesson will give you a solid foundation to build upon.",
        type: "video",
        content_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "15:30",
        order_index: 1
      },
      {
        id: "lesson-2",
        title: "Setting Up Your Development Environment",
        description: "Learn how to set up your computer for web development.",
        lesson_note: "Make sure to follow along and set up your environment as we go through this lesson.",
        type: "video",
        content_url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
        duration: "22:45",
        order_index: 2
      },
      {
        id: "lesson-3",
        title: "Course Resources",
        description: "Download the course materials and resources.",
        type: "file",
        content_url: "",
        file_url: "/course-resources.zip",
        duration: "5:00",
        order_index: 3
      }
    ]
  },
  {
    id: "module-2",
    title: "HTML Fundamentals",
    description: "Master the building blocks of web pages",
    order_index: 2,
    lessons: [
      {
        id: "lesson-4",
        title: "HTML Structure and Syntax",
        description: "Learn the basic structure and syntax of HTML documents.",
        lesson_note: "HTML is the foundation of all web pages. Pay close attention to the structure!",
        type: "video",
        content_url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        duration: "18:20",
        order_index: 1
      },
      {
        id: "lesson-5",
        title: "Common HTML Elements",
        description: "Explore the most commonly used HTML elements and their purposes.",
        type: "text",
        content_url: `
          <h2>Common HTML Elements</h2>
          <p>HTML provides many elements for structuring content. Here are some of the most important ones:</p>
          
          <h3>Headings</h3>
          <p>Use h1 through h6 for headings, with h1 being the most important.</p>
          
          <h3>Paragraphs</h3>
          <p>The p element is used for paragraphs of text.</p>
          
          <h3>Links</h3>
          <p>The a element creates hyperlinks to other pages or resources.</p>
          
          <h3>Images</h3>
          <p>The img element displays images on your web page.</p>
        `,
        duration: "12:00",
        order_index: 2
      }
    ]
  },
  {
    id: "module-3",
    title: "CSS Styling",
    description: "Make your websites beautiful with CSS",
    order_index: 3,
    lessons: [
      {
        id: "lesson-6",
        title: "CSS Basics",
        description: "Introduction to CSS and how it works with HTML.",
        lesson_note: "CSS is what makes websites look good. Take your time with this one!",
        type: "video",
        content_url: "https://youtu.be/1Rs2ND1ryYc",
        duration: "25:15",
        order_index: 1
      }
    ]
  }
];

export const fetchModulesAndLessons = async (programId: string): Promise<Module[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real implementation, this would be a Supabase query like:
  // const { data, error } = await supabase
  //   .from('modules')
  //   .select(`
  //     *,
  //     lessons (*)
  //   `)
  //   .eq('program_id', programId)
  //   .order('order_index');
  
  return mockModules;
};

export const fetchLessonProgress = async (userId: string): Promise<CourseProgress> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real implementation, this would be a Supabase query like:
  // const { data, error } = await supabase
  //   .from('lesson_progress')
  //   .select('lesson_id, completed')
  //   .eq('user_id', userId);
  
  // Mock progress data
  return {
    "lesson-1": true,
    "lesson-2": false,
    "lesson-3": false,
    "lesson-4": false,
    "lesson-5": false,
    "lesson-6": false
  };
};

export const checkAndUpdateCourseCompletion = async (
  userId: string, 
  programId: string
): Promise<boolean> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // In a real implementation, this would check if all lessons are completed
  // and update the course_progress table accordingly
  
  return false; // Mock: course not completed
};

export const markLessonComplete = async (
  userId: string,
  lessonId: string
): Promise<boolean> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real implementation, this would be a Supabase query like:
  // const { data, error } = await supabase
  //   .from('lesson_progress')
  //   .upsert({
  //     user_id: userId,
  //     lesson_id: lessonId,
  //     completed: true,
  //     completed_at: new Date().toISOString()
  //   });
  
  return true;
};
