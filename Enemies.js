class Zombie extends GameUnit
{
    constructor(){
		super(new Physijs.CapsuleMesh(
			new THREE.CylinderGeometry(1,1,4,32),
			Physijs.createMaterial(new THREE.MeshStandardMaterial({color: 0xffffff, transparent: true, opacity: 0}), 0.3, 0.3), 1))
		this.model.setAngularFactor(new THREE.Vector3(0,0,0))
		load_geometry("assets/models/characterBase").then(geometry => {
			let mesh = new THREE.Mesh(
				geometry,
				new THREE.MeshStandardMaterial({ color: 0xffffff })
			)
			this.model.add(mesh)
		})
		this.movespeed = 10
		))
	}
}
