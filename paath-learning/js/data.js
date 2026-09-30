/* =====================================================================
   DATA (all sample content, no backend)
   ===================================================================== */
const CATS={
  "Programming":["#2B3A9E","#5B6CFF"],
  "Data & AI":["#0B6E78","#2FC2B1"],
  "Design":["#B02A6E","#FF7EB0"],
  "Business":["#A04C08","#F0A93A"],
  "Languages":["#2A7530","#7BC95E"],
  "Science & Math":["#55299A","#A578FF"]
};
const CAT_NAMES=Object.keys(CATS);

const COURSES=[
 {id:"py",title:"Python from Zero",cat:"Programming",by:"Aarav Mehta",level:"Beginner",hrs:18,rating:4.8,learners:42300,pat:"blocks",tags:"python coding code beginner programming",
  desc:"Learn to write real programs, starting with no experience at all.",
  lessons:["Install Python and run your first script","Variables, numbers and text","Decisions with if and else","Loops and lists","Functions you can reuse","Project: a number-guessing game"],books:["b1","b2"]},
 {id:"web",title:"Web Development Basics",cat:"Programming",by:"Simran Kaur",level:"Beginner",hrs:22,rating:4.7,learners:38100,pat:"stripes",tags:"html css javascript website web frontend",
  desc:"Build and publish your first websites with HTML, CSS and a little JavaScript.",
  lessons:["How a web page works","HTML structure and text","CSS colors, spacing and layout","Responsive pages for phones","Add behavior with JavaScript","Project: your personal site"],books:["b2","b3"]},
 {id:"js",title:"JavaScript in Depth",cat:"Programming",by:"Manpreet Dhillon",level:"Intermediate",hrs:20,rating:4.7,learners:21400,pat:"dots",tags:"javascript js async promises dom advanced",
  desc:"Understand closures, async code and the browser so bugs stop being mysterious.",
  lessons:["Scope and closures","Objects, arrays and methods","Working with the DOM","Async code and promises","Fetching data from APIs","Project: a live weather widget"],books:["b2","b1"]},
 {id:"da",title:"Data Analysis with Excel and SQL",cat:"Data & AI",by:"Rohan Verma",level:"Beginner",hrs:16,rating:4.6,learners:29800,pat:"waves",tags:"excel sql data analysis spreadsheet database",
  desc:"Clean, summarize and chart data, then ask databases the right questions.",
  lessons:["Spreadsheet basics that save hours","Cleaning messy data","Pivot tables and charts","Your first SQL query","Joining tables","Project: a sales dashboard"],books:["b4","b10"]},
 {id:"ml",title:"Machine Learning Foundations",cat:"Data & AI",by:"Dr. Neha Kapoor",level:"Intermediate",hrs:24,rating:4.8,learners:33500,pat:"rings",tags:"machine learning ai artificial intelligence model python",
  desc:"See how models learn from data, and train and test a few of your own.",
  lessons:["What machine learning really is","Data, features and labels","Regression in plain language","Classification and accuracy","Overfitting and how to avoid it","Project: predict house prices"],books:["b10","b4"]},
 {id:"ux",title:"UX Design Fundamentals",cat:"Design",by:"Kabir Sandhu",level:"Beginner",hrs:14,rating:4.7,learners:27600,pat:"rings",tags:"ux ui user experience design app usability wireframe",
  desc:"Design apps people can use without instructions, from research to prototype.",
  lessons:["What users actually need","Interviews and research notes","Sketching flows and wireframes","Layout, hierarchy and spacing","Testing with five people","Project: redesign a booking app"],books:["b3","b11"]},
 {id:"gd",title:"Graphic Design with Color and Type",cat:"Design",by:"Meera Iyer",level:"Beginner",hrs:12,rating:4.5,learners:19200,pat:"blocks",tags:"graphic design color typography poster logo",
  desc:"Make posters, logos and social posts that look deliberate.",
  lessons:["Seeing like a designer","Color palettes that work","Choosing and pairing fonts","Composition and white space","Logos and simple branding","Project: an event poster"],books:["b11","b3"]},
 {id:"su",title:"Startup Basics: Idea to First Customer",cat:"Business",by:"Harleen Gill",level:"Beginner",hrs:10,rating:4.6,learners:24700,pat:"stripes",tags:"startup business entrepreneur idea customer",
  desc:"Test an idea cheaply and find your first paying customers.",
  lessons:["Finding a problem worth solving","Talking to customers","Building the smallest version","Pricing and first sales","Measuring what matters","Project: a one-page plan"],books:["b6","b7"]},
 {id:"dm",title:"Digital Marketing Essentials",cat:"Business",by:"Vikram Rao",level:"Beginner",hrs:13,rating:4.4,learners:22900,pat:"dots",tags:"marketing seo social media ads content",
  desc:"Reach the right people with search, social media and email.",
  lessons:["How people find things online","Search basics and keywords","Writing content people share","Social media that isn't noise","Email and follow-ups","Project: a 30-day campaign"],books:["b9","b7"]},
 {id:"pf",title:"Personal Finance for Beginners",cat:"Business",by:"Tanvi Arora",level:"Beginner",hrs:8,rating:4.6,learners:31200,pat:"waves",tags:"money finance saving budget investing",
  desc:"Budgeting, saving and investing basics without the jargon.",
  lessons:["Where your money goes","Budgets you can keep","Emergency funds and saving","Interest and inflation","Investing basics","Project: your 12-month plan"],books:["b7","b9"]},
 {id:"se",title:"Spoken English for Confidence",cat:"Languages",by:"Anita Sharma",level:"Beginner",hrs:15,rating:4.7,learners:45800,pat:"waves",tags:"english speaking spoken communication fluency interview",
  desc:"Speak clearly in meetings, interviews and everyday conversation.",
  lessons:["Sounds and clear pronunciation","Everyday phrases that sound natural","Talking about yourself","Telephone and meeting English","Handling interviews","Project: a two-minute talk"],books:["b8"]},
 {id:"aw",title:"Academic Writing in English",cat:"Languages",by:"Prof. Daljit Singh",level:"Intermediate",hrs:9,rating:4.5,learners:14300,pat:"stripes",tags:"writing essay academic english grammar research",
  desc:"Structure essays and reports so your argument is easy to follow.",
  lessons:["Thesis and argument","Paragraphs that flow","Using sources and citations","Editing for clarity","Formal tone and grammar","Project: a 1,000-word essay"],books:["b8","b5"]},
 {id:"ph",title:"Class 12 Physics Made Clear",cat:"Science & Math",by:"Sanjay Bhatt",level:"Intermediate",hrs:30,rating:4.8,learners:36400,pat:"rings",tags:"physics class 12 board exam science electricity optics",
  desc:"Concepts, derivations and solved problems for board exams.",
  lessons:["Electric charges and fields","Current electricity","Magnetism and induction","Ray optics","Wave optics","Revision: solved past papers"],books:["b5","b4"]},
 {id:"st",title:"Statistics for Everyday Decisions",cat:"Science & Math",by:"Ishita Malhotra",level:"Beginner",hrs:11,rating:4.6,learners:20500,pat:"blocks",tags:"statistics math probability data graphs",
  desc:"Read numbers in the news critically and make better calls.",
  lessons:["Averages and what they hide","Spread and outliers","Probability without pain","Sampling and surveys","Correlation is not cause","Project: audit a news story"],books:["b4","b5"]}
];

