import '@testing-library/jest-dom';

// Mock WebGL context for Three.js tests
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: (contextType: string) => {
    if (contextType === 'webgl' || contextType === 'webgl2') {
      return {
        // Mock WebGL context methods
        createShader: () => ({}),
        shaderSource: () => {},
        compileShader: () => {},
        createProgram: () => ({}),
        attachShader: () => {},
        linkProgram: () => {},
        useProgram: () => {},
        createBuffer: () => ({}),
        bindBuffer: () => {},
        bufferData: () => {},
        enableVertexAttribArray: () => {},
        vertexAttribPointer: () => {},
        drawArrays: () => {},
        drawElements: () => {},
        enable: () => {},
        disable: () => {},
        blendFunc: () => {},
        clearColor: () => {},
        clear: () => {},
        viewport: () => {},
        getShaderParameter: () => true,
        getProgramParameter: () => true,
        getShaderInfoLog: () => '',
        getProgramInfoLog: () => '',
        deleteShader: () => {},
        deleteProgram: () => {},
        deleteBuffer: () => {},
        getParameter: () => 4,
        getExtension: () => null,
        canvas: {
          width: 300,
          height: 150
        }
      };
    }
    return null;
  }
});

// Mock requestAnimationFrame
globalThis.requestAnimationFrame = (callback: FrameRequestCallback) => {
  return setTimeout(callback, 16);
};

globalThis.cancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};