import { Vec3, assert, failed, UUID, gl, Color, ShadersManager } from "./index.js";

/**
  * @type { WebGLProgram[] }
  */
export const shaderPrograms = [];

const showErrorPopup = (file, log, code) => {
  const errorLines = log.split('\n').map(line => {
    // error format: ERROR: 0:1: 'void' : syntax error
    const errorLine = line.match(/ERROR:\s*(\d+):(\d+):\s*(.*)/);
    console.log(errorLine);
    return +errorLine?.[2];
  });

  // Getting preprocessor's errors
  code.split('\n').forEach((line, index) => {
    if (!line.includes("// ERROR:")) return;
    errorLines.push(index + 1);
  });

  code = code.split('\n')
    .map((line, index) => {
      const color = errorLines.includes(index + 1) ? 'red' : 'gray';
      return `<div 
        data-line="${index}"
        class="code-line"
        style="color: ${color}; background-color: color-mix(in srgb, ${color}, white 90%); padding: 0 10px;"
      >
        ${index + 1}: ${line}
      </div>`
    }).join('\n');


  const d = Object.assign(document.createElement('div'), {
    className: 'shader-error-popup',
  })
  Object.assign(d.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    width: '80%',
    maxHeight: '80%',
    overflowY: 'auto',
    fontFamily: 'monospace',
    fontSize: '14px',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '5px',
    zIndex: 1000,
  });

  d.innerHTML = /* html */`
    <h1>Shader Error</h1>
    <p>${file}</p>
    <div style="position: sticky; z-index: 1; display: block; border-bottom: 1px solid grey; top: -20px; padding: 20px 10px; background-color: white; margin">${log}</div>
    <div>${code}</div>
  `

  document.body.appendChild(d);

  d.querySelector(`[data-line="${errorLines[0]}"]`).scrollIntoView({ 
    behavior: 'smooth',
  });
}

/**
  * Injects values from the definitions into the shader's source code.
  *
  * @param { TemplateStringsArray | string } shaderSource
  * @param { Record<string, string | number> } definitions
  */
const injectDefinitions = (shaderSource, definitions) => {
  Object.keys(definitions).forEach(key => {
    let value = definitions[key];

    if (key.toLowerCase().startsWith('float_')) {
      value = value.toFixed(6)
        .replace(/(\..+[1-9])(0+)$/g, '$1')
        .replace(/\.0+$/g, '.0');
    }
    
    shaderSource = shaderSource.replaceAll('#inject ' + key, definitions[key]);
  });

  return shaderSource;
}

/**
  * Recursively injects shader includes into the shader source code.
  * @param { string | TemplateStringsArray } shaderSource - The GLSL shader source code.
  * @return { string } - The shader source code with all includes injected.
  */
const injectIncludes = (shaderSource) => {
  const includeRegex = /#include\s+['"]([^'"]+)['"]/g;
  return shaderSource.replace(includeRegex, (match, filename) => {
    try {
      const errorLine = `// ERROR: File for include is not found: ${filename}`;
      const includeContent = ShadersManager.import(filename) || errorLine;
      return injectIncludes(includeContent);
    } catch (error) {
      console.error(`Failed to load shader include: ${filename}`, error);
      return match; // Return the original match if the include fails
    }
  });
}

const compileShader = (string, type) => {
  const source = `#version 300 es\n` + string;
  const shader = gl.createShader(type);
  shader._id = UUID.generate();
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const log = gl.getShaderInfoLog(shader);
  if (log) {
    showErrorPopup(shader._id, log, source);
  }

  if (failed(gl.getShaderParameter(shader, gl.COMPILE_STATUS), gl.deleteShader.bind(gl, shader))) return null;

  return shader;
}

/**
  * @param { TemplateStringsArray | string } string - The GLSL fragment shader source code.
  * @param { Record<string, string | number> } injections - Definitions to inject into the shader source.
  */
export const fragment = (string, injections = {}) => {
  string = injectDefinitions(string, injections);
  string = injectIncludes(string);

  return compileShader(string, gl.FRAGMENT_SHADER);
}

/**
  * @param { TemplateStringsArray | string } string - The GLSL fragment shader source code.
  * @param { Record<string, string | number> } injections - Definitions to inject into the shader source.
  */
export const vertex = (string, injections = {}) => {
  string = injectDefinitions(string, injections);
  string = injectIncludes(string);

  return compileShader(string, gl.VERTEX_SHADER);
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

    vertexShader = vertexShader;
    fragmentShader = fragmentShader;

    params = {};

    /**
      * @param { string } name
      * @param { number | Vec3 | Color | number[] | boolean } value
      */
    setParameter(name, value) {
      if (!(name in uniforms)) {
        return;
      }

      const location = uniforms[name];

      if (typeof value === "boolean") {
        gl.uniform1i(location, value ? 1 : 0);
        return;
      }

      if (typeof value === "number") {
        gl.uniform1f(location, value);
        return;
      }

      value = value instanceof Vec3  || value instanceof Color
        ? value.toArray() : value;

      if (Array.isArray(value)) {
        if (value.length === 16) {
          gl.uniformMatrix4fv(location, false, new Float32Array(value));
        } else if (value.length === 2) {
          gl.uniform2fv(location, value);
        } else if (value.length === 3) {
          gl.uniform3fv(location, value);
        } else if (value.length === 4) {
          gl.uniform4fv(location, value);
        }
      }
    }

    applyUniforms() {
      for (const name in this.params) {
        const value = this.params[name];
        if (name in uniforms) {
          this.setParameter(name, value);
        }
      }
    }
  }
}
