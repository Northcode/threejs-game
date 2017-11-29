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
			object.scale.set(2,2,2)
			this.model.add(object)
		})
		this.movespeed = 10

	}
}
