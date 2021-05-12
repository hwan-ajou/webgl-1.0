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

var vertexBuffer; 
var colorBuffer; 

function initialiseBuffer() {

    /* var vertexData = [
        -0.4, -0.4, 0.0, 1.0, 0.0, 0.0, 1.0,  // Bottom left
         0.4, -0.4, 0.0, 1.0, 0.0, 1.0, 1.0,  // Bottom right
         0.0, 0.5, 0.0, 1.0, 1.0, 1.0, 1.0,  // Top middle
		 0.6, 0.4, 0.0, 1.0, 0.0, 0.0, 1.0,  // Bottom left
         0.8, 0.4, 0.0, 1.0, 1.0, 0.0, 1.0,  // Bottom right
         0.7, 0.9, 0.0, 1.0, 0.0, 1.0, 1.0  // Top middle
    ]; */
	var vertexData = [
        -0.4, -0.4, 0.0,  // Bottom left
         0.4, -0.4, 0.0,  // Bottom right
         0.0, 0.5, 0.0,  // Top middle
		 0.6, 0.4, 0.0,  // Bottom left
         0.8, 0.4, 0.0,   // Bottom right
         0.7, 0.9, 0.0  // Top middle
    ];
	var colorData = [
       1.0, 0.0, 0.0, 1.0,  // Bottom left
      1.0, 0.0, 1.0, 1.0,  // Bottom right
         1.0, 1.0, 1.0, 1.0,  // Top middle
		1.0, 0.0, 0.0, 1.0,  // Bottom left
         1.0, 1.0, 0.0, 1.0,  // Bottom right
        .0, 0.0, 1.0, 1.0  // Top middle
    ];

    // Generate a buffer object
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
	colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);
	
	return testGLError("initialiseBuffers");
}

var shaderProgram;

function initialiseShaders() {

    var fragmentShaderSource = `
		    uniform mediump vec4 uColor;
			varying highp vec4 col;			
			void main(void) 
			{ 
				gl_FragColor = col; 
			}
			`;
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
			attribute highp vec4 myColor; 
			varying highp vec4 col;
			uniform highp vec2 trXY; 
			uniform mediump mat4 transformationMatrix; 
			void main(void)  
			{ 
				gl_Position = transformationMatrix * myVertex;
				gl_Position.xy += trXY; 
				col = myColor; 
				
				
			}
			
			`;
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
	gl.bindAttribLocation(gl.programObject, 1, "myColor");

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

var frame = 1;  

function renderScene() {
 
    gl.clearColor(0.6, 0.8, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Get the location of the transformation matrix in the shader using its name
    var matrixLocation = gl.getUniformLocation(gl.programObject, "transformationMatrix");
	var ucolorLocation = gl.getUniformLocation(gl.programObject, "uColor");
	var utrxyLocation = gl.getUniformLocation(gl.programObject, "trXY");

    // Matrix used to specify the orientation of the triangle on screen
    var transformationMatrix = [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ];

    // Pass the identity transformation matrix to the shader using its location
    gl.uniformMatrix4fv(matrixLocation, gl.FALSE, transformationMatrix);
	gl.uniform4f(ucolorLocation, 1.0, 0.0, 0.0, 1.0); 
	gl.uniform2f(utrxyLocation, 0.1, 0.1);

    if (!testGLError("gl.uniformMatrix4fv")) {
        return false;
    }

    // Enable the user-defined vertex array
    gl.enableVertexAttribArray(0);
	gl.enableVertexAttribArray(1);

    // Set the vertex data to this attribute index, with the number of floats in each position
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 0, 0); 
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.vertexAttribPointer(1, 4, gl.FLOAT, gl.FALSE, 0, 0); 
    if (!testGLError("gl.vertexAttribPointer")) {
        return false;
    }
	
	// gl.disableVertexAttribArray(1);
	gl.vertexAttrib4f(1, 0.0, 0.0, 1.0, 1.0); 
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    if (!testGLError("gl.drawArrays")) {
        return false;
    }

    return true;
}



function main() {
    var canid = document.getElementById("helloapicanvas");

    if (!initialiseGL(canid)) {
        return;
    }

    if (!initialiseBuffer()) {
        return;
    }

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