// Mock data for demo mode (no backend needed)

export const mockModules = [
    {
        id: 1,
        moduleNumber: 0,
        title: "Introduction to Human Risk Management",
        description: "Explore the key concepts and principles of human risk management in cybersecurity.",
        estimatedTime: 30,
        lessonCount: 4,
        completedCount: 0,
        progress: 0
    },
    {
        id: 2,
        moduleNumber: 1,
        title: "The Human Risk Problem",
        description: "Understanding why humans are the weakest link in cybersecurity and how to address it.",
        estimatedTime: 35,
        lessonCount: 4,
        completedCount: 0,
        progress: 0
    },
    {
        id: 3,
        moduleNumber: 2,
        title: "Understanding the Human Risk Landscape",
        description: "Analyze the various factors that contribute to human risk in organizations.",
        estimatedTime: 40,
        lessonCount: 4,
        completedCount: 0,
        progress: 0
    },
    {
        id: 4,
        moduleNumber: 3,
        title: "The Psychology of Social Engineering",
        description: "Learn how attackers exploit psychological principles to manipulate people.",
        estimatedTime: 45,
        lessonCount: 4,
        completedCount: 0,
        progress: 0
    },
    {
        id: 5,
        moduleNumber: 4,
        title: "Human Risk Triggers Across Employee Lifecycle",
        description: "Identify risk points throughout an employee's journey in an organization.",
        estimatedTime: 40,
        lessonCount: 4,
        completedCount: 0,
        progress: 0
    },
    {
        id: 6,
        moduleNumber: 5,
        title: "Social Engineering Attack Vectors",
        description: "Explore common attack methods used by social engineers.",
        estimatedTime: 45,
        lessonCount: 4,
        completedCount: 0,
        progress: 0
    },
    {
        id: 7,
        moduleNumber: 6,
        title: "Insider Risk",
        description: "Understand threats from within the organization and how to mitigate them.",
        estimatedTime: 40,
        lessonCount: 4,
        completedCount: 0,
        progress: 0
    },
    {
        id: 8,
        moduleNumber: 7,
        title: "Privilege Misuse and Access Exposure",
        description: "Learn about risks associated with excessive privileges and access controls.",
        estimatedTime: 35,
        lessonCount: 4,
        completedCount: 0,
        progress: 0
    },
    {
        id: 9,
        moduleNumber: 8,
        title: "Future Proofing Human Risk Management",
        description: "Prepare for emerging threats and evolving risk management strategies.",
        estimatedTime: 40,
        lessonCount: 4,
        completedCount: 0,
        progress: 0
    }
];

export const mockUser = {
    id: 1,
    email: "demo@example.com",
    firstName: "Demo",
    lastName: "User",
    role: "student"
};

export const mockLessons = {
    1: [
        { id: 1, type: "video", title: "Stop Blaming People: The New Rules of Cyber-Risk", duration: 330, orderIndex: 0, completed: false },
        { id: 2, type: "video", title: "The HRM-Risk Model", duration: 360, orderIndex: 1, completed: false },
        { id: 3, type: "reading", title: "Introduction - Overview", duration: 600, orderIndex: 2, completed: false },
        { id: 4, type: "quiz", title: "Introduction Quiz", duration: 600, orderIndex: 3, completed: false }
    ]
};

export const mockQuiz = {
    id: 1,
    title: "Introduction Quiz",
    passingScore: 70,
    questions: [
        {
            id: "q1",
            question: "According to the HRM model, what is the primary cause of most modern cybersecurity incidents?",
            options: [
                "Failures in firewall technology",
                "Malicious employees seeking to harm the company",
                "Human decisions made under imperfect conditions like cognitive overload",
                "Insufficiently complex password policies"
            ]
        },
        {
            id: "q2",
            question: "How does this course define 'Human Risk' in a new way?",
            options: [
                "The probability of an employee making a mistake",
                "The risk of employees not completing their annual training",
                "The exposure created when human behavior interacts with poorly designed systems and cultures",
                "The threat posed by unpatched employee-owned devices"
            ]
        },
        {
            id: "q3",
            question: "Why does traditional, annual cybersecurity awareness training often fail?",
            options: [
                "The training content is usually too technical for most employees",
                "It ignores the environmental pressures (stress, fatigue, workload) that dictate real-world behavior",
                "The sessions are consistently too long to be memorable",
                "It focuses too much on real-world examples"
            ]
        }
    ]
};

export const mockLessonContent = {
    1: {
        id: 1,
        title: "Stop Blaming People: The New Rules of Cyber-Risk",
        type: "video",
        content: `# Video Script: Stop Blaming People

## Scene 1: The Misdirection (0:00-0:30)

**VISUAL:** Dark server rack with blinking lights. Security indicators show "ACTIVE" status.

**NARRATOR:** "For decades, this is what we were told cybersecurity looked like. A fortress of code and hardware designed to keep the bad guys out."

## Scene 2: The Real Point of Failure (0:30-1:45)

**VISUAL:** Animated brain with cognitive load meter rising into red zone.

**NARRATOR:** "But we were looking in the wrong place. The biggest security threat isn't a flaw in our code. It's a feature of our biology."

**ON-SCREEN TEXT:** *Cybersecurity fails when human behavior interacts with a system not designed for it.*`,
        mediaPlaceholders: [
            {
                id: 1,
                type: "video",
                description: "[VIDEO PLACEHOLDER: Stop Blaming People - The New Rules of Cyber-Risk]",
                timingInfo: "Duration: 5:30",
                dimensions: "1920x1080"
            }
        ]
    }
};
