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
        gl.viewport(0, 0, 600, 600); 
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

function cube(sx, sy, sz)
{
	vertexData = [ -sx/2.0, -sy/2.0, sz/2.0, 0.0, 0.0, 0.0, 1.0,
	                sx/2.0, -sy/2.0, sz/2.0, 0.0, 0.0, 0.0, 1.0,
					sx/2.0,  sy/2.0, sz/2.0, 0.0, 0.0, 0.0, 1.0,
				   -sx/2.0, -sy/2.0, sz/2.0, 0.0, 0.0, 0.0, 1.0,
    			   sx/2.0,  sy/2.0, sz/2.0, 0.0, 0.0, 0.0, 1.0,
				   -sx/2.0, sy/2.0, sz/2.0, 0.0, 0.0, 1.0, 1.0, 
				   
				   -sx/2.0, -sy/2.0, -sz/2.0, 1.0, 0.0, 0.0, 1.0,
	                sx/2.0, -sy/2.0, -sz/2.0, 1.0, 0.0, 0.0, 1.0,
					sx/2.0,  sy/2.0, -sz/2.0, 1.0, 0.0, 0.0, 1.0,
				   -sx/2.0, -sy/2.0, -sz/2.0, 1.0, 0.0, 1.0, 1.0,
    			   sx/2.0,  sy/2.0, -sz/2.0, 1.0, 1.0, 0.0, 1.0,
				   -sx/2.0, sy/2.0, -sz/2.0, 1.0, 0.0, 0.0, 1.0,  
				   
				   -sx/2.0, sy/2.0, sz/2.0, 1.0, 0.0, 0.0, 1.0,
	                sx/2.0, sy/2.0, sz/2.0, 1.0, 0.0, 0.0, 1.0,
					sx/2.0, sy/2.0, -sz/2.0, 1.0, 0.0, 0.0, 1.0,
				   -sx/2.0, sy/2.0, sz/2.0, 1.0, 0.0, 1.0, 1.0,
    			   sx/2.0,  sy/2.0, -sz/2.0, 1.0, 1.0, 0.0, 1.0,
				   -sx/2.0, sy/2.0, -sz/2.0, 1.0, 0.0, 0.0, 1.0,  
				   
				    -sx/2.0, -sy/2.0, sz/2.0, 1.0, 0.0, 0.0, 1.0,
	                sx/2.0, -sy/2.0, sz/2.0, 1.0, 0.0, 0.0, 1.0,
					sx/2.0, -sy/2.0, -sz/2.0, 1.0, 0.0, 0.0, 1.0,
				   -sx/2.0, -sy/2.0, sz/2.0, 1.0, 0.0, 1.0, 1.0,
    			   sx/2.0,  -sy/2.0, -sz/2.0, 1.0, 1.0, 0.0, 1.0,
				   -sx/2.0, -sy/2.0, -sz/2.0, 1.0, 0.0, 0.0, 1.0,  
				   
				    -sx/2.0, -sy/2.0, sz/2.0, 1.0, 0.0, 0.0, 1.0,
	                -sx/2.0, sy/2.0, sz/2.0, 1.0, 0.0, 0.0, 1.0,
					-sx/2.0, sy/2.0, -sz/2.0, 1.0, 0.0, 0.0, 1.0,
				   -sx/2.0, -sy/2.0, sz/2.0, 1.0, 0.0, 1.0, 1.0,
    			   -sx/2.0, -sy/2.0, -sz/2.0, 1.0, 1.0, 0.0, 1.0,
				   -sx/2.0, sy/2.0, -sz/2.0, 1.0, 0.0, 0.0, 1.0,  
				   
				    sx/2.0, -sy/2.0, sz/2.0, 1.0, 0.0, 0.0, 1.0,
	                sx/2.0, sy/2.0, sz/2.0, 1.0, 0.0, 0.0, 1.0,
					sx/2.0, sy/2.0, -sz/2.0, 1.0, 0.0, 0.0, 1.0,
				   sx/2.0, -sy/2.0, sz/2.0, 1.0, 0.0, 1.0, 1.0,
    			   sx/2.0, -sy/2.0, -sz/2.0, 1.0, 1.0, 0.0, 1.0,
				   sx/2.0, sy/2.0, -sz/2.0, 1.0, 0.0, 0.0, 1.0,  
				   ];
	return vertexData;
}


