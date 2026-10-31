import { TopicStepGuide } from '../src/types';

// Curated high-yield topic guides with pedagogical depth
export const CURATED_TOPIC_GUIDES: Record<string, TopicStepGuide> = {
  normalization: {
    subject: 'Database Management Systems',
    topic: 'Normalization (1NF, 2NF, 3NF, BCNF)',
    prerequisites: ['Relational Model Basics', 'Primary Keys & Candidate Keys', 'Functional Dependencies (FDs)'],
    starting_point: {
      first_step: 'Do NOT start by memorizing definitions. First understand the 3 anomalies: Insertion, Deletion, and Update anomalies.',
      first_30_mins: 'Write out one messy single-table spreadsheet (e.g. StudentID, StudentName, CourseID, CourseInstructor, Room). Observe how changing an instructor name requires updating 50 rows. That headache is why normalization exists.',
      mental_model: 'Normalization is organizing a messy closet: grouping related items into their own labeled boxes with a tag connecting them, so moving one item never ruins the rest.',
    },
    steps: [
      {
        step_number: 1,
        title: 'Master Functional Dependency & Attribute Closure (First 35 min)',
        duration: '35 mins',
        what_to_do: 'Learn how to calculate attribute closure (X⁺). Given relation R(A, B, C, D) and FDs {A->B, B->C}, practice finding if A is a candidate key.',
        key_concept: 'If X⁺ contains all attributes in the relation, then X is a Super Key. If no subset of X is a superkey, X is a Candidate Key.',
        check_question: 'Can you determine candidate keys from a given set of FDs in under 3 minutes without looking at notes?',
      },
      {
        step_number: 2,
        title: '1NF to 2NF: Kill Partial Dependencies (30 min)',
        duration: '30 mins',
        what_to_do: 'Understand that 1NF means atomic values (no lists in a single cell). 2NF means every non-prime attribute must depend on the WHOLE candidate key, not part of a composite key.',
        key_concept: 'Partial dependency only happens if the candidate key is composite (e.g. {StudentID, CourseID}). If keys are single attributes, it is automatically 2NF!',
        check_question: 'If candidate key is {A, B} and FD is A -> C, which normal form is violated?',
      },
      {
        step_number: 3,
        title: '3NF & BCNF: Eliminate Transitive Dependencies (40 min)',
        duration: '40 mins',
        what_to_do: 'Apply the rule for 3NF: for every FD X -> Y, either X is a Super Key OR Y is a Prime Attribute. For BCNF, strictly X MUST be a Super Key.',
        key_concept: '3NF is forgiving (allows non-superkey if RHS is prime attribute); BCNF is strict (LHS must always be a superkey).',
        check_question: 'Why is BCNF strictly stronger than 3NF, and when might you prefer 3NF (dependency preservation)?',
      },
      {
        step_number: 4,
        title: 'Lossless Decomposition & Exam Traps (35 min)',
        duration: '35 mins',
        what_to_do: 'Practice splitting R into R1 and R2 and checking if (R1 ∩ R2) -> R1 or (R1 ∩ R2) -> R2. If yes, the decomposition is lossless join.',
        key_concept: 'An exam question almost always gives R(A,B,C,D,E) with 4 FDs and asks: 1) Identify candidate keys, 2) Highest normal form, 3) Decompose into 3NF/BCNF.',
        check_question: 'Can you decompose a relation that is in 3NF but not BCNF without losing dependencies?',
      },
    ],
    practice_ladder: [
      {
        level: 'Beginner',
        problem_type: 'Attribute Closure Check',
        goal: 'Given R(A,B,C,D) with {A->B, BC->D}, compute A⁺ and (AC)⁺ to identify candidate keys.',
      },
      {
        level: 'Intermediate',
        problem_type: 'Normal Form Diagnosis',
        goal: 'Determine the highest normal form of a given schema with 3 FDs and justify in 2 sentences.',
      },
      {
        level: 'Exam Ready',
        problem_type: 'Full Decomposition & Lossless Test',
        goal: 'Decompose a university enrollment relation into BCNF tables and verify lossless join property.',
      },
    ],
    common_traps: [
      'Assuming 2NF is violated when the primary key is just a single column (partial dependency requires composite keys).',
      'Confusing superkey with candidate key (candidate key is minimal superkey).',
      'Forgetting that in BCNF, dependency preservation is not always guaranteed.',
    ],
    self_test_questions: [
      'What is an attribute closure and how does it prove if a set of attributes is a key?',
      'If X -> Y and Y is a prime attribute, can this relation be in 3NF? Can it be in BCNF?',
      'Why is losing dependency preservation during BCNF decomposition sometimes an acceptable trade-off in production databases?',
    ],
  },

  pointers: {
    subject: 'Data Structures & Algorithms',
    topic: 'Pointers & Dynamic Memory Management',
    prerequisites: ['Variables and Data Types in C/C++', 'Function Parameters & Return Values'],
    starting_point: {
      first_step: 'Draw physical memory as a row of numbered lockers (addresses: 1000, 1004, 1008...).',
      first_30_mins: 'Write a 10-line program declaring `int x = 42; int *ptr = &x;`. Print both `&x`, `ptr`, `x`, and `*ptr`. See the actual hex addresses in your terminal.',
      mental_model: 'A pointer is just a piece of paper containing a locker number, NOT the locker itself. Dereferencing (*) is walking over and opening that locker.',
    },
    steps: [
      {
        step_number: 1,
        title: 'The Address-Of (&) vs Dereference (*) Distinction (25 min)',
        duration: '25 mins',
        what_to_do: 'Clear up the syntax ambiguity: `*` means "pointer type" when declaring (`int *p`), but "go to address" when executing (`*p = 10`).',
        key_concept: '`&` extracts the address where a variable lives. `*` visits that address and accesses its stored payload.',
        check_question: 'If `p` holds 0x7ffd, what does `*p` evaluate to?',
      },
      {
        step_number: 2,
        title: 'Pointer Arithmetic & Arrays Under the Hood (35 min)',
        duration: '35 mins',
        what_to_do: 'Understand why `ptr + 1` advances by `sizeof(type)` bytes, not 1 byte! Trace `arr[i]` being equivalent to `*(arr + i)`.',
        key_concept: 'An array name acts like a constant pointer to its first element: `arr == &arr[0]`.',
        check_question: 'If an `int` takes 4 bytes and `ptr = 2000`, what is the address of `ptr + 3`?',
      },
      {
        step_number: 3,
        title: 'Heap Memory: malloc/free or new/delete (40 min)',
        duration: '40 mins',
        what_to_do: 'Differentiate Stack (auto-managed, fixed scope) vs Heap (manual allocation, lives until freed). Trace memory leaks.',
        key_concept: 'Always check if `malloc` returned NULL. Every `malloc` MUST have a matching `free` before pointer is re-assigned.',
        check_question: 'What is a dangling pointer and how does setting `ptr = NULL` after freeing prevent silent bugs?',
      },
      {
        step_number: 4,
        title: 'Double Pointers & Linked List Node Modification (40 min)',
        duration: '40 mins',
        what_to_do: 'Learn pass-by-pointer: why modifying a head pointer in a function requires `Node **head_ref`.',
        key_concept: 'To modify an int inside a function, pass `int*`. To modify a pointer (`Node*`) inside a function, pass `Node**`.',
        check_question: 'Why does passing `Node *head` by value to `insertAtBeginning` fail to update the caller\'s head?',
      },
    ],
    practice_ladder: [
      {
        level: 'Beginner',
        problem_type: 'Address Tracing',
        goal: 'Hand-trace a 15-line pointer swap function and draw memory diagrams showing address changes.',
      },
      {
        level: 'Intermediate',
        problem_type: 'Dynamic Array Allocation',
        goal: 'Write a function that dynamically allocates an array of N integers, fills it, and correctly frees it.',
      },
      {
        level: 'Exam Ready',
        problem_type: 'Linked List Node Insertion',
        goal: 'Implement a singly linked list insertion at head and deletion by key using pointer manipulation.',
      },
    ],
    common_traps: [
      'Dereferencing a NULL or uninitialized pointer (causes Segmentation Fault / crash).',
      'Forgetting that memory allocated with malloc retains garbage values unless cleared with calloc or memset.',
      'Memory leak: reassigning a pointer before calling free() on its allocated memory block.',
    ],
    self_test_questions: [
      'What is the difference between a segmentation fault and a memory leak?',
      'Why does `int *arr = malloc(5 * sizeof(int))` allow index access like `arr[2]`?',
      'How does double indirection (`**`) allow functions to alter pointer variables in the caller frame?',
    ],
  },

  deadlocks: {
    subject: 'Operating Systems',
    topic: 'Deadlocks & The Banker\'s Algorithm',
    prerequisites: ['Processes and Threads', 'Resources (Preemptible vs Non-preemptible)', 'State Transitions'],
    starting_point: {
      first_step: 'Visualize a 4-way intersection gridlock where every car is bumper-to-bumper with the car ahead.',
      first_30_mins: 'Memorize the 4 Coffman Conditions with an everyday analogy: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait. All 4 MUST hold simultaneously for a deadlock to exist.',
      mental_model: 'Two kids: Kid A holds the Xbox controller and wants the headset. Kid B holds the headset and wants the controller. Neither will surrender what they have.',
    },
    steps: [
      {
        step_number: 1,
        title: 'The 4 Coffman Conditions (25 min)',
        duration: '25 mins',
        what_to_do: 'Break down why breaking ANY single condition completely prevents deadlock from ever occurring.',
        key_concept: 'Deadlock Prevention = Structuring system rules so at least one Coffman condition is mathematically impossible (e.g. resource ordering breaks circular wait).',
        check_question: 'How does imposing a strict global total ordering on all resource types prevent circular wait?',
      },
      {
        step_number: 2,
        title: 'Resource Allocation Graph (RAG) (30 min)',
        duration: '30 mins',
        what_to_do: 'Draw process circles (P1, P2) and resource boxes with dots for instances. Draw request edges (P -> R) and assignment edges (R -> P).',
        key_concept: 'If RAG has NO cycles → guaranteed NO deadlock. If RAG has cycles and resources are single-instance → GUARANTEED deadlock.',
        check_question: 'If a cycle exists in a RAG with multi-instance resources, is deadlock guaranteed? (Answer: No, depends on available instances).',
      },
      {
        step_number: 3,
        title: 'Banker\'s Algorithm for Deadlock Avoidance (45 min)',
        duration: '45 mins',
        what_to_do: 'Calculate the Need Matrix: `Need[i][j] = Max[i][j] - Allocation[i][j]`. Simulate finding a safe sequence.',
        key_concept: 'A state is "Safe" if there exists at least one order (Safe Sequence <P1, P3, P0...>) where all processes can finish one by one.',
        check_question: 'Can a system be in an unsafe state without actually being deadlocked yet?',
      },
      {
        step_number: 4,
        title: 'Resource Request Algorithm & Exam Table Solving (40 min)',
        duration: '40 mins',
        what_to_do: 'Practice standard exam tables: Given Allocation, Max, and Available vectors, evaluate whether Request(P_i) can be immediately granted.',
        key_concept: 'Rule 1: Request <= Need. Rule 2: Request <= Available. Pretend to allocate, run Safety Algorithm. If safe, grant; else wait.',
        check_question: 'What are the two checks the OS must make BEFORE pretending to grant a process\'s resource request?',
      },
    ],
    practice_ladder: [
      {
        level: 'Beginner',
        problem_type: 'Coffman Condition Identification',
        goal: 'Identify which Coffman condition is broken by spooling, resource preemption, and total resource ordering.',
      },
      {
        level: 'Intermediate',
        problem_type: 'RAG Cycle Detection',
        goal: 'Given a 3-process 2-resource system, draw the RAG, detect cycles, and determine if deadlock exists.',
      },
      {
        level: 'Exam Ready',
        problem_type: 'Banker\'s Algorithm Matrix Calculation',
        goal: 'Solve a standard 5-process 3-resource Banker\'s problem: compute Need matrix, find safe sequence, and evaluate a new request in 10 minutes.',
      },
    ],
    common_traps: [
      'Assuming that an unsafe state automatically means the system is currently deadlocked (unsafe means deadlock is possible, not guaranteed).',
      'Calculating Need matrix incorrectly by subtracting Allocation from Available instead of Max.',
      'Forgetting to return the process\'s allocated resources back to the Available pool when a process finishes in the safe sequence simulation.',
    ],
    self_test_questions: [
      'What is the fundamental difference between Deadlock Prevention and Deadlock Avoidance?',
      'Why is Banker\'s Algorithm rarely used in modern general-purpose operating systems like Linux or Windows?',
      'How does the concept of a "Safe Sequence" guarantee the absence of deadlocks?',
    ],
  },

  recursion: {
    subject: 'Data Structures & Algorithms',
    topic: 'Recursion & Dynamic Programming (DP)',
    prerequisites: ['Functions and Call Stack Basics', 'Array Iteration', 'Basic Time Complexity (Big-O)'],
    starting_point: {
      first_step: 'Do NOT try to hold the entire recursion tree in your head. Trust the recursive leap of faith.',
      first_30_mins: 'Draw the call stack for `factorial(3)` as real cardboard boxes stacked on top of each other. See how it pauses at each level until the base case returns.',
      mental_model: 'Delegating work to your clone: You solve the top layer, hand a strictly smaller problem to your clone, and wait for their answer before doing the final addition.',
    },
    steps: [
      {
        step_number: 1,
        title: 'The 3 Golden Rules of Recursion (30 min)',
        duration: '30 mins',
        what_to_do: 'Every recursive function needs: 1) Base Case (stop condition), 2) Work done at current level, 3) Recursive call with smaller input.',
        key_concept: 'If your input does not get strictly closer to the base case on every invocation, you will trigger Stack Overflow.',
        check_question: 'What happens if the base case is omitted or unreachable?',
      },
      {
        step_number: 2,
        title: 'Visualizing Recursion Trees & Overlapping Subproblems (35 min)',
        duration: '35 mins',
        what_to_do: 'Draw the call tree for `fib(5)`. Circle all the duplicate calls like `fib(3)` and `fib(2)`.',
        key_concept: 'When the same subproblems are computed over and over again, that tree has exponential O(2ⁿ) complexity — the prime candidate for Dynamic Programming!',
        check_question: 'How many times is `fib(2)` calculated when computing `fib(5)` naively?',
      },
      {
        step_number: 3,
        title: 'Top-Down DP: Memoization (40 min)',
        duration: '40 mins',
        what_to_do: 'Take your clean recursive code and add 3 lines: a hash map or array `memo`. Before computing, check if in memo; before returning, store in memo.',
        key_concept: 'Memoization turns exponential recursive trees into linear or polynomial graphs: compute once, store, reuse forever.',
        check_question: 'How does memoization reduce Fibonacci from O(2ⁿ) to O(n) time?',
      },
      {
        step_number: 4,
        title: 'Bottom-Up DP: Tabulation (40 min)',
        duration: '40 mins',
        what_to_do: 'Eliminate the recursion stack entirely! Create a table `dp[]`, fill base cases `dp[0]=0, dp[1]=1`, and use a loop `for i=2 to n: dp[i] = dp[i-1] + dp[i-2]`.',
        key_concept: 'State transition equations dictate how past subproblem answers build future answers.',
        check_question: 'Why does bottom-up tabulation avoid stack overflow errors that top-down memoization might encounter?',
      },
    ],
    practice_ladder: [
      {
        level: 'Beginner',
        problem_type: 'Basic Stack Tracing',
        goal: 'Hand-trace sum of digits or string reversal using recursion and draw stack push/pop stages.',
      },
      {
        level: 'Intermediate',
        problem_type: 'Climbing Stairs / Fibonacci Memoization',
        goal: 'Solve the Climbing Stairs problem (1 or 2 steps) using both recursion + memoization and tabular DP.',
      },
      {
        level: 'Exam Ready',
        problem_type: '0/1 Knapsack Problem',
        goal: 'Formulate the recurrence relation for 0/1 Knapsack, build the 2D DP table, and trace the optimal value in 15 minutes.',
      },
    ],
    common_traps: [
      'Trying to mentally execute all recursive branches at once instead of establishing the inductive hypothesis.',
      'Putting state changes after the recursive call when they needed to happen before, or vice-versa.',
      'Confusing 0/1 Knapsack (each item picked at most once) with Fractional Knapsack (greedy approach).',
    ],
    self_test_questions: [
      'What are the two necessary properties a problem must possess for Dynamic Programming to be applicable?',
      'What is the space complexity overhead of top-down recursion with memoization compared to bottom-up tabulation?',
      'How do you identify whether a recursive branch should be explored using Backtracking vs Dynamic Programming?',
    ],
  },
};

