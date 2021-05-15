var gl;

const {mat2, mat3, mat4, vec2, vec3, vec4} = glMatrix;  // Now we can use function without glMatrix.~~~

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
        gl = canvas.getContext('webgl',
			{stencil:true, alpha:true, depth:true, antialias:true, preserveDrawingBuffer:false});
		//gl = canvas.getContext('webgl',
		//	{stencil:true, alpha:true, depth:true, antialias:false, preserveDrawingBuffer:true});
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
         0.5, -0.5,  0.5,  0.0, 0.0, 1.0, 1.0,
		 0.5,  0.5,  0.5,  0.0, 0.0, 1.0, 1.0,
        -0.5, -0.5,  0.5,  0.0, 0.0, 1.0, 1.0,
         0.5,  0.5,  0.5,  1.0, 1.0, 1.0, 1.0, 
		 -0.5,  0.5,  0.5,  0.0, 0.0, 1.0, 1.0,
		// LEFT (GREEN/WHITE) -> z = 0.5
        -0.5, -0.5, -0.5,  0.0, 1.0, 0.0, 1.0,
        -0.5,  0.5,  0.5,  0.0, 1.0, 0.0, 1.0,
        -0.5,  0.5, -0.5,  0.0, 1.0, 0.0, 1.0,
        -0.5, -0.5, -0.5,  0.0, 1.0, 0.0, 1.0,
        -0.5, -0.5,  0.5,  0.0, 1.0, 0.0, 1.0,
        -0.5,  0.5,  0.5,  0.0, 1.0, 1.0, 1.0, 
		// RIGHT (YELLOW/WHITE) -> z = 0.5
         0.5, -0.5, -0.5,  1.0, 1.0, 0.0, 1.0,
         0.5,  0.5, -0.5,  1.0, 1.0, 0.0, 1.0,
		 0.5,  0.5,  0.5,  1.0, 1.0, 0.0, 1.0,
         0.5, -0.5, -0.5,  1.0, 1.0, 0.0, 1.0,
         0.5,  0.5,  0.5,  1.0, 1.0, 1.0, 1.0, 
		 0.5, -0.5,  0.5,  1.0, 1.0, 0.0, 1.0,
		// BOTTON (MAGENTA/WHITE) -> z = 0.5
        -0.5, -0.5, -0.5,  1.0, 0.0, 1.0, 1.0,
         0.5, -0.5, -0.5,  1.0, 0.0, 1.0, 1.0,
		 0.5, -0.5,  0.5,  1.0, 0.0, 1.0, 1.0,
        -0.5, -0.5, -0.5,  1.0, 0.0, 1.0, 1.0,
         0.5, -0.5,  0.5,  1.0, 1.0, 1.0, 1.0, 
		 -0.5, -0.5,  0.5,  1.0, 0.0, 1.0, 1.0,
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
			uniform mediump mat4 mMat; 
			uniform mediump mat4 vMat; 
			uniform mediump mat4 pMat; 
			varying  highp vec4 col;
			void main(void)  
			{ 
				gl_Position = pMat * vMat * mMat * myVertex; 
				gl_PointSize = 8.0;
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

var xRot = 0.0;
var yRot = 0.0;
var zRot = 0.0;
var speedRot = 0.01; 

var flag_animation = 0; 
var flag_draw_twice = 0; 

function fn_speed_scale(a)
{
	speedRot *= a; 
}

var draw_mode = 4; // 4 Triangles, 3 line_strip 0-Points

function fn_draw_mode(a)
{
	draw_mode = a;
}

var fov_degree = 90.0; 
function fn_update_fov(val)
{
	document.getElementById('textFOV').value=val; 
	fov_degree = val; 
}

function fn_toggle(mode)
{
	if (gl.isEnabled(mode))
		gl.disable(mode);
	else
		gl.enable(mode); 
}

function fn_cull_mode(val)
{
	gl.cullFace(val);
}

function fn_scissor()
{
	gl.scissor(document.getElementById('scissorx').value, document.getElementById('scissory').value,
	document.getElementById('scissorw').value,document.getElementById('scissorh').value);
}


function fn_polygonOffset()
{
	gl.polygonOffset(document.getElementById('offset_f').value,document.getElementById('offset_u').value);
	console.log(document.getElementById('offset_f').value,document.getElementById('offset_u').value);
}

function fn_depth_mode(val)
{
	gl.depthFunc(val);
}

var mMat, vMat, pMat; 
var depth_clear_value = 1.0; 

function renderScene() {
	
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clearDepth(depth_clear_value);											// Added for depth Test 
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);	// Added for depth Test 
	
    var mMatLocation = gl.getUniformLocation(gl.programObject, "mMat");
	var vMatLocation = gl.getUniformLocation(gl.programObject, "vMat");
	var pMatLocation = gl.getUniformLocation(gl.programObject, "pMat");
    pMat = mat4.create(); 
	vMat = mat4.create(); 
	mMat = mat4.create(); 
	// mat4.ortho(pMat, -8.0/6.0, 8.0/6.0, -1, 1, -1, 1); 
	// mat4.frustum(pMat, -8.0/6.0, 8.0/6.0, -1, 1, 0.5, 3); 
	mat4.perspective(pMat, fov_degree * 3.141592 / 180.0 , 8.0/6.0 , 0.5, 8); 
	mat4.lookAt(vMat, [0,0,2], [0.0,0.0,0.0], [0,1,0]);
	mat4.rotateX(mMat, mMat, xRot);
	mat4.rotateY(mMat, mMat, yRot);
	mat4.rotateZ(mMat, mMat, zRot);
	
	if (flag_animation == 1)
	{
		//xRot = xRot + speedRot;	
		yRot = yRot + speedRot;	
		zRot = zRot + 2 * speedRot;	
    }
	
	gl.uniformMatrix4fv(mMatLocation, gl.FALSE, mMat );
	gl.uniformMatrix4fv(vMatLocation, gl.FALSE, vMat );
	gl.uniformMatrix4fv(pMatLocation, gl.FALSE, pMat );

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
	
	
	if ( flag_draw_twice ) {
		gl.enable(gl.POLYGON_OFFSET_FILL);
		mat4.translate(mMat, mMat, [0.00000, 0.0000, 0.000]);
		mat4.rotateY(mMat, mMat, 3.141592/2.0);
		gl.uniformMatrix4fv(mMatLocation, gl.FALSE, mMat );
		gl.drawArrays(draw_mode, 0, 36); 
		gl.disable(gl.POLYGON_OFFSET_FILL);
	}
	
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
	
	//fn_capture_stencil();
	//renderScene();
	
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
