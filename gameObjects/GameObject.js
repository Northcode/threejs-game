class GameObject
{
    constructor() {
    }

    destroy() {}
    
    animate(delta) {
    }

    update(keyboard, scene) {
    }
}

class GameUnit extends GameObject
{
    constructor(model) {
	super()
	this.movement = {
	    forward: false,
	    backward: false,
	    left: false,
	    right: false,
	    jump: false,
	    sprinting: false,
	    speed: 10,
	    sprintspeed: 20,
	    jumpforce: 15,
	    stunned: 0,
	    velocity: new THREE.Vector3(0,0,0)
	}
	this.rotationMatrix = new THREE.Matrix4()
	this.model = model
	this.killplane = -10
	this.spawnpoint = new THREE.Vector3(0,30,0)
	this.hp = 100
	this.isDead = false
	this.model.entity = this
	this.stuntime = 50
	this.knockbackmulti = 8
	this.movement.knockback = zero_vec.clone()
    }

    forward() {
	this.movement.forward = true
    }

    backward() {
	this.movement.backward = true
    }

    left() {
	this.movement.left = true
    }

    right() {
	this.movement.right = true
    }

    jump() {
	this.movement.jump = true
    }

    sprint() {
	this.movement.sprinting = true
    }

    is_moving() {
	return this.movement.forward || this.movement.backward || this.movement.left || this.movement.right
    }

    takeDamage(damage,direction){
	if (this.movement.stunned == 0) {
	    this.hp -= damage
		this.movement.knockback.x = (direction.x * this.knockbackmulti)
		this.movement.knockback.y = (direction.y * this.knockbackmulti) + this.knockbackmulti
		this.movement.knockback.z = (direction.z * this.knockbackmulti)
	    if (this.hp <= 0) {
		this.die()
	    } else {
		this.movement.stunned = this.stuntime
	    }
	}
    }

	die(){
	    this.model.setLinearVelocity(zero_vec)
		this.isDead = true
		this.respawn()
	}

    respawn() {
	this.isDead = false
	this.hp = 100
	this.movement.velocity.set(0,0,0)
	this.model.setLinearVelocity(this.movement.velocity)
	this.model.position.copy(this.spawnpoint)
	this.model.__dirtyPosition = true
	console.log(this.movement.velocity)
	console.log(this.model.getLinearVelocity())
    }

    lookAt(position) {
	let vec = new THREE.Vector3()
	vec.subVectors(position, this.model.position)
	vec.normalize()
	let yRot = Math.atan2(vec.x, vec.z) + Math.PI
	let zRot = -Math.asin(vec.y)
	// console.log("rotation to: " + yRot)
	this.model.rotation.set(0, yRot, 0)
	this.model.__dirtyRotation = true
    }

    updateMatrix() {
	return undefined
    }

    animate(delta) {
		if (this.object != null) {
			let animationAction = this.animationMixer.clipAction( this.object.animations[ 0 ] )
			if (this.is_moving()) {
				if (this.movement.sprinting) {
					delta *= 2
				}
				if (!animationAction.isRunning()) {
					animationAction.play();
				}
				this.animationMixer.update( delta * 2);
			}else {
				if (animationAction.isRunning()) {
					animationAction.stop();
				}
			}
		}
    }

    resetMovement() {
	this.movement.forward = false
	this.movement.backward = false
	this.movement.left = false
	this.movement.right = false
	this.movement.sprinting = false
    }

    update(keyboard, scene) {
	super.update(keyboard, scene)

	this.updateMatrix()

	let old_velocity = this.model.getLinearVelocity()
	this.movement.velocity.set(0,0,0)
	let cur_mov_speed = 0

	if (this.model.position.y < this.killplane) {
	    this.die()
	}

	if (this.movement.sprinting) {
	    cur_mov_speed = this.sprintspeed
	}else {
	    cur_mov_speed = this.movespeed
	}

	if (this.movement.forward) {
	    this.movement.velocity.z = -cur_mov_speed
	}
	if (this.movement.backward) {
	    this.movement.velocity.z = cur_mov_speed
	}
	if (this.movement.left) {
	    this.movement.velocity.x = -cur_mov_speed
	}
	if (this.movement.right) {
	    this.movement.velocity.x = cur_mov_speed
	}

	if (this.movement.velocity.length() > cur_mov_speed) {
	    this.movement.velocity.multiplyScalar(0.7071)
	}

	this.movement.velocity.applyMatrix4(this.rotationMatrix)
	this.movement.velocity.y = old_velocity.y

	let raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 3 )
	raycaster.ray.origin.copy( this.model.position )
	let intersections = raycaster.intersectObjects( scene.ground )

	if (intersections.length > 0) {
	    if (intersections[0].object.movable === true) {
		this.movement.velocity.add(intersections[0].object.gameobject.velocity)
	    }
	    if (this.movement.jump) {
		this.movement.velocity.y = this.jumppower
	    }
	}

	this.movement.jump = false

	if(this.movement.stunned > 0) {
	    this.movement.stunned -= 1
	}

	if (!this.isDead) {
		if (this.movement.stunned <= this.stuntime - 10) {
			this.model.setLinearVelocity(this.movement.velocity)
			this.model.setAngularFactor(zero_vec)
		} else {
			let oldy = old_velocity.y
			old_velocity.multiplyScalar(0.98)
			old_velocity.y = oldy
			if (this.movement.knockback.length() != 0) {
				this.model.setLinearVelocity(this.movement.knockback)
				this.movement.knockback = zero_vec.clone()
			} else{
				this.model.setLinearVelocity(old_velocity)
			}
		}
	}


    }
}
