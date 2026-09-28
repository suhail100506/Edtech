import { Learner, RiskLevel } from "../types";
import { RISK_THRESHOLDS } from "../constants";

// Seeded pseudorandom generator for deterministic, reproducible mock data
function createSeededRandom(seed: number) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function generateMockLearners(count = 500): Learner[] {
  const rng = createSeededRandom(42);
  const learners: Learner[] = [];
  const courses = ["C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09", "C10"];

  for (let i = 1; i <= count; i++) {
    const id = `L${(1000 + i).toString()}`;
    const courseIndex = Math.floor(rng() * courses.length);
    const courseId = courses[courseIndex];

    // Overall completion rate ~ 55%
    const isCompleted = rng() < 0.55;

    let login: number;
    let video: number;
    let quiz: number;
    let assignments: number;
    let discussion: number;

    if (isCompleted) {
      // Centered around completed means: Login 5.99, Video 82.1, Quiz 3.61, Assign 2.88, Disc 2.84
      login = clamp(Math.round(5.99 + (rng() - 0.5) * 4), 1, 10);
      video = clamp(roundTo(82.1 + (rng() - 0.5) * 30, 1), 35, 100);
      quiz = clamp(Math.round(3.61 + (rng() - 0.5) * 3), 1, 6);
      assignments = clamp(Math.round(2.88 + (rng() - 0.5) * 2), 1, 4);
      discussion = clamp(Math.round(2.84 + (rng() - 0.5) * 4), 0, 7);
    } else {
      // Centered around not completed means: Login 3.76, Video 42.57, Quiz 2.27, Assign 1.71, Disc 1.71
      login = clamp(Math.round(3.76 + (rng() - 0.5) * 3.5), 0, 8);
      video = clamp(roundTo(42.57 + (rng() - 0.5) * 45, 1), 0, 85);
      quiz = clamp(Math.round(2.27 + (rng() - 0.5) * 2.5), 0, 4);
      assignments = clamp(Math.round(1.71 + (rng() - 0.5) * 2), 0, 3);
      discussion = clamp(Math.round(1.71 + (rng() - 0.5) * 2.5), 0, 5);
    }

    // Dropout risk model heuristic mirroring feature weights:
    // Video: 0.3805, Login: 0.178, Quiz: 0.1261, Assign: 0.1197, Disc: 0.1117
    const normVideo = video / 100;
    const normLogin = clamp(login / 8, 0, 1);
    const normQuiz = clamp(quiz / 5, 0, 1);
    const normAssign = clamp(assignments / 4, 0, 1);
    const normDisc = clamp(discussion / 5, 0, 1);

    const completionScore =
      0.3805 * normVideo +
      0.178 * normLogin +
      0.1261 * normQuiz +
      0.1197 * normAssign +
      0.1117 * normDisc;

    // Add subtle stochastic noise
    const noise = (rng() - 0.5) * 0.12;
    const completionProb = clamp(roundTo(completionScore + noise, 3), 0.05, 0.98);
    const dropoutRisk = roundTo(1 - completionProb, 3);

    let riskLevel: RiskLevel;
    if (dropoutRisk > RISK_THRESHOLDS.mediumMax) {
      riskLevel = "High";
    } else if (dropoutRisk >= RISK_THRESHOLDS.lowMax) {
      riskLevel = "Medium";
    } else {
      riskLevel = "Low";
    }

    // Recommended action based on lowest relative metric
    let recommendedAction = "Maintain self-paced progress & milestone engagement.";
    if (riskLevel === "High") {
      if (video < 35) {
        recommendedAction = "1-on-1 mentor check-in; provide bite-sized video recaps.";
      } else if (login < 3) {
        recommendedAction = "Automated SMS/email re-engagement alert with direct module deep link.";
      } else if (assignments < 2) {
        recommendedAction = "Assignment assistance session & deadline extension offer.";
      } else {
        recommendedAction = "Comprehensive mentor review & learning barrier assessment.";
      }
    } else if (riskLevel === "Medium") {
      if (quiz < 2) {
        recommendedAction = "Prompt low-stakes concept practice quiz with instant explanations.";
      } else if (discussion < 2) {
        recommendedAction = "Invite to peer study cohort & active discussion thread.";
      } else {
        recommendedAction = "Weekly milestone reminder and progress encouragement.";
      }
    } else {
      recommendedAction = "Award milestone badge & invite to peer mentoring program.";
    }

    learners.push({
      Learner_ID: id,
      Course_ID: courseId,
      Login_Frequency: login,
      Video_Completion: video,
      Quiz_Attempts: quiz,
      Assignment_Submissions: assignments,
      Discussion_Activity: discussion,
      Completion_Status: isCompleted ? "Completed" : "Not Completed",
      predictedRisk: dropoutRisk,
      completionProbability: completionProb,
      riskLevel,
      recommendedAction,
    });
  }

  return learners;
}

export const MOCK_LEARNERS: Learner[] = generateMockLearners(500);
