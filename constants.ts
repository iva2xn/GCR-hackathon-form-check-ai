import type { ReportData } from './types';

export const DUMMY_REPORT_DATA: ReportData = {
  title: 'Form Analysis Report: Barbell Squat',
  error: {
    title: 'Consistent Error Detected',
    timestamp: '@ 0:12',
    imageSrc: 'https://picsum.photos/seed/squat-form/800/600',
  },
  findings: {
    errorName: "'Butt Wink' - Lumbar Spine Flexion",
    description: "AI detected a consistent posterior pelvic tilt leading to spinal flexion at the bottom of the squat. This is often caused by mobility limitations in the hips or ankles, or a lack of core stability.",
    confidence: '94% High',
    affectedJoints: ['Lumbar Spine', 'Pelvis', 'Hips'],
  },
  correctionPlan: {
    title: 'Actionable Correction Plan',
    steps: [
      {
        title: '1. Enhance Core Bracing',
        description: 'Before descending, take a deep breath into your abdomen (not your chest) and brace your core muscles as if you are about to be punched. Maintain this tension throughout the entire lift.',
      },
      {
        title: '2. Control Your Depth',
        description: 'Only squat as deep as you can while maintaining a neutral spine. Use a mirror or record yourself to find the point where your pelvis starts to tuck under, and stop just before that point.',
      },
      {
        title: '3. Improve Ankle and Hip Mobility',
        description: 'Incorporate mobility drills for your ankles (e.g., wall ankle mobilizations) and hips (e.g., pigeon pose, frog stretch) into your warm-up routine to improve your range of motion.',
      },
    ],
  },
  rationale: {
    title: 'Why This Correction Matters',
    text: 'Maintaining a neutral spine during heavy lifts like the squat is critical for preventing injury. A "butt wink" places significant shearing forces on the lumbar vertebrae and intervertebral discs. Over time, this can lead to chronic lower back pain, disc herniation, and other serious spinal injuries. Proper form not only ensures safety but also allows for more efficient force transfer, leading to better performance and strength gains.',
  },
  positiveReinforcement: {
    title: "What You're Doing Well",
    text: "Excellent spinal neutrality at the start of the lift. Your setup is strong and stable, providing a great foundation for the movement."
  },
  formRating: {
    formScore: 75,
    level: 'Good',
    justification: 'Your overall form is solid, with a strong core and good tempo. The main area for improvement is achieving full depth without lumbar flexion, which impacts your spinal alignment score.',
    detailedScores: [
      {
        metric: 'Spinal Alignment',
        score: 6,
        justification: 'Spine is neutral at the start but shows flexion (butt wink) at the bottom of the squat.',
      },
      {
        metric: 'Joint Stability',
        score: 8,
        justification: 'Knees track well over the feet with minimal wavering. Hips appear stable.',
      },
      {
        metric: 'Range of Motion',
        score: 7,
        justification: 'Depth is limited by the onset of butt wink. Could be deeper with improved mobility.',
      },
      {
        metric: 'Tempo & Control',
        score: 9,
        justification: 'The descent and ascent are smooth and well-controlled, showing good command of the weight.',
      },
    ],
  },
};