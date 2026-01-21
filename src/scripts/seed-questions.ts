import { supabase } from "../database/client.js";

interface QuestionSeed {
  question_text: string;
  options: string[];
  correct_option_index: number;
  question_type: "drill" | "scenario" | "practice";
  difficulty: number;
  framework_tags: string[];
  explanation: string;
}

const questions: QuestionSeed[] = [
  // ===============================
  // 6MX (Micro-expressions)
  // ===============================
  {
    question_text: "What does the 'M' in 6MX stand for?",
    options: ["Movement", "Mirroring", "Micro-expressions", "Mindset"],
    correct_option_index: 2,
    question_type: "drill",
    difficulty: 1,
    framework_tags: ["6MX"],
    explanation:
      "6MX stands for the 6 universal Micro-expressions: Happiness, Sadness, Fear, Disgust, Anger, and Surprise.",
  },
  {
    question_text:
      "Which micro-expression is characterized by a one-sided mouth pull?",
    options: ["Disgust", "Contempt", "Anger", "Sadness"],
    correct_option_index: 1,
    question_type: "drill",
    difficulty: 2,
    framework_tags: ["6MX"],
    explanation:
      "Contempt is the only asymmetrical micro-expression, showing as a unilateral lip corner pull.",
  },
  {
    question_text:
      "A genuine (Duchenne) smile involves which muscles?",
    options: [
      "Only the mouth muscles",
      "Mouth and eye muscles",
      "Forehead and mouth",
      "Jaw and cheek",
    ],
    correct_option_index: 1,
    question_type: "drill",
    difficulty: 2,
    framework_tags: ["6MX", "Body Language"],
    explanation:
      "A Duchenne smile involves both the zygomatic major (mouth corners) and orbicularis oculi (crow's feet around eyes).",
  },
  {
    question_text: "Fear micro-expression typically shows:",
    options: [
      "Lowered brows and tense jaw",
      "Raised brows, wide eyes, open mouth",
      "Wrinkled nose and raised upper lip",
      "One-sided lip raise",
    ],
    correct_option_index: 1,
    question_type: "drill",
    difficulty: 2,
    framework_tags: ["6MX"],
    explanation:
      "Fear displays with raised and drawn-together eyebrows, wide eyes, and a horizontally stretched mouth.",
  },
  {
    question_text: "Disgust is primarily shown in which facial region?",
    options: ["Eyes and forehead", "Nose and upper lip", "Lower lip and chin", "Cheeks only"],
    correct_option_index: 1,
    question_type: "drill",
    difficulty: 2,
    framework_tags: ["6MX"],
    explanation:
      "Disgust centers on the nose wrinkle and raised upper lip, as if rejecting a bad smell.",
  },

  // ===============================
  // FATE Framework
  // ===============================
  {
    question_text: "In the FATE framework, what does 'F' stand for?",
    options: ["Force", "Focus", "Fear", "Frame"],
    correct_option_index: 1,
    question_type: "drill",
    difficulty: 1,
    framework_tags: ["FATE"],
    explanation: "FATE: Focus, Authority, Territory, Exposure.",
  },
  {
    question_text: "A person taking up more space at a table demonstrates which FATE element?",
    options: ["Focus", "Authority", "Territory", "Exposure"],
    correct_option_index: 2,
    question_type: "drill",
    difficulty: 1,
    framework_tags: ["FATE"],
    explanation:
      "Territory refers to physical space occupation and claiming behaviors.",
  },
  {
    question_text:
      "Someone maintaining strong eye contact while speaking demonstrates which FATE element?",
    options: ["Focus", "Authority", "Territory", "Exposure"],
    correct_option_index: 1,
    question_type: "drill",
    difficulty: 2,
    framework_tags: ["FATE"],
    explanation:
      "Authority includes behaviors that project dominance and confidence, such as sustained eye contact.",
  },
  {
    question_text: "In FATE, 'Exposure' refers to:",
    options: [
      "Revealing personal information",
      "Physical vulnerability signals",
      "Time spent talking",
      "Amount of eye contact",
    ],
    correct_option_index: 1,
    question_type: "drill",
    difficulty: 2,
    framework_tags: ["FATE"],
    explanation:
      "Exposure relates to comfort level—showing vulnerable areas (neck, torso) indicates openness.",
  },

  // ===============================
  // BTE (Baseline, Triggers, Exceptions)
  // ===============================
  {
    question_text: "What is the primary purpose of establishing someone's 'Baseline'?",
    options: [
      "To catch them lying",
      "To understand their normal behavior",
      "To build rapport quickly",
      "To establish authority",
    ],
    correct_option_index: 1,
    question_type: "drill",
    difficulty: 1,
    framework_tags: ["BTE"],
    explanation:
      "Baseline is their 'normal'—deviations from baseline indicate cognitive or emotional shifts.",
  },
  {
    question_text: "In BTE, a 'Trigger' is:",
    options: [
      "A word that causes anger",
      "A stimulus that produces a deviation from baseline",
      "A manipulation technique",
      "A rapport-building phrase",
    ],
    correct_option_index: 1,
    question_type: "drill",
    difficulty: 2,
    framework_tags: ["BTE"],
    explanation:
      "Triggers are stimuli (questions, topics, words) that cause observable changes from baseline behavior.",
  },
  {
    question_text: "How long should you typically observe someone to establish baseline?",
    options: ["30 seconds", "2-5 minutes", "15-30 minutes", "1 hour"],
    correct_option_index: 1,
    question_type: "drill",
    difficulty: 2,
    framework_tags: ["BTE"],
    explanation:
      "2-5 minutes of neutral conversation usually provides enough data to establish baseline patterns.",
  },

  // ===============================
  // 4 Frames
  // ===============================
  {
    question_text: "Which of the 4 Frames focuses on 'What's in it for them'?",
    options: ["Ego Frame", "Utility Frame", "Narrative Frame", "Identity Frame"],
    correct_option_index: 1,
    question_type: "drill",
    difficulty: 2,
    framework_tags: ["4 Frames"],
    explanation:
      "The Utility Frame addresses practical benefits and self-interest.",
  },
  {
    question_text: "The 'Identity Frame' relates to:",
    options: [
      "Their job title",
      "How they see themselves and want to be seen",
      "Their physical appearance",
      "Their social status",
    ],
    correct_option_index: 1,
    question_type: "drill",
    difficulty: 2,
    framework_tags: ["4 Frames"],
    explanation:
      "Identity Frame encompasses self-perception and desired perception by others.",
  },

  // ===============================
  // Elicitation
  // ===============================
  {
    question_text: "What is 'Elicitation' primarily used for?",
    options: [
      "Direct interrogation",
      "Obtaining information without direct questions",
      "Building deep rapport",
      "Inducing hypnotic states",
    ],
    correct_option_index: 1,
    question_type: "drill",
    difficulty: 2,
    framework_tags: ["Elicitation"],
    explanation:
      "Elicitation extracts information through conversation without the target realizing they're being questioned.",
  },
  {
    question_text: "The 'Assumed Knowledge' elicitation technique involves:",
    options: [
      "Pretending to know more than you do",
      "Asking about what you already know",
      "Making false statements to provoke correction",
      "Stating known facts to build credibility",
    ],
    correct_option_index: 2,
    question_type: "drill",
    difficulty: 3,
    framework_tags: ["Elicitation"],
    explanation:
      "Stating something slightly wrong triggers the target's urge to correct you, revealing accurate information.",
  },
  {
    question_text: "Which elicitation technique uses flattery strategically?",
    options: [
      "Bracketing",
      "Oblique Reference",
      "Appeal to Ego",
      "Naïve Questioning",
    ],
    correct_option_index: 2,
    question_type: "drill",
    difficulty: 2,
    framework_tags: ["Elicitation"],
    explanation:
      "Appeal to Ego leverages the target's desire to appear knowledgeable or important.",
  },

  // ===============================
  // Body Language
  // ===============================
  {
    question_text: "Which body part is considered the 'most honest' in body language?",
    options: ["Eyes", "Hands", "Feet", "Mouth"],
    correct_option_index: 2,
    question_type: "drill",
    difficulty: 2,
    framework_tags: ["Body Language"],
    explanation:
      "Feet are furthest from the brain and receive the least conscious control, making them highly reliable indicators.",
  },
  {
    question_text: "Crossed arms most reliably indicate:",
    options: [
      "Deception",
      "Self-comfort or barrier behavior",
      "Aggression",
      "Confidence",
    ],
    correct_option_index: 1,
    question_type: "drill",
    difficulty: 2,
    framework_tags: ["Body Language"],
    explanation:
      "Crossed arms are primarily self-soothing or barrier behavior—not necessarily deception or negativity.",
  },
  {
    question_text: "A 'ventral denial' is when someone:",
    options: [
      "Turns their back completely",
      "Angles their torso away while facing you",
      "Covers their face",
      "Looks down and away",
    ],
    correct_option_index: 1,
    question_type: "drill",
    difficulty: 3,
    framework_tags: ["Body Language"],
    explanation:
      "Ventral denial: protecting the vulnerable front of the body by angling away, signaling discomfort.",
  },

  // ===============================
  // Cognitive Biases
  // ===============================
  {
    question_text: "What is 'Cognitive Dissonance'?",
    options: [
      "Perfect mental clarity",
      "Discomfort from holding conflicting beliefs",
      "Inability to focus",
      "Memory loss under stress",
    ],
    correct_option_index: 1,
    question_type: "drill",
    difficulty: 1,
    framework_tags: ["Cognitive Biases"],
    explanation:
      "Cognitive dissonance is psychological stress from holding contradictory beliefs simultaneously.",
  },
  {
    question_text: "The 'Halo Effect' causes people to:",
    options: [
      "Follow the crowd blindly",
      "Let one positive trait influence overall perception",
      "Remember only negative information",
      "Overestimate their own abilities",
    ],
    correct_option_index: 1,
    question_type: "drill",
    difficulty: 2,
    framework_tags: ["Cognitive Biases"],
    explanation:
      "Halo Effect: a positive impression in one area bleeds into judgment of unrelated areas.",
  },
  {
    question_text: "Confirmation Bias leads people to:",
    options: [
      "Seek information that supports existing beliefs",
      "Change their minds easily",
      "Trust authority figures",
      "Forget contradictory evidence",
    ],
    correct_option_index: 0,
    question_type: "drill",
    difficulty: 1,
    framework_tags: ["Cognitive Biases"],
    explanation:
      "Confirmation bias: the tendency to search for and favor information confirming preexisting beliefs.",
  },
  {
    question_text: "The 'Anchoring' bias refers to:",
    options: [
      "Staying physically grounded",
      "Over-relying on the first piece of information received",
      "Being unable to change opinions",
      "Trusting experts implicitly",
    ],
    correct_option_index: 1,
    question_type: "drill",
    difficulty: 2,
    framework_tags: ["Cognitive Biases"],
    explanation:
      "Anchoring: first information received disproportionately influences subsequent judgments.",
  },

  // ===============================
  // Rapport
  // ===============================
  {
    question_text: "Mirroring in rapport building involves:",
    options: [
      "Copying exactly what someone says",
      "Subtly matching body language and speech patterns",
      "Always agreeing with them",
      "Maintaining identical posture",
    ],
    correct_option_index: 1,
    question_type: "drill",
    difficulty: 1,
    framework_tags: ["Rapport"],
    explanation:
      "Effective mirroring is subtle matching of posture, gestures, and speech rhythm—not exact copying.",
  },
  {
    question_text: "The most effective way to build initial rapport is:",
    options: [
      "Sharing personal stories immediately",
      "Finding genuine common ground",
      "Complimenting their appearance",
      "Asking many questions",
    ],
    correct_option_index: 1,
    question_type: "drill",
    difficulty: 2,
    framework_tags: ["Rapport"],
    explanation:
      "Authentic common ground creates natural connection faster than forced techniques.",
  },

  // ===============================
  // Influence (Cialdini)
  // ===============================
  {
    question_text: "The principle of 'Reciprocity' states that people:",
    options: [
      "Always want to be first",
      "Feel obligated to return favors",
      "Trust authority figures",
      "Follow the crowd",
    ],
    correct_option_index: 1,
    question_type: "drill",
    difficulty: 1,
    framework_tags: ["Influence", "Cialdini"],
    explanation:
      "Reciprocity: receiving something creates a psychological obligation to give something back.",
  },
  {
    question_text: "Social Proof is most effective when:",
    options: [
      "Coming from authority figures",
      "Coming from similar people in similar situations",
      "Presented with statistics",
      "Delivered privately",
    ],
    correct_option_index: 1,
    question_type: "drill",
    difficulty: 2,
    framework_tags: ["Influence", "Cialdini"],
    explanation:
      "Social proof is most persuasive when the examples are from people we perceive as similar to ourselves.",
  },
  {
    question_text: "The 'Scarcity' principle works because:",
    options: [
      "People like expensive things",
      "Perceived limited availability increases value",
      "Rare items are always better",
      "People fear loss of options",
    ],
    correct_option_index: 1,
    question_type: "drill",
    difficulty: 2,
    framework_tags: ["Influence", "Cialdini"],
    explanation:
      "Scarcity creates urgency by making opportunities seem more valuable when limited.",
  },

  // ===============================
  // General Doctrine
  // ===============================
  {
    question_text: "The first step in any behavioral observation should be:",
    options: [
      "Making assumptions based on appearance",
      "Establishing baseline behavior",
      "Testing for deception",
      "Building rapport immediately",
    ],
    correct_option_index: 1,
    question_type: "drill",
    difficulty: 1,
    framework_tags: ["General"],
    explanation:
      "Always establish baseline first—you cannot identify deviations without knowing what's normal.",
  },
  {
    question_text: "A 'cluster' of behaviors is important because:",
    options: [
      "Single behaviors are always reliable",
      "Multiple consistent signals increase reliability",
      "Clusters are easier to observe",
      "They indicate deception specifically",
    ],
    correct_option_index: 1,
    question_type: "drill",
    difficulty: 2,
    framework_tags: ["General"],
    explanation:
      "Never rely on single behaviors. Clusters of congruent signals dramatically increase diagnostic accuracy.",
  },
  {
    question_text: "Context is critical in behavioral analysis because:",
    options: [
      "It makes you look more professional",
      "The same behavior can mean different things in different situations",
      "It helps you remember observations",
      "Without context, people won't talk to you",
    ],
    correct_option_index: 1,
    question_type: "drill",
    difficulty: 2,
    framework_tags: ["General"],
    explanation:
      "Behavior must be interpreted within context—crossed arms in a cold room vs. during confrontation mean different things.",
  },
];

async function seed(): Promise<void> {
  console.log(`[Seed] Preparing to seed ${questions.length} questions...`);

  // Clear existing questions (optional—comment out to append)
  // await supabase.from("questions").delete().neq("id", 0);

  const { data, error } = await supabase.from("questions").insert(questions).select();

  if (error) {
    console.error("[Seed] Error seeding questions:", error.message);
    process.exit(1);
  }

  console.log(`[Seed] Successfully seeded ${data?.length ?? 0} questions.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("[Seed] Unexpected error:", err);
  process.exit(1);
});
