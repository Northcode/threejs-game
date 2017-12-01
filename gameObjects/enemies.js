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
		})
		this.movespeed = 5

	}
	die(){
		if (!this.isDead) {
			setTimeout(this.respawn.bind(this), 5000)
			this.isDead = true
		}
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
	    
	}

	super.update(keyboard, scene)
    }
}
