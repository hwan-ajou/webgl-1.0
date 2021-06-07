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

var numDivision = 36; 
var shaderProgram;
var num_vertex = (numDivision+1)*2; 
var opacity1 = 1.0; 
var opacity2 = 1.0; 


var tex1, tex2;
var bufVertex = new ArrayBuffer(num_vertex*12*4);		// For 36+1, 2 Vertex, 12 Floating, 4 bytes
var viewVertex = new Float32Array(bufVertex);


function makeCylinder(r,h,n)
{
	for (i = 0; i <= n ; i++)
	{
		// Vertex Position
		viewVertex[i*24 +  0] = viewVertex[i*24 +  12] = Math.cos(Math.PI / 180.0 * (360.0 / n ) * i); 
		viewVertex[i*24 +  1] = -h/2.0; 
		viewVertex[i*24 + 13] =  h/2.0; 
		viewVertex[i*24 +  2] = viewVertex[i*24 + 14] = Math.sin(Math.PI / 180.0 * (360.0 / n ) * i); 
		// Color Attrub all light grey; 
		viewVertex[i*24 +  3] = viewVertex[i*24 + 15] = 0.75; 
		viewVertex[i*24 +  4] = viewVertex[i*24 + 16] = 0.75; 
		viewVertex[i*24 +  5] = viewVertex[i*24 + 17] = 0.75; 
		viewVertex[i*24 +  6] = opacity1;
		viewVertex[i*24 + 18] = opacity2;
		// Texture UV
		viewVertex[i*24 +  7] = viewVertex[i*24 + 19] = i / n; 
		viewVertex[i*24 +  8] = 1.0;
		viewVertex[i*24 + 20] = 0.0;
		// Normal 
		viewVertex[i*24 +  9] = viewVertex[i*24 + 21] = Math.cos(Math.PI / 180.0 * (360.0 / n ) * i); 
		viewVertex[i*24 + 10] = viewVertex[i*24 + 22] = 0.0;
		viewVertex[i*24 + 11] = viewVertex[i*24 + 23] = Math.sin(Math.PI / 180.0 * (360.0 / n ) * i); 
	}
	return(viewVertex); 
}

		
function initialiseBuffer() {

	makeCylinder(0.5, 3, numDivision); 

    gl.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, makeCylinder(0.5, 1, numDivision), gl.DYNAMIC_DRAW);

    return testGLError("initialiseBuffers");
}

function updateBuffer() {
	for (var i=0; i< 6; i++)
	{
		vertexData[i*54+6] = vertexData[i*54+15] = vertexData[i*54+24] = opacity1; 
		vertexData[i*54+33] = vertexData[i*54+42] = vertexData[i*54+51] = opacity2;
	}			
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.DYNAMIC_DRAW);

    return testGLError("updateBuffers");
}


