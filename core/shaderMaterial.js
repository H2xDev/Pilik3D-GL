import { Vec3, assert, failed, UUID, gl } from "./index.js";

/**
  * @type { WebGLProgram[] }
  */
export const shaderPrograms = [];

/**
  * @param { TemplateStringsArray } string - The GLSL fragment shader source code.
  */
export const fragment = (string) => {
  const source = `#version 300 es\n` + string;
  const shader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (failed(gl.getShaderParameter(shader, gl.COMPILE_STATUS), gl.deleteShader.bind(gl, shader))) return null;

  return shader;
}

/**
  * @param { TemplateStringsArray } string - The GLSL fragment shader source code.
  */
export const vertex = (string) => {
  const source = `#version 300 es\n` + string;
  const shader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (failed(gl.getShaderParameter(shader, gl.COMPILE_STATUS), gl.deleteShader.bind(gl, shader))) return null;

  return shader;
}

/**
  * Preprocesses the shader source code to handle `#include` directives.
  *
  * @param { string } path - The path to the shader source file.
  */
export const loadShaderSource = async (path, baseSource = '') => {
  baseSource = baseSource.split('/').slice(0, -1).join('/') + '/';
  path = path.startsWith('http') ? path : baseSource + path;
  path = path.replace(/\/\//g, '/'); // Normalize path for Windows

  const source = await fetch(path).then(response => response.text()).catch(error => '');

  if (!source.includes('#include')) return source;

  const promises = source.split('\n').map(async (line, index) => {
    if (!line.includes('#include')) return line;
    line = line.replace('#include', '').trim();

    return loadShaderSource(line, path);
  });

  const lines = await Promise.all(promises);
  return lines.join('\n');
}

/**
  * @param { WebGLShader } vertexShader - The source code for the vertex shader.
  * @param { WebGLShader } fragmentShader - The source code for the fragment shader.
  */
export const ShaderMaterial = (vertexShader, fragmentShader) => {
  const program = gl.createProgram();

  assert(vertexShader instanceof WebGLShader, "Vertex shader must be a WebGLShader instance");
  assert(fragmentShader instanceof WebGLShader, "Fragment shader must be a WebGLShader instance");

  if (failed(gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS), () => {
    console.error("Fragment shader compilation failed:", gl.getShaderInfoLog(fragmentShader));
    gl.deleteShader(fragmentShader);
  })) return null;

  if (failed(gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS), () => {
    console.error("Vertex shader compilation failed:", gl.getShaderInfoLog(vertexShader));
    gl.deleteShader(vertexShader);
  })) return null;

  gl.attachShader(program, fragmentShader);
  gl.attachShader(program, vertexShader);
  gl.linkProgram(program);

  if (failed(gl.getProgramParameter(program, gl.LINK_STATUS), () => {
    console.error("Program linking failed:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  })) return null;

  const uniforms = {};
  const attributes = {};

  let count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(program, i);
    if (!info) continue;

    const location = gl.getUniformLocation(program, info.name);
    if (location === null) continue;

    uniforms[info.name] = location;
  }

  count = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveAttrib(program, i);
    if (!info) continue;

    const location = gl.getAttribLocation(program, info.name);
    if (location === -1) continue;

    attributes[info.name] = location;
  }

  shaderPrograms.push(program);

  return class Material {
    id = UUID.generate();

    get program() {
      return program;
    }

    get uniforms() {
      return uniforms;
    }

    get attributes() {
      return attributes;
    }

    params = {};

    /**
      * @param { string } name
      * @param { number | Vec3 | number[] } value
      */
    setParameter(name, value) {
      if (!(name in uniforms)) {
        return;
      }

      const location = uniforms[name];

      if (value instanceof Vec3) {
        gl.uniform3fv(location, new Float32Array(value.toArray()));
      } else if (typeof value === "number") {
        gl.uniform1f(location, value);
      } else if (Array.isArray(value)) {
        if (value.length === 16) {
          gl.uniformMatrix4fv(location, false, new Float32Array(value));
        } else if (value.length === 2) {
          gl.uniform2fv(location, value);
        } else if (value.length === 4) {
          gl.uniform4fv(location, value);
        } else {
          console.warn(`Unsupported uniform type for ${name}:`, value);
        }
      } else {
        console.warn(`Unsupported uniform type for ${name}:`, value);
      }
    }

    applyUniforms() {
      for (const name in this.params) {
        const value = this.params[name];
        if (name in uniforms) {
          this.setParameter(name, value);
        } else {
          console.warn(`Uniform ${name} not found in material ${this.id}`);
        }
      }
    }
  }
}
