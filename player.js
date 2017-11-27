class Player extends GameObject
{
    constructor(model, controls) {
	super()
	model.setAngularFactor(new THREE.Vector3(0,0,0))
	this.model = model
	this.controls = controls
	this.model.add(controls.getObject())
	this.movespeed = 0.5
	this.maxspeed = 5

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

	if (current_speed < this.maxspeed) {
	    new_velocity.applyMatrix4(rotMatrix)
	    new_velocity.y = 0
	    let tot_speed = new THREE.Vector3()
	    tot_speed.addVectors(old_velocity, new_velocity)


	    this.model.setLinearVelocity(tot_speed)
	    this.model.setAngularFactor(new THREE.Vector3(0,0,0))
	}
    }
}
