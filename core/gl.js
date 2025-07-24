export const canvas = document.createElement('canvas');
export const gl = canvas.getContext('webgl2')

if (!gl.getExtension('EXT_color_buffer_float')) {
  console.warn('EXT_color_buffer_float is not supported by this browser.');
}