// Generic pedagogical topic guide generator for any subject & topic
export function generateDynamicTopicGuide(subject: string, topicName?: string): TopicStepGuide {
  const normalizedTopic = (topicName || subject).toLowerCase();

  // Check if we have an exact or partial match in curated library
  for (const key of Object.keys(CURATED_TOPIC_GUIDES)) {
    if (normalizedTopic.includes(key) || key.includes(normalizedTopic)) {
      return CURATED_TOPIC_GUIDES[key];
    }
  }

  const effectiveTopic = topicName?.trim() || `${subject} Core Mastery`;

  return {
    subject,
    topic: effectiveTopic,
    prerequisites: [
      `Foundational definitions of ${effectiveTopic}`,
      `Basic problem-solving conventions in ${subject}`,
      'Core syllabus terminology',
    ],
    starting_point: {
      first_step: `Do NOT dive straight into complex formulas or past exam papers. First build an intuitive mental anchor for ${effectiveTopic}.`,
      first_30_mins: `Read the first 3 pages of your reference textbook or lecture slides covering "${effectiveTopic}". Write down the main definition in your own words, and draw a quick mind-map diagram linking its 3 primary components.`,
      mental_model: `Think of ${effectiveTopic} as a specialized pipeline: raw inputs are structured according to specific rules to produce a predictable, verified output.`,
    },
    steps: [
      {
        step_number: 1,
        title: 'Intuition & Key Terminology Anchor (Day 1 / 30 mins)',
        duration: '30 mins',
        what_to_do: `Identify the 3 to 5 core technical terms that define ${effectiveTopic}. Create simple flashcards or bullet notes defining what each term means without confusing academic jargon.`,
        key_concept: 'Mastering the terminology eliminates 60% of confusion before touching numerical or theoretical derivations.',
        check_question: `Can you explain the main purpose of ${effectiveTopic} to a fellow student in 60 seconds without looking at notes?`,
      },
      {
        step_number: 2,
        title: 'Trace One Worked Example Step-by-Step (Day 1 / 35 mins)',
        duration: '35 mins',
        what_to_do: `Find a solved textbook problem or professor\'s lecture example on ${effectiveTopic}. Copy each line by hand on paper, writing a 1-sentence explanation beside each transition explaining WHY that step was taken.`,
        key_concept: 'Passive reading gives the illusion of competence. Active handwriting forces your brain to register state transitions and logic leaps.',
        check_question: 'Can you reproduce that same solved example from a blank sheet of paper without checking the solution?',
      },
      {
        step_number: 3,
        title: 'The "Rule of 3" Practice Ladder (Day 2 / 45 mins)',
        duration: '45 mins',
        what_to_do: `Solve 3 graduated problems: 1) One basic warmup problem identical to the lecture, 2) One problem with a slight variation in parameters, and 3) One challenge question that combines two sub-concepts.`,
        key_concept: 'If you get stuck for more than 7 minutes, consult the hint, write down the missing insight in a "Mistake Log", and retry.',
        check_question: 'What specific trigger in the question tells you which formula or technique to apply?',
      },
      {
        step_number: 4,
        title: 'Exam Trap Identification & 1-Page Formula Summary (Day 3 / 30 mins)',
        duration: '30 mins',
        what_to_do: `Look at past 3 years university exam papers for questions on ${effectiveTopic}. Highlight trick constraints (e.g. boundary conditions, edge cases, negative values). Create a 1-page condensed "Emergency Exam Sheet".`,
        key_concept: 'Exams test edge cases and boundary conditions, not just happy-path scenarios.',
        check_question: 'What are the top 2 mistakes students lose marks on in this topic during semester exams?',
      },
    ],
    practice_ladder: [
      {
        level: 'Beginner',
        problem_type: 'Concept Recognition & Basic Calculation',
        goal: `State the fundamental theorem or algorithm and solve a straightforward single-step problem on ${effectiveTopic}.`,
      },
      {
        level: 'Intermediate',
        problem_type: 'Multi-Step Application Problem',
        goal: `Solve a standard university midterm question where you must transform input parameters before applying the core method.`,
      },
      {
        level: 'Exam Ready',
        problem_type: 'End-Semester Synthesis / Edge-Case Question',
        goal: `Solve a full-weightage university final exam question involving edge cases, performance trade-offs, or formal proofs.`,
      },
    ],
    common_traps: [
      'Skipping foundational definitions to jump immediately into complex past exam questions.',
      'Reading solutions and nodding along rather than attempting problems on a blank sheet of paper.',
      'Neglecting boundary conditions, negative cases, or unit conversions.',
    ],
    self_test_questions: [
      `What is the single most important definition or theorem in ${effectiveTopic}?`,
      'Under what conditions or assumptions does this technique fail or become inefficient?',
      'If given this topic in a 10-mark final exam question, what 3 diagrams or equations MUST be drawn to secure full marks?',
    ],
  };
}

