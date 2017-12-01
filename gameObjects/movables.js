class MovingPlatform extends GameObject
{
    constructor(color) {
	super()
	this.color = color
	this.model = new Physijs.BoxMesh(
		new THREE.BoxGeometry(7,1,7),
		Physijs.createMaterial(new THREE.MeshStandardMaterial({ color: this.color }), 0.3,0.3), 0)

	this.model.gameobject = this
	this.model.movable = true
	this.startpos = zero_vec.clone()
	this.endpos = zero_vec.clone()
	this.tweenpos = zero_vec.clone()
	this.duration = 5000
	this.distance = 0
	this.velocity = zero_vec.clone()
	this.model.castShadow = true
    }

    rebuild_tween() {
	this.startpos.y += 2.5
	this.endpos.y += 2.5
	this.distance = this.startpos.distanceTo(this.endpos)
	let axisvec = new THREE.Vector3()
	axisvec.subVectors(this.endpos, this.startpos).normalize().multiplyScalar(this.distance / (this.duration / 1000))
	this.tweenpos.copy(this.startpos)
	this.tweento = new TWEEN.Tween(this.tweenpos)
	    .to(this.endpos, this.duration)
	    .onStart(() => {
		this.velocity.x = axisvec.x
		this.velocity.z = axisvec.z
	    })
	this.tweenback = new TWEEN.Tween(this.tweenpos)
	    .to(this.startpos, this.duration)
	    .onStart(() => {
		this.velocity.x = -axisvec.x
		this.velocity.z = -axisvec.z
	    })
	    .chain(this.tweento)
	this.tweento.chain(this.tweenback)
	this.tweento.start()
    }

    update(keyboard, scene) {
	this.model.position.copy(this.tweenpos)
	this.model.__dirtyPosition = true
	// console.log("platform vel: " + vec_to_str(this.velocity))
    }
}
