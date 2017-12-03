class Zombie extends GameUnit
{
    constructor(){
		super(new Physijs.CapsuleMesh(
			new THREE.CylinderGeometry(1,1,4,32),
			Physijs.createMaterial(new THREE.MeshStandardMaterial({color: 0xffffff, transparent: true, opacity: 0}), 0.3, 0.3), 1))
		this.model.setAngularFactor(new THREE.Vector3(0,0,0))
		load_object("assets/models/characterBase.json").then(object => {
			/*let mesh = new THREE.Mesh(
				geometry,
				new THREE.MeshStandardMaterial({ color: 0xffffff })
			)*/
			this.animationMixer = new THREE.AnimationMixer( object )
			object.scale.set(2,2,2)
			this.object = object
			this.model.add(object)
			this.name = "zombie"
			this.stuntime = 20

		})
		this.movespeed = 5
	}

    destroy() {
	clearTimeout(this.respawntimer)
    }

	takeDamage(damage, direction){
		if (this.movement.stunned == 0) {
			zombiehurtsound.play()
		}
		super.takeDamage(damage, direction)
	}

	die(){
		if (!this.isDead) {
			this.respawntimer = setTimeout(this.respawn.bind(this), 5000)
			this.isDead = true
			scene.remove(this.model)
		}
	}

	respawn(){
		scene.add(this.model)
		super.respawn()
	}

    update(keyboard, scene) {
	this.resetMovement()

	this.rotationMatrix.extractRotation(this.model.matrix)

	// console.log(scene.player.model.position.clone())
	if (!this.isDead) {
	    this.lookAt(scene.player.model.position.clone())

	    let rayvec = new THREE.Vector3(0,-1,-0.5)
	    rayvec.applyMatrix4(this.rotationMatrix)

	    let raycaster = new THREE.Raycaster( new THREE.Vector3(), rayvec, 0, 5 )
	    raycaster.ray.origin.copy( this.model.position )
	    let intersections = raycaster.intersectObjects( scene.children )

	    if (intersections.length > 0) {
		this.forward()
	    }

		let hitrayvec = zero_vec.clone()
		hitrayvec.subVectors(scene.player.model.position.clone(), this.model.position.clone())
		hitrayvec.normalize()

		let hitraycaster = new THREE.Raycaster(new THREE.Vector3(), hitrayvec, 0, 3)
		let hitrayorigin = this.model.position.clone()
		hitrayorigin.y += 1.7
		hitraycaster.ray.origin.copy(hitrayorigin)
		let hitintersectiuons = hitraycaster.intersectObjects(scene.children)

		if (scene.castray) {
			let arrow = new THREE.ArrowHelper(hitrayvec, hitrayorigin, 5, 0x0000ff )
			scene.add(arrow)
		}

		if (hitintersectiuons.length > 0) {
			if (hitintersectiuons[0].object.name == "player") {
				scene.player.takeDamage(10, hitrayvec)
			}
		}

	}

	super.update(keyboard, scene)
    }
}
