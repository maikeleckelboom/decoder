export const CANVAS_RENDERING_CONTEXT_2D_DEFAULTS: CanvasRenderingContext2DSettings = {
  alpha: true,
  willReadFrequently: true
} as const;

export const CREATE_IMAGE_BITMAP_DEFAULTS: ImageBitmapOptions = {
  imageOrientation: 'none',
  premultiplyAlpha: 'default'
} as const;

export const GET_IMAGE_DATA_DEFAULTS: ImageDataSettings = {
  colorSpace: 'srgb'
} as const;
