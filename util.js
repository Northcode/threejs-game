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