// Convert a topic step guide into an empathetic, step-by-step markdown response for the Coach chat
export function formatTopicGuideForChat(guide: TopicStepGuide, customContext?: string): string {
  return `### 🧭 Step-by-Step Study Guide: **${guide.topic}**
*Subject:* **${guide.subject}**

${customContext ? `💡 *Student Context:* ${customContext}\n` : ''}
---
#### 🌱 1. How to Start from Absolute Scratch (First 30 Mins)
- **First Step:** ${guide.starting_point.first_step}
- **Your First 30 Minutes:** ${guide.starting_point.first_30_mins}
- **Mental Model to Hold:** *"${guide.starting_point.mental_model}"*

---
#### 🪜 2. The 4-Phase Study Roadmap
${guide.steps
  .map(
    (s) => `**Step ${s.step_number}: ${s.title}** [⏱️ ${s.duration}]
• **What to do:** ${s.what_to_do}
• **Key Concept:** ${s.key_concept}
• **Self-Check Question:** *${s.check_question}*`
  )
  .join('\n\n')}

---
#### 🎯 3. Practice Problem Ladder
1. **Beginner:** ${guide.practice_ladder[0].problem_type} — *Goal: ${guide.practice_ladder[0].goal}*
2. **Intermediate:** ${guide.practice_ladder[1].problem_type} — *Goal: ${guide.practice_ladder[1].goal}*
3. **Exam Ready:** ${guide.practice_ladder[2].problem_type} — *Goal: ${guide.practice_ladder[2].goal}*

---
#### ⚠️ 4. Common Traps to Watch Out For
${guide.common_traps.map((t) => `• ⚠️ ${t}`).join('\n')}

---
#### 🏁 5. Diagnostic Check: Are You Ready for Exams?
${guide.self_test_questions.map((q, idx) => `[ ] ${idx + 1}. ${q}`).join('\n')}

*Ready to start? Begin with **Step 1** right now for 25 minutes, then take a 5-minute breather!*`;
}
