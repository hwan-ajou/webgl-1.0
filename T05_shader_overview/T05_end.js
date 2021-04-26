var gl;

function testGLError(functionLastCalled) {

    var lastError = gl.getError();

    if (lastError != gl.NO_ERROR) {
        alert(functionLastCalled + " failed (" + lastError + ")");
        return false;
    }

    return true;
}

function initialiseGL(canvas) {
    try {
        // Try to grab the standard context. If it fails, fallback to experimental
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    catch (e) {
    }

    if (!gl) {
        alert("Unable to initialise WebGL. Your browser may not support it");
        return false;
    }

    return true;
}



function initialiseBuffer() {

    var vertexData = [
        -0.4, -0.4, 0.0, // Bottom left
         0.4, -0.4, 0.0, // Bottom right
         0.0, 0.4, 0.0,  // Top middle
		 0.5, -0.2, -1.0, // Bottom left
         0.9, -0.2, -1.0, // Bottom right
         0.7, 0.2, -1.0  // Top middle
    ];

    // Generate a buffer object
    gl.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
    return testGLError("initialiseBuffers");
}

var shaderProgram1;
var shaderProgram2;

function initialiseShaders1() {

    var fragmentShaderSource = `
			void main(void) 
			{ 
			    if (gl_FragCoord.x  < 400.0) 
					gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
				else
					gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
				if (gl_FragCoord.y > 300.0)
					discard;
			
			}`;
    gl.fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(gl.fragShader, fragmentShaderSource);
    gl.compileShader(gl.fragShader);

    // Check if compilation succeeded
    if (!gl.getShaderParameter(gl.fragShader, gl.COMPILE_STATUS)) {
        // It didn't. Display the info log as to why
        alert("Failed to compile the fragment shader.\n" + gl.getShaderInfoLog(gl.fragShader));
        return false;
    }

    // Vertex shader code
    var vertexShaderSource = `
			attribute highp vec4 myVertex; 
			uniform mediump mat4 transformationMatrix; 
			void main(void)  
			{ 
				gl_Position = transformationMatrix * myVertex;
			}`;
    gl.vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(gl.vertexShader, vertexShaderSource);
    gl.compileShader(gl.vertexShader);

    // Check if compilation succeeded
    if (!gl.getShaderParameter(gl.vertexShader, gl.COMPILE_STATUS)) {
        // It didn't. Display the info log as to why
        alert("Failed to compile the vertex shader.\n" + gl.getShaderInfoLog(gl.vertexShader));
        return false;
    }

    // Create the shader program
    shaderProgram1 = gl.createProgram();

    // Attach the fragment and vertex shaders to it
    gl.attachShader(shaderProgram1, gl.fragShader);
    gl.attachShader(shaderProgram1, gl.vertexShader);

    // Bind the custom vertex attribute "myVertex" to location 0
    gl.bindAttribLocation(shaderProgram1, 0, "myVertex");

    // Link the program
    gl.linkProgram(shaderProgram1);

    // Check if linking succeeded in a similar way we checked for compilation errors
    if (!gl.getProgramParameter(shaderProgram1, gl.LINK_STATUS)) {
        alert("Failed to link the program.\n" + gl.getProgramInfoLog(shaderProgram1));
        return false;
    }

    gl.useProgram(shaderProgram1);

    return testGLError("initialiseShaders");
}

function initialiseShaders2() {

    var fragmentShaderSource = `
			void main(void) 
			{ 
			   
					gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
				
			}`;
    gl.fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(gl.fragShader, fragmentShaderSource);
    gl.compileShader(gl.fragShader);

    // Check if compilation succeeded
    if (!gl.getShaderParameter(gl.fragShader, gl.COMPILE_STATUS)) {
        // It didn't. Display the info log as to why
        alert("Failed to compile the fragment shader.\n" + gl.getShaderInfoLog(gl.fragShader));
        return false;
    }

    // Vertex shader code
    var vertexShaderSource = `
			attribute highp vec4 myVertex; 
			uniform mediump mat4 transformationMatrix; 
			void main(void)  
			{ 
				gl_Position = transformationMatrix * myVertex;
			}`;
    gl.vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(gl.vertexShader, vertexShaderSource);
    gl.compileShader(gl.vertexShader);

    // Check if compilation succeeded
    if (!gl.getShaderParameter(gl.vertexShader, gl.COMPILE_STATUS)) {
        // It didn't. Display the info log as to why
        alert("Failed to compile the vertex shader.\n" + gl.getShaderInfoLog(gl.vertexShader));
        return false;
    }

    // Create the shader program
    shaderProgram2 = gl.createProgram();

    // Attach the fragment and vertex shaders to it
    gl.attachShader(shaderProgram2, gl.fragShader);
    gl.attachShader(shaderProgram2, gl.vertexShader);

    // Bind the custom vertex attribute "myVertex" to location 0
    gl.bindAttribLocation(shaderProgram2, 0, "myVertex");

    // Link the program
    gl.linkProgram(shaderProgram2);

    // Check if linking succeeded in a similar way we checked for compilation errors
    if (!gl.getProgramParameter(shaderProgram2, gl.LINK_STATUS)) {
        alert("Failed to link the program.\n" + gl.getProgramInfoLog(shaderProgram2));
        return false;
    }

    gl.useProgram(shaderProgram2);

    return testGLError("initialiseShaders");
}

var rep = 1; 

function renderScene() {
 
    gl.clearColor(0.6, 0.8, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Get the location of the transformation matrix in the shader using its name
	if ( rep > 100) {
		gl.useProgram(shaderProgram1);
		var matrixLocation = gl.getUniformLocation(shaderProgram1, "transformationMatrix");
	}
	else {
		gl.useProgram(shaderProgram2);
		var matrixLocation = gl.getUniformLocation(shaderProgram2, "transformationMatrix");
	}
	rep = rep+1; 
    // Matrix used to specify the orientation of the triangle on screen
    var transformationMatrix = [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ];

    // Pass the identity transformation matrix to the shader using its location
    gl.uniformMatrix4fv(matrixLocation, gl.FALSE, transformationMatrix);

    if (!testGLError("gl.uniformMatrix4fv")) {
        return false;
    }

    // Enable the user-defined vertex array
    gl.enableVertexAttribArray(0);

    // Set the vertex data to this attribute index, with the number of floats in each position
    gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 0, 0);

    if (!testGLError("gl.vertexAttribPointer")) {
        return false;
    }

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    if (!testGLError("gl.drawArrays")) {
        return false;
    }

    return true;
}

function main() {
    var canvas = document.getElementById("helloapicanvas");

    if (!initialiseGL(canvas)) {
        return;
    }

    if (!initialiseBuffer()) {
        return;
    }

    if (!initialiseShaders1()) {
        return;
    }
	if (!initialiseShaders2()) {
        return;
    }

    // Render loop
    requestAnimFrame = (function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
			function (callback) {
			    window.setTimeout(callback, 1000, 60);
			};
    })();

    (function renderLoop() {
        if (renderScene()) {
            // Everything was successful, request that we redraw our scene again in the future
            requestAnimFrame(renderLoop);
        }
    })();
}
