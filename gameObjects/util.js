const setup_pointer_lock = function(onlock,onunlock) {
    let havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document

    if (havePointerLock) {
	let element = document.body;

	const pointerlockchange = function ( event ) {

	    if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
		onlock()
	    } else {
		onunlock()
	    }
	};

	// Hook pointer lock state change events
	document.addEventListener( 'pointerlockchange', pointerlockchange, false )
	document.addEventListener( 'mozpointerlockchange', pointerlockchange, false )
	document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false )

	element.addEventListener( 'click', function ( event ) {

	    // Ask the browser to lock the pointer
	    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
	    element.requestPointerLock();

	}, false )

    }
}


const is_num = (n) => !isNaN(parseFloat(n)) && isFinite(n)

// ------------------------- LOADER CODE --------------------
let texLoader = new THREE.TextureLoader()
let jloader = new THREE.JSONLoader()
let oloader = new THREE.ObjectLoader()

const load_file = (model_f, tex_f) => {
    return new Promise((resolve,reject) => {
	jloader.load(model_f, (geometry, mats) => {
	    texLoader.load(tex_f, (texture) => {
		let mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial({map: texture, flatShading: true, shininess: 0, specular: 0x000, morphTargets: true, vertexColors: THREE.FaceColors }) )
		resolve(mesh)
	    }, (progress) => {}, (error) => reject(error))
	})
    }, (prog) => {}, (err) => reject(err))
}

const load_geometry = (model_f) => {
    return new Promise((resolve,reject) => {
	jloader.load(model_f, (geometry, mats) => {
	    resolve(geometry)
	})
    }, (prog) => {}, (err) => reject(err))
}

const load_object = (model_f) => {
    return new Promise((resolve,reject) => {
	oloader.load(model_f, (geometry) => {
	    resolve(geometry)
	})
    }, (prog) => {}, (err) => reject(err))
}

const draw_vec = (vec) => {
    let arr = new THREE.ArrowHelper(vec.clone().normalize(),
				    new THREE.Vector3(0,0,0),
				    vec.length(),
				    0x00ff00)
    scene.add(arr)
}