function initialiseBuffer() {

    /* var vertexData = [
        -0.4, -0.4, 0.0, 1.0, 0.0, 0.0, 0.5, // Bottom left
         0.4, -0.4, 0.0, 1.0, 1.0, 0.0, 0.5, // Bottom right
         0.0, 0.4, 0.0, 1.0, 0.0, 1.0, 0.5,  // Top middle
		 0.5, 0.4, 0.0, 1.0, 1.0, 0.0, 0.5,  // Bottom left
         0.9, 0.4, 0.0, 1.0, 1.0, 0.0, 0.5,  // Bottom right
         0.7, 0.8, 0.0, 1.0, 0.0, 0.0, 0.5   // Top middle
    ]; */ 
	vertexData = cube(1.0, 1.0, 1.0); 

    // Generate a buffer object
    gl.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
    return testGLError("initialiseBuffers");
}

function initialiseShaders() {

    var fragmentShaderSource = `
	     
			varying lowp vec4 col;
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
			attribute lowp vec4 myColor;
			varying highp vec4 col;
			uniform mediump mat4 transformationMatrix;
			void main(void) 
			{
				gl_Position = transformationMatrix * myVertex;
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

var r_x = 0.0; 
var r_z = 0.0; 

function mmul(out, a,b)
{
	 a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11],
        a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15];

     b00 = b[0],
        b01 = b[1],
        b02 = b[2],
        b03 = b[3],
        b10 = b[4],
        b11 = b[5],
        b12 = b[6],
        b13 = b[7],
        b20 = b[8],
        b21 = b[9],
        b22 = b[10],
        b23 = b[11],
        b30 = b[12],
        b31 = b[13],
        b32 = b[14],
        b33 = b[15];

	out[0] = a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30;
    out[1] = a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31;
    out[2] = a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32;
    out[3] = a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33;
    out[4] = a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30;
    out[5] = a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31;
    out[6] = a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32;
    out[7] = a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33;
    out[8] = a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30;
    out[9] = a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31;
    out[10] = a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32;
    out[11] = a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33;
    out[12] = a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30;
    out[13] = a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31;
    out[14] = a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32;
    out[15] = a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33;

}

function renderScene() {
 
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Get the location of the transformation matrix in the shader using its name
    var matrixLocation = gl.getUniformLocation(gl.programObject, "transformationMatrix");

    r_x = r_x + 0.01; 
	r_z = r_z + 0.03; 
    // Matrix used to specify the orientation of the triangle on screen
    var transformationMatrix1 = [
        1.0, 0.0, 0.0, 0.0,
        0.0, Math.cos(r_x), -Math.sin(r_x), 0.0,
        0.0, Math.sin(r_x), Math.cos(r_x), 0.0,
        0.0, 0.0, 0.0, 1.0
    ];
	var transformationMatrix2 = [
        Math.cos(r_z), -Math.sin(r_z), 0.0, 0.0,
        Math.sin(r_z),  Math.cos(r_z), 0.0, 0.0, 
        0.0,0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ];
	var transformationMatrix = [
        Math.cos(r_z), -Math.sin(r_z), 0.0, 0.0,
        Math.sin(r_z),  Math.cos(r_z), 0.0, 0.0, 
        0.0,0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ];
	
	mmul(transformationMatrix, transformationMatrix1, transformationMatrix2); 
	//transformationMatrix[11] = 0.8; 	 

    // Pass the identity transformation matrix to the shader using its location
    gl.uniformMatrix4fv(matrixLocation, gl.FALSE, transformationMatrix);

    if (!testGLError("gl.uniformMatrix4fv")) {
        return false;
    }

    // Enable the user-defined vertex array
    gl.enableVertexAttribArray(0);
	gl.enableVertexAttribArray(1);

    // Set the vertex data to this attribute index, with the number of floats in each position
    gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 28, 0);
	gl.vertexAttribPointer(1, 4, gl.FLOAT, gl.FALSE, 28, 12);

    if (!testGLError("gl.vertexAttribPointer")) {
        return false;
    }

    gl.drawArrays(gl.LINES, 0, 36);

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
