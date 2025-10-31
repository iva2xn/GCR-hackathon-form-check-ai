
import type { ReportData } from './types';

export const DUMMY_REPORT_DATA: ReportData = {
  title: 'Form Analysis Report: Barbell Squat',
  error: {
    title: 'Consistent Error Detected',
    timestamp: '@ 0:12',
    imageSrc: 'https://picsum.photos/seed/squat-form/800/600',
    skeleton: {
      keypoints: {
        nose: { x: 0.5, y: 0.1 },
        leftShoulder: { x: 0.4, y: 0.25 },
        rightShoulder: { x: 0.6, y: 0.25 },
        leftElbow: { x: 0.35, y: 0.4 },
        rightElbow: { x: 0.65, y: 0.4 },
        leftHip: { x: 0.42, y: 0.55 },
        rightHip: { x: 0.58, y: 0.55 },
        pelvis: { x: 0.5, y: 0.55 },
        spine: { x: 0.5, y: 0.4 },
        leftKnee: { x: 0.38, y: 0.75 },
        rightKnee: { x: 0.62, y: 0.75 },
        leftAnkle: { x: 0.35, y: 0.95 },
        rightAnkle: { x: 0.65, y: 0.95 },
      },
      connections: [
        ['leftShoulder', 'rightShoulder'],
        ['leftShoulder', 'leftElbow'],
        ['rightShoulder', 'rightElbow'],
        ['leftShoulder', 'leftHip'],
        ['rightShoulder', 'rightHip'],
        ['leftHip', 'rightHip'],
        ['leftHip', 'leftKnee'],
        ['rightHip', 'rightKnee'],
        ['leftKnee', 'leftAnkle'],
        ['rightKnee', 'rightAnkle'],
      ],
      highlightedConnections: [
        ['pelvis', 'spine'],
        ['leftHip', 'pelvis'],
        ['rightHip', 'pelvis'],
      ],
    },
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
};
