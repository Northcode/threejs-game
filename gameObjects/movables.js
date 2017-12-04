class MovingPlatform extends GameObject
{
    constructor(color) {
	super()
	this.color = color
	this.model = new Physijs.BoxMesh(
		new THREE.BoxGeometry(7,1,7),
		Physijs.createMaterial(new THREE.MeshStandardMaterial({ color: this.color }), 0.3,0.3), 1)

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
	this.model.setLinearFactor(zero_vec)
	this.model.setAngularFactor(zero_vec)
	this.model.position.copy(this.tweenpos)
	this.model.__dirtyPosition = true
    }
}

class Door extends GameObject {
	constructor(color) {
		super()
		this.color = color
		this.model = new Physijs.BoxMesh(
			new THREE.BoxGeometry(8,6,8),
			Physijs.createMaterial(new THREE.MeshStandardMaterial({ color: this.color }), 0.3,0.3), 0)
		keyPartsLoadedP.then(object => {
			for (let doorKeyPart of doorKey){
				let color = get_key_color(doorKeyPart)
				doorKeyPart.translateZ(4)
				doorKeyPart.material = new THREE.MeshStandardMaterial( {
					color: color,
					opacity: 0.4,
					transparent: true
				} )
				this.model.add(doorKeyPart)
			}
		})

		this.startpos = zero_vec.clone()
		this.endpos = zero_vec.clone()
		this.tweenpos = { x: 0, y: 0, z: 0, w: 1, h: 1, d: 1}
		this.duration = 4000
	}

	build_tween(){
		this.tweenpos.x = this.startpos.x
		this.tweenpos.y = this.startpos.y
		this.tweenpos.z = this.startpos.z

		this.tweento = { x: this.endpos.x, y: this.endpos.y, z: this.endpos.z, w: 0.95, h: 0.95, d: 0.95 }
		let tween = new TWEEN.Tween(this.tweenpos)
				.to(this.tweento, this.duration)
				.easing(TWEEN.Easing.Quadratic.In)
				.onUpdate( () =>{
					this.model.position.copy(this.tweenpos)
					this.model.__dirtyPosition = true
					this.model.scale.set(this.tweenpos.w, this.tweenpos.h, this.tweenpos.d)
				})
				.start()
	}
}
