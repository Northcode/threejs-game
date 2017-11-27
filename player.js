class Player extends GameObject
{
    constructor(model, controls) {
	super()
	model.setAngularFactor(new THREE.Vector3(0,0,0))
	this.model = model
	this.model.castShadow = true
	this.controls = controls
	this.model.add(controls.getObject())
	this.movespeed = 10
	this.sprintspeed = 20
	this.jumppower = 30

    }

    update(keyboard, scene) {
	super.update(keyboard, scene)

	let rotMatrix = this.controls.getObject().matrix
	let old_velocity = this.model.getLinearVelocity()
	let current_speed = Math.sqrt(Math.pow(old_velocity.x, 2) + Math.pow(old_velocity.z,2))
	let new_velocity = new THREE.Vector3(0,0,0)

	if (keyboard.pressed("W")) {
	    new_velocity.z = -this.movespeed
	}
	if (keyboard.pressed("S")) {
	    new_velocity.z = this.movespeed
	}
	if (keyboard.pressed("A")) {
	    new_velocity.x = -this.movespeed
	}
	if (keyboard.pressed("D")) {
	    new_velocity.x = this.movespeed
	}

	new_velocity.applyMatrix4(rotMatrix)
	new_velocity.y = old_velocity.y

	if (keyboard.pressed("space")) {

	    let raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 2 )
	    raycaster.ray.origin.copy( this.model.position )
	    let intersections = raycaster.intersectObjects( scene.children )

	    let arrow = new THREE.ArrowHelper(raycaster.ray.direction.normalize(), raycaster.ray.origin, 2, 0xff0000)
	    scene.add(arrow)

	    if (intersections.length > 0) {
		console.log("Jump!");
		new_velocity.y = this.jumppower
	    }
	}

	if (current_speed < this.maxspeed) {

	    // if ((new_velocity.x > 0 && old_velocity.x < 0)
	    // 	|| (new_velocity.x < 0 && old_velocity.x > 0)) {
	    // 	old_velocity.x = 0
	    // }
	    // if ((new_velocity.z > 0 && old_velocity.z < 0)
	    // 	|| (new_velocity.z > 0 && old_velocity.z > 0)) {
	    // 	old_velocity.z = 0
	    // }

	    let tot_speed = new THREE.Vector3()
	    // tot_speed.addVectors(old_velocity, new_velocity)

	    this.model.setLinearVelocity(new_velocity)
	}
}