function initialiseShaders() {

    var fragmentShaderSource = `
			precision mediump float;
			uniform mediump vec3 lightPos; 
			varying highp vec4 col; 
			varying highp vec3 VMv;
			varying highp vec3 VMn; 
			void main(void) 
			{ 
				vec3 N = normalize(VMn);
				float  d = length(lightPos - VMv);
				float specular; 
				mediump vec3 lightVec = normalize(lightPos - VMv);
				float diffuse = max(dot(N, lightVec), 0.1);
				diffuse = diffuse * (1.0 / (1.0 + (0.25 * d * d)));
				if (diffuse > 0.0) {
					    vec3 R = reflect(-lightVec, N);      // Reflected light vector
						vec3 V = normalize(-VMv);	 // Vector to viewer
						// Compute the specular term
						float specAngle = max(dot(R, V), 0.0);
						specular = pow(specAngle, 80.0);
				}
				gl_FragColor = col*diffuse + vec4(1.0,1.0,1.0,1.0)*specular;
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
		attribute highp vec2 myUV; 
		attribute highp vec3 myNormal; 
		uniform mediump mat4 mMat; 
		uniform mediump mat4 vMat; 
		uniform mediump mat4 pMat; 
		varying highp vec4 col;
		varying highp vec3 VMv;
		varying highp vec3 VMn; 
		void main(void)  
		{ 
			VMv = vec3 (vMat * mMat * myVertex);
			VMn = vec3 (vMat * mMat * vec4(myNormal, 0.0));
			col = myColor;
			gl_Position = pMat * vMat * mMat * myVertex;
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
	gl.bindAttribLocation(gl.programObject, 2, "myUV");
	gl.bindAttribLocation(gl.programObject, 3, "myNormal");
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
var flag_draw_stencil = 0; 

function fn_speed_scale(a)

{
	speedRot *= a; 
}

var draw_mode = 5; // 4 Triangles, 3 line_strip 0-Points

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

var twice_x=0.2, twice_y=0.2, twice_z=0.2; 
function fn_twice_position()
{
	twice_x = document.getElementById('twice_x').value;
	twice_y = document.getElementById('twice_y').value;
	twice_z = document.getElementById('twice_z').value;
}

function fn_polygonOffset()
{
	gl.polygonOffset(document.getElementById('offset_f').value,document.getElementById('offset_u').value);
}

function fn_depth_mode(val)
{
	gl.depthFunc(val);
}

var mMat, vMat, pMat; 
var depth_clear_value = 1.0; 
var sample_coverage_value = 1.0; 
var flag_sample_coverage_inverse = 0;

function fn_make_clear_stencil()
{
	gl.enable(gl.STENCIL_TEST);
	gl.stencilMask(0xFF); 
	gl.clearStencil(0); 
	gl.clear(gl.STENCIL_BUFFER_BIT);
	gl.clearStencil(1); 
	gl.enable(gl.SCISSOR_TEST); 
	gl.scissor(400, 300, 100, 100); 
	gl.clear(gl.STENCIL_BUFFER_BIT);
	gl.scissor(300, 200, 100, 100); 
	gl.clear(gl.STENCIL_BUFFER_BIT);
	gl.stencilFunc(gl.EQUAL, 1, 255); 
	gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP); 
	gl.disable(gl.SCISSOR_TEST); 
}

var blend_const_color = [0,0,0,1.0]; 

var blend_sc_func = 1;		// gl.ONE
var blend_dc_func = 0;		// gl.ZERO
var blend_color_op = 32774; // gl.FUNC_ADD; 
var blend_sa_func = 1; 		// gl.ONE
var blend_da_func = 0;		// gl.ZERO
var blend_alpha_op = 32774; // gl.FUNC_ADD; 
var light_posx = 0.0;
var light_posy = 0.0;
var light_posz = 2.0;

function renderScene() {
	
	// fn_make_clear_stencil();
	
    gl.clearColor(0.1, 0.1, 0.1, 0.0);
	gl.clearDepth(depth_clear_value);											// Added for depth Test 
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);	// Added for depth Test 
	if (gl.isEnabled(gl.SAMPLE_COVERAGE))
		gl.sampleCoverage(sample_coverage_value, flag_sample_coverage_inverse);
	
	if (gl.isEnabled(gl.BLEND))
	{
		gl.blendFuncSeparate(blend_sc_func, blend_dc_func, blend_sa_func, blend_da_func); 
		gl.blendEquationSeparate(blend_color_op, blend_alpha_op);
	}
	
    var mMatLocation = gl.getUniformLocation(gl.programObject, "mMat");
	var vMatLocation = gl.getUniformLocation(gl.programObject, "vMat");
	var pMatLocation = gl.getUniformLocation(gl.programObject, "pMat");
	
	pMat = mat4.create(); 
	vMat = mat4.create(); 
	mMat = mat4.create(); 
	
	mat4.perspective(pMat, fov_degree * 3.141592 / 180.0 , 8.0/6.0 , 0.5, 6); 
	mat4.lookAt(vMat, [0,0,2], [0.0 ,0.0, 0.0], [0,1,0]);
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

	// Set Light Position
	gl.uniform3f(gl.getUniformLocation(gl.programObject, "lightPos"), light_posx, light_posy, light_posz);
    if (!testGLError("gl.uniformMatrix4fv")) {
		
        return false;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
	
    
	gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 48, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, gl.FALSE, 48, 12);
	gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, gl.FALSE, 48, 28);
	gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 3, gl.FLOAT, gl.FALSE, 48, 36);

    if (!testGLError("gl.vertexAttribPointer")) {
        return false;
    }
	
	if ( flag_draw_stencil ) {
		gl.enable(gl.STENCIL_TEST);
		gl.stencilMask(0xFF); 
		gl.clearStencil(0); 
		gl.clear(gl.STENCIL_BUFFER_BIT);
		gl.stencilFunc(gl.ALWAYS, 1, 255); 
		gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE); 
		gl.colorMask(false, false, false, false); 
		gl.drawArrays(draw_mode, 0, 6); 
		gl.stencilFunc(gl.EQUAL, 1, 255); 
		gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP); 
		gl.colorMask(true, true, true, true); 
	}
	else
	{
		gl.disable(gl.STENCIL_TEST);
	}
	
	gl.disable(gl.POLYGON_OFFSET_FILL); // Offset must be applied only one not both
	//gl.disable(gl.BLEND);
	gl.drawArrays(draw_mode, 0, num_vertex); 
	
	if ( flag_draw_twice ) {
		//gl.enable(gl.BLEND);
		mat4.translate(mMat, mMat, [twice_x, twice_y, twice_z]); 
		// mat4.rotateY(mMat, mMat, 3.141592/2.0);	// 90 degree rotate to make different face color 
		gl.uniformMatrix4fv(mMatLocation, gl.FALSE, mMat );
		gl.enable(gl.POLYGON_OFFSET_FILL); 
		gl.drawArrays(draw_mode, 0, num_vertex); 
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