const BOOKS=[
 {id:"b1",title:"Python Crash Course",author:"Eric Matthes",cat:"Programming",c:["#2B3A9E","#4E5EE0"],blurb:"A hands-on introduction to Python with projects you build as you read."},
 {id:"b7",title:"Atomic Habits",author:"James Clear",cat:"Business",c:["#A04C08","#E3982F"],blurb:"Small daily changes that compound, and how to make them stick."},
 {id:"b2",title:"Clean Code",author:"Robert C. Martin",cat:"Programming",c:["#1F5F4A","#3FA07E"],blurb:"How to write code that other people, and future you, can read."},
 {id:"b3",title:"Don't Make Me Think",author:"Steve Krug",cat:"Design",c:["#B02A6E","#F0679F"],blurb:"A short, practical guide to making websites obvious to use."},
 {id:"b4",title:"Naked Statistics",author:"Charles Wheelan",cat:"Science & Math",c:["#55299A","#8C5CE6"],blurb:"Statistics explained through real stories, with the math kept light."},
 {id:"b6",title:"The Lean Startup",author:"Eric Ries",cat:"Business",c:["#7A3B00","#C77414"],blurb:"Build, measure, learn: a way to test ideas before betting everything."},
 {id:"b9",title:"Deep Work",author:"Cal Newport",cat:"Business",c:["#264653","#3B7F94"],blurb:"Why focused time is rare and valuable, and how to protect it."},
 {id:"b10",title:"Hands-On Machine Learning",author:"Aurélien Géron",cat:"Data & AI",c:["#0B6E78","#27B3A3"],blurb:"Build and train machine learning models with working code."},
 {id:"b11",title:"The Design of Everyday Things",author:"Don Norman",cat:"Design",c:["#7B2C86","#C160CF"],blurb:"Why some objects are easy to use and others frustrate us."},
 {id:"b5",title:"A Brief History of Time",author:"Stephen Hawking",cat:"Science & Math",c:["#1B2A6B","#4257C4"],blurb:"From the Big Bang to black holes, explained for curious readers."},
 {id:"b8",title:"Word Power Made Easy",author:"Norman Lewis",cat:"Languages",c:["#2A7530","#5FB246"],blurb:"A step-by-step way to grow your vocabulary."}
];

const QUIZ={
 "Programming":[
  {q:"Which keyword repeats code while a condition is true?",o:["while","if","def","return"],a:0},
  {q:"What does a function let you do?",o:["Store a single number","Reuse a block of code","Delete a file","Change the screen color"],a:1}],
 "Data & AI":[
  {q:"Which of these is a label in a spam-detection dataset?",o:["The email's length","The sender's name","Spam or not spam","The date sent"],a:2},
  {q:"A model that scores perfectly on training data but poorly on new data is…",o:["Underfitting","Overfitting","Well balanced","Untrained"],a:1}],
 "Design":[
  {q:"What is visual hierarchy?",o:["The order things are made","Guiding attention by size, weight and color","Using many fonts","Adding more decoration"],a:1},
  {q:"How many test users often reveal most usability problems?",o:["1","About 5","500","Exactly 100"],a:1}],
 "Business":[
  {q:"What should you do first when you have a business idea?",o:["Build everything","Talk to potential customers","Buy a logo","Hire a team"],a:1},
  {q:"An emergency fund is meant to cover…",o:["Holiday shopping","Unexpected costs","Stock tips","Rent for next year"],a:1}],
 "Languages":[
  {q:"Which is the clearest way to start a formal email?",o:["Hey!","Dear Ms. Kaur,","Yo,","Sup"],a:1},
  {q:"A strong thesis statement…",o:["Asks a question","States your main argument","Lists sources","Repeats the title"],a:1}],
 "Science & Math":[
  {q:"Which measure is least affected by extreme outliers?",o:["Mean","Median","Sum","Range"],a:1},
  {q:"Correlation between two things means…",o:["One causes the other","They move together, cause unknown","They are identical","Nothing at all"],a:1}]
};

