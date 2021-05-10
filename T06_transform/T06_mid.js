var gl;

const {mat2, mat3, mat4, vec2, vec3, vec4} = glMatrix;  
// Now we can use function without glMatrix.~~~

function testGLError(functionLastCalled) {
    /* gl.getError returns the last error that occurred using WebGL for debugging */ 
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

var shaderProgram;

var vertexData = [
		// Backface (RED/WHITE) -> z = 0.5
        -0.5, -0.5, -0.5,  1.0, 0.0, 0.0, 1.0,
         0.5,  0.5, -0.5,  1.0, 0.0, 0.0, 1.0,
         0.5, -0.5, -0.5,  1.0, 0.0, 0.0, 1.0,
        -0.5, -0.5, -0.5,  1.0, 0.0, 0.0, 1.0,
        -0.5,  0.5, -0.5,  1.0, 0.0, 0.0, 1.0,
         0.5,  0.5, -0.5,  1.0, 1.0, 1.0, 1.0, 
		// Front (BLUE/WHITE) -> z = 0.5
        -0.5, -0.5,  0.5,  0.0, 0.0, 1.0, 1.0,
         0.5,  0.5,  0.5,  0.0, 0.0, 1.0, 1.0,
         0.5, -0.5,  0.5,  0.0, 0.0, 1.0, 1.0,
        -0.5, -0.5,  0.5,  0.0, 0.0, 1.0, 1.0,
        -0.5,  0.5,  0.5,  0.0, 0.0, 1.0, 1.0,
         0.5,  0.5,  0.5,  1.0, 1.0, 1.0, 1.0, 
		// LEFT (GREEN/WHITE) -> z = 0.5
        -0.5, -0.5, -0.5,  0.0, 1.0, 0.0, 1.0,
        -0.5,  0.5,  0.5,  0.0, 1.0, 0.0, 1.0,
        -0.5,  0.5, -0.5,  0.0, 1.0, 0.0, 1.0,
        -0.5, -0.5, -0.5,  0.0, 1.0, 0.0, 1.0,
        -0.5, -0.5,  0.5,  0.0, 1.0, 0.0, 1.0,
        -0.5,  0.5,  0.5,  0.0, 1.0, 1.0, 1.0, 
		// RIGHT (YELLOW/WHITE) -> z = 0.5
         0.5, -0.5, -0.5,  1.0, 1.0, 0.0, 1.0,
         0.5,  0.5,  0.5,  1.0, 1.0, 0.0, 1.0,
         0.5,  0.5, -0.5,  1.0, 1.0, 0.0, 1.0,
         0.5, -0.5, -0.5,  1.0, 1.0, 0.0, 1.0,
         0.5, -0.5,  0.5,  1.0, 1.0, 0.0, 1.0,
         0.5,  0.5,  0.5,  1.0, 1.0, 1.0, 1.0, 
		// BOTTON (MAGENTA/WHITE) -> z = 0.5
        -0.5, -0.5, -0.5,  1.0, 0.0, 1.0, 1.0,
         0.5, -0.5,  0.5,  1.0, 0.0, 1.0, 1.0,
         0.5, -0.5, -0.5,  1.0, 0.0, 1.0, 1.0,
        -0.5, -0.5, -0.5,  1.0, 0.0, 1.0, 1.0,
        -0.5, -0.5,  0.5,  1.0, 0.0, 1.0, 1.0,
         0.5, -0.5,  0.5,  1.0, 1.0, 1.0, 1.0, 
		// TOP (CYAN/WHITE) -> z = 0.5
        -0.5,  0.5, -0.5,  0.0, 1.0, 1.0, 1.0,
         0.5,  0.5,  0.5,  0.0, 1.0, 1.0, 1.0,
         0.5,  0.5, -0.5,  0.0, 1.0, 1.0, 1.0,
        -0.5,  0.5, -0.5,  0.0, 1.0, 1.0, 1.0,
        -0.5,  0.5,  0.5,  0.0, 1.0, 1.0, 1.0,
         0.5,  0.5,  0.5,  1.0, 1.0, 1.0, 1.0 
];

function initialiseBuffer() {

    gl.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

    return testGLError("initialiseBuffers");
}

function initialiseShaders() {

    var fragmentShaderSource = `
			varying highp vec4 col; 
			void main(void) 
			{ 
				gl_FragColor = col;
			}`;

    gl.fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(gl.fragShader, fragmentShaderSource);
    gl.compileShader(gl.fragShader);
    // Check if compilation succeeded
    if (!gl.getShaderParameter(gl.fragShader, gl.COMPILE_STATUS)) {
        alert("Failed to compile the fragment shader.\n" + gl.getShaderInfoLog(gl.fragShader));
        return false;
    }

    // Vertex shader code
    var vertexShaderSource = `
			attribute highp vec4 myVertex; 
			attribute highp vec4 myColor; 
			uniform mediump mat4 transformationMatrix; 
			varying  highp vec4 col;
			void main(void)  
			{ 
				gl_Position = transformationMatrix * myVertex; 
				gl_PointSize = 20.0; 
				col = myColor; 
			}`;

    gl.vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(gl.vertexShader, vertexShaderSource);
    gl.compileShader(gl.vertexShader);
    // Check if compilation succeeded
    if (!gl.getShaderParameter(gl.vertexShader, gl.COMPILE_STATUS)) {
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

var flag_animation = 0; 
function toggleAnimation()
{
	flag_animation ^= 1; 
	console.log("flag_animation=", flag_animation);
}

var xRot = 0.0; 
var yRot = 0.0; 
var zRot = 0.0; 

var draw_mode = 4; 

function draw_mode_line()
{
	draw_mode = 3;
}
function draw_mode_triangle()
{
	draw_mode = 4;
}
function draw_mode_point()
{
	draw_mode = 0;
}


function renderScene() {

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clearDepth(1.0);										// Added for depth Test 
	// gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);		// Added for depth Test 
	gl.enable(gl.DEPTH_TEST);								// Added for depth Test 

    var matrixLocation = gl.getUniformLocation(gl.programObject, "transformationMatrix");
    var transformationMatrix = mat4.create(); 
	mat4.rotateX(transformationMatrix, transformationMatrix, xRot); 
	mat4.rotateY(transformationMatrix, transformationMatrix, yRot); 
	mat4.rotateZ(transformationMatrix, transformationMatrix, zRot); 
	if (flag_animation == 0) {
		xRot += 0.01;
		yRot += 0.01;
		zRot += 0.01;
	}
	
    gl.uniformMatrix4fv(matrixLocation, gl.FALSE, transformationMatrix );

    if (!testGLError("gl.uniformMatrix4fv")) {
        return false;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 28, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, gl.FALSE, 28, 12);

    if (!testGLError("gl.vertexAttribPointer")) {
        return false;
    }

	gl.drawArrays(draw_mode, 0, 36); 
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

    if (!initialiseShaders()) {
        return;
    }

	// renderScene();
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
