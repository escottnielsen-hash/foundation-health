// ============================================
// QPA Reference Data
// ============================================
// Qualifying Payment Amounts (QPA) for common orthopedic procedures.
// QPA represents the median contracted rate for a given service
// in the same geographic area, as defined by the No Surprises Act.
//
// Foundation Health charges 2.7-4x QPA to reflect:
// - Board-certified, fellowship-trained specialists
// - Concierge-level patient experience
// - Extended appointment times (45-60 min vs. 7-10 min industry avg)
// - Advanced imaging & diagnostics in-house
// - Superior clinical outcomes & patient satisfaction
// ============================================

export interface QpaReference {
  cptCode: string
  description: string
  qpaAmountCents: number
  foundationMultiplier: number
  category: 'surgical' | 'diagnostic' | 'therapeutic' | 'evaluation' | 'injection'
}

export const QPA_CATEGORIES: { value: QpaReference['category']; label: string }[] = [
  { value: 'surgical', label: 'Surgical Procedures' },
  { value: 'diagnostic', label: 'Diagnostic Services' },
  { value: 'therapeutic', label: 'Therapeutic Services' },
  { value: 'evaluation', label: 'Evaluation & Management' },
  { value: 'injection', label: 'Injections & Aspirations' },
]

export const QPA_REFERENCE_DATA: QpaReference[] = [
  // ============================================
  // Joint Replacements
  // ============================================
  {
    cptCode: '27447',
    description: 'Total Knee Arthroplasty (TKA)',
    qpaAmountCents: 1_850_000,
    foundationMultiplier: 3.5,
    category: 'surgical',
  },
  {
    cptCode: '27130',
    description: 'Total Hip Arthroplasty (THA)',
    qpaAmountCents: 2_100_000,
    foundationMultiplier: 3.5,
    category: 'surgical',
  },
  {
    cptCode: '27446',
    description: 'Partial Knee Replacement (Unicompartmental)',
    qpaAmountCents: 1_620_000,
    foundationMultiplier: 3.2,
    category: 'surgical',
  },

  // ============================================
  // Ligament & Tendon Repairs
  // ============================================
  {
    cptCode: '29888',
    description: 'ACL Reconstruction, Arthroscopic',
    qpaAmountCents: 1_450_000,
    foundationMultiplier: 3.5,
    category: 'surgical',
  },
  {
    cptCode: '23412',
    description: 'Rotator Cuff Repair, Open',
    qpaAmountCents: 1_280_000,
    foundationMultiplier: 3.3,
    category: 'surgical',
  },
  {
    cptCode: '29827',
    description: 'Rotator Cuff Repair, Arthroscopic',
    qpaAmountCents: 1_380_000,
    foundationMultiplier: 3.5,
    category: 'surgical',
  },

  // ============================================
  // Arthroscopy
  // ============================================
  {
    cptCode: '29881',
    description: 'Knee Arthroscopy with Meniscectomy',
    qpaAmountCents: 680_000,
    foundationMultiplier: 3.0,
    category: 'surgical',
  },
  {
    cptCode: '29826',
    description: 'Shoulder Arthroscopy, Extensive Debridement',
    qpaAmountCents: 920_000,
    foundationMultiplier: 3.2,
    category: 'surgical',
  },

  // ============================================
  // Spine
  // ============================================
  {
    cptCode: '22630',
    description: 'Lumbar Spinal Fusion, Posterior Interbody (PLIF)',
    qpaAmountCents: 3_200_000,
    foundationMultiplier: 3.8,
    category: 'surgical',
  },
  {
    cptCode: '63030',
    description: 'Lumbar Discectomy / Laminotomy',
    qpaAmountCents: 1_150_000,
    foundationMultiplier: 3.2,
    category: 'surgical',
  },

  // ============================================
  // Fracture Care
  // ============================================
  {
    cptCode: '27236',
    description: 'Hip Fracture ORIF (Open Reduction Internal Fixation)',
    qpaAmountCents: 1_750_000,
    foundationMultiplier: 3.5,
    category: 'surgical',
  },
  {
    cptCode: '25607',
    description: 'Distal Radius Fracture ORIF',
    qpaAmountCents: 850_000,
    foundationMultiplier: 3.0,
    category: 'surgical',
  },

  // ============================================
  // Hand & Wrist
  // ============================================
  {
    cptCode: '64721',
    description: 'Carpal Tunnel Release',
    qpaAmountCents: 380_000,
    foundationMultiplier: 2.8,
    category: 'surgical',
  },
  {
    cptCode: '26055',
    description: 'Trigger Finger Release',
    qpaAmountCents: 280_000,
    foundationMultiplier: 2.7,
    category: 'surgical',
  },

  // ============================================
  // Injections & Aspirations
  // ============================================
  {
    cptCode: '20610',
    description: 'Joint Injection / Aspiration, Major Joint (Knee, Shoulder)',
    qpaAmountCents: 18_500,
    foundationMultiplier: 3.0,
    category: 'injection',
  },
  {
    cptCode: '20605',
    description: 'Joint Injection / Aspiration, Intermediate Joint',
    qpaAmountCents: 15_000,
    foundationMultiplier: 3.0,
    category: 'injection',
  },
  {
    cptCode: '20604',
    description: 'Joint Injection / Aspiration, Small Joint',
    qpaAmountCents: 12_000,
    foundationMultiplier: 2.8,
    category: 'injection',
  },
  {
    cptCode: '27096',
    description: 'Sacroiliac Joint Injection with Fluoroscopy',
    qpaAmountCents: 42_000,
    foundationMultiplier: 3.2,
    category: 'injection',
  },

  // ============================================
  // Diagnostic — Imaging Interpretation
  // ============================================
  {
    cptCode: '73721',
    description: 'MRI Lower Extremity (Knee) without Contrast',
    qpaAmountCents: 48_000,
    foundationMultiplier: 2.8,
    category: 'diagnostic',
  },
  {
    cptCode: '73221',
    description: 'MRI Upper Extremity (Shoulder) without Contrast',
    qpaAmountCents: 48_000,
    foundationMultiplier: 2.8,
    category: 'diagnostic',
  },
  {
    cptCode: '72148',
    description: 'MRI Lumbar Spine without Contrast',
    qpaAmountCents: 52_000,
    foundationMultiplier: 2.8,
    category: 'diagnostic',
  },
  {
    cptCode: '73560',
    description: 'X-Ray Knee, Complete (3+ views)',
    qpaAmountCents: 8_500,
    foundationMultiplier: 2.7,
    category: 'diagnostic',
  },
  {
    cptCode: '73030',
    description: 'X-Ray Shoulder, Complete (2+ views)',
    qpaAmountCents: 7_500,
    foundationMultiplier: 2.7,
    category: 'diagnostic',
  },

  // ============================================
  // Evaluation & Management
  // ============================================
  {
    cptCode: '99203',
    description: 'New Patient Office Visit, Low Complexity',
    qpaAmountCents: 16_800,
    foundationMultiplier: 3.5,
    category: 'evaluation',
  },
  {
    cptCode: '99204',
    description: 'New Patient Office Visit, Moderate Complexity',
    qpaAmountCents: 25_200,
    foundationMultiplier: 3.5,
    category: 'evaluation',
  },
  {
    cptCode: '99205',
    description: 'New Patient Office Visit, High Complexity',
    qpaAmountCents: 33_600,
    foundationMultiplier: 3.5,
    category: 'evaluation',
  },
  {
    cptCode: '99213',
    description: 'Established Patient Office Visit, Low Complexity',
    qpaAmountCents: 11_500,
    foundationMultiplier: 3.2,
    category: 'evaluation',
  },
  {
    cptCode: '99214',
    description: 'Established Patient Office Visit, Moderate Complexity',
    qpaAmountCents: 16_500,
    foundationMultiplier: 3.5,
    category: 'evaluation',
  },
  {
    cptCode: '99215',
    description: 'Established Patient Office Visit, High Complexity',
    qpaAmountCents: 22_500,
    foundationMultiplier: 3.5,
    category: 'evaluation',
  },

  // ============================================
  // Therapeutic
  // ============================================
  {
    cptCode: '97110',
    description: 'Therapeutic Exercise (per 15 min unit)',
    qpaAmountCents: 4_200,
    foundationMultiplier: 3.0,
    category: 'therapeutic',
  },
  {
    cptCode: '97140',
    description: 'Manual Therapy (per 15 min unit)',
    qpaAmountCents: 4_500,
    foundationMultiplier: 3.0,
    category: 'therapeutic',
  },
  {
    cptCode: '97161',
    description: 'Physical Therapy Evaluation, Low Complexity',
    qpaAmountCents: 10_500,
    foundationMultiplier: 3.0,
    category: 'therapeutic',
  },
  {
    cptCode: '97162',
    description: 'Physical Therapy Evaluation, Moderate Complexity',
    qpaAmountCents: 13_500,
    foundationMultiplier: 3.0,
    category: 'therapeutic',
  },
]

// ============================================
// Helper Functions
// ============================================

/**
 * Get Foundation Health charge amount for a given procedure
 */
export function getFoundationChargeCents(ref: QpaReference): number {
  return Math.round(ref.qpaAmountCents * ref.foundationMultiplier)
}

/**
 * Look up a QPA reference by CPT code
 */
export function findQpaReference(cptCode: string): QpaReference | undefined {
  return QPA_REFERENCE_DATA.find((ref) => ref.cptCode === cptCode)
}

/**
 * Filter QPA references by category
 */
export function filterQpaByCategory(
  category: QpaReference['category']
): QpaReference[] {
  return QPA_REFERENCE_DATA.filter((ref) => ref.category === category)
}

/**
 * Search QPA references by description or CPT code
 */
export function searchQpaReferences(query: string): QpaReference[] {
  const lowerQuery = query.toLowerCase().trim()
  if (lowerQuery.length === 0) return QPA_REFERENCE_DATA

  return QPA_REFERENCE_DATA.filter(
    (ref) =>
      ref.cptCode.toLowerCase().includes(lowerQuery) ||
      ref.description.toLowerCase().includes(lowerQuery)
  )
}
