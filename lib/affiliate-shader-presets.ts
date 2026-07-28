export type ShaderUniformConfig = {
  colors: readonly (readonly [number, number, number])[]
  colorCount: number
  scale: number
  intensity: number
  paramA: number
  warp: number
  detail: number
  contrast: number
  brightness: number
  saturation: number
  hue: number
  vignette: number
  blur: number
  grain: number
  seed: number
  rotate: number
  offsetX: number
  offsetY: number
  drift: number
  cursorEnabled: boolean
  cursorEffect: number
  cursorStrength: number
  cursorRadius: number
  oklab: number
  timeScale: number
}

/** Shared step pattern — different wave from the hero; colors differ per step. */
const STEP_PATTERN: Omit<ShaderUniformConfig, "colors" | "colorCount" | "hue"> =
  {
    scale: 0.72,
    intensity: 0.82,
    paramA: 0.55,
    warp: 0.22,
    detail: 2.85,
    contrast: 1.12,
    brightness: 0.04,
    saturation: 1.85,
    vignette: 0.08,
    blur: 0.02,
    grain: 0.28,
    seed: 8841,
    rotate: 0.65,
    offsetX: 0.18,
    offsetY: -0.12,
    drift: 0.22,
    cursorEnabled: false,
    cursorEffect: 3,
    cursorStrength: 0.54,
    cursorRadius: 0.555,
    oklab: 1,
    timeScale: 0.45,
  }

const CREAM = [1, 0.9607843137254902, 0.9215686274509803] as const

const STEP_01_COLORS = [
  [0.10196078431372549, 0.0784313725490196, 0.13725490196078433],
  [0.7176470588235294, 0.36470588235294116, 0.4117647058823529],
  [0.9176470588235294, 0.803921568627451, 0.7607843137254902],
  CREAM,
  CREAM,
  CREAM,
  CREAM,
  CREAM,
] as const

/** Hero panel — original soft wave (not the step pattern). */
export const AFFILIATE_SHADER_HERO: ShaderUniformConfig = {
  scale: 1.32,
  intensity: 0.49,
  paramA: 0.84,
  warp: 0.006,
  detail: 1.728,
  contrast: 1.077,
  brightness: 0.07,
  saturation: 2,
  hue: 2.2689,
  vignette: 0,
  blur: 0.04,
  grain: 0.35,
  seed: 4984,
  rotate: 3.3685,
  offsetX: -0.13,
  offsetY: 0.05,
  drift: 0.4,
  cursorEnabled: false,
  cursorEffect: 3,
  cursorStrength: 0.54,
  cursorRadius: 0.555,
  oklab: 1,
  timeScale: -0.67,
  colorCount: 4,
  colors: STEP_01_COLORS,
}

/**
 * Color order L→R: cool start → bridge → warm reward.
 * 01 Apply = sky blue, 02 Link = violet, 03 Earn = amber/gold.
 */
export const AFFILIATE_SHADER_STEP_01: ShaderUniformConfig = {
  ...STEP_PATTERN,
  colorCount: 4,
  hue: 0,
  colors: [
    [0.08, 0.2, 0.42],
    [0.32, 0.62, 0.92],
    [0.78, 0.9, 0.98],
    [0.96, 0.98, 1.0],
    [0.96, 0.98, 1.0],
    [0.96, 0.98, 1.0],
    [0.96, 0.98, 1.0],
    [0.96, 0.98, 1.0],
  ],
}

/** Violet — link step. */
export const AFFILIATE_SHADER_STEP_02: ShaderUniformConfig = {
  ...STEP_PATTERN,
  colorCount: 4,
  hue: 0,
  colors: [
    [0.12, 0.05, 0.22],
    [0.52, 0.28, 0.82],
    [0.82, 0.72, 0.96],
    [0.96, 0.94, 1.0],
    [0.96, 0.94, 1.0],
    [0.96, 0.94, 1.0],
    [0.96, 0.94, 1.0],
    [0.96, 0.94, 1.0],
  ],
}

/** Amber/gold — earn step. */
export const AFFILIATE_SHADER_STEP_03: ShaderUniformConfig = {
  ...STEP_PATTERN,
  colorCount: 4,
  hue: 0,
  colors: [
    [0.18, 0.08, 0.04],
    [0.88, 0.42, 0.12],
    [0.98, 0.78, 0.42],
    [1.0, 0.95, 0.88],
    [1.0, 0.95, 0.88],
    [1.0, 0.95, 0.88],
    [1.0, 0.95, 0.88],
    [1.0, 0.95, 0.88],
  ],
}

export const AFFILIATE_SHADER_PRESETS = {
  "01": AFFILIATE_SHADER_STEP_01,
  "02": AFFILIATE_SHADER_STEP_02,
  "03": AFFILIATE_SHADER_STEP_03,
} as const satisfies Record<string, ShaderUniformConfig>

export type AffiliateShaderStepId = keyof typeof AFFILIATE_SHADER_PRESETS
