var gl; 
var gl1; 
var gl2;


function testGLError(functionLastCalled) {

    var lastError = gl.getError();

    if (lastError != gl.NO_ERROR) {
        alert(functionLastCalled + " failed (" + lastError + ")");
        return false;
    }

    return true;
}

function initialiseGL(canvas1, canvas2) {
    try {
        gl1 = canvas1.getContext('webgl',
			{stencil:true, alpha:true, depth:true, antialias:true, preserveDrawingBuffer:false});
		gl1.viewport(0, 0, canvas1.width, canvas1.height);
		gl2 = canvas2.getContext('webgl',
			{stencil:true, alpha:true, depth:true, antialias:false, preserveDrawingBuffer:false});
		
		gl2.viewport(0, 0, canvas2.width, canvas2.height);
    }
    catch (e) {
    }
    if (!gl1 || !gl2) {
        alert("Unable to initialise WebGL. Your browser may not support it");
        return false;
    }

    return true;
}

var shaderProgram;

function initialiseBuffer() {

    var vertexData = [
        -0.4, -0.4, 0.0, // Bottom left
         0.4, -0.4, 0.0, // Bottom right
         0.0, 1.4, 0.0,  // Top middle
		 0.4, -0.4, 0.0, // Bottom right
         0.0, 1.4, 0.0,  // Top middle
		 0.6, 1.4,0.0
    ];
    // Generate a buffer object
    gl.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
    return testGLError("initialiseBuffers");
}

function initialiseShaders() {

    var fragmentShaderSource = '\
			void main(void) \
			{ \
				gl_FragColor = vec4(1.0, 1.0, 0.66, 1.0); \
			}';
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
    var vertexShaderSource = '\
			attribute highp vec4 myVertex; \
			uniform mediump mat4 transformationMatrix; \
			void main(void)  \
			{ \
				gl_Position = transformationMatrix * myVertex; \
			}';
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
    gl.programObject = gl.createProgram();

    // Attach the fragment and vertex shaders to it
    gl.attachShader(gl.programObject, gl.fragShader);
    gl.attachShader(gl.programObject, gl.vertexShader);

    // Bind the custom vertex attribute "myVertex" to location 0
    gl.bindAttribLocation(gl.programObject, 0, "myVertex");

    // Link the program
    gl.linkProgram(gl.programObject);

    // Check if linking succeeded in a similar way we checked for compilation errors
    if (!gl.getProgramParameter(gl.programObject, gl.LINK_STATUS)) {
        alert("Failed to link the program.\n" + gl.getProgramInfoLog(gl.programObject));
        return false;
    }

    gl.useProgram(gl.programObject);

    return testGLError("initialiseShaders");
}

function renderScene() {
 
	gl = gl1; 
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Get the location of the transformation matrix in the shader using its name
    var matrixLocation = gl.getUniformLocation(gl.programObject, "transformationMatrix");

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

	gl = gl2; 
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Get the location of the transformation matrix in the shader using its name
    var matrixLocation = gl.getUniformLocation(gl.programObject, "transformationMatrix");

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
    var canvas1 = document.getElementById("canvas1");
	var canvas2 = document.getElementById("canvas2");
    if (!initialiseGL(canvas1, canvas2)) {
        return;
    }
	gl = gl1; 
    if (!initialiseBuffer()) {
        return;
    }
	gl = gl2;
    if (!initialiseBuffer()) {
        return;
    }
	gl = gl1; 
    if (!initialiseShaders()) {
        return;
    }
	gl = gl2; 
	if (!initialiseShaders()) {
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
