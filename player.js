class Player extends GameUnit
{
    constructor(controls) {
	super(new Physijs.CapsuleMesh(
	    new THREE.CylinderGeometry(1,1,4,32),
	    Physijs.createMaterial(new THREE.MeshStandardMaterial({color: 0xffffff, transparent: true, opacity: 0}), 0.3, 0.3), 1))
	this.model.setAngularFactor(new THREE.Vector3(0,0,0))
	this.model.castShadow = true
	this.controls = controls
	this.model.add(controls.getObject())
	this.movespeed = 10
	this.sprintspeed = 20
	this.jumppower = 15

    }

    updateMatrix() {
	this.rotationMatrix = this.controls.getObject().matrix
    }

    update(keyboard, scene) {
	if (keyboard.pressed("shift")) {
	    this.sprint()
	}
	if (keyboard.pressed("W")) {
	    this.forward()
	}
	if (keyboard.pressed("S")) {
	    this.backward()
	}
	if (keyboard.pressed("A")) {
	    this.left()
	}
	if (keyboard.pressed("D")) {
	    this.right()
	}
	if (keyboard.pressed("space")) {
	    this.jump()
	}

	super.update(keyboard, scene)
    }
}
